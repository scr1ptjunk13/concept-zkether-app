import { type Deposit, type Withdrawal, type PrivacyMetrics, type InsertDeposit, type InsertWithdrawal } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Deposits
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  getDeposits(): Promise<Deposit[]>;
  updateDepositStatus(id: string, status: string, nullifierHash?: string): Promise<void>;
  
  // Withdrawals
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawals(): Promise<Withdrawal[]>;
  updateWithdrawalStatus(id: string, status: string): Promise<void>;
  
  // Privacy Metrics
  getPrivacyMetrics(): Promise<PrivacyMetrics>;
  updatePrivacyMetrics(anonymitySetSize: number, unlinkabilityScore: number): Promise<void>;
  
  // Recent Activity
  getRecentActivity(): Promise<Array<{id: string, type: string, status: string, timestamp: Date}>>;
}

export class MemStorage implements IStorage {
  private deposits: Map<string, Deposit>;
  private withdrawals: Map<string, Withdrawal>;
  private privacyMetrics: PrivacyMetrics;

  constructor() {
    this.deposits = new Map();
    this.withdrawals = new Map();
    this.privacyMetrics = {
      id: randomUUID(),
      anonymitySetSize: 23,
      unlinkabilityScore: 95.7,
      updatedAt: new Date(),
    };
  }

  async createDeposit(insertDeposit: InsertDeposit): Promise<Deposit> {
    const id = randomUUID();
    const deposit: Deposit = {
      ...insertDeposit,
      id,
      nullifierHash: null,
      status: "pending",
      createdAt: new Date(),
    };
    this.deposits.set(id, deposit);
    await this.updateAnonymitySet();
    return deposit;
  }

  async getDeposits(): Promise<Deposit[]> {
    return Array.from(this.deposits.values());
  }

  async updateDepositStatus(id: string, status: string, nullifierHash?: string): Promise<void> {
    const deposit = this.deposits.get(id);
    if (deposit) {
      deposit.status = status;
      if (nullifierHash) {
        deposit.nullifierHash = nullifierHash;
      }
      this.deposits.set(id, deposit);
    }
  }

  async createWithdrawal(insertWithdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const id = randomUUID();
    const withdrawal: Withdrawal = {
      ...insertWithdrawal,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.withdrawals.set(id, withdrawal);
    return withdrawal;
  }

  async getWithdrawals(): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values());
  }

  async updateWithdrawalStatus(id: string, status: string): Promise<void> {
    const withdrawal = this.withdrawals.get(id);
    if (withdrawal) {
      withdrawal.status = status;
      this.withdrawals.set(id, withdrawal);
    }
  }

  async getPrivacyMetrics(): Promise<PrivacyMetrics> {
    return this.privacyMetrics;
  }

  async updatePrivacyMetrics(anonymitySetSize: number, unlinkabilityScore: number): Promise<void> {
    this.privacyMetrics.anonymitySetSize = anonymitySetSize;
    this.privacyMetrics.unlinkabilityScore = unlinkabilityScore;
    this.privacyMetrics.updatedAt = new Date();
  }

  async getRecentActivity(): Promise<Array<{id: string, type: string, status: string, timestamp: Date}>> {
    const activity = [];
    
    // Add recent deposits
    Array.from(this.deposits.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3)
      .forEach(deposit => {
        activity.push({
          id: deposit.id,
          type: "deposit",
          status: deposit.status,
          timestamp: deposit.createdAt
        });
      });

    // Add recent withdrawals
    Array.from(this.withdrawals.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3)
      .forEach(withdrawal => {
        activity.push({
          id: withdrawal.id,
          type: "withdrawal",
          status: withdrawal.status,
          timestamp: withdrawal.createdAt
        });
      });

    return activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
  }

  private async updateAnonymitySet(): Promise<void> {
    const committedDeposits = Array.from(this.deposits.values()).filter(d => d.status === "committed");
    const anonymitySetSize = committedDeposits.length;
    const unlinkabilityScore = anonymitySetSize > 0 ? Math.min(99.998, 100 - (100 / anonymitySetSize)) : 0;
    await this.updatePrivacyMetrics(anonymitySetSize, unlinkabilityScore);
  }
}

export const storage = new MemStorage();

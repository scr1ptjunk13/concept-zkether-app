import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDepositSchema, insertWithdrawalSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get privacy metrics
  app.get("/api/privacy-metrics", async (req, res) => {
    try {
      const metrics = await storage.getPrivacyMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch privacy metrics" });
    }
  });

  // Get recent activity
  app.get("/api/activity", async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity" });
    }
  });

  // Create deposit (commitment generation simulation)
  app.post("/api/deposits", async (req, res) => {
    try {
      const depositData = insertDepositSchema.parse(req.body);
      
      // Simulate commitment generation delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const deposit = await storage.createDeposit(depositData);
      
      // Simulate blockchain confirmation after another delay
      setTimeout(async () => {
        await storage.updateDepositStatus(deposit.id, "committed");
      }, 5000);
      
      res.json(deposit);
    } catch (error) {
      res.status(400).json({ error: "Invalid deposit data" });
    }
  });

  // Simulate note discovery
  app.post("/api/discover-notes", async (req, res) => {
    try {
      // Simulate note scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const deposits = await storage.getDeposits();
      const availableNotes = deposits.filter(d => d.status === "committed" && !d.nullifierHash);
      
      res.json({
        found: availableNotes.length,
        notes: availableNotes.map(note => ({
          id: note.id,
          amount: note.amount,
          position: Math.floor(Math.random() * 1000) + 1
        }))
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to discover notes" });
    }
  });

  // Create withdrawal (ZK proof generation simulation)
  app.post("/api/withdrawals", async (req, res) => {
    try {
      const withdrawalData = insertWithdrawalSchema.parse(req.body);
      
      // Simulate ZK proof generation delay (8-15 seconds)
      const proofTime = 8000 + Math.random() * 7000;
      await new Promise(resolve => setTimeout(resolve, proofTime));
      
      const withdrawal = await storage.createWithdrawal(withdrawalData);
      
      // Mark corresponding deposit as withdrawn
      const deposits = await storage.getDeposits();
      const correspondingDeposit = deposits.find(d => 
        d.status === "committed" && !d.nullifierHash
      );
      
      if (correspondingDeposit) {
        await storage.updateDepositStatus(
          correspondingDeposit.id, 
          "withdrawn", 
          withdrawalData.nullifierHash
        );
      }
      
      // Simulate relayer submission
      setTimeout(async () => {
        await storage.updateWithdrawalStatus(withdrawal.id, "completed");
      }, 3000);
      
      res.json(withdrawal);
    } catch (error) {
      res.status(400).json({ error: "Invalid withdrawal data" });
    }
  });

  // Get balance (sum of uncommitted deposits)
  app.get("/api/balance", async (req, res) => {
    try {
      const deposits = await storage.getDeposits();
      const withdrawals = await storage.getWithdrawals();
      
      const totalDeposited = deposits
        .filter(d => d.status === "committed")
        .reduce((sum, d) => sum + d.amount, 0);
        
      const totalWithdrawn = withdrawals
        .filter(w => w.status === "completed")
        .reduce((sum, w) => sum + w.amount, 0);
      
      const balance = totalDeposited - totalWithdrawn;
      
      res.json({ balance: Math.max(0, balance) });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate balance" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

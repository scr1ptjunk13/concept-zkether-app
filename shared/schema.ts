import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const deposits = pgTable("deposits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: real("amount").notNull(),
  recipient: text("recipient").notNull(),
  commitment: text("commitment").notNull(),
  nullifierHash: text("nullifier_hash"),
  status: text("status").notNull().default("pending"), // pending, committed, withdrawn
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const withdrawals = pgTable("withdrawals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: real("amount").notNull(),
  nullifierHash: text("nullifier_hash").notNull(),
  proof: text("proof").notNull(),
  recipient: text("recipient").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const privacyMetrics = pgTable("privacy_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  anonymitySetSize: integer("anonymity_set_size").notNull().default(0),
  unlinkabilityScore: real("unlinkability_score").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertDepositSchema = createInsertSchema(deposits).pick({
  amount: true,
  recipient: true,
  commitment: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).pick({
  amount: true,
  nullifierHash: true,
  proof: true,
  recipient: true,
});

export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Deposit = typeof deposits.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type PrivacyMetrics = typeof privacyMetrics.$inferSelect;

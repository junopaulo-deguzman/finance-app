import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  note: text("note").notNull().default(""),
  amount: real("amount").notNull(),
  type: text("type", { enum: ["income", "expense", "save"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const goals = sqliteTable("goals", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  targetAmount: real("target_amount"),
  targetDate: text("target_date"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  lastUpdatedAt: integer("last_updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const goal_allocations = sqliteTable("goal_allocations", {
  id: text("id").primaryKey(),
  goalId: text("goalId").references(() => goals.id),
  transactionId: text("transactionId").references(() => transactions.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
})

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

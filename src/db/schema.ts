import { sql } from "drizzle-orm";
import { check, index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    houseId: text("house_id").notNull(),
    name: text("name").notNull(),
    provider: text("provider").notNull().default("manual"),
    type: text("type", { enum: ["checking", "savings", "credit", "cash", "investment", "other"] }).notNull(),
    currency: text("currency").notNull().default("PHP"),
    isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("accounts_house_idx").on(table.houseId),
    index("accounts_archived_idx").on(table.isArchived),
  ],
);

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    date: text("date").notNull(),
    type: text("type", { enum: ["income", "expense", "transfer", "adjustment"] }).notNull(),
    accountId: text("account_id").notNull().references(() => accounts.id),
    toAccountId: text("to_account_id").references(() => accounts.id),
    amount: real("amount").notNull(),
    amountSigned: real("amount_signed"),
    note: text("note").notNull().default(""),
    categoryId: text("category_id"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    check(
      "transactions_transfer_shape_chk",
      sql`(
        (${table.type} = 'transfer' AND ${table.toAccountId} IS NOT NULL AND ${table.toAccountId} <> ${table.accountId})
        OR
        (${table.type} <> 'transfer' AND ${table.toAccountId} IS NULL)
      )`,
    ),
    check(
      "transactions_positive_amount_chk",
      sql`${table.amount} > 0`,
    ),
    check(
      "transactions_adjustment_signed_chk",
      sql`(${table.type} <> 'adjustment' AND ${table.amountSigned} IS NULL) OR (${table.type} = 'adjustment' AND ${table.amountSigned} IS NOT NULL AND ${table.amountSigned} <> 0)`,
    ),
    index("transactions_account_date_idx").on(table.accountId, table.date),
    index("transactions_to_account_date_idx").on(table.toAccountId, table.date),
    index("transactions_type_date_idx").on(table.type, table.date),
  ],
);

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
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

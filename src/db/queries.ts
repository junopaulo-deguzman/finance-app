import { and, desc, eq, gte, inArray, lte, or, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { accounts, goal_allocations, goals, transactions } from "@/db/schema";

type DateRange = {
  from?: string;
  to?: string;
};

type ListTransactionsFilters = DateRange & {
  types?: Array<"income" | "expense" | "transfer" | "adjustment">;
  limit?: number;
};

export async function listAccounts() {
  const db = getDb();

  return db.select().from(accounts).where(eq(accounts.isArchived, false)).orderBy(accounts.name);
}

export async function ensureDefaultAccount() {
  const db = getDb();
  const existing = await db.select().from(accounts).limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const now = new Date();
  const account = {
    id: crypto.randomUUID(),
    name: "Primary Checking",
    provider: "Manual",
    type: "checking" as const,
    currency: "PHP",
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(accounts).values(account);
  return account;
}

export async function getAccountBalance(accountId: string, dateRange?: DateRange) {
  const db = getDb();
  const filters = [
    or(eq(transactions.accountId, accountId), eq(transactions.toAccountId, accountId)),
    dateRange?.from ? gte(transactions.date, dateRange.from) : undefined,
    dateRange?.to ? lte(transactions.date, dateRange.to) : undefined,
  ].filter(Boolean);

  const rows = await db
    .select({
      balance: sql<number>`coalesce(sum(
        case
          when ${transactions.type} = 'income' and ${transactions.accountId} = ${accountId} then ${transactions.amount}
          when ${transactions.type} = 'expense' and ${transactions.accountId} = ${accountId} then -${transactions.amount}
          when ${transactions.type} = 'adjustment' and ${transactions.accountId} = ${accountId} then ${transactions.amountSigned}
          when ${transactions.type} = 'transfer' and ${transactions.accountId} = ${accountId} then -${transactions.amount}
          when ${transactions.type} = 'transfer' and ${transactions.toAccountId} = ${accountId} then ${transactions.amount}
          else 0
        end
      ), 0)`,
    })
    .from(transactions)
    .where(and(...filters));

  return Number(rows[0]?.balance ?? 0);
}

export async function listTransactions(accountId: string, filters: ListTransactionsFilters = {}) {
  const db = getDb();
  const whereFilters = [
    or(eq(transactions.accountId, accountId), eq(transactions.toAccountId, accountId)),
    filters.from ? gte(transactions.date, filters.from) : undefined,
    filters.to ? lte(transactions.date, filters.to) : undefined,
    filters.types?.length ? inArray(transactions.type, filters.types) : undefined,
  ].filter(Boolean);

  const result = await db
    .select({
      id: transactions.id,
      date: transactions.date,
      type: transactions.type,
      accountId: transactions.accountId,
      toAccountId: transactions.toAccountId,
      amount: transactions.amount,
      amountSigned: transactions.amountSigned,
      note: transactions.note,
      categoryId: transactions.categoryId,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      direction: sql<"in" | "out" | null>`case
        when ${transactions.type} = 'transfer' and ${transactions.accountId} = ${accountId} then 'out'
        when ${transactions.type} = 'transfer' and ${transactions.toAccountId} = ${accountId} then 'in'
        else null
      end`,
    })
    .from(transactions)
    .where(and(...whereFilters))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(filters.limit ?? 100);

  return result;
}

type CreateTransactionInput = {
  date: string;
  accountId: string;
  amount: number;
  note?: string;
  categoryId?: string;
  type: "income" | "expense";
};

export async function createTransaction(input: CreateTransactionInput) {
  const db = getDb();
  const now = new Date();
  const transactionId = crypto.randomUUID();

  await db.insert(transactions).values({
    id: transactionId,
    date: input.date,
    type: input.type,
    accountId: input.accountId,
    toAccountId: null,
    amount: input.amount,
    amountSigned: null,
    note: input.note ?? "",
    categoryId: input.categoryId,
    createdAt: now,
    updatedAt: now,
  });

  return transactionId;
}

export async function createTransfer(fromAccountId: string, toAccountId: string, amount: number, date: string, note?: string) {
  if (fromAccountId === toAccountId) {
    throw new Error("Transfer source and destination must be different accounts.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Transfer amount must be greater than zero.");
  }

  const db = getDb();
  const now = new Date();
  const transactionId = crypto.randomUUID();

  await db.insert(transactions).values({
    id: transactionId,
    date,
    type: "transfer",
    accountId: fromAccountId,
    toAccountId,
    amount,
    amountSigned: null,
    note: note ?? "",
    categoryId: null,
    createdAt: now,
    updatedAt: now,
  });

  return transactionId;
}

export async function reconcileAccount(accountId: string, realBalance: number, asOfDate: string) {
  const appBalance = await getAccountBalance(accountId, { to: asOfDate });
  const diff = Number((realBalance - appBalance).toFixed(2));

  if (diff === 0) {
    return { diff, transactionId: null };
  }

  const db = getDb();
  const now = new Date();
  const transactionId = crypto.randomUUID();

  await db.insert(transactions).values({
    id: transactionId,
    date: asOfDate,
    type: "adjustment",
    accountId,
    toAccountId: null,
    amount: Math.abs(diff),
    amountSigned: diff,
    note: "Account reconciliation adjustment",
    categoryId: null,
    createdAt: now,
    updatedAt: now,
  });

  return { diff, transactionId };
}

export async function listGoalsWithProgress() {
  const db = getDb();

  return db
    .select({
      id: goals.id,
      name: goals.name,
      targetAmount: goals.targetAmount,
      targetDate: goals.targetDate,
      createdAt: goals.createdAt,
      lastUpdatedAt: goals.lastUpdatedAt,
      savedAmount: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
    })
    .from(goals)
    .leftJoin(goal_allocations, eq(goals.id, goal_allocations.goalId))
    .leftJoin(transactions, eq(goal_allocations.transactionId, transactions.id))
    .groupBy(goals.id)
    .orderBy(desc(goals.createdAt));
}

type CreateGoalInput = {
  name: string;
  targetAmount?: number;
  targetDate?: string;
};

export async function createGoal(input: CreateGoalInput) {
  const db = getDb();
  const now = new Date();

  return db.insert(goals).values({
    id: crypto.randomUUID(),
    name: input.name,
    targetAmount: input.targetAmount,
    targetDate: input.targetDate,
    createdAt: now,
    lastUpdatedAt: now,
  });
}

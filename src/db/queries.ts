import { desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { savings, savings_allocations, transactions } from "@/db/schema";

export async function listTransactions() {
  const db = getDb();

  return db.select().from(transactions).orderBy(desc(transactions.date));
}

export async function listSavingsWithProgress() {
  const db = getDb();

  return db
    .select({
      id: savings.id,
      name: savings.name,
      targetAmount: savings.targetAmount,
      targetDate: savings.targetDate,
      createdAt: savings.createdAt,
      lastUpdatedAt: savings.lastUpdatedAt,
      savedAmount: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
    })
    .from(savings)
    .leftJoin(savings_allocations, eq(savings.id, savings_allocations.savingsId))
    .leftJoin(transactions, eq(savings_allocations.transactionId, transactions.id))
    .groupBy(savings.id)
    .orderBy(desc(savings.createdAt));
}

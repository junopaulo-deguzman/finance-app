import { desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { goal_allocations, goals, transactions } from "@/db/schema";

export async function listTransactions() {
  const db = getDb();

  return db.select().from(transactions).orderBy(desc(transactions.date));
}

export async function listGoalsWithProgress() {
  const db = getDb();

  try {
    return await db
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
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("goal_allocations")) {
      throw error;
    }

    return db
      .select({
        id: goals.id,
        name: goals.name,
        targetAmount: goals.targetAmount,
        targetDate: goals.targetDate,
        createdAt: goals.createdAt,
        lastUpdatedAt: goals.lastUpdatedAt,
        savedAmount: sql<number>`0`,
      })
      .from(goals)
      .orderBy(desc(goals.createdAt));
  }
}

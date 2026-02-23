import { desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { goal_allocations, goals, transactions } from "@/db/schema";

export async function listTransactions() {
  const db = getDb();

  return db.select().from(transactions).orderBy(desc(transactions.date));
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

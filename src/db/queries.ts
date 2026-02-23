import { desc } from "drizzle-orm";

import { getDb } from "@/db/client";
import { transactions } from "@/db/schema";

export async function listTransactions() {
  const db = getDb();

  return db.select().from(transactions).orderBy(desc(transactions.date));
}

import { getDb } from "@/db/client";
import { seedTransactions } from "@/db/seed-data";
import { transactions } from "@/db/schema";

async function seed() {
  const db = getDb();

  await db.delete(transactions);
  await db.insert(transactions).values(seedTransactions);

  console.log(`Seeded ${seedTransactions.length} transactions`);
}

seed().catch((error) => {
  console.error("Failed to seed database", error);
  process.exit(1);
});

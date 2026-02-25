import { loadEnvConfig } from "@next/env";

import { getHouseIdFromEnv } from "@/auth/env";
import { getDb } from "@/db/client";
import { buildSeedAccounts, seedTransactions } from "@/db/seed-data";
import { accounts, transactions } from "@/db/schema";

loadEnvConfig(process.cwd());

async function seed() {
  const db = getDb();
  const seedAccounts = buildSeedAccounts(getHouseIdFromEnv());

  await db.delete(transactions);
  await db.delete(accounts);
  await db.insert(accounts).values(seedAccounts);
  await db.insert(transactions).values(seedTransactions);

  console.log(`Seeded ${seedAccounts.length} accounts and ${seedTransactions.length} transactions`);
}

seed().catch((error) => {
  console.error("Failed to seed database", error);
  process.exit(1);
});

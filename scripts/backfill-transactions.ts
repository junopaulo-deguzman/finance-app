import { loadEnvConfig } from "@next/env";
import { createClient } from "@libsql/client";

loadEnvConfig(process.cwd());

async function backfillTransactions() {
  const url = process.env.TURSO_DATABASE_URL;

  if (!url) {
    throw new Error("Missing TURSO_DATABASE_URL environment variable");
  }

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const result = await client.execute(`DELETE FROM goal_allocations
    WHERE transactionId IN (
      SELECT id FROM transactions WHERE type IN ('transfer', 'adjustment')
    )`);

  console.log(`Backfill complete. Removed ${result.rowsAffected ?? 0} invalid goal allocations.`);
}

backfillTransactions().catch((error) => {
  console.error("Failed to backfill transactions", error);
  process.exit(1);
});

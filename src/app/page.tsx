import FinanceDashboard from "@/components/finance-dashboard";
import { listTransactions } from "@/db/queries";
import { seedTransactions } from "@/db/seed-data";

export default async function Home() {
  const rows = await listTransactions().catch(() => seedTransactions);

  return (
    <FinanceDashboard
      initialRows={rows.map((row) => ({
        id: row.id,
        date: row.date,
        category: row.category,
        note: row.note,
        amount: row.amount,
        type: row.type,
      }))}
    />
  );
}

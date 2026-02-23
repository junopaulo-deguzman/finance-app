import FinanceDashboard from "@/components/finance-dashboard";
import { listGoalsWithProgress, listTransactions } from "@/db/queries";
import { seedTransactions } from "@/db/seed-data";

export default async function Home() {
  const [rows, goals] = await Promise.all([
    listTransactions().catch(() => seedTransactions),
    listGoalsWithProgress().catch(() => []),
  ]);

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
      goals={goals.map((goal) => ({
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate,
        savedAmount: Number(goal.savedAmount),
      }))}
    />
  );
}

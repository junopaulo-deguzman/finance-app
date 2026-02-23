import FinanceDashboard from "@/components/finance-dashboard";
import { listSavingsWithProgress, listTransactions } from "@/db/queries";
import { seedTransactions } from "@/db/seed-data";

export default async function Home() {
  const [rows, savingsPlans] = await Promise.all([
    listTransactions().catch(() => seedTransactions),
    listSavingsWithProgress().catch(() => []),
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
      savingsPlans={savingsPlans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        targetAmount: plan.targetAmount,
        targetDate: plan.targetDate,
        savedAmount: Number(plan.savedAmount),
      }))}
    />
  );
}

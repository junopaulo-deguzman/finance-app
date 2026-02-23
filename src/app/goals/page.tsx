import Link from "next/link";

import CreateGoalForm from "@/components/create-goal-form";
import { listGoalsWithProgress } from "@/db/queries";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function GoalsPage() {
  const goals = await listGoalsWithProgress().catch(() => []);

  return (
    <main className="container">
      <header className="topbar">
        <div>
          <h1>Goals</h1>
          <p className="subtitle">Track progress toward each goal and check targets at a glance.</p>
        </div>
        <Link className="link-button" href="/">
          Back to Dashboard
        </Link>
      </header>

      <section className="grid">
        <CreateGoalForm />

        <article>
          <h3>All Goals</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Saved</th>
                <th>Target Amount</th>
                <th>Target Date</th>
              </tr>
            </thead>
            <tbody>
              {goals.length === 0 ? (
                <tr>
                  <td colSpan={4}>No goals found.</td>
                </tr>
              ) : (
                goals.map((goal) => (
                  <tr key={goal.id}>
                    <td>{goal.name}</td>
                    <td className="saved">{currency.format(Number(goal.savedAmount))}</td>
                    <td>{goal.targetAmount ? currency.format(goal.targetAmount) : "—"}</td>
                    <td>{goal.targetDate || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </article>
      </section>
    </main>
  );
}

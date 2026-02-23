import Link from "next/link";

import { listSavingsWithProgress } from "@/db/queries";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function SavingsPage() {
  const plans = await listSavingsWithProgress().catch(() => []);

  return (
    <main className="container">
      <header className="topbar">
        <div>
          <h1>Savings Plans</h1>
          <p className="subtitle">Track progress toward each saving plan and check targets at a glance.</p>
        </div>
        <Link className="link-button" href="/">
          Back to Dashboard
        </Link>
      </header>

      <section className="grid-single">
        <article>
          <h3>All Savings</h3>
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
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={4}>No savings plans found.</td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id}>
                    <td>{plan.name}</td>
                    <td className="saved">{currency.format(Number(plan.savedAmount))}</td>
                    <td>{plan.targetAmount ? currency.format(plan.targetAmount) : "—"}</td>
                    <td>{plan.targetDate || "—"}</td>
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

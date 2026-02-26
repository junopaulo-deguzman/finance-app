import Link from "next/link";
import { notFound } from "next/navigation";

import { updateAccountAction } from "@/app/accounts/actions";
import { getAccountBalance, getAccountById, listTransactions } from "@/db/queries";
import { ACCOUNT_TYPES } from "@/lib/constants";

export default async function AccountPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  const account = await getAccountById(accountId);

  if (!account) {
    notFound();
  }

  const balance = await getAccountBalance(accountId);
  const rows = await listTransactions(accountId, { limit: 20 });

  return (
    <main className="container">
      <div className="topbar">
        <div>
          <h1>Manage {account.name}</h1>
          <p className="subtitle">Update account information and review recent activity.</p>
        </div>
        <Link href="/accounts" className="link-button">
          Back to accounts
        </Link>
      </div>

      <section className="kpis">
        <article>
          <h2>Current Balance</h2>
          <p className={balance >= 0 ? "income" : "expense"}>
            {new Intl.NumberFormat("en-US", { style: "currency", currency: account.currency }).format(balance)}
          </p>
        </article>
      </section>

      <section className="grid">
        <article>
          <h2>Account Details</h2>
          <form action={updateAccountAction} className="form-grid">
            <input type="hidden" name="accountId" value={account.id} />
            <input name="name" defaultValue={account.name} required />
            <input name="provider" defaultValue={account.provider} required />
            <select name="type" defaultValue={account.type} required>
              {Object.values(ACCOUNT_TYPES).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input name="currency" defaultValue={account.currency} maxLength={3} required />
            <button type="submit">Save changes</button>
          </form>
        </article>

        <article>
          <h2>Recent Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>{row.type}</td>
                  <td>{row.amount}</td>
                  <td>{row.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </main>
  );
}

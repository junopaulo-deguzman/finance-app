import Link from "next/link";

import { createAccountAction } from "@/app/accounts/actions";
import { getAccountBalance, listAccounts } from "@/db/queries";

const accountTypes = ["checking", "savings", "credit", "cash", "investment", "other"];

export default async function AccountsPage() {
  const accounts = await listAccounts();
  const balances = await Promise.all(accounts.map((account) => getAccountBalance(account.id)));

  return (
    <main className="container">
      <div className="topbar">
        <div>
          <h1>Accounts</h1>
          <p className="subtitle">View all accounts and create new ones.</p>
        </div>
        <Link href="/" className="link-button">
          Back to dashboard
        </Link>
      </div>

      <section className="grid">
        <article>
          <h2>Account List</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Provider</th>
                <th>Currency</th>
                <th>Balance</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, index) => (
                <tr key={account.id}>
                  <td>{account.name}</td>
                  <td>{account.type}</td>
                  <td>{account.provider}</td>
                  <td>{account.currency}</td>
                  <td>{new Intl.NumberFormat("en-US", { style: "currency", currency: account.currency }).format(balances[index])}</td>
                  <td>
                    <Link href={`/accounts/${account.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article>
          <h2>Create Account</h2>
          <form action={createAccountAction} className="form-grid">
            <input name="name" placeholder="Account name" required />
            <input name="provider" placeholder="Provider" defaultValue="Manual" required />
            <select name="type" defaultValue="checking" required>
              {accountTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input name="currency" placeholder="Currency code" defaultValue="PHP" maxLength={3} required />
            <button type="submit">Create account</button>
          </form>
        </article>
      </section>
    </main>
  );
}

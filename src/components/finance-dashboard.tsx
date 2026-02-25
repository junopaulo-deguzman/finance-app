"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { createTransaction } from "@/api/transactions";

type Row = {
  id: string;
  date: string;
  type: "income" | "expense" | "transfer" | "adjustment";
  accountId: string;
  toAccountId: string | null;
  amount: number;
  amountSigned: number | null;
  note: string;
  categoryId: string | null;
  direction: "in" | "out" | null;
};

type Account = {
  id: string;
  name: string;
};

type FinanceDashboardProps = {
  initialRows: Row[];
  accounts: Account[];
  initialAccountId: string;
  initialTotalBalance: number;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "PHP",
});

export default function FinanceDashboard({ initialRows, accounts, initialAccountId, initialTotalBalance }: FinanceDashboardProps) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [totalBalance, setTotalBalance] = useState(initialTotalBalance);
  const [form, setForm] = useState({
    accountId: initialAccountId,
    toAccountId: "",
    date: "",
    amount: 0,
    note: "",
    categoryId: "",
    type: "expense" as "income" | "expense" | "transfer",
  });
  const [submitError, setSubmitError] = useState("");

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a.name])), [accounts]);

  async function addRow() {
    if (!form.date || form.amount <= 0 || !form.accountId) {
      setSubmitError("Date, account, and amount are required.");
      return;
    }

    if (form.type === "transfer" && !form.toAccountId) {
      setSubmitError("Destination account is required for transfers.");
      return;
    }

    try {
      const created = await createTransaction(form);
      setRows((prev) => [
        {
          id: created.id,
          date: form.date,
          type: form.type,
          accountId: form.accountId,
          toAccountId: form.type === "transfer" ? form.toAccountId : null,
          amount: form.amount,
          amountSigned: null,
          note: form.note,
          categoryId: form.categoryId || null,
          direction: form.type === "transfer" ? "out" : null,
        },
        ...prev,
      ]);
      if (form.type === "income") setTotalBalance((v) => v + form.amount);
      if (form.type === "expense") setTotalBalance((v) => v - form.amount);
      setSubmitError("");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not save transaction.");
    }
  }

  return (
    <main className="container">
      <h1>Home Finance Tracker</h1>
      <p>
        <Link href="/accounts">Manage accounts</Link>
      </p>
      <section className="kpis">
        <article>
          <h2>Total Balance</h2>
          <p className={totalBalance >= 0 ? "income" : "expense"}>{currency.format(totalBalance)}</p>
        </article>
      </section>

      <section className="grid">
        <article>
          <h3>Add Transaction</h3>
          <div className="form-grid">
            <select value={form.accountId} onChange={(e) => setForm((p) => ({ ...p, accountId: e.target.value }))}>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
            <input type="number" min="0" step="0.01" value={form.amount || ""} onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))} />
            <input placeholder="Category" value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))} />
            <input placeholder="Note" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as typeof p.type }))}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
            {form.type === "transfer" ? (
              <select value={form.toAccountId} onChange={(e) => setForm((p) => ({ ...p, toAccountId: e.target.value }))}>
                <option value="">Destination account</option>
                {accounts
                  .filter((account) => account.id !== form.accountId)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
              </select>
            ) : null}
            <button onClick={addRow}>Add</button>
            {submitError ? <p className="form-feedback form-feedback-error">{submitError}</p> : null}
          </div>
        </article>

        <article>
          <h3>Recent Transactions ({accountMap.get(initialAccountId)})</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Note</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>{row.type === "transfer" ? `transfer (${row.direction})` : row.type}</td>
                  <td>{row.categoryId || "—"}</td>
                  <td>{row.note || "—"}</td>
                  <td>{currency.format(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import TransactionForm from "@/components/transaction-form";

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

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a.name])), [accounts]);

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
          <TransactionForm
            accounts={accounts}
            accountId={initialAccountId}
            onTransactionCreated={(created) => {
              setRows((previous) => [
                {
                  ...created,
                  amountSigned: null,
                  direction: created.type === "transfer" ? "out" : null,
                },
                ...previous,
              ]);
              if (created.type === "income") setTotalBalance((value) => value + created.amount);
              if (created.type === "expense") setTotalBalance((value) => value - created.amount);
            }}
          />
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

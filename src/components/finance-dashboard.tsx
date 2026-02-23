"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { createTransaction } from "@/api/transactions";

type Row = {
  id: string;
  date: string;
  category: string;
  note: string;
  amount: number;
  type: "income" | "expense" | "save";
};

type Goal = {
  id: string;
  name: string;
  targetAmount: number | null;
  targetDate: string | null;
  savedAmount: number;
};

type FinanceDashboardProps = {
  initialRows: Row[];
  goals: Goal[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function FinanceDashboard({ initialRows, goals }: FinanceDashboardProps) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [newRow, setNewRow] = useState<Omit<Row, "id"> & { goalId: string }>({
    date: "",
    category: "",
    note: "",
    amount: 0,
    type: "expense",
    goalId: "",
  });
  const [csvText, setCsvText] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const goalsMap = useMemo(() => new Map(goals.map((s) => [s.id, s])), [goals]);

  const totals = useMemo(() => {
    const income = rows.filter((r) => r.type === "income").reduce((sum, r) => sum + r.amount, 0);
    const expenses = rows.filter((r) => r.type === "expense").reduce((sum, r) => sum + r.amount, 0);
    const saved = rows.filter((r) => r.type === "save").reduce((sum, r) => sum + r.amount, 0);

    return {
      income,
      expenses,
      saved,
      balance: income - expenses - saved,
    };
  }, [rows]);

  const groupedExpenses = useMemo(() => {
    const grouped = new Map<string, number>();

    rows
      .filter((r) => r.type === "expense")
      .forEach((r) => {
        grouped.set(r.category, (grouped.get(r.category) ?? 0) + r.amount);
      });

    return [...grouped.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  async function addRow() {
    if (!newRow.date || !newRow.category || newRow.amount <= 0) {
      setSubmitError("Date, category, and amount are required.");
      return;
    }

    if (newRow.type === "save" && !newRow.goalId) {
      setSubmitError("Please select a goal for save transactions.");
      return;
    }

    setSubmitError("");
    setIsSaving(true);

    try {
      const created = await createTransaction({
        date: newRow.date,
        category: newRow.category,
        note: newRow.note,
        amount: newRow.amount,
        type: newRow.type,
        goalId: newRow.goalId || undefined,
      });

      const goalName = created.type === "save" ? goalsMap.get(newRow.goalId)?.name ?? "Goal" : "";

      setRows((prev) => [
        {
          ...created,
          category: created.type === "save" ? `Save: ${goalName}` : created.category,
        },
        ...prev,
      ]);

      setNewRow({
        date: "",
        category: "",
        note: "",
        amount: 0,
        type: "expense",
        goalId: "",
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not save transaction.");
    } finally {
      setIsSaving(false);
    }
  }

  function importCsv() {
    const parsed = csvText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(1)
      .map((line) => {
        const [date, category, note, amount, type] = line.split(",").map((item) => item.trim());
        const numericAmount = Number(amount);

        if (!date || !category || Number.isNaN(numericAmount) || (type !== "income" && type !== "expense" && type !== "save")) {
          return null;
        }

        return {
          id: crypto.randomUUID(),
          date,
          category,
          note: note ?? "",
          amount: numericAmount,
          type,
        } as Row;
      })
      .filter((item): item is Row => item !== null);

    if (parsed.length > 0) {
      setRows((prev) => [...parsed, ...prev]);
      setCsvText("");
    }
  }

  return (
    <main className="container">
      <header className="topbar">
        <div>
          <h1>Home Finance Tracker</h1>
          <p className="subtitle">Replace your spreadsheet with a shared web dashboard your family can maintain together.</p>
        </div>
        <Link className="link-button" href="/goals">
          View Goals
        </Link>
      </header>

      <section className="kpis kpis-four">
        <article>
          <h2>Total Income</h2>
          <p className="income">{currency.format(totals.income)}</p>
        </article>
        <article>
          <h2>Total Expenses</h2>
          <p className="expense">{currency.format(totals.expenses)}</p>
        </article>
        <article>
          <h2>Total Saved</h2>
          <p className="saved">{currency.format(totals.saved)}</p>
        </article>
        <article>
          <h2>Remaining Balance</h2>
          <p className={totals.balance >= 0 ? "income" : "expense"}>{currency.format(totals.balance)}</p>
        </article>
      </section>

      <section className="grid">
        <article>
          <h3>Add Transaction</h3>
          <div className="form-grid">
            <input type="date" value={newRow.date} onChange={(e) => setNewRow((p) => ({ ...p, date: e.target.value }))} />
            <input
              placeholder="Category"
              value={newRow.category}
              disabled={newRow.type === "save"}
              onChange={(e) => setNewRow((p) => ({ ...p, category: e.target.value }))}
            />
            <input placeholder="Note" value={newRow.note} onChange={(e) => setNewRow((p) => ({ ...p, note: e.target.value }))} />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
              value={newRow.amount || ""}
              onChange={(e) => setNewRow((p) => ({ ...p, amount: Number(e.target.value) }))}
            />
            <select
              value={newRow.type}
              onChange={(e) =>
                setNewRow((p) => ({
                  ...p,
                  type: e.target.value as Row["type"],
                  category: e.target.value === "save" ? "Goal" : p.category,
                  goalId: e.target.value === "save" ? p.goalId : "",
                }))
              }
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="save">Save</option>
            </select>
            {newRow.type === "save" ? (
              <select value={newRow.goalId} onChange={(e) => setNewRow((p) => ({ ...p, goalId: e.target.value }))}>
                <option value="">Select goal</option>
                {goals.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            ) : null}
            <button onClick={addRow} disabled={isSaving}>{isSaving ? "Saving..." : "Add"}</button>
            {submitError ? <p className="form-feedback form-feedback-error">{submitError}</p> : null}
          </div>
        </article>

        <article>
          <h3>Paste CSV From Excel</h3>
          <p className="hint">Expected columns: date, category, note, amount, type</p>
          <textarea
            rows={7}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={"date,category,note,amount,type\n2026-02-20,Gas,Fuel,65.72,expense"}
          />
          <button onClick={importCsv}>Import CSV</button>
        </article>
      </section>

      <section className="grid">
        <article>
          <h3>Recent Transactions</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Note</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>{row.category}</td>
                  <td>{row.note || "—"}</td>
                  <td>{row.type}</td>
                  <td className={row.type === "income" ? "income" : row.type === "save" ? "saved" : "expense"}>{currency.format(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article>
          <h3>Expense Breakdown</h3>
          <ul className="breakdown">
            {groupedExpenses.map(([category, amount]) => (
              <li key={category}>
                <span>{category}</span>
                <strong>{currency.format(amount)}</strong>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

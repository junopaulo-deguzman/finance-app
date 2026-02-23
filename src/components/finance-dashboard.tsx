"use client";

import { useMemo, useState } from "react";

type Row = {
  id: string;
  date: string;
  category: string;
  note: string;
  amount: number;
  type: "income" | "expense";
};

const seedData: Row[] = [
  { id: "1", date: "2026-02-01", category: "Salary", note: "Main paycheck", amount: 6200, type: "income" },
  { id: "2", date: "2026-02-03", category: "Mortgage", note: "Monthly payment", amount: 1850, type: "expense" },
  { id: "3", date: "2026-02-08", category: "Groceries", note: "Weekly shopping", amount: 182.44, type: "expense" },
  { id: "4", date: "2026-02-14", category: "Freelance", note: "Side project", amount: 740, type: "income" },
  { id: "5", date: "2026-02-19", category: "Utilities", note: "Electric + water", amount: 210.98, type: "expense" },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function FinanceDashboard() {
  const [rows, setRows] = useState<Row[]>(seedData);
  const [newRow, setNewRow] = useState<Omit<Row, "id">>({
    date: "",
    category: "",
    note: "",
    amount: 0,
    type: "expense",
  });
  const [csvText, setCsvText] = useState("");

  const totals = useMemo(() => {
    const income = rows.filter((r) => r.type === "income").reduce((sum, r) => sum + r.amount, 0);
    const expenses = rows.filter((r) => r.type === "expense").reduce((sum, r) => sum + r.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [rows]);

  const groupedExpenses = useMemo(() => {
    const grouped = new Map<string, number>();

    rows.filter((r) => r.type === "expense").forEach((r) => {
      grouped.set(r.category, (grouped.get(r.category) ?? 0) + r.amount);
    });

    return [...grouped.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  function addRow() {
    if (!newRow.date || !newRow.category || newRow.amount <= 0) {
      return;
    }

    setRows((prev) => [
      {
        id: crypto.randomUUID(),
        ...newRow,
      },
      ...prev,
    ]);

    setNewRow({
      date: "",
      category: "",
      note: "",
      amount: 0,
      type: "expense",
    });
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

        if (!date || !category || Number.isNaN(numericAmount) || (type !== "income" && type !== "expense")) {
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
      <h1>Home Finance Tracker</h1>
      <p className="subtitle">Replace your spreadsheet with a shared web dashboard your family can maintain together.</p>

      <section className="kpis">
        <article>
          <h2>Total Income</h2>
          <p className="income">{currency.format(totals.income)}</p>
        </article>
        <article>
          <h2>Total Expenses</h2>
          <p className="expense">{currency.format(totals.expenses)}</p>
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
            <input placeholder="Category" value={newRow.category} onChange={(e) => setNewRow((p) => ({ ...p, category: e.target.value }))} />
            <input placeholder="Note" value={newRow.note} onChange={(e) => setNewRow((p) => ({ ...p, note: e.target.value }))} />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
              value={newRow.amount || ""}
              onChange={(e) => setNewRow((p) => ({ ...p, amount: Number(e.target.value) }))}
            />
            <select value={newRow.type} onChange={(e) => setNewRow((p) => ({ ...p, type: e.target.value as Row["type"] }))}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <button onClick={addRow}>Add</button>
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
                  <td className={row.type === "income" ? "income" : "expense"}>{currency.format(row.amount)}</td>
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

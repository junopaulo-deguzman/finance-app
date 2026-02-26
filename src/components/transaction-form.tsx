"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createTransaction } from "@/api/transactions";

type Account = {
  id: string;
  name: string;
};

type TransactionType = "income" | "expense" | "transfer";

type TransactionFormProps = {
  accounts: Account[];
  accountId?: string;
  refreshOnSuccess?: boolean;
  onTransactionCreated?: (payload: {
    id: string;
    accountId: string;
    toAccountId: string | null;
    date: string;
    amount: number;
    type: TransactionType;
    note: string;
    categoryId: string | null;
  }) => void;
};

export default function TransactionForm({ accounts, accountId, refreshOnSuccess = false, onTransactionCreated }: TransactionFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    accountId: accountId ?? accounts[0]?.id ?? "",
    toAccountId: "",
    date: "",
    amount: 0,
    note: "",
    categoryId: "",
    type: "expense" as TransactionType,
  });
  const [submitError, setSubmitError] = useState("");


  async function addTransaction() {
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
      setSubmitError("");
      onTransactionCreated?.({
        id: created.id,
        accountId: form.accountId,
        toAccountId: form.type === "transfer" ? form.toAccountId : null,
        date: form.date,
        amount: form.amount,
        type: form.type,
        note: form.note,
        categoryId: form.categoryId || null,
      });

      setForm((previous) => ({
        ...previous,
        toAccountId: "",
        date: "",
        amount: 0,
        note: "",
        categoryId: "",
      }));

      if (refreshOnSuccess) {
        router.refresh();
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not save transaction.");
    }
  }

  return (
    <div className="form-grid">
      {!accountId ? (
        <select value={form.accountId} onChange={(event) => setForm((previous) => ({ ...previous, accountId: event.target.value }))}>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      ) : null}
      <input type="date" value={form.date} onChange={(event) => setForm((previous) => ({ ...previous, date: event.target.value }))} />
      <input
        type="number"
        min="0"
        step="0.01"
        value={form.amount || ""}
        onChange={(event) => setForm((previous) => ({ ...previous, amount: Number(event.target.value) }))}
      />
      <input placeholder="Category" value={form.categoryId} onChange={(event) => setForm((previous) => ({ ...previous, categoryId: event.target.value }))} />
      <input placeholder="Note" value={form.note} onChange={(event) => setForm((previous) => ({ ...previous, note: event.target.value }))} />
      <select value={form.type} onChange={(event) => setForm((previous) => ({ ...previous, type: event.target.value as TransactionType }))}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
        <option value="transfer">Transfer</option>
      </select>
      {form.type === "transfer" ? (
        <select value={form.toAccountId} onChange={(event) => setForm((previous) => ({ ...previous, toAccountId: event.target.value }))}>
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
      <button onClick={addTransaction}>Add</button>
      {submitError ? <p className="form-feedback form-feedback-error">{submitError}</p> : null}
    </div>
  );
}

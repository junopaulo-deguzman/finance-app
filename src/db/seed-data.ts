import type { Account, Transaction } from "@/db/schema";

const createdAt = new Date();

export function buildSeedAccounts(houseId: string): Account[] {
  return [
    {
      id: "acct-1",
      houseId,
      name: "Primary Checking",
      provider: "Manual",
      type: "checking",
      currency: "PHP",
      isArchived: false,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "acct-2",
      houseId,
      name: "Savings",
      provider: "Manual",
      type: "savings",
      currency: "PHP",
      isArchived: false,
      createdAt,
      updatedAt: createdAt,
    },
  ];
}

export const seedTransactions: Transaction[] = [
  {
    id: "1",
    date: "2026-02-01",
    type: "income",
    accountId: "acct-1",
    toAccountId: null,
    amount: 6200,
    amountSigned: null,
    note: "Main paycheck",
    categoryId: "salary",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "2",
    date: "2026-02-03",
    type: "expense",
    accountId: "acct-1",
    toAccountId: null,
    amount: 1850,
    amountSigned: null,
    note: "Monthly payment",
    categoryId: "mortgage",
    createdAt,
    updatedAt: createdAt,
  },
];

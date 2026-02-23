import type { Transaction } from "@/db/schema";

const createdAt = new Date();

export const seedTransactions: Transaction[] = [
  { id: "1", date: "2026-02-01", category: "Salary", note: "Main paycheck", amount: 6200, type: "income", createdAt },
  { id: "2", date: "2026-02-03", category: "Mortgage", note: "Monthly payment", amount: 1850, type: "expense", createdAt },
  { id: "3", date: "2026-02-08", category: "Groceries", note: "Weekly shopping", amount: 182.44, type: "expense", createdAt },
  { id: "4", date: "2026-02-14", category: "Freelance", note: "Side project", amount: 740, type: "income", createdAt },
  { id: "5", date: "2026-02-19", category: "Utilities", note: "Electric + water", amount: 210.98, type: "expense", createdAt },
];

type TxType = "income" | "expense" | "transfer" | "adjustment";

type Tx = {
  type: TxType;
  accountId: string;
  toAccountId: string | null;
  amount: number;
  amountSigned: number | null;
};

function getBalance(rows: Tx[], accountId: string) {
  return rows.reduce((sum, tx) => {
    if (tx.type === "income" && tx.accountId === accountId) return sum + tx.amount;
    if (tx.type === "expense" && tx.accountId === accountId) return sum - tx.amount;
    if (tx.type === "adjustment" && tx.accountId === accountId) return sum + (tx.amountSigned ?? 0);
    if (tx.type === "transfer" && tx.accountId === accountId) return sum - tx.amount;
    if (tx.type === "transfer" && tx.toAccountId === accountId) return sum + tx.amount;
    return sum;
  }, 0);
}

function assertEqual(actual: number | string | null, expected: number | string | null, name: string) {
  if (actual !== expected) {
    throw new Error(`${name} failed. Expected ${String(expected)}, got ${String(actual)}`);
  }
}

const rows: Tx[] = [
  { type: "income", accountId: "a1", toAccountId: null, amount: 1000, amountSigned: null },
  { type: "transfer", accountId: "a1", toAccountId: "a2", amount: 200, amountSigned: null },
  { type: "adjustment", accountId: "a2", toAccountId: null, amount: 1, amountSigned: -50 },
];

assertEqual(getBalance(rows, "a1"), 800, "transfer decreases source");
assertEqual(getBalance(rows, "a2"), 150, "transfer increases destination + adjustment applied");
assertEqual(rows[1].accountId === "a1" ? "out" : "in", "out", "transfer direction for source");
assertEqual(rows[1].toAccountId === "a2" ? "in" : "out", "in", "transfer direction for destination");

console.log("ledger-tests passed");

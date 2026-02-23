export type CreateTransactionPayload = {
  date: string;
  category: string;
  note: string;
  amount: number;
  type: "income" | "expense" | "save";
  goalId?: string;
};

export type TransactionDto = {
  id: string;
  date: string;
  category: string;
  note: string;
  amount: number;
  type: "income" | "expense" | "save";
};

export async function createTransaction(payload: CreateTransactionPayload): Promise<TransactionDto> {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to create transaction.");
  }

  return (await response.json()) as TransactionDto;
}

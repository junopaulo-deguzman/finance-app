import { NextResponse } from "next/server";

import { createTransaction } from "@/db/queries";

type CreateTransactionRequestBody = {
  date?: unknown;
  category?: unknown;
  note?: unknown;
  amount?: unknown;
  type?: unknown;
  goalId?: unknown;
};

export async function POST(request: Request) {
  let body: CreateTransactionRequestBody;

  try {
    body = (await request.json()) as CreateTransactionRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const date = String(body.date ?? "").trim();
  const category = String(body.category ?? "").trim();
  const note = String(body.note ?? "").trim();
  const amount = Number(body.amount);
  const type = String(body.type ?? "").trim();
  const goalId = String(body.goalId ?? "").trim();

  if (!date || !category || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Date, category, and a positive amount are required." }, { status: 400 });
  }

  if (type !== "income" && type !== "expense" && type !== "save") {
    return NextResponse.json({ error: "Type must be income, expense, or save." }, { status: 400 });
  }

  if (type === "save" && !goalId) {
    return NextResponse.json({ error: "Goal is required when type is save." }, { status: 400 });
  }

  try {
    const transaction = await createTransaction({
      date,
      category,
      note,
      amount,
      type,
      goalId: goalId || undefined,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save transaction." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { getHouseIdFromEnv } from "@/auth/env";
import { verifyJwtFromRequest } from "@/auth/jwt";
import { createTransaction, createTransfer } from "@/db/queries";

type CreateTransactionRequestBody = {
  date?: unknown;
  accountId?: unknown;
  toAccountId?: unknown;
  note?: unknown;
  amount?: unknown;
  type?: unknown;
  categoryId?: unknown;
};

export async function POST(request: Request) {
  try {
    const payload = await verifyJwtFromRequest(request);
    const houseId = getHouseIdFromEnv();

    if (payload.houseId && payload.houseId !== houseId) {
      return NextResponse.json({ error: "Token houseId does not match configured house." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: CreateTransactionRequestBody;

  try {
    body = (await request.json()) as CreateTransactionRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const date = String(body.date ?? "").trim();
  const accountId = String(body.accountId ?? "").trim();
  const toAccountId = String(body.toAccountId ?? "").trim();
  const note = String(body.note ?? "").trim();
  const categoryId = String(body.categoryId ?? "").trim();
  const amount = Number(body.amount);
  const type = String(body.type ?? "").trim();

  if (!date || !accountId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Date, account, and a positive amount are required." }, { status: 400 });
  }

  if (type !== "income" && type !== "expense" && type !== "transfer") {
    return NextResponse.json({ error: "Type must be income, expense, or transfer." }, { status: 400 });
  }

  try {
    const id =
      type === "transfer"
        ? await createTransfer(accountId, toAccountId, amount, date, note)
        : await createTransaction({ date, accountId, note, amount, type, categoryId: categoryId || undefined });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save transaction." },
      { status: 500 },
    );
  }
}

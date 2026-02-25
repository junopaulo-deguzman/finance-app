"use server";

import { revalidatePath } from "next/cache";

import { createAccountRecord, updateAccountDetails } from "@/db/queries";

function normalize(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function createAccountAction(formData: FormData) {
  const name = normalize(formData.get("name"));
  const provider = normalize(formData.get("provider"));
  const currency = normalize(formData.get("currency"));
  const type = normalize(formData.get("type"));

  await createAccountRecord({ name, provider, currency, type });
  revalidatePath("/accounts");
}

export async function updateAccountAction(formData: FormData) {
  const accountId = normalize(formData.get("accountId"));
  const name = normalize(formData.get("name"));
  const provider = normalize(formData.get("provider"));
  const currency = normalize(formData.get("currency"));
  const type = normalize(formData.get("type"));

  await updateAccountDetails(accountId, { name, provider, currency, type });
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${accountId}`);
}

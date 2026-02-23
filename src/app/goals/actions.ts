"use server";

import { revalidatePath } from "next/cache";

import { createGoal } from "@/db/queries";

export type CreateGoalFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialCreateGoalState: CreateGoalFormState = {
  status: "idle",
  message: "",
};

export async function createGoalAction(_: CreateGoalFormState, formData: FormData): Promise<CreateGoalFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const targetAmountRaw = String(formData.get("targetAmount") ?? "").trim();
  const targetDateRaw = String(formData.get("targetDate") ?? "").trim();

  if (!name) {
    return {
      status: "error",
      message: "Goal name is required.",
    };
  }

  let targetAmount: number | undefined;

  if (targetAmountRaw) {
    const parsed = Number(targetAmountRaw);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return {
        status: "error",
        message: "Target amount must be a number greater than 0.",
      };
    }

    targetAmount = parsed;
  }

  const targetDate = targetDateRaw || undefined;

  try {
    await createGoal({
      name,
      targetAmount,
      targetDate,
    });
  } catch {
    return {
      status: "error",
      message: "Could not create goal. Please verify database configuration and try again.",
    };
  }

  revalidatePath("/goals");
  revalidatePath("/");

  return {
    status: "success",
    message: "Goal created.",
  };
}

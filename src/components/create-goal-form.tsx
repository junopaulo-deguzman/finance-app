"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createGoalAction } from "@/app/goals/actions";
import { initialCreateGoalState } from "@/app/goals/form-state";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Goal"}
    </button>
  );
}

export default function CreateGoalForm() {
  const [state, formAction] = useActionState(createGoalAction, initialCreateGoalState);

  return (
    <article>
      <h3>Create Goal</h3>
      <form className="form-grid" action={formAction}>
        <input name="name" placeholder="Name" required />
        <input name="targetAmount" type="number" min="0" step="0.01" placeholder="Target Amount (optional)" />
        <input name="targetDate" type="date" />
        <SubmitButton />
      </form>
      {state.message ? (
        <p className={state.status === "error" ? "form-feedback form-feedback-error" : "form-feedback form-feedback-success"}>{state.message}</p>
      ) : null}
    </article>
  );
}

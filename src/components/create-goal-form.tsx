"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Card, Field, Input, Stack, Text } from "@chakra-ui/react";

import { createGoalAction } from "@/app/goals/actions";
import { initialCreateGoalState } from "@/app/goals/form-state";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" loading={pending}>
      {pending ? "Creating..." : "Create Goal"}
    </Button>
  );
}

export default function CreateGoalForm() {
  const [state, formAction] = useActionState(createGoalAction, initialCreateGoalState);

  return (
    <Card.Root>
      <Card.Header>
        <Text fontWeight="semibold">Create Goal</Text>
      </Card.Header>
      <Card.Body>
        <form action={formAction}>
          <Stack gap={3}>
            <Field.Root>
              <Field.Label>Name</Field.Label>
              <Input name="name" placeholder="Name" required />
            </Field.Root>
            <Field.Root>
              <Field.Label>Target amount</Field.Label>
              <Input name="targetAmount" type="number" min="0" step="0.01" placeholder="Target Amount (optional)" />
            </Field.Root>
            <Field.Root>
              <Field.Label>Target date</Field.Label>
              <Input name="targetDate" type="date" />
            </Field.Root>
            <SubmitButton />
          </Stack>
        </form>
        {state.message ? <Text mt={3} color={state.status === "error" ? "red.600" : "green.600"}>{state.message}</Text> : null}
      </Card.Body>
    </Card.Root>
  );
}

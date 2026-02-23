export type CreateGoalFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialCreateGoalState: CreateGoalFormState = {
  status: "idle",
  message: "",
};

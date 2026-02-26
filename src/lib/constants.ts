export const ACCOUNT_TYPES = {
  CHECKING: "checking",
  SAVINGS: "savings",
  CREDIT: "credit",
  INVESTMENT: "investment",
  CASH: "cash",
} as const;

export type AccountType = (typeof ACCOUNT_TYPES)[keyof typeof ACCOUNT_TYPES];
export type SetupWorkflowInput = {
  budgetCount: number;
  categoryCount: number;
  goalCount: number;
  paymentMethodCount: number;
  transactionCount: number;
};

export type SetupWorkflowStepId =
  "categories" | "paymentMethods" | "budget" | "transaction" | "goal";

export function buildSetupWorkflow(input: SetupWorkflowInput) {
  const steps = [
    {
      href: "/categories",
      id: "categories",
      isComplete: input.categoryCount > 0,
    },
    {
      href: "/payments",
      id: "paymentMethods",
      isComplete: input.paymentMethodCount > 0,
    },
    { href: "/budgets", id: "budget", isComplete: input.budgetCount > 0 },
    {
      href: "/transactions/new",
      id: "transaction",
      isComplete: input.transactionCount > 0,
    },
    {
      href: "/goals",
      id: "goal",
      isComplete: input.goalCount > 0,
      isOptional: true,
    },
  ] satisfies Array<{
    href: string;
    id: SetupWorkflowStepId;
    isComplete: boolean;
    isOptional?: boolean;
  }>;
  const requiredSteps = steps.filter((step) => !step.isOptional);
  const completedRequiredSteps = requiredSteps.filter(
    (step) => step.isComplete,
  ).length;

  return {
    completedRequiredSteps,
    isComplete: completedRequiredSteps === requiredSteps.length,
    steps,
    totalRequiredSteps: requiredSteps.length,
  };
}

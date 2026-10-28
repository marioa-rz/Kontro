import { describe, expect, it } from "vitest";

import { buildSetupWorkflow } from "@/lib/finance/workflow";

describe("buildSetupWorkflow", () => {
  it("orders the incomplete setup steps and treats goals as optional", () => {
    expect(
      buildSetupWorkflow({
        budgetCount: 0,
        categoryCount: 3,
        goalCount: 0,
        paymentMethodCount: 2,
        transactionCount: 0,
      }),
    ).toEqual({
      completedRequiredSteps: 2,
      isComplete: false,
      steps: [
        { href: "/categories", id: "categories", isComplete: true },
        { href: "/payments", id: "paymentMethods", isComplete: true },
        { href: "/budgets", id: "budget", isComplete: false },
        { href: "/transactions/new", id: "transaction", isComplete: false },
        { href: "/goals", id: "goal", isComplete: false, isOptional: true },
      ],
      totalRequiredSteps: 4,
    });
  });

  it("finishes when every required setup step is complete", () => {
    expect(
      buildSetupWorkflow({
        budgetCount: 1,
        categoryCount: 1,
        goalCount: 0,
        paymentMethodCount: 1,
        transactionCount: 1,
      }).isComplete,
    ).toBe(true);
  });
});

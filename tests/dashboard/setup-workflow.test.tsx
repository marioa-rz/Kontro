import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SetupWorkflow } from "@/components/dashboard/setup-workflow";
import { buildSetupWorkflow } from "@/lib/finance/workflow";

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe("SetupWorkflow", () => {
  it("shows incomplete actions and hides once required setup is complete", () => {
    const incomplete = renderToStaticMarkup(
      <SetupWorkflow
        workflow={buildSetupWorkflow({
          budgetCount: 0,
          categoryCount: 1,
          goalCount: 0,
          paymentMethodCount: 1,
          transactionCount: 0,
        })}
      />,
    );
    const complete = renderToStaticMarkup(
      <SetupWorkflow
        workflow={buildSetupWorkflow({
          budgetCount: 1,
          categoryCount: 1,
          goalCount: 0,
          paymentMethodCount: 1,
          transactionCount: 1,
        })}
      />,
    );

    expect(incomplete).toContain("workflow.title");
    expect(incomplete).toContain('href="/budgets"');
    expect(incomplete).toContain('href="/transactions/new"');
    expect(incomplete).toContain("workflow.optional");
    expect(complete).toBe("");
  });
});

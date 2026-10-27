import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { FinancialFocus } from "@/components/dashboard/financial-focus";

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    formatCurrency: (value: number) => `Q${value}`,
    formatDate: (value: string) => value,
    t: (key: string) =>
      ({
        "dashboard.focus.budgetTitle": "Budget progress",
        "dashboard.focus.debtTitle": "Debt progress",
        "dashboard.focus.incomeTitle": "Income sources",
        "dashboard.focus.remaining": "Remaining",
        "dashboard.focus.overBudget": "Over budget",
        "dashboard.focus.paid": "Paid",
        "dashboard.focus.of": "of",
        "dashboard.focus.spent": "Spent",
      })[key] ?? key,
  }),
}));

describe("FinancialFocus", () => {
  it("renders real amounts for budgets, debts, and income without percentages", () => {
    const html = renderToStaticMarkup(
      <FinancialFocus
        data={{
          budgets: [
            {
              budgetAmount: 1000,
              color: "#be123c",
              icon: "🏠",
              id: "rent",
              label: "Rent",
              remainingAmount: 350,
              overAmount: 0,
              spentAmount: 650,
            },
            {
              budgetAmount: 200,
              color: "#e11d48",
              icon: "🎬",
              id: "entertainment",
              label: "Entertainment",
              overAmount: 50,
              remainingAmount: 0,
              spentAmount: 250,
            },
          ],
          debts: [
            {
              dueDate: "2026-10-20",
              id: "visa",
              label: "Visa",
              paidAmount: 300,
              remainingAmount: 600,
              totalAmount: 900,
            },
          ],
          incomes: [
            { amount: 1800, icon: "💼", id: "freelance", label: "Freelance" },
          ],
        }}
      />,
    );

    expect(html).toContain("Budget progress");
    expect(html).toContain("Debt progress");
    expect(html).toContain("Income sources");
    expect(html).toContain("Q650");
    expect(html).toContain("Q600");
    expect(html).toContain("Q1800");
    expect(html).toContain("Over budget");
    expect(html).toContain("Q50");
    expect(html).not.toContain("% used");
    expect(html).toContain("grid-cols-[auto_1fr]");
    expect(html).not.toContain("flex-row items-center gap-3");
  });
});

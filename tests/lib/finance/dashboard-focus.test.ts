import { describe, expect, it } from "vitest";

import { buildDashboardFocusData } from "@/lib/finance/dashboard-focus";

describe("buildDashboardFocusData", () => {
  it("builds amount-first budget, income, and debt progress", () => {
    const result = buildDashboardFocusData(
      [
        {
          canModify: true,
          color: "#be123c",
          group: "needs",
          icon: "🏠",
          id: "rent",
          isDefault: false,
          isService: false,
          label: "Rent",
          monthlyLimit: 1000,
          name: "Rent",
          spent: 650,
        },
        {
          canModify: true,
          color: "#15803d",
          group: "income",
          icon: "💼",
          id: "freelance",
          isDefault: false,
          isService: false,
          label: "Freelance",
          monthlyLimit: 0,
          name: "Freelance",
          spent: 1800,
        },
        {
          canModify: true,
          color: "#e11d48",
          group: "wants",
          icon: "🎬",
          id: "entertainment",
          isDefault: false,
          isService: false,
          label: "Entertainment",
          monthlyLimit: 200,
          name: "Entertainment",
          spent: 250,
        },
        {
          canModify: true,
          color: "#be123c",
          group: "income",
          icon: "💵",
          id: "salary",
          isDefault: false,
          isService: false,
          label: "Salary",
          monthlyLimit: 0,
          name: "Salary",
          spent: 1200,
        },
      ],
      [
        {
          dueDate: "2026-10-20",
          id: "visa-2026-10",
          paidAmount: 300,
          paymentMethodKey: "Visa",
          totalAmount: 900,
        },
        {
          dueDate: "2026-10-10",
          id: "amex-2026-10",
          paidAmount: 100,
          paymentMethodKey: "Amex",
          totalAmount: 400,
        },
      ],
    );

    expect(result.budgets[0]).toMatchObject({
      budgetAmount: 1000,
      remainingAmount: 350,
      spentAmount: 650,
    });
    expect(result.incomes[0]).toMatchObject({
      amount: 1800,
      label: "Freelance",
    });
    expect(result.budgets[0]).toMatchObject({
      id: "rent",
      overAmount: 0,
    });
    expect(result.budgets[1]).toMatchObject({
      id: "entertainment",
      overAmount: 50,
      remainingAmount: 0,
    });
    expect(result.debts[1]).toMatchObject({
      paidAmount: 300,
      remainingAmount: 600,
      totalAmount: 900,
    });
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DailyExpensesSplineChart } from "@/components/dashboard/expenses-over-time-chart";

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    t: (key: string) =>
      ({
        "dashboard.dailyExpenses.averagePerDay": "Promedio diario",
        "dashboard.dailyExpenses.daysShown": "Días mostrados",
        "dashboard.dailyExpenses.description":
          "Gastos reales por día durante el mes seleccionado.",
        "dashboard.dailyExpenses.spentSoFar": "Gastado hasta ahora",
        "dashboard.dailyExpenses.title": "Gasto diario",
      })[key] ?? key,
  }),
}));

describe("DailyExpensesSplineChart", () => {
  it("uses localized Spanish copy instead of hardcoded English", () => {
    render(
      <DailyExpensesSplineChart
        dailyExpensesOverTime={[{ amount: 25, date: "2026-10-01" }]}
        selectedMonth="2026-10"
      />,
    );

    expect(screen.getByText("Gasto diario")).toBeVisible();
    expect(screen.getByText("Promedio diario")).toBeVisible();
    expect(screen.queryByText("Daily spending")).not.toBeInTheDocument();
  });
});

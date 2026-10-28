import { describe, expect, it } from "vitest";

import { buildPeriodSummaries } from "@/lib/finance/period-summary";
import { type Transaction } from "@/lib/data";

function transaction(
  date: string,
  type: Transaction["type"],
  amount: number,
  personalDebtId?: string,
): Transaction {
  let group: Transaction["group"] = "needs";
  if (type === "income") group = "income";
  if (type === "saving") group = "savings";

  return {
    amount: type === "income" ? amount : -amount,
    categoryKey: type,
    date,
    descriptionKey: type,
    group,
    icon: "•",
    id: `${date}-${type}-${amount}`,
    personalDebtId,
    type,
  };
}

describe("buildPeriodSummaries", () => {
  it("separates consumption, savings, and debt payments by period", () => {
    const result = buildPeriodSummaries(
      [
        transaction("2026-10-28", "income", 1000),
        transaction("2026-10-28", "expense", 100),
        transaction("2026-10-27", "saving", 200),
        transaction("2026-10-26", "expense", 150, "debt-1"),
        transaction("2026-10-01", "expense", 50),
      ],
      "2026-10-28",
    );

    expect(result.day).toMatchObject({
      available: 900,
      expenses: 100,
      income: 1000,
    });
    expect(result.week).toMatchObject({
      available: 550,
      debtPayments: 150,
      savings: 200,
    });
    expect(result.month).toMatchObject({ available: 500, expenses: 150 });
  });
});

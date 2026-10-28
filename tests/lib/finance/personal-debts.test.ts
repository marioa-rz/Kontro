import { describe, expect, it } from "vitest";

import { summarizePersonalDebt } from "@/lib/finance/personal-debts";

describe("summarizePersonalDebt", () => {
  it("calculates paid and remaining amounts without exceeding principal", () => {
    expect(summarizePersonalDebt(1000, [200, 350, 900])).toEqual({
      paidAmount: 1000,
      remainingAmount: 0,
      status: "paid",
    });
  });

  it("keeps an unpaid debt active", () => {
    expect(summarizePersonalDebt(1000, [250])).toEqual({
      paidAmount: 250,
      remainingAmount: 750,
      status: "active",
    });
  });
});

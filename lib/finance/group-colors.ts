import { type BudgetGroup } from "@/lib/finance/budget";

export const GROUP_COLORS = {
  needs: "#E11D48",
  wants: "#BE185D",
  savings: "#DB2777",
} as const satisfies Record<BudgetGroup, string>;

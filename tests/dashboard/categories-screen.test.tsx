import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  CategoriesScreen,
  filterCategoriesByMovementType,
} from "@/components/dashboard/categories-screen";
import type { CategoryOverviewItem } from "@/lib/finance/transactions";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const translations: Record<string, string> = {
  "common.all": "All",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.expense": "Expenses",
  "common.income": "Income",
  "common.saving": "Savings",
  "screen.categories.description": "Categories used by your movements",
  "screen.categories.newCategory": "New category",
  "screen.categories.title": "Categories",
};

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    formatCurrency: (value: number) => `Q${value}`,
    t: (key: string) => translations[key] ?? key,
  }),
}));

function category(
  id: string,
  name: string,
  group: CategoryOverviewItem["group"],
): CategoryOverviewItem {
  return {
    canModify: true,
    color: "#be123c",
    group,
    icon: "🏷️",
    id,
    isDefault: false,
    isService: false,
    label: name,
    monthlyLimit: 0,
    name,
    spent: 0,
  };
}

const categories = [
  category("needs", "Rent", "needs"),
  category("wants", "Leisure", "wants"),
  category("savings", "Emergency fund", "savings"),
  category("income", "Salary", "income"),
];

describe("CategoriesScreen", () => {
  it("organizes categories by movement type instead of budget groups", () => {
    render(
      <CategoriesScreen
        categories={categories}
        createCategoryAction={vi.fn()}
        deleteCategoryAction={vi.fn()}
        updateCategoryAction={vi.fn()}
      />,
    );

    expect(screen.getByRole("tab", { name: "Expenses" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Income" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Savings" })).toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: "Needs" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: "Wants" }),
    ).not.toBeInTheDocument();

    expect(
      filterCategoriesByMovementType(categories, "expense").map(
        (item) => item.name,
      ),
    ).toEqual(["Rent", "Leisure"]);
    expect(
      filterCategoriesByMovementType(categories, "income").map(
        (item) => item.name,
      ),
    ).toEqual(["Salary"]);
    expect(
      filterCategoriesByMovementType(categories, "saving").map(
        (item) => item.name,
      ),
    ).toEqual(["Emergency fund"]);
  });
});

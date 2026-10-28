import { AppShell } from "@/components/dashboard/app-shell";
import { BudgetsScreen } from "@/components/dashboard/budgets-screen";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/transactions/actions";
import { getBudgetOverviewData } from "@/lib/finance/transactions";

type BudgetsPageProps = {
  searchParams?: Promise<{
    month?: string | string[];
  }>;
};

export default async function BudgetsPage({ searchParams }: BudgetsPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedMonth = Array.isArray(resolvedSearchParams?.month)
    ? resolvedSearchParams.month[0]
    : resolvedSearchParams?.month;
  const budgetOverviewData = await getBudgetOverviewData(selectedMonth);

  return (
    <AppShell>
      <BudgetsScreen
        budgetData={budgetOverviewData.budgetData}
        categories={budgetOverviewData.categories}
        createCategoryAction={createCategoryAction}
        updateCategoryAction={updateCategoryAction}
      />
    </AppShell>
  );
}

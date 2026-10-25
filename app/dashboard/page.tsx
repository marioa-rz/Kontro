import { Suspense } from "react";

import { AppShell } from "@/components/dashboard/app-shell";
import { FinancialFocus } from "@/components/dashboard/financial-focus";
import { SummarySection } from "@/components/dashboard/summary-section";
import {
  DashboardLoadingRegion,
  FinancialSummaryRegion,
} from "@/components/dashboard/localized-dashboard-regions";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TransactionsList } from "@/components/dashboard/transactions-list";
import {
  createCategoryAction,
  createTransactionAction,
} from "@/app/transactions/actions";
import {
  getDashboardData,
  getPaymentsDueData,
  getUserContext,
  listCategoryOverview,
} from "@/lib/finance/transactions";
import { buildDashboardFocusData } from "@/lib/finance/dashboard-focus";
import { AnimatedCard } from "@/components/ui/animated-card";

type DashboardPageProps = {
  searchParams?: Promise<{
    month?: string | string[];
  }>;
};

function DashboardContentFallback() {
  return (
    <DashboardLoadingRegion>
      <div className="h-84 animate-pulse rounded-xl border border-border bg-card/70 lg:h-81.5" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-33 animate-pulse rounded-xl border border-border bg-card/70"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="h-107.5 animate-pulse rounded-xl border border-border bg-card/70" />
        <div className="h-107.5 animate-pulse rounded-xl border border-border bg-card/70 lg:col-span-2" />
      </div>
    </DashboardLoadingRegion>
  );
}

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

function DashboardDetails({ dashboardData }: { dashboardData: DashboardData }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-2 lg:gap-6">
      <AnimatedCard index={4} className="h-full">
        <TransactionsList transactions={dashboardData.latestTransactions} />
      </AnimatedCard>
      <AnimatedCard index={5}>
        <QuickActions />
      </AnimatedCard>
    </div>
  );
}

async function DashboardContent({
  selectedMonth,
  userContext,
}: {
  selectedMonth?: string;
  userContext: Awaited<ReturnType<typeof getUserContext>>;
}) {
  const [dashboardData, categories, paymentsDue] = await Promise.all([
    getDashboardData(selectedMonth, userContext),
    listCategoryOverview(selectedMonth, userContext),
    getPaymentsDueData(selectedMonth, userContext),
  ]);
  const focusData = buildDashboardFocusData(categories, paymentsDue.invoices);

  return (
    <>
      <AnimatedCard index={0} className="mb-6 lg:mb-8">
        <FinancialSummaryRegion>
          <SummarySection
            summaryData={dashboardData.summaryData}
            categories={dashboardData.categories}
            paymentMethods={dashboardData.paymentMethods}
            createCategoryAction={createCategoryAction}
            onSubmit={createTransactionAction}
          />
        </FinancialSummaryRegion>
      </AnimatedCard>

      <FinancialFocus data={focusData} />
      <DashboardDetails dashboardData={dashboardData} />
    </>
  );
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedMonth = Array.isArray(resolvedSearchParams?.month)
    ? resolvedSearchParams.month[0]
    : resolvedSearchParams?.month;
  const userContext = await getUserContext();

  return (
    <AppShell userContext={userContext}>
      <Suspense fallback={<DashboardContentFallback />}>
        <DashboardContent
          selectedMonth={selectedMonth}
          userContext={userContext}
        />
      </Suspense>
    </AppShell>
  );
}

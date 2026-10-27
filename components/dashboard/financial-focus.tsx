"use client";

import Link from "next/link";
import { ArrowRight, Landmark, TrendingUp, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
  BudgetFocusItem,
  DashboardFocusData,
  DebtFocusItem,
} from "@/lib/finance/dashboard-focus";
import { useI18n } from "@/lib/i18n";

function progressValue(current: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

function EmptyState({
  message,
  href,
  action,
}: {
  message: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button asChild variant="link" className="mt-1 text-primary">
        <Link href={href}>
          {action}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

function BudgetRow({ item }: { item: BudgetFocusItem }) {
  const { formatCurrency, t } = useI18n();
  const isOverBudget = item.overAmount > 0;
  return (
    <div className="rounded-xl border border-border/70 bg-background/55 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-lg">{item.icon}</span>
          <span className="truncate font-medium">{t(item.label)}</span>
        </div>
        <span
          className={`shrink-0 font-semibold ${isOverBudget ? "text-destructive" : ""}`}
        >
          {formatCurrency(
            isOverBudget ? item.overAmount : item.remainingAmount,
          )}
        </span>
      </div>
      <p
        className={`mt-1 text-right text-xs ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}
      >
        {t(
          isOverBudget
            ? "dashboard.focus.overBudget"
            : "dashboard.focus.remaining",
        )}
      </p>
      <Progress
        value={progressValue(item.spentAmount, item.budgetAmount)}
        className="mt-3 h-2.5"
        style={{ "--progress-foreground": item.color } as React.CSSProperties}
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>
          {t("dashboard.focus.spent")}: {formatCurrency(item.spentAmount)}
        </span>
        <span>
          {t("dashboard.focus.of")} {formatCurrency(item.budgetAmount)}
        </span>
      </div>
    </div>
  );
}

function DebtRow({ item }: { item: DebtFocusItem }) {
  const { formatCurrency, formatDate, t } = useI18n();
  return (
    <div className="rounded-xl border border-border/70 bg-background/55 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{t(item.label)}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(item.dueDate)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-destructive">
            {formatCurrency(item.remainingAmount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("dashboard.focus.remaining")}
          </p>
        </div>
      </div>
      <Progress
        value={progressValue(item.paidAmount, item.totalAmount)}
        className="mt-3 h-2.5"
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>
          {t("dashboard.focus.paid")}: {formatCurrency(item.paidAmount)}
        </span>
        <span>
          {t("dashboard.focus.of")} {formatCurrency(item.totalAmount)}
        </span>
      </div>
    </div>
  );
}

function BudgetFocusCard({ data }: { data: DashboardFocusData }) {
  const { t } = useI18n();
  return (
    <Card className="border-border bg-card card-shadow">
      <CardHeader className="grid-cols-[auto_1fr] grid-rows-1 items-center gap-3">
        <span className="rounded-xl bg-primary/10 p-2 text-primary">
          <WalletCards className="size-5" />
        </span>
        <CardTitle className="leading-snug">
          {t("dashboard.focus.budgetTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.budgets.length ? (
          data.budgets.map((item) => <BudgetRow key={item.id} item={item} />)
        ) : (
          <EmptyState
            message={t("dashboard.focus.budgetEmpty")}
            href="/categories"
            action={t("dashboard.focus.configureBudgets")}
          />
        )}
      </CardContent>
    </Card>
  );
}

function DebtFocusCard({ data }: { data: DashboardFocusData }) {
  const { t } = useI18n();
  return (
    <Card className="border-border bg-card card-shadow">
      <CardHeader className="grid-cols-[auto_1fr] grid-rows-1 items-center gap-3">
        <span className="rounded-xl bg-destructive/10 p-2 text-destructive">
          <Landmark className="size-5" />
        </span>
        <CardTitle className="leading-snug">
          {t("dashboard.focus.debtTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.debts.length ? (
          data.debts.map((item) => <DebtRow key={item.id} item={item} />)
        ) : (
          <EmptyState
            message={t("dashboard.focus.debtEmpty")}
            href="/payments"
            action={t("dashboard.focus.manageDebts")}
          />
        )}
      </CardContent>
    </Card>
  );
}

function IncomeFocusCard({ data }: { data: DashboardFocusData }) {
  const { formatCurrency, t } = useI18n();
  return (
    <Card className="border-border bg-card card-shadow lg:col-span-2">
      <CardHeader className="grid-cols-[auto_1fr] grid-rows-1 items-center gap-3">
        <span className="rounded-xl bg-income/10 p-2 text-income">
          <TrendingUp className="size-5" />
        </span>
        <CardTitle className="leading-snug">
          {t("dashboard.focus.incomeTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.incomes.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.incomes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-border/70 bg-background/55 p-4"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="truncate text-sm font-medium">
                    {t(item.label)}
                  </span>
                </span>
                <span className="ml-3 font-semibold text-income">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            message={t("dashboard.focus.incomeEmpty")}
            href="/categories"
            action={t("dashboard.focus.configureIncome")}
          />
        )}
      </CardContent>
    </Card>
  );
}

export function FinancialFocus({
  data,
}: {
  readonly data: DashboardFocusData;
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-2 lg:gap-6">
      <BudgetFocusCard data={data} />
      <DebtFocusCard data={data} />
      <IncomeFocusCard data={data} />
    </div>
  );
}

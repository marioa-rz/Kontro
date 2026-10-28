"use client";

import { useState } from "react";

import { Download } from "lucide-react";

import { NewCategoryDialog } from "@/components/dashboard/new-category-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  type BudgetData,
  type CategoryOverviewItem,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/finance/transactions";
import { calculateBudgetUsage } from "@/lib/finance/budget";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type BudgetsScreenProps = {
  readonly budgetData: BudgetData;
  readonly categories: CategoryOverviewItem[];
  readonly createCategoryAction?: (data: CreateCategoryInput) => Promise<void>;
  readonly updateCategoryAction?: (data: UpdateCategoryInput) => Promise<void>;
};

const unavailableCreateCategoryAction = async () => {
  throw new Error("Category creation is unavailable on this screen.");
};

const unavailableUpdateCategoryAction = async () => {
  throw new Error("Budget updates are unavailable on this screen.");
};

export function csvEscape(value: string | number | null) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function buildBudgetTotals(budgetData: BudgetData) {
  const totalBudget =
    budgetData.needs.budget +
    budgetData.wants.budget +
    budgetData.savings.budget;
  const totalSpent =
    budgetData.needs.spent + budgetData.wants.spent + budgetData.savings.spent;
  const totalPlannedSpent =
    budgetData.needs.plannedSpent +
    budgetData.wants.plannedSpent +
    budgetData.savings.plannedSpent;
  const totalUsage = calculateBudgetUsage(totalSpent, totalBudget);

  return { totalBudget, totalSpent, totalPlannedSpent, totalUsage };
}

function buildBudgetCsvRows({
  budgetData,
  includePlanned,
  t,
}: {
  budgetData: BudgetData;
  includePlanned: boolean;
  t: (key: string) => string;
}) {
  const groups = ["needs", "wants", "savings"] as const;

  return [
    [
      t("export.group"),
      t("common.spent"),
      ...(includePlanned ? [t("common.planned")] : []),
      t("export.budget"),
      "%",
    ],
    ...groups.map((key) => {
      const group = budgetData[key];
      return [
        t(`data.group.${key}`),
        group.spent.toFixed(2),
        ...(includePlanned ? [group.plannedSpent.toFixed(2)] : []),
        group.budget.toFixed(2),
        `${group.percentage}%`,
      ];
    }),
  ];
}

/* c8 ignore start */
function downloadBudgetCsv({
  budgetData,
  includePlanned,
  t,
}: {
  budgetData: BudgetData;
  includePlanned: boolean;
  t: (key: string) => string;
}) {
  const rows = buildBudgetCsvRows({ budgetData, includePlanned, t });
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kontro-presupuesto.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
/* c8 ignore stop */

function useBudgetsScreenState({
  budgetData,
}: Pick<BudgetsScreenProps, "budgetData">) {
  const { t } = useI18n();
  const [includePlanned, setIncludePlanned] = useState(false);
  const totals = buildBudgetTotals(budgetData);
  const downloadCsv = () =>
    downloadBudgetCsv({ budgetData, includePlanned, t });

  return {
    includePlanned,
    setIncludePlanned,
    ...totals,
    downloadCsv,
  };
}

type BudgetsSummaryCardData = {
  label: string;
  value: string;
  note: string;
  sub: string | null;
};

function buildBudgetsSummaryCards({
  totalBudget,
  totalSpent,
  totalPlannedSpent,
  totalUsage,
  formatCurrency,
  t,
}: {
  totalBudget: number;
  totalSpent: number;
  totalPlannedSpent: number;
  totalUsage: ReturnType<typeof calculateBudgetUsage>;
  formatCurrency: (value: number) => string;
  t: (key: string) => string;
}): BudgetsSummaryCardData[] {
  return [
    {
      label: t("screen.budgets.totalBudget"),
      value: formatCurrency(totalBudget),
      note: t("screen.budgets.monthlyAllocation"),
      sub: null,
    },
    {
      label: t("screen.budgets.totalSpent"),
      value: formatCurrency(totalSpent),
      note: `${totalUsage.usagePercentage}% ${t("common.ofBudget")}`,
      sub:
        totalPlannedSpent !== totalSpent
          ? `${t("screen.budgets.plannedLabel")}: ${formatCurrency(totalPlannedSpent)}`
          : null,
    },
    {
      label: totalUsage.isOverBudget
        ? t("common.overBudget")
        : t("common.left"),
      value: formatCurrency(
        totalUsage.isOverBudget
          ? totalUsage.exceededAmount
          : totalUsage.remainingAmount,
      ),
      note: totalUsage.isOverBudget
        ? t("common.overBudget")
        : t("screen.budgets.leftToSpend"),
      sub: null,
    },
  ];
}

function BudgetsSummaryCards(props: {
  readonly totalBudget: number;
  readonly totalSpent: number;
  readonly totalPlannedSpent: number;
  readonly totalUsage: ReturnType<typeof calculateBudgetUsage>;
  readonly formatCurrency: (value: number) => string;
  readonly t: (key: string) => string;
}) {
  const cards = buildBudgetsSummaryCards(props);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label} className="border-border bg-card card-shadow">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{card.note}</p>
            {card.sub ? (
              <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BudgetsToolbar({
  includePlanned,
  setIncludePlanned,
  downloadCsv,
  t,
}: {
  readonly includePlanned: boolean;
  readonly setIncludePlanned: (value: boolean) => void;
  readonly downloadCsv: () => void;
  readonly t: (key: string) => string;
}) {
  return (
    <div className="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
      <div className="flex items-center gap-2">
        <Switch
          id="include-planned"
          checked={includePlanned}
          onCheckedChange={setIncludePlanned}
        />
        <Label
          htmlFor="include-planned"
          className="text-sm text-muted-foreground cursor-pointer"
        >
          {t("screen.budgets.includePlanned")}
        </Label>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadCsv}
        className="gap-2 sm:w-auto"
      >
        <Download className="size-4" />
        {t("screen.budgets.exportCsv")}
      </Button>
    </div>
  );
}

type CategoryBudgetItemProps = {
  readonly category: CategoryOverviewItem;
  readonly createCategoryAction: (data: CreateCategoryInput) => Promise<void>;
  readonly formatCurrency: (value: number) => string;
  readonly t: (key: string) => string;
  readonly updateCategoryAction: (data: UpdateCategoryInput) => Promise<void>;
};

function ConfiguredCategoryBudget(props: CategoryBudgetItemProps) {
  const { category, formatCurrency, t } = props;
  const usage = calculateBudgetUsage(category.spent, category.monthlyLimit);

  return (
    <>
      <span
        className={cn(
          "text-sm",
          usage.isOverBudget
            ? "font-medium text-destructive"
            : "text-muted-foreground",
        )}
      >
        {formatCurrency(category.spent)} /{" "}
        {formatCurrency(category.monthlyLimit)}
      </span>
      <div
        className="col-span-2 overflow-hidden rounded-full bg-secondary"
        style={{
          // @ts-expect-error CSS variable
          "--progress-foreground": usage.isOverBudget
            ? "var(--destructive)"
            : category.color,
        }}
      >
        <Progress value={usage.progressValue} className="h-2" />
      </div>
      <div className="col-span-2 flex justify-between gap-3 text-xs text-muted-foreground">
        <span>
          {t("common.spent")}: {formatCurrency(category.spent)}
        </span>
        <span className={usage.isOverBudget ? "text-destructive" : ""}>
          {usage.isOverBudget
            ? `${formatCurrency(usage.exceededAmount)} ${t("common.overBudget")}`
            : `${formatCurrency(usage.remainingAmount)} ${t("common.left")}`}
        </span>
      </div>
      <div className="col-span-2 flex justify-end">
        <BudgetLimitDialogButton {...props} />
      </div>
    </>
  );
}

function BudgetLimitDialogButton(props: CategoryBudgetItemProps) {
  const { category, t } = props;
  return (
    <NewCategoryDialog
      purpose="budget"
      category={{
        group: category.group,
        icon: category.icon,
        id: category.id,
        monthlyLimit: category.monthlyLimit,
        name: category.name,
      }}
      createCategoryAction={props.createCategoryAction}
      updateCategoryAction={props.updateCategoryAction}
    >
      <Button variant="link" size="sm" className="h-auto px-0">
        {t("screen.budgets.configureBudget")}
      </Button>
    </NewCategoryDialog>
  );
}

function CategoryBudgetItem(props: CategoryBudgetItemProps) {
  const { category, t } = props;

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 rounded-lg bg-accent/50 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <span>{category.icon}</span>
        <span className="truncate font-medium text-foreground">
          {t(category.label)}
        </span>
      </div>
      {category.monthlyLimit > 0 ? (
        <ConfiguredCategoryBudget {...props} />
      ) : (
        <div className="col-span-2 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{t("category.noMonthlyLimit")}</span>
          <BudgetLimitDialogButton {...props} />
        </div>
      )}
    </div>
  );
}

function CategoryBudgetsCard({
  categories,
  createCategoryAction,
  formatCurrency,
  t,
  updateCategoryAction,
}: {
  readonly categories: CategoryOverviewItem[];
  readonly createCategoryAction: (data: CreateCategoryInput) => Promise<void>;
  readonly formatCurrency: (value: number) => string;
  readonly t: (key: string) => string;
  readonly updateCategoryAction: (data: UpdateCategoryInput) => Promise<void>;
}) {
  const budgetCategories = categories.filter(
    (category) => category.group !== "income",
  );

  return (
    <Card className="border-border bg-card card-shadow">
      <CardHeader>
        <CardTitle className="text-lg">
          {t("screen.budgets.categoryBudgets")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {budgetCategories.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {budgetCategories.map((category) => (
              <CategoryBudgetItem
                key={category.id}
                category={category}
                createCategoryAction={createCategoryAction}
                formatCurrency={formatCurrency}
                t={t}
                updateCategoryAction={updateCategoryAction}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("common.noDataForPeriod")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function BudgetsScreen({
  budgetData,
  categories,
  createCategoryAction = unavailableCreateCategoryAction,
  updateCategoryAction = unavailableUpdateCategoryAction,
}: BudgetsScreenProps) {
  const { formatCurrency, t } = useI18n();
  const state = useBudgetsScreenState({ budgetData });

  return (
    <>
      <PageHeader
        title={t("screen.budgets.title")}
        description={t("screen.budgets.track")}
      />

      <BudgetsSummaryCards {...state} formatCurrency={formatCurrency} t={t} />
      <BudgetsToolbar {...state} t={t} />

      <CategoryBudgetsCard
        categories={categories}
        createCategoryAction={createCategoryAction}
        formatCurrency={formatCurrency}
        t={t}
        updateCategoryAction={updateCategoryAction}
      />
    </>
  );
}

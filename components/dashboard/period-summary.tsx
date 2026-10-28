"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type PeriodSummaries } from "@/lib/finance/period-summary";
import { useI18n } from "@/lib/i18n";

type Period = keyof PeriodSummaries;

function SummaryRow({
  period,
  summary,
}: {
  period: Period;
  summary: PeriodSummaries[Period];
}) {
  const { formatCurrency, t } = useI18n();
  const values = [
    [summary.income, "text-income"],
    [summary.expenses, "text-expense"],
    [summary.savings, "text-savings"],
    [summary.debtPayments, "text-destructive"],
    [summary.available, "font-semibold"],
  ] as const;

  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-3 font-medium">{t(`periodSummary.${period}`)}</td>
      {values.map(([value, className], index) => (
        <td key={index} className={`py-3 text-right ${className}`}>
          {formatCurrency(value)}
        </td>
      ))}
    </tr>
  );
}

export function PeriodSummary({ summaries }: { summaries: PeriodSummaries }) {
  const { t } = useI18n();
  const rows = ["day", "week", "month"] as const;

  return (
    <Card className="mt-4 border-border bg-card card-shadow lg:mt-6">
      <CardHeader>
        <CardTitle className="text-lg">{t("periodSummary.title")}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-160 text-sm">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              {[
                "period",
                "income",
                "expense",
                "saving",
                "debt",
                "available",
              ].map((key) => (
                <th
                  key={key}
                  className={
                    key === "period" ? "py-2 text-left" : "py-2 text-right"
                  }
                >
                  {t(`periodSummary.${key}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((period) => (
              <SummaryRow
                key={period}
                period={period}
                summary={summaries[period]}
              />
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

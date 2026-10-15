"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/lib/i18n";

export function DashboardLoadingRegion({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { t } = useI18n();

  return (
    <div
      aria-label={t("dashboard.loadingLabel")}
      className="space-y-4 lg:space-y-6"
    >
      {children}
    </div>
  );
}

export function FinancialSummaryRegion({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { t } = useI18n();

  return (
    <section aria-label={t("dashboard.financialSummaryLabel")}>
      {children}
    </section>
  );
}

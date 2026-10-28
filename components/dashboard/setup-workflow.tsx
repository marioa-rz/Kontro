"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { buildSetupWorkflow } from "@/lib/finance/workflow";
import { useI18n } from "@/lib/i18n";

type SetupWorkflowData = ReturnType<typeof buildSetupWorkflow>;

export function SetupWorkflow({
  workflow,
}: {
  readonly workflow: SetupWorkflowData;
}) {
  const { t } = useI18n();
  if (workflow.isComplete) return null;

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5 card-shadow">
      <CardHeader className="gap-1">
        <CardTitle>{t("workflow.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("workflow.description")} {workflow.completedRequiredSteps}/
          {workflow.totalRequiredSteps}
        </p>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {workflow.steps.map((step) => {
          const Icon = step.isComplete ? CheckCircle2 : Circle;
          return (
            <Link
              key={step.id}
              href={step.href}
              className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background/80 px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-background"
            >
              <Icon
                className={
                  step.isComplete
                    ? "size-4 shrink-0 text-income"
                    : "size-4 shrink-0 text-primary"
                }
              />
              <span className="min-w-0 flex-1">
                {t(`workflow.step.${step.id}`)}
                {step.isOptional ? (
                  <span className="block text-xs text-muted-foreground">
                    {t("workflow.optional")}
                  </span>
                ) : null}
              </span>
              {!step.isComplete ? (
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              ) : null}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

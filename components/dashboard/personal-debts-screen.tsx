"use client";

import { CalendarDays, CheckCircle2, HandCoins, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { type PersonalDebt } from "@/lib/finance/personal-debts";
import { useI18n } from "@/lib/i18n";

type FormAction = (formData: FormData) => Promise<void>;

type PersonalDebtsScreenProps = {
  createAction: FormAction;
  debts: PersonalDebt[];
  deleteAction: FormAction;
  recordPaymentAction: FormAction;
};

function NewDebtForm({ action }: { action: FormAction }) {
  const { t } = useI18n();

  return (
    <Card className="border-border bg-card card-shadow">
      <CardHeader>
        <CardTitle>{t("debts.createTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="debt-name">{t("debts.name")}</Label>
            <Input id="debt-name" name="name" required maxLength={160} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debt-counterparty">{t("debts.counterparty")}</Label>
            <Input id="debt-counterparty" name="counterparty" maxLength={160} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debt-principal">{t("debts.originalAmount")}</Label>
            <Input
              id="debt-principal"
              name="principal"
              type="number"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debt-due-date">{t("debts.dueDate")}</Label>
            <Input id="debt-due-date" name="dueDate" type="date" />
          </div>
          <Button type="submit" className="md:col-span-2 md:justify-self-start">
            <HandCoins className="size-4" />
            {t("debts.create")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DebtAmounts({ debt }: { debt: PersonalDebt }) {
  const { formatCurrency, t } = useI18n();
  const items = [
    ["debts.originalAmount", debt.principal, ""],
    ["debts.paidAmount", debt.paidAmount, "text-income"],
    ["debts.remainingAmount", debt.remainingAmount, "text-destructive"],
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      {items.map(([label, amount, className]) => (
        <div key={label}>
          <p className="text-muted-foreground">{t(label)}</p>
          <p className={`font-semibold ${className}`}>
            {formatCurrency(amount)}
          </p>
        </div>
      ))}
    </div>
  );
}

function DebtPayment({
  action,
  debt,
}: {
  action: FormAction;
  debt: PersonalDebt;
}) {
  const { t } = useI18n();

  if (debt.status === "paid") {
    return (
      <p className="flex items-center gap-2 text-sm text-income">
        <CheckCircle2 className="size-4" />
        {t("debts.paidMessage")}
      </p>
    );
  }

  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="debtId" value={debt.id} />
      <Input
        name="amount"
        type="number"
        min="0.01"
        max={debt.remainingAmount}
        step="0.01"
        required
        placeholder={t("debts.paymentAmount")}
      />
      <Button type="submit">{t("debts.recordPayment")}</Button>
    </form>
  );
}

function DebtDueDate({ dueDate }: { dueDate: string }) {
  const { formatDate, t } = useI18n();
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <CalendarDays className="size-4" />
      {t("debts.dueDate")}: {formatDate(dueDate)}
    </p>
  );
}

function DebtCard({
  debt,
  deleteAction,
  recordPaymentAction,
}: {
  debt: PersonalDebt;
  deleteAction: FormAction;
  recordPaymentAction: FormAction;
}) {
  const { t } = useI18n();
  const percentage =
    debt.principal > 0 ? (debt.paidAmount / debt.principal) * 100 : 0;

  return (
    <Card className="border-border bg-card card-shadow">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">{debt.name}</CardTitle>
          {debt.counterparty ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {debt.counterparty}
            </p>
          ) : null}
        </div>
        <Badge variant={debt.status === "paid" ? "secondary" : "outline"}>
          {debt.status === "paid" ? t("debts.paid") : t("debts.active")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={percentage} aria-label={t("debts.progress")} />
        <DebtAmounts debt={debt} />
        {debt.dueDate ? <DebtDueDate dueDate={debt.dueDate} /> : null}
        <DebtPayment action={recordPaymentAction} debt={debt} />
        <form action={deleteAction}>
          <input type="hidden" name="debtId" value={debt.id} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-destructive"
          >
            <Trash2 className="size-4" />
            {t("common.delete")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function PersonalDebtsScreen({
  createAction,
  debts,
  deleteAction,
  recordPaymentAction,
}: PersonalDebtsScreenProps) {
  const { t } = useI18n();

  return (
    <>
      <PageHeader
        title={t("debts.title")}
        description={t("debts.description")}
      />
      <NewDebtForm action={createAction} />
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">{t("debts.listTitle")}</h2>
        {debts.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {debts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                deleteAction={deleteAction}
                recordPaymentAction={recordPaymentAction}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {t("debts.empty")}
            </CardContent>
          </Card>
        )}
      </section>
    </>
  );
}

import { type Transaction } from "@/lib/data";

export type PeriodFinanceSummary = {
  available: number;
  debtPayments: number;
  expenses: number;
  income: number;
  savings: number;
};

export type PeriodSummaries = Record<
  "day" | "week" | "month",
  PeriodFinanceSummary
>;

function shiftDate(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function summarize(transactions: Transaction[]): PeriodFinanceSummary {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const expenses = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" && !transaction.personalDebtId,
    )
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const savings = transactions
    .filter((transaction) => transaction.type === "saving")
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const debtPayments = transactions
    .filter((transaction) => transaction.personalDebtId)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  return {
    available: income - expenses - savings - debtPayments,
    debtPayments,
    expenses,
    income,
    savings,
  };
}

export function buildPeriodSummaries(
  transactions: Transaction[],
  endDate: string,
): PeriodSummaries {
  const actualTransactions = transactions.filter(
    (transaction) =>
      !transaction.isPlanned && !transaction.isCreditCardInvoicePurchase,
  );
  const weekStart = shiftDate(endDate, -6);
  const monthPrefix = endDate.slice(0, 7);

  return {
    day: summarize(
      actualTransactions.filter((transaction) => transaction.date === endDate),
    ),
    week: summarize(
      actualTransactions.filter(
        (transaction) =>
          transaction.date >= weekStart && transaction.date <= endDate,
      ),
    ),
    month: summarize(
      actualTransactions.filter((transaction) =>
        transaction.date.startsWith(monthPrefix),
      ),
    ),
  };
}

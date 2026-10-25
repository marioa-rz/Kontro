import type {
  CategoryOverviewItem,
  PaymentInvoiceItem,
} from "@/lib/finance/transactions";

export type BudgetFocusItem = {
  budgetAmount: number;
  color: string;
  icon: string;
  id: string;
  label: string;
  overAmount: number;
  remainingAmount: number;
  spentAmount: number;
};

export type IncomeFocusItem = {
  amount: number;
  icon: string;
  id: string;
  label: string;
};

export type DebtFocusItem = {
  dueDate: string;
  id: string;
  label: string;
  paidAmount: number;
  remainingAmount: number;
  totalAmount: number;
};

export type DashboardFocusData = {
  budgets: BudgetFocusItem[];
  debts: DebtFocusItem[];
  incomes: IncomeFocusItem[];
};

type DebtSource = Pick<
  PaymentInvoiceItem,
  "dueDate" | "id" | "paidAmount" | "paymentMethodKey" | "totalAmount"
>;

export function buildDashboardFocusData(
  categories: CategoryOverviewItem[],
  invoices: DebtSource[],
): DashboardFocusData {
  const budgets = categories
    .filter(
      (category) =>
        category.group !== "income" &&
        category.group !== "savings" &&
        category.monthlyLimit > 0,
    )
    .map((category) => {
      const balance = category.monthlyLimit - category.spent;
      return {
        budgetAmount: category.monthlyLimit,
        color: category.color,
        icon: category.icon,
        id: category.id,
        label: category.label,
        overAmount: Math.max(-balance, 0),
        remainingAmount: Math.max(balance, 0),
        spentAmount: category.spent,
      };
    })
    .sort((left, right) => right.spentAmount - left.spentAmount);

  const debts = invoices
    .map((invoice) => ({
      dueDate: invoice.dueDate,
      id: invoice.id,
      label: invoice.paymentMethodKey,
      paidAmount: invoice.paidAmount,
      remainingAmount: Math.max(invoice.totalAmount - invoice.paidAmount, 0),
      totalAmount: invoice.totalAmount,
    }))
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate));

  const incomes = categories
    .filter((category) => category.group === "income")
    .map((category) => ({
      amount: category.spent,
      icon: category.icon,
      id: category.id,
      label: category.label,
    }))
    .sort((left, right) => right.amount - left.amount);

  return { budgets, debts, incomes };
}

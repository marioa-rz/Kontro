import "server-only";

import {
  decryptField,
  encryptDescription,
  encryptField,
} from "@/lib/crypto/field-encryption";
import { getGuatemalaDateValue } from "@/lib/datetime/guatemala";
import { getUserContext } from "@/lib/finance/transactions";

export type PersonalDebtStatus = "active" | "paid";

export type PersonalDebt = {
  counterparty: string | null;
  dueDate: string | null;
  id: string;
  name: string;
  paidAmount: number;
  principal: number;
  remainingAmount: number;
  status: PersonalDebtStatus;
};

type PersonalDebtPaymentRow = { amount: number | string };
type PersonalDebtRow = {
  counterparty: string | null;
  due_date: string | null;
  id: string;
  name: string;
  personal_debt_payments: PersonalDebtPaymentRow[] | null;
  principal: number | string;
};

export function summarizePersonalDebt(
  principal: number,
  payments: number[],
): Pick<PersonalDebt, "paidAmount" | "remainingAmount" | "status"> {
  const safePrincipal = Math.max(principal, 0);
  const paidAmount = Math.min(
    payments.reduce((sum, amount) => sum + Math.max(amount, 0), 0),
    safePrincipal,
  );
  const remainingAmount = Math.max(safePrincipal - paidAmount, 0);

  return {
    paidAmount,
    remainingAmount,
    status: remainingAmount === 0 ? "paid" : "active",
  };
}

export async function listPersonalDebts(): Promise<PersonalDebt[]> {
  const { supabase, userId } = await getUserContext();
  const { data, error } = await supabase
    .from("personal_debts")
    .select(
      "id,name,counterparty,principal,due_date,personal_debt_payments(amount)",
    )
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw new Error(`Unable to list personal debts: ${error.message}`);

  return ((data ?? []) as PersonalDebtRow[]).map((debt) => {
    const principal = Number(debt.principal);
    const summary = summarizePersonalDebt(
      principal,
      (debt.personal_debt_payments ?? []).map((payment) =>
        Number(payment.amount),
      ),
    );

    return {
      counterparty: decryptField(debt.counterparty),
      dueDate: debt.due_date,
      id: debt.id,
      name: decryptField(debt.name) ?? "",
      principal,
      ...summary,
    };
  });
}

export async function createPersonalDebt(input: {
  counterparty?: string | null;
  dueDate?: string | null;
  name: string;
  principal: number;
}) {
  const { supabase, userId } = await getUserContext();
  const { error } = await supabase.from("personal_debts").insert({
    counterparty: encryptField(input.counterparty?.trim() || null),
    due_date: input.dueDate || null,
    name: encryptField(input.name.trim()),
    principal: input.principal,
    user_id: userId,
  });

  if (error)
    throw new Error(`Unable to create personal debt: ${error.message}`);
}

export async function recordPersonalDebtPayment(
  debtId: string,
  amount: number,
) {
  const { supabase, userId } = await getUserContext();
  const { data, error } = await supabase.rpc("record_personal_debt_payment", {
    p_amount: amount,
    p_debt_id: debtId,
    p_description: encryptDescription("transaction.personalDebtPayment"),
    p_notes: encryptField(`personal-debt:${debtId}`),
    p_paid_at: getGuatemalaDateValue(),
    p_user_id: userId,
  });

  if (error) throw new Error(`Unable to record debt payment: ${error.message}`);
  if (data === null) throw new Error("Personal debt not found.");
  if (Number(data) <= 0) throw new Error("Personal debt is already paid.");
}

export async function deletePersonalDebt(debtId: string) {
  const { supabase, userId } = await getUserContext();
  const { error } = await supabase
    .from("personal_debts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", debtId)
    .eq("user_id", userId);

  if (error)
    throw new Error(`Unable to delete personal debt: ${error.message}`);
}

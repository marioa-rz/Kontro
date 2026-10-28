"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createPersonalDebt,
  deletePersonalDebt,
  recordPersonalDebtPayment,
} from "@/lib/finance/personal-debts";

const uuidSchema = z.string().uuid();
const amountSchema = z.coerce.number().finite().positive().max(1_000_000_000);

function revalidateDebtViews() {
  revalidatePath("/dashboard");
  revalidatePath("/debts");
  revalidatePath("/payments");
}

export async function createPersonalDebtAction(formData: FormData) {
  const input = z
    .object({
      counterparty: z.string().trim().max(160).optional(),
      dueDate: z.union([z.literal(""), z.string().date()]).optional(),
      name: z.string().trim().min(1).max(160),
      principal: amountSchema,
    })
    .parse(Object.fromEntries(formData));

  await createPersonalDebt(input);
  revalidateDebtViews();
}

export async function recordPersonalDebtPaymentAction(formData: FormData) {
  const debtId = uuidSchema.parse(formData.get("debtId"));
  const amount = amountSchema.parse(formData.get("amount"));
  await recordPersonalDebtPayment(debtId, amount);
  revalidateDebtViews();
}

export async function deletePersonalDebtAction(formData: FormData) {
  const debtId = uuidSchema.parse(formData.get("debtId"));
  await deletePersonalDebt(debtId);
  revalidateDebtViews();
}

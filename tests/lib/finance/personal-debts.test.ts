import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserContext } = vi.hoisted(() => ({ getUserContext: vi.fn() }));

vi.mock("@/lib/finance/transactions", () => ({ getUserContext }));
vi.mock("@/lib/crypto/field-encryption", () => ({
  decryptField: (value: string | null | undefined) =>
    value ? `decrypted:${value}` : null,
  encryptDescription: (value: string) => `description:${value}`,
  encryptField: (value: string | null | undefined) =>
    value ? `encrypted:${value}` : null,
}));
vi.mock("@/lib/datetime/guatemala", () => ({
  getGuatemalaDateValue: () => "2026-10-28",
}));

import {
  createPersonalDebt,
  deletePersonalDebt,
  listPersonalDebts,
  recordPersonalDebtPayment,
  summarizePersonalDebt,
} from "@/lib/finance/personal-debts";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const DEBT_ID = "22222222-2222-4222-8222-222222222222";

function query(response: { data?: unknown; error?: unknown }) {
  const builder: Record<string, unknown> = {};
  const chain = vi.fn(() => builder);
  Object.assign(builder, {
    eq: chain,
    insert: chain,
    is: chain,
    order: chain,
    select: chain,
    update: chain,
    then: (
      resolve: (value: unknown) => void,
      reject: (reason: unknown) => void,
    ) => Promise.resolve(response).then(resolve, reject),
  });
  return builder;
}

function setup(
  response: { data?: unknown; error?: unknown } = { error: null },
) {
  const builder = query(response);
  const supabase = { from: vi.fn(() => builder), rpc: vi.fn() };
  getUserContext.mockResolvedValue({ supabase, userId: USER_ID });
  return { builder, supabase };
}

beforeEach(() => vi.clearAllMocks());

describe("summarizePersonalDebt", () => {
  it("caps payments at the principal", () => {
    expect(summarizePersonalDebt(1000, [200, 350, 900])).toEqual({
      paidAmount: 1000,
      remainingAmount: 0,
      status: "paid",
    });
  });

  it("normalizes negative values", () => {
    expect(summarizePersonalDebt(-100, [-25])).toEqual({
      paidAmount: 0,
      remainingAmount: 0,
      status: "paid",
    });
  });
});

describe("listPersonalDebts", () => {
  it("maps encrypted rows and payment totals", async () => {
    setup({
      data: [
        {
          counterparty: "lender",
          due_date: "2026-12-01",
          id: DEBT_ID,
          name: "loan",
          personal_debt_payments: [{ amount: "25" }],
          principal: "100",
        },
        {
          counterparty: null,
          due_date: null,
          id: "33333333-3333-4333-8333-333333333333",
          name: "",
          personal_debt_payments: null,
          principal: 50,
        },
      ],
      error: null,
    });

    await expect(listPersonalDebts()).resolves.toEqual([
      expect.objectContaining({
        counterparty: "decrypted:lender",
        name: "decrypted:loan",
        paidAmount: 25,
        remainingAmount: 75,
      }),
      expect.objectContaining({ counterparty: null, name: "", paidAmount: 0 }),
    ]);
  });

  it("handles empty results and query failures", async () => {
    setup({ data: null, error: null });
    await expect(listPersonalDebts()).resolves.toEqual([]);
    setup({ error: { message: "list failed" } });
    await expect(listPersonalDebts()).rejects.toThrow(
      "Unable to list personal debts: list failed",
    );
  });
});

describe("createPersonalDebt", () => {
  it("encrypts values and inserts an owned debt", async () => {
    const { builder } = setup();
    await createPersonalDebt({
      counterparty: "  Ana  ",
      dueDate: "2026-12-01",
      name: "  Loan  ",
      principal: 100,
    });
    expect(builder.insert).toHaveBeenCalledWith({
      counterparty: "encrypted:Ana",
      due_date: "2026-12-01",
      name: "encrypted:Loan",
      principal: 100,
      user_id: USER_ID,
    });
  });

  it("handles optional values and insert failures", async () => {
    const { builder } = setup();
    await createPersonalDebt({ name: "Loan", principal: 100 });
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ counterparty: null, due_date: null }),
    );
    setup({ error: { message: "insert failed" } });
    await expect(
      createPersonalDebt({ name: "Loan", principal: 100 }),
    ).rejects.toThrow("Unable to create personal debt: insert failed");
  });
});

describe("recordPersonalDebtPayment", () => {
  it("records an encrypted, dated payment", async () => {
    const { supabase } = setup();
    supabase.rpc.mockResolvedValue({ data: 25, error: null });
    await recordPersonalDebtPayment(DEBT_ID, 25);
    expect(supabase.rpc).toHaveBeenCalledWith("record_personal_debt_payment", {
      p_amount: 25,
      p_debt_id: DEBT_ID,
      p_description: "description:transaction.personalDebtPayment",
      p_notes: `encrypted:personal-debt:${DEBT_ID}`,
      p_paid_at: "2026-10-28",
      p_user_id: USER_ID,
    });
  });

  it.each([
    [
      { data: null, error: { message: "rpc failed" } },
      "Unable to record debt payment: rpc failed",
    ],
    [{ data: null, error: null }, "Personal debt not found."],
    [{ data: 0, error: null }, "Personal debt is already paid."],
  ])("reports payment failure %#", async (response, message) => {
    const { supabase } = setup();
    supabase.rpc.mockResolvedValue(response);
    await expect(recordPersonalDebtPayment(DEBT_ID, 25)).rejects.toThrow(
      message,
    );
  });
});

describe("deletePersonalDebt", () => {
  it("soft deletes an owned debt and reports failures", async () => {
    const { builder } = setup();
    await deletePersonalDebt(DEBT_ID);
    expect(builder.update).toHaveBeenCalledWith({
      deleted_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
    setup({ error: { message: "delete failed" } });
    await expect(deletePersonalDebt(DEBT_ID)).rejects.toThrow(
      "Unable to delete personal debt: delete failed",
    );
  });
});

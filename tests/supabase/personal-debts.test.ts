import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/013_add_personal_debts.sql",
  "utf8",
);

describe("personal debts migration", () => {
  it("creates owner-scoped debts, payments, and an atomic payment RPC", () => {
    expect(migration).toContain(
      "create table if not exists public.personal_debts",
    );
    expect(migration).toContain(
      "create table if not exists public.personal_debt_payments",
    );
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("force row level security");
    expect(migration).toContain(
      "create or replace function public.record_personal_debt_payment",
    );
    expect(migration).toContain("personal_debt_id uuid");
    expect(migration).toContain("insert into public.transactions");
    expect(migration).toContain("security definer");
    expect(migration).toContain(
      "revoke insert, update, delete on public.personal_debt_payments from authenticated",
    );
    expect(migration).toContain("invalid goal for transaction owner");
    expect(migration).toContain("invalid personal debt for transaction owner");
    expect(migration).toContain("grant execute");
  });
});

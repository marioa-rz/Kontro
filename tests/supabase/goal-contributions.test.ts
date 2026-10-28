import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/012_goal_contributions_and_personal_debts.sql",
  "utf8",
);

describe("goal contribution migration", () => {
  it("links savings to goals and records contributions atomically", () => {
    expect(migration).toContain("add column if not exists goal_id uuid");
    expect(migration).toContain(
      "create or replace function public.record_goal_contribution",
    );
    expect(migration).toContain("insert into public.transactions");
    expect(migration).toContain("kind");
    expect(migration).toContain("'saving'");
    expect(migration).toContain("update public.goals");
    expect(migration).toContain("grant execute");
  });
});

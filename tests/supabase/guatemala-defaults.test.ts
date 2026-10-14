import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve("supabase/migrations/011_localize_guatemala_defaults.sql"),
  "utf8",
);

describe("Guatemala onboarding defaults migration", () => {
  it.each([
    "Mi gato",
    "Universidad",
    "Transporte",
    "Alimentación",
    "Supermercado",
    "Luz",
    "Recargas telefónicas",
    "Deudas",
    "Gastos personales",
    "Salud",
    "Negocio de uñas",
    "Entretenimiento",
    "Imprevistos y emergencias",
    "Suscripciones y aplicaciones",
    "Ahorro",
    "Ingresos",
    "Ingresos del negocio de uñas",
  ])("creates the %s category for each new user", (category) => {
    expect(migration).toContain(`'${category}'`);
  });

  it.each([
    ["Transferencia bancaria", "bank"],
    ["Efectivo", "cash"],
    ["Tarjeta de crédito", "credit"],
    ["Tarjeta de débito", "debit"],
  ])("creates payment method %s with type %s", (name, type) => {
    expect(migration).toContain(`'${name}', '${type}'`);
  });

  it("keeps the signup function privileged but constrained", () => {
    expect(migration).toMatch(/security definer/i);
    expect(migration).toMatch(/set search_path = public, auth/i);
  });

  it("does not keep Brazil-specific onboarding methods", () => {
    expect(migration).not.toMatch(/'Pix'/);
    expect(migration).not.toMatch(/'Boleto'/);
  });
});

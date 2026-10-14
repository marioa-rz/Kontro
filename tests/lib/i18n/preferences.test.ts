import { describe, expect, it } from "vitest";

import {
  formatLocalizedDate,
  GUATEMALA_TIME_ZONE,
  resolveCurrency,
  resolveLocale,
} from "@/lib/i18n";

describe("Guatemala regional preferences", () => {
  it("uses Spanish for Guatemala as the fallback locale", () => {
    expect(resolveLocale()).toBe("es-GT");
    expect(resolveLocale("es-GT")).toBe("es-GT");
    expect(resolveLocale("es-MX")).toBe("es-GT");
  });

  it("preserves the supported English and Portuguese locales", () => {
    expect(resolveLocale("en-US")).toBe("en");
    expect(resolveLocale("pt-BR")).toBe("pt-BR");
  });

  it("selects a currency that matches the locale when none is stored", () => {
    expect(resolveCurrency(null, "es-GT")).toBe("GTQ");
    expect(resolveCurrency(undefined, "en")).toBe("USD");
    expect(resolveCurrency("invalid", "pt-BR")).toBe("BRL");
  });

  it("keeps a supported currency selected by the user", () => {
    expect(resolveCurrency("EUR", "es-GT")).toBe("EUR");
  });

  it("uses the Guatemala timezone for instant-based dates", () => {
    expect(GUATEMALA_TIME_ZONE).toBe("America/Guatemala");

    const result = formatLocalizedDate(
      "es-GT",
      new Date("2026-01-01T04:30:00.000Z"),
      { year: "numeric", month: "2-digit", day: "2-digit" },
    );

    expect(result).toBe("31/12/2025");
  });

  it("keeps date-only values on their calendar day", () => {
    expect(
      formatLocalizedDate("es-GT", "2026-10-13", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    ).toBe("13/10/2026");
  });
});

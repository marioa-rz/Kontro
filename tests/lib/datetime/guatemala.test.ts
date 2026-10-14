import { describe, expect, it } from "vitest";

import {
  addDaysToDateValue,
  addYearsToDateValue,
  getGuatemalaDateValue,
  getGuatemalaMonthValue,
  GUATEMALA_TIME_ZONE,
} from "@/lib/datetime/guatemala";

describe("Guatemala business dates", () => {
  it("uses the Guatemala IANA timezone", () => {
    expect(GUATEMALA_TIME_ZONE).toBe("America/Guatemala");
    expect(getGuatemalaDateValue()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("keeps the previous Guatemala day and month before local midnight", () => {
    const instant = new Date("2026-11-01T04:30:00.000Z");

    expect(getGuatemalaDateValue(instant)).toBe("2026-10-31");
    expect(getGuatemalaMonthValue(instant)).toBe("2026-10");
  });

  it("moves to the new day at Guatemala midnight", () => {
    const instant = new Date("2026-11-01T06:00:00.000Z");

    expect(getGuatemalaDateValue(instant)).toBe("2026-11-01");
    expect(getGuatemalaMonthValue(instant)).toBe("2026-11");
  });

  it("adds calendar days without depending on the execution timezone", () => {
    expect(addDaysToDateValue("2026-02-27", 3)).toBe("2026-03-02");
    expect(addDaysToDateValue("2024-02-28", 1)).toBe("2024-02-29");
  });

  it("adds years and clamps leap day to the target month", () => {
    expect(addYearsToDateValue("2024-02-29", 1)).toBe("2025-02-28");
    expect(addYearsToDateValue("2026-10-14", 1)).toBe("2027-10-14");
  });
});

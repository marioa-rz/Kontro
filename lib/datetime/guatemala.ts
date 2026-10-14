export const GUATEMALA_TIME_ZONE = "America/Guatemala";

const guatemalaDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: GUATEMALA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getGuatemalaDateValue(date = new Date()): string {
  const parts = Object.fromEntries(
    guatemalaDateFormatter
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getGuatemalaMonthValue(date = new Date()): string {
  return getGuatemalaDateValue(date).slice(0, 7);
}

export function addDaysToDateValue(dateValue: string, days: number): string {
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function addYearsToDateValue(dateValue: string, years: number): string {
  const [year, month, day] = dateValue.split("-").map(Number);
  const targetYear = year + years;
  const lastDay = new Date(Date.UTC(targetYear, month, 0)).getUTCDate();
  const targetDay = Math.min(day, lastDay);

  return `${targetYear}-${String(month).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
}

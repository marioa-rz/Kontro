export type CurrencyCode = "GTQ" | "BRL" | "USD" | "EUR";

const supportedCurrencies = new Set<CurrencyCode>(["GTQ", "BRL", "USD", "EUR"]);
const storageKey = "kontro-currency";
const legacyStorageKey = "dragg-currency";

const defaultCurrency: CurrencyCode = "GTQ";

export function isSupportedCurrency(value: unknown): value is CurrencyCode {
  return supportedCurrencies.has(value as CurrencyCode);
}

export function getStoredCurrency(): CurrencyCode {
  if (typeof window === "undefined") return defaultCurrency;
  try {
    const stored =
      window.localStorage.getItem(storageKey) ??
      window.localStorage.getItem(legacyStorageKey);
    if (stored && isSupportedCurrency(stored)) return stored;
  } catch {}
  return defaultCurrency;
}

export function setStoredCurrency(currency: CurrencyCode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, currency);
  } catch {}
}

export function formatCurrency(
  amount: number,
  locale: string,
  currency: CurrencyCode,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(
  locale: string,
  currency: CurrencyCode,
): string {
  return (
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency
  );
}

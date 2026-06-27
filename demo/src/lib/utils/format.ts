import { differenceInDays } from "date-fns";

/**
 * Currency formatting — mirrors the platform ledger exactly so the storefront
 * and the back office never disagree: thousands separators + exactly two
 * decimals, e.g. `19,000.00 EGP`.
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "—";
  }
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;
}

/**
 * Serialize a Date as a raw `YYYY-MM-DD` string in LOCAL time — no UTC
 * conversion, so a date picked at midnight never shifts a day on the wire.
 */
export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse a `YYYY-MM-DD` string into a local Date (no timezone drift). */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year!, month! - 1, day);
}

export function getNights(
  checkIn: Date | null | undefined,
  checkOut: Date | null | undefined
): number {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, differenceInDays(checkOut, checkIn));
}

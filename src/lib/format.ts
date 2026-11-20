import { ADDIS_TIME_ZONE } from "@/lib/dates";

// Calendar helpers live in a client-safe module; re-exported for convenience.
export { addDays, addisToday, formatSlot, formatVisitDate, isValidYmd, weekdayOf } from "@/lib/dates";

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatPrice(price: number | null | undefined) {
  return price && price > 0 ? `ETB ${numberFormat.format(price)}` : "Price on request";
}

/** "ETB 12.5M" — for cards and tight spaces. */
export function formatPriceCompact(price: number | null | undefined) {
  if (!price || price <= 0) return "Price on request";
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    return `ETB ${millions >= 100 ? Math.round(millions) : Number(millions.toFixed(1))}M`;
  }
  if (price >= 1_000) return `ETB ${Math.round(price / 1_000)}K`;
  return `ETB ${numberFormat.format(price)}`;
}

/** Price after a percentage discount, rounded to the nearest 1,000 birr. */
export function discountedPrice(price: number, percent: number) {
  return Math.round((price * (100 - percent)) / 100 / 1000) * 1000;
}

export function formatArea(sqm: number | null | undefined) {
  if (!sqm) return null;
  return `${Number.isInteger(sqm) ? sqm : sqm.toFixed(1)} m²`;
}

export function formatFloor(floor: number | null | undefined) {
  if (floor === null || floor === undefined) return null;
  if (floor === 0) return "Ground floor";
  if (floor < 0) return `Basement ${Math.abs(floor)}`;
  const mod100 = floor % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? "th" : (({ 1: "st", 2: "nd", 3: "rd" }) as Record<number, string>)[floor % 10] ?? "th";
  return `${floor}${suffix} floor`;
}

export function formatDate(date: Date | string | number, options: Intl.DateTimeFormatOptions = { dateStyle: "long" }) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: ADDIS_TIME_ZONE, ...options }).format(new Date(date));
}

export function formatDateTime(date: Date | string | number) {
  return formatDate(date, { dateStyle: "medium", timeStyle: "short" });
}

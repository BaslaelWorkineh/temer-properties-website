import { ADDIS_TIME_ZONE } from "@/lib/dates";
import type { Locale } from "@/lib/i18n/config";
import { getPropertiesDict } from "@/lib/i18n/dict/properties";

// Calendar helpers live in a client-safe module; re-exported for convenience.
export { addDays, addisToday, formatSlot, formatVisitDate, isValidYmd, weekdayOf } from "@/lib/dates";

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatPrice(price: number | null | undefined, lang: Locale = "en") {
  if (!price || price <= 0) return getPropertiesDict(lang).detail.priceOnRequest;
  return lang === "am" ? `${numberFormat.format(price)} ብር` : `ETB ${numberFormat.format(price)}`;
}

/** "ETB 12.5M" — for cards and tight spaces. */
export function formatPriceCompact(price: number | null | undefined, lang: Locale = "en") {
  if (!price || price <= 0) return getPropertiesDict(lang).detail.priceOnRequest;
  const am = lang === "am";
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    const n = millions >= 100 ? Math.round(millions) : Number(millions.toFixed(1));
    return am ? `${n} ሚሊዮን ብር` : `ETB ${n}M`;
  }
  if (price >= 1_000) return am ? `${Math.round(price / 1_000)} ሺ ብር` : `ETB ${Math.round(price / 1_000)}K`;
  return am ? `${numberFormat.format(price)} ብር` : `ETB ${numberFormat.format(price)}`;
}

/** Price after a percentage discount, rounded to the nearest 1,000 birr. */
export function discountedPrice(price: number, percent: number) {
  return Math.round((price * (100 - percent)) / 100 / 1000) * 1000;
}

export function formatArea(sqm: number | null | undefined) {
  if (!sqm) return null;
  return `${Number.isInteger(sqm) ? sqm : sqm.toFixed(1)} m²`;
}

export function formatFloor(floor: number | null | undefined, lang: Locale = "en") {
  if (floor === null || floor === undefined) return null;
  const d = getPropertiesDict(lang).detail;
  if (floor === 0) return d.groundFloor;
  if (floor < 0) return d.basement(Math.abs(floor));
  return d.floorN(floor);
}

export function formatDate(date: Date | string | number, options: Intl.DateTimeFormatOptions = { dateStyle: "long" }, lang: Locale = "en") {
  // Amharic month names with the Gregorian calendar and Latin digits, so dates match the rest of the site.
  return new Intl.DateTimeFormat(lang === "am" ? "am-ET-u-nu-latn" : "en-GB", { timeZone: ADDIS_TIME_ZONE, ...options }).format(new Date(date));
}

export function formatDateTime(date: Date | string | number) {
  return formatDate(date, { dateStyle: "medium", timeStyle: "short" });
}

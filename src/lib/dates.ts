/**
 * Calendar helpers on YYYY-MM-DD strings in Addis Ababa local time (UTC+3,
 * no DST). Client-safe: no server or config imports.
 */
import type { Locale } from "@/lib/i18n/config";

export const ADDIS_TIME_ZONE = "Africa/Addis_Ababa";

/** Today's date in Addis Ababa. Request-time / browser only: never call during prerendering. */
export function addisToday(now: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ADDIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function ymdToUtcDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(ymd: string, days: number) {
  const date = ymdToUtcDate(ymd);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday */
export function weekdayOf(ymd: string) {
  return ymdToUtcDate(ymd).getUTCDay();
}

export function isValidYmd(ymd: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const date = ymdToUtcDate(ymd);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === ymd;
}

// Gregorian calendar names in Amharic (written out so the result does not depend on the browser's locale data).
const AM_WEEKDAYS = ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"];
const AM_MONTHS = ["ጃንዩወሪ", "ፌብሩወሪ", "ማርች", "ኤፕሪል", "ሜይ", "ጁን", "ጁላይ", "ኦገስት", "ሴፕቴምበር", "ኦክቶበር", "ኖቬምበር", "ዲሴምበር"];

/** "Saturday, 22 November 2026" (Amharic: "ቅዳሜ፣ 22 ኖቬምበር 2026") */
export function formatVisitDate(ymd: string, lang: Locale = "en") {
  if (lang === "am") {
    const date = ymdToUtcDate(ymd);
    return `${AM_WEEKDAYS[date.getUTCDay()]}፣ ${date.getUTCDate()} ${AM_MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  }
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(ymdToUtcDate(ymd));
}

/** "14:00" -> "2:00 PM" (Amharic: "2:00 ከሰዓት") */
export function formatSlot(slot: string, lang: Locale = "en") {
  const [h, m] = slot.split(":").map(Number);
  const period = lang === "am" ? (h >= 12 ? "ከሰዓት" : "ጥዋት") : h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

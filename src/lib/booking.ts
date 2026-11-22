import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { randomInt } from "node:crypto";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { ACTIVE_BOOKING_STATUSES, bookingConfig } from "@/lib/config/booking";
import { addDays, addisToday, formatSlot } from "@/lib/dates";
import { bookableDateIssue, dateIssueMessage } from "@/lib/i18n/dict/forms";
import type { Locale } from "@/lib/i18n/config";

/** Request-time only (uses the current date). */
export function bookingWindow() {
  const today = addisToday();
  return { min: addDays(today, bookingConfig.minDaysAhead), max: addDays(today, bookingConfig.maxDaysAhead) };
}

export function checkBookableDate(ymd: string, lang: Locale = "en"): { ok: true } | { ok: false; message: string } {
  const issue = bookableDateIssue(ymd, addisToday());
  return issue ? { ok: false, message: dateIssueMessage(issue, lang) } : { ok: true };
}

export type SlotAvailability = { time: string; label: string; remaining: number; available: boolean };

export async function getSlotAvailability(ymd: string): Promise<SlotAvailability[]> {
  const rows = await db
    .select({ timeSlot: bookings.timeSlot, count: sql<number>`count(*)` })
    .from(bookings)
    .where(and(eq(bookings.visitDate, ymd), inArray(bookings.status, ACTIVE_BOOKING_STATUSES)))
    .groupBy(bookings.timeSlot);
  const taken = new Map(rows.map((r) => [r.timeSlot, Number(r.count)]));
  return bookingConfig.slots.map((time) => {
    const remaining = Math.max(0, bookingConfig.capacityPerSlot - (taken.get(time) ?? 0));
    return { time, label: formatSlot(time), remaining, available: remaining > 0 };
  });
}

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Short, unambiguous reference customers can read over the phone, e.g. TP-7K3Q9M. */
export function generateBookingReference() {
  let ref = "TP-";
  for (let i = 0; i < 6; i++) ref += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  return ref;
}

"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { toId } from "@/app/admin/_lib/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/config/booking";
import { bookingUpdateSchema, errorState, optStr, str, validationError, type FormState } from "@/lib/validation";

/** Status + internal notes form on the booking detail page. */
export async function updateBookingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = toId(formData.get("id"));
  if (!id) return errorState("Missing booking.");

  const parsed = bookingUpdateSchema.safeParse({ status: str(formData, "status"), adminNotes: optStr(formData, "adminNotes") });
  if (!parsed.success) return validationError(parsed.error);

  const updated = await db
    .update(bookings)
    .set({ status: parsed.data.status, adminNotes: parsed.data.adminNotes ?? null })
    .where(eq(bookings.id, id))
    .returning({ id: bookings.id });
  if (!updated.length) return errorState("This booking no longer exists.");

  refresh();
  return { status: "success", message: "Booking updated." };
}

/** One-click status buttons (Confirm, Cancel, Completed, No-show). */
export async function setBookingStatusAction(formData: FormData) {
  await requireAdmin();
  const id = toId(formData.get("id"));
  const status = str(formData, "status") as BookingStatus;
  if (!id || !BOOKING_STATUSES.includes(status)) return;

  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  refresh();
}

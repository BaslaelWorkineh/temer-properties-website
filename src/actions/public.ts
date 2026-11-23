"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, inquiries, projects, properties } from "@/db/schema";
import { checkBookableDate, generateBookingReference } from "@/lib/booking";
import { ACTIVE_BOOKING_STATUSES, bookingConfig } from "@/lib/config/booking";
import { hasLocale, type Locale } from "@/lib/i18n/config";
import { getFormsDict } from "@/lib/i18n/dict/forms";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  errorState,
  makeBookingSchema,
  makeInquirySchema,
  normalizePhone,
  optStr,
  str,
  validationError,
  type FormState,
} from "@/lib/validation";

export type BookingResult = { reference: string; visitDate: string; timeSlot: string; visitType: string };

class SlotFullError extends Error {}

/** The visitor's language, sent by the form as a hidden field. Anything unexpected falls back to English. */
function langOf(formData: FormData): Locale {
  const value = str(formData, "lang");
  return hasLocale(value) ? value : "en";
}

/** Resolves optional property/project ids to real, published records (ignores tampered ids). */
async function resolveSubject(propertyId?: number, projectId?: number) {
  const [property] = propertyId
    ? await db
        .select({ id: properties.id, title: properties.title, slug: properties.slug, projectId: properties.projectId })
        .from(properties)
        .where(and(eq(properties.id, propertyId), eq(properties.isPublished, true)))
        .limit(1)
    : [];
  const resolvedProjectId = projectId ?? property?.projectId ?? undefined;
  const [project] = resolvedProjectId
    ? await db
        .select({ id: projects.id, name: projects.name, slug: projects.slug })
        .from(projects)
        .where(and(eq(projects.id, resolvedProjectId), eq(projects.isPublished, true)))
        .limit(1)
    : [];
  return { property, project };
}

export async function createBooking(_prev: FormState<BookingResult>, formData: FormData): Promise<FormState<BookingResult>> {
  const lang = langOf(formData);
  const t = getFormsDict(lang);
  // Honeypot: real people never fill the hidden "website" field.
  if (str(formData, "website")) return errorState(t.actions.bookingBlocked);

  const ip = await getClientIp();
  if (!rateLimit(`booking:${ip}`, 6, 10 * 60_000).ok) {
    return errorState(t.actions.bookingTooMany);
  }

  const parsed = makeBookingSchema(t.validation).safeParse({
    fullName: str(formData, "fullName"),
    phone: normalizePhone(str(formData, "countryCode"), str(formData, "phone")),
    email: optStr(formData, "email"),
    visitDate: str(formData, "visitDate"),
    timeSlot: str(formData, "timeSlot"),
    visitType: str(formData, "visitType") || "in_person",
    partySize: str(formData, "partySize") || "1",
    message: optStr(formData, "message"),
    propertyId: optStr(formData, "propertyId"),
    projectId: optStr(formData, "projectId"),
    source: optStr(formData, "source"),
  });
  if (!parsed.success) return validationError(parsed.error, t.actions.fixFields);
  const input = parsed.data;

  const dateCheck = checkBookableDate(input.visitDate, lang);
  if (!dateCheck.ok) return errorState(dateCheck.message, { visitDate: [dateCheck.message] });

  const { property, project } = await resolveSubject(input.propertyId, input.projectId);
  const reference = generateBookingReference();

  try {
    // The capacity check and insert must be atomic. Postgres' default isolation would let two simultaneous requests
    // both see a free place, so take a lock on this date + slot first (released when the transaction ends).
    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`booking:${input.visitDate}:${input.timeSlot}`}))`);
      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)` })
        .from(bookings)
        .where(
          and(
            eq(bookings.visitDate, input.visitDate),
            eq(bookings.timeSlot, input.timeSlot),
            inArray(bookings.status, ACTIVE_BOOKING_STATUSES),
          ),
        );
      if (Number(count) >= bookingConfig.capacityPerSlot) throw new SlotFullError();
      await tx.insert(bookings).values({
        reference,
        propertyId: property?.id ?? null,
        projectId: project?.id ?? null,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email ?? null,
        visitDate: input.visitDate,
        timeSlot: input.timeSlot,
        visitType: input.visitType,
        partySize: input.partySize,
        message: input.message ?? null,
        source: input.source ?? null,
      });
    });
  } catch (err) {
    if (err instanceof SlotFullError) {
      return errorState(t.actions.slotFull, { timeSlot: [t.actions.slotFull] });
    }
    console.error("[booking] insert failed", err);
    return errorState(t.actions.bookingFailed);
  }


  return {
    status: "success",
    message: t.actions.bookingReceived,
    data: { reference, visitDate: input.visitDate, timeSlot: input.timeSlot, visitType: input.visitType },
  };
}

export async function createInquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const t = getFormsDict(langOf(formData));
  if (str(formData, "website")) return errorState(t.actions.inquiryBlocked);

  const ip = await getClientIp();
  if (!rateLimit(`inquiry:${ip}`, 6, 10 * 60_000).ok) {
    return errorState(t.actions.inquiryTooMany);
  }

  const parsed = makeInquirySchema(t.validation).safeParse({
    fullName: str(formData, "fullName"),
    phone: normalizePhone(str(formData, "countryCode"), str(formData, "phone")),
    email: optStr(formData, "email"),
    company: optStr(formData, "company"),
    interest: str(formData, "interest") || "other",
    message: optStr(formData, "message"),
    propertyId: optStr(formData, "propertyId"),
    projectId: optStr(formData, "projectId"),
    source: optStr(formData, "source"),
  });
  if (!parsed.success) return validationError(parsed.error, t.actions.fixFields);
  const input = parsed.data;

  const { property, project } = await resolveSubject(input.propertyId, input.projectId);
  try {
    await db.insert(inquiries).values({
      fullName: input.fullName,
      phone: input.phone,
      email: input.email ?? null,
      company: input.company ?? null,
      interest: input.interest,
      message: input.message ?? null,
      propertyId: property?.id ?? null,
      projectId: project?.id ?? null,
      source: input.source ?? null,
    });
  } catch (err) {
    console.error("[inquiry] insert failed", err);
    return errorState(t.actions.inquiryFailed);
  }


  return { status: "success", message: t.actions.inquiryThanks };
}

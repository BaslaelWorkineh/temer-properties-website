"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db";
import { bookings, inquiries, projects, properties } from "@/db/schema";
import { checkBookableDate, generateBookingReference } from "@/lib/booking";
import { ACTIVE_BOOKING_STATUSES, bookingConfig, inquiryInterestLabels, visitTypeLabels } from "@/lib/config/booking";
import { absoluteUrl } from "@/lib/config/site";
import { formatSlot, formatVisitDate } from "@/lib/dates";
import { notifyTeam } from "@/lib/notify";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  bookingSchema,
  errorState,
  inquirySchema,
  normalizePhone,
  optStr,
  str,
  validationError,
  type FormState,
} from "@/lib/validation";

export type BookingResult = { reference: string; visitDate: string; timeSlot: string; visitType: string };

class SlotFullError extends Error {}

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
  // Honeypot: real people never fill the hidden "website" field.
  if (str(formData, "website")) return errorState("Your request could not be sent. Please call us instead.");

  const ip = await getClientIp();
  if (!rateLimit(`booking:${ip}`, 6, 10 * 60_000).ok) {
    return errorState("Too many booking attempts. Please wait a few minutes or call us directly.");
  }

  const parsed = bookingSchema.safeParse({
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
  if (!parsed.success) return validationError(parsed.error);
  const input = parsed.data;

  const dateCheck = checkBookableDate(input.visitDate);
  if (!dateCheck.ok) return errorState(dateCheck.message, { visitDate: [dateCheck.message] });

  const { property, project } = await resolveSubject(input.propertyId, input.projectId);
  const reference = generateBookingReference();

  try {
    // BEGIN IMMEDIATE (libSQL "write" transaction): the capacity check and insert are atomic.
    await db.transaction(async (tx) => {
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
      const message = "That time has just been fully booked. Please choose another time.";
      return errorState(message, { timeSlot: [message] });
    }
    console.error("[booking] insert failed", err);
    return errorState("Something went wrong while saving your booking. Please try again or call us.");
  }

  after(() =>
    notifyTeam(
      "New site visit request",
      {
        Reference: reference,
        Name: input.fullName,
        Phone: input.phone,
        Email: input.email,
        When: `${formatVisitDate(input.visitDate)} at ${formatSlot(input.timeSlot)}`,
        Type: visitTypeLabels[input.visitType],
        People: input.partySize,
        Property: property?.title,
        Project: project?.name,
        Message: input.message,
      },
      absoluteUrl("/admin/bookings"),
    ),
  );

  return {
    status: "success",
    message: "Your visit request has been received.",
    data: { reference, visitDate: input.visitDate, timeSlot: input.timeSlot, visitType: input.visitType },
  };
}

export async function createInquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  if (str(formData, "website")) return errorState("Your message could not be sent. Please call us instead.");

  const ip = await getClientIp();
  if (!rateLimit(`inquiry:${ip}`, 6, 10 * 60_000).ok) {
    return errorState("Too many messages. Please wait a few minutes or call us directly.");
  }

  const parsed = inquirySchema.safeParse({
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
  if (!parsed.success) return validationError(parsed.error);
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
    return errorState("Something went wrong while sending your message. Please try again or call us.");
  }

  after(() =>
    notifyTeam(
      "New website enquiry",
      {
        Name: input.fullName,
        Phone: input.phone,
        Email: input.email,
        Interest: inquiryInterestLabels[input.interest],
        Property: property?.title,
        Project: project?.name,
        Message: input.message,
      },
      absoluteUrl("/admin/inquiries"),
    ),
  );

  return { status: "success", message: "Thank you! Our sales team will contact you shortly." };
}

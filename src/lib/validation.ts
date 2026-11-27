import { z } from "zod";
import { BOOKING_STATUSES, INQUIRY_INTERESTS, INQUIRY_STATUSES, VISIT_TYPES, bookingConfig } from "@/lib/config/booking";
import { PROJECT_STATUSES, PROPERTY_STATUSES, PROPERTY_TYPES } from "@/lib/config/property-types";
import type { FaqItem, ImageItem } from "@/db/schema";

/* ------------------------------------------------------------------ */
/* Action state shared by every form (public and admin)                */
/* ------------------------------------------------------------------ */

export type FieldErrors = Record<string, string[] | undefined>;

export type FormState<T = undefined> =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: FieldErrors }
  | { status: "success"; message: string; data?: T };

export const idleState = { status: "idle" } as const;

export function errorState(message: string, fieldErrors?: FieldErrors) {
  return { status: "error", message, fieldErrors } as const;
}

/**
 * Required-for-the-buyer checks. Each rule is [field, isFilled, message]. Returns an error state naming every
 * empty field (shown as a red border plus text under the box), or null when all are filled.
 */
export function requireFilled(rules: ReadonlyArray<readonly [field: string, filled: boolean, message: string]>) {
  const fieldErrors: FieldErrors = {};
  for (const [field, filled, message] of rules) if (!filled) fieldErrors[field] = [message];
  return Object.keys(fieldErrors).length ? errorState("Please fill in the required fields.", fieldErrors) : null;
}

export function validationError(error: z.ZodError, message = "Please correct the highlighted fields.") {
  return errorState(message, z.flattenError(error).fieldErrors as FieldErrors);
}

/* ------------------------------------------------------------------ */
/* FormData readers                                                    */
/* ------------------------------------------------------------------ */

export function str(fd: FormData, key: string) {
  const value = fd.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Empty string -> undefined, so optional fields validate as "not provided". */
export function optStr(fd: FormData, key: string) {
  return str(fd, key) || undefined;
}

export function bool(fd: FormData, key: string) {
  const value = fd.get(key);
  return value === "on" || value === "true" || value === "1";
}

/** One item per line (textarea), blank lines dropped. */
export function lines(fd: FormData, key: string) {
  return str(fd, key)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function json<T>(fd: FormData, key: string, fallback: T): T {
  const raw = str(fd, key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(String(v).replace(/[, ]/g, ""))),
    z.number({ error: "Enter a whole number" }).int("Enter a whole number").min(min).max(max).optional(),
  );

const optionalNumber = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(String(v).replace(/[, ]/g, ""))),
    z.number({ error: "Enter a number" }).min(min).max(max).optional(),
  );

const optionalId = optionalInt(1, Number.MAX_SAFE_INTEGER);

const slugField = z
  .string()
  .max(90)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only")
  .optional();

const optionalText = (max: number) => z.string().max(max, `Keep this under ${max} characters`).optional();

export const imageItemSchema: z.ZodType<ImageItem> = z.object({
  url: z.string().min(1).max(500),
  alt: z.string().max(200),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const faqItemSchema: z.ZodType<FaqItem> = z.object({
  question: z.string().min(3).max(200),
  answer: z.string().min(3).max(2000),
});

const seoFields = {
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
};

/**
 * Normalizes phone numbers to +<country><number>.
 * "0911234567" + "+251" -> "+251911234567"
 */
export function normalizePhone(countryCode: string, number: string) {
  const digits = number.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `+${digits.slice(1).replace(/\D/g, "")}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  const cc = (countryCode || "+251").replace(/[^\d]/g, "");
  const local = digits.replace(/^0+/, "");
  if (local.startsWith(cc) && local.length > 10) return `+${local}`;
  return `+${cc}${local}`;
}

export type PublicFormMessages = {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  keepUnder: (n: number) => string;
};

const englishMessages: PublicFormMessages = {
  name: "Enter your full name",
  phone: "Enter a valid phone number, e.g. 0911 234 567",
  email: "Enter a valid email",
  date: "Choose a visit date",
  time: "Choose a time",
  keepUnder: (n) => `Keep this under ${n} characters`,
};

/* ------------------------------------------------------------------ */
/* Public forms                                                        */
/* ------------------------------------------------------------------ */

/** The schemas take their messages as a parameter so visitors see errors in their own language. */
export function makeBookingSchema(m: PublicFormMessages) {
  const text = (max: number) => z.string().max(max, m.keepUnder(max)).optional();
  return z.object({
    fullName: z.string().min(2, m.name).max(100),
    phone: z.string().regex(/^\+\d{8,15}$/, m.phone),
    email: z.email(m.email).max(150).optional(),
    visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, m.date),
    timeSlot: z.enum(bookingConfig.slots, { error: m.time }),
    visitType: z.enum(VISIT_TYPES),
    partySize: z.coerce.number().int().min(1).max(bookingConfig.maxPartySize).default(1),
    message: text(1000),
    propertyId: optionalId,
    projectId: optionalId,
    source: text(300),
  });
}
export const bookingSchema = makeBookingSchema(englishMessages);
export type BookingInput = z.infer<typeof bookingSchema>;

export function makeInquirySchema(m: PublicFormMessages) {
  const text = (max: number) => z.string().max(max, m.keepUnder(max)).optional();
  return z.object({
    fullName: z.string().min(2, m.name).max(100),
    phone: z.string().regex(/^\+\d{8,15}$/, m.phone),
    email: z.email(m.email).max(150).optional(),
    company: text(120),
    interest: z.enum(INQUIRY_INTERESTS).default("other"),
    message: text(1000),
    propertyId: optionalId,
    projectId: optionalId,
    source: text(300),
  });
}
export const inquirySchema = makeInquirySchema(englishMessages);
export type InquiryInput = z.infer<typeof inquirySchema>;

export const loginSchema = z.object({
  email: z.email("Enter your email"),
  password: z.string().min(1, "Enter your password").max(200),
});

/* ------------------------------------------------------------------ */
/* Admin forms                                                         */
/* ------------------------------------------------------------------ */

export const propertyInputSchema = z.object({
  title: z.string().min(3, "Title is required").max(140),
  slug: slugField,
  type: z.enum(PROPERTY_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  projectId: optionalId,
  locationId: optionalId,
  price: optionalInt(0, 100_000_000_000),
  promo: optionalText(120),
  discountPercent: optionalInt(1, 90),
  bedrooms: optionalInt(0, 50),
  bathrooms: optionalInt(0, 50),
  areaSqm: optionalNumber(1, 100_000),
  floor: optionalInt(-5, 200),
  completion: optionalText(60),
  summary: optionalText(300),
  description: optionalText(20_000),
  features: z.array(z.string().max(120)).max(60),
  paymentPlan: optionalText(2000),
  images: z.array(imageItemSchema).max(40),
  videoUrl: z.url("Enter a full URL").max(300).optional(),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  sortOrder: optionalInt(-10_000, 10_000),
  ...seoFields,
});
export type PropertyInput = z.infer<typeof propertyInputSchema>;

export const projectInputSchema = z.object({
  name: z.string().min(2, "Name is required").max(140),
  slug: slugField,
  locationId: optionalId,
  status: z.enum(PROJECT_STATUSES),
  category: optionalText(100),
  summary: optionalText(300),
  description: optionalText(20_000),
  totalUnits: optionalInt(0, 100_000),
  floors: optionalInt(0, 300),
  unitTypes: z.array(z.string().max(120)).max(30),
  amenities: z.array(z.string().max(120)).max(60),
  paymentPlan: optionalText(2000),
  completion: optionalText(60),
  address: optionalText(200),
  latitude: optionalNumber(-90, 90),
  longitude: optionalNumber(-180, 180),
  images: z.array(imageItemSchema).max(40),
  videoUrl: z.url("Enter a full URL").max(300).optional(),
  faqs: z.array(faqItemSchema).max(30),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  sortOrder: optionalInt(-10_000, 10_000),
  ...seoFields,
});
export type ProjectInput = z.infer<typeof projectInputSchema>;

export const locationInputSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  slug: slugField,
  city: z.string().min(2).max(100).default("Addis Ababa"),
  summary: optionalText(300),
  description: optionalText(20_000),
  highlights: z.array(z.string().max(200)).max(20),
  faqs: z.array(faqItemSchema).max(30),
  image: imageItemSchema.nullable(),
  latitude: optionalNumber(-90, 90),
  longitude: optionalNumber(-180, 180),
  isPublished: z.boolean(),
  sortOrder: optionalInt(-10_000, 10_000),
  ...seoFields,
});
export type LocationInput = z.infer<typeof locationInputSchema>;

export const postInputSchema = z.object({
  title: z.string().min(3, "Title is required").max(160),
  slug: slugField,
  excerpt: optionalText(300),
  content: z.string().max(100_000),
  coverImage: imageItemSchema.nullable(),
  authorName: z.string().min(2).max(100).default("Temer Properties"),
  isPublished: z.boolean(),
  ...seoFields,
});
export type PostInput = z.infer<typeof postInputSchema>;

export const bookingUpdateSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
  adminNotes: optionalText(2000),
});

export const inquiryUpdateSchema = z.object({
  status: z.enum(INQUIRY_STATUSES),
  adminNotes: optionalText(2000),
});

/**
 * Reads the `am_<field>` inputs of the Amharic section (see components/admin/amharic-fields.tsx) into the
 * `translations` value. Empty fields are left out, so they fall back to the English text.
 */
export function readAm(
  fd: FormData,
  spec: { text?: readonly string[]; lines?: readonly string[]; faqs?: boolean },
): { am?: Record<string, unknown> } {
  const am: Record<string, unknown> = {};
  for (const key of spec.text ?? []) {
    const v = str(fd, `am_${key}`).replace(/\r\n/g, "\n").trim();
    if (v) am[key] = v;
  }
  for (const key of spec.lines ?? []) {
    const v = lines(fd, `am_${key}`);
    if (v.length) am[key] = v;
  }
  if (spec.faqs) {
    const items = json<Array<{ question?: unknown; answer?: unknown }>>(fd, "am_faqs", [])
      .map((i) => ({ question: String(i.question ?? "").trim(), answer: String(i.answer ?? "").trim() }))
      .filter((i) => i.question && i.answer);
    if (items.length) am.faqs = items;
  }
  return Object.keys(am).length ? { am } : {};
}

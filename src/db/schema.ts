import { sql } from "drizzle-orm";
import { boolean, doublePrecision, index, integer, jsonb, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
// Relative imports (not "@/…") so drizzle-kit and tsx scripts can load this file directly.
import { PROJECT_STATUSES, PROPERTY_STATUSES, PROPERTY_TYPES } from "../lib/config/property-types";
import { BOOKING_STATUSES, INQUIRY_INTERESTS, INQUIRY_STATUSES, VISIT_TYPES } from "../lib/config/booking";

export type ImageItem = {
  url: string;
  /** Descriptive alt text: what the photo shows + where. Important for image SEO. */
  alt: string;
  width?: number;
  height?: number;
};

export type FaqItem = { question: string; answer: string };

/**
 * Amharic versions of the text fields, stored next to the English columns: `{ am: { title: "…" } }`.
 * Keys match the English column names. A missing or empty value falls back to the English text, so a record can
 * be translated field by field. See src/lib/i18n/localize.ts.
 */
export type PropertyAm = {
  title?: string;
  summary?: string;
  description?: string;
  features?: string[];
  paymentPlan?: string;
  promo?: string;
  completion?: string;
};
export type ProjectAm = {
  name?: string;
  summary?: string;
  description?: string;
  category?: string;
  paymentPlan?: string;
  completion?: string;
  address?: string;
  unitTypes?: string[];
  amenities?: string[];
  faqs?: FaqItem[];
};
export type LocationAm = { name?: string; summary?: string; description?: string; highlights?: string[]; faqs?: FaqItem[] };
export type PostAm = { title?: string; excerpt?: string; content?: string };
export type Translations<A> = { am?: A };

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

const seo = {
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
};

export const locations = pgTable(
  "locations",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    city: text("city").notNull().default("Addis Ababa"),
    /** 1–2 sentence intro; also the meta description fallback. */
    summary: text("summary"),
    /** Long-form area guide in Markdown. Unique content is what makes area pages rank. */
    description: text("description"),
    highlights: jsonb("highlights").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    faqs: jsonb("faqs").$type<FaqItem[]>().notNull().default(sql`'[]'::jsonb`),
    image: jsonb("image").$type<ImageItem | null>(),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    sortOrder: integer("sort_order").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    translations: jsonb("translations").$type<Translations<LocationAm>>().notNull().default(sql`'{}'::jsonb`),
    ...seo,
    ...timestamps,
  },
  (t) => [index("locations_published_idx").on(t.isPublished)],
);

export const projects = pgTable(
  "projects",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    locationId: integer("location_id").references(() => locations.id, { onDelete: "set null" }),
    status: text("status", { enum: PROJECT_STATUSES }).notNull().default("under_construction"),
    /** e.g. "Apartments & shops", "Residential apartments" */
    category: text("category"),
    summary: text("summary"),
    description: text("description"),
    totalUnits: integer("total_units"),
    floors: integer("floors"),
    unitTypes: jsonb("unit_types").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    amenities: jsonb("amenities").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    paymentPlan: text("payment_plan"),
    /** Free text such as "Q4 2027" or "Delivered 2015 E.C." */
    completion: text("completion"),
    address: text("address"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    images: jsonb("images").$type<ImageItem[]>().notNull().default(sql`'[]'::jsonb`),
    videoUrl: text("video_url"),
    faqs: jsonb("faqs").$type<FaqItem[]>().notNull().default(sql`'[]'::jsonb`),
    isFeatured: boolean("is_featured").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    translations: jsonb("translations").$type<Translations<ProjectAm>>().notNull().default(sql`'{}'::jsonb`),
    ...seo,
    ...timestamps,
  },
  (t) => [index("projects_location_idx").on(t.locationId), index("projects_status_idx").on(t.status)],
);

export const properties = pgTable(
  "properties",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    type: text("type", { enum: PROPERTY_TYPES }).notNull().default("apartment"),
    status: text("status", { enum: PROPERTY_STATUSES }).notNull().default("available"),
    projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
    locationId: integer("location_id").references(() => locations.id, { onDelete: "set null" }),
    /** Whole Ethiopian Birr. NULL = "Price on request". */
    price: integer("price"),
    /** Short promotional line, e.g. "10% discount for full payment". */
    promo: text("promo"),
    /** Optional discount, 1–90 (%). When set with a price, the card shows the old and the new price. */
    discountPercent: integer("discount_percent"),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    areaSqm: real("area_sqm"),
    /** 0 = ground floor. */
    floor: integer("floor"),
    /** e.g. "Ready to move in", "December 2027" */
    completion: text("completion"),
    summary: text("summary"),
    description: text("description"),
    features: jsonb("features").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    paymentPlan: text("payment_plan"),
    images: jsonb("images").$type<ImageItem[]>().notNull().default(sql`'[]'::jsonb`),
    videoUrl: text("video_url"),
    isFeatured: boolean("is_featured").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    translations: jsonb("translations").$type<Translations<PropertyAm>>().notNull().default(sql`'{}'::jsonb`),
    ...seo,
    ...timestamps,
  },
  (t) => [
    index("properties_published_idx").on(t.isPublished, t.status),
    index("properties_type_idx").on(t.type),
    index("properties_location_idx").on(t.locationId),
    index("properties_project_idx").on(t.projectId),
  ],
);

export const posts = pgTable(
  "posts",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt"),
    /** Markdown */
    content: text("content").notNull().default(""),
    coverImage: jsonb("cover_image").$type<ImageItem | null>(),
    authorName: text("author_name").notNull().default("Temer Properties"),
    isPublished: boolean("is_published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
    translations: jsonb("translations").$type<Translations<PostAm>>().notNull().default(sql`'{}'::jsonb`),
    ...seo,
    ...timestamps,
  },
  (t) => [index("posts_published_idx").on(t.isPublished, t.publishedAt)],
);

export const bookings = pgTable(
  "bookings",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    /** Human-friendly reference given to the customer, e.g. TP-7K3Q9M */
    reference: text("reference").notNull().unique(),
    propertyId: integer("property_id").references(() => properties.id, { onDelete: "set null" }),
    projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    /** YYYY-MM-DD, Addis Ababa local date */
    visitDate: text("visit_date").notNull(),
    /** HH:MM, Addis Ababa local time */
    timeSlot: text("time_slot").notNull(),
    visitType: text("visit_type", { enum: VISIT_TYPES }).notNull().default("in_person"),
    partySize: integer("party_size").notNull().default(1),
    message: text("message"),
    status: text("status", { enum: BOOKING_STATUSES }).notNull().default("pending"),
    adminNotes: text("admin_notes"),
    /** Page the booking was made from. */
    source: text("source"),
    ...timestamps,
  },
  (t) => [index("bookings_slot_idx").on(t.visitDate, t.timeSlot), index("bookings_status_idx").on(t.status)],
);

export const inquiries = pgTable(
  "inquiries",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    company: text("company"),
    interest: text("interest", { enum: INQUIRY_INTERESTS }).notNull().default("other"),
    message: text("message"),
    propertyId: integer("property_id").references(() => properties.id, { onDelete: "set null" }),
    projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
    status: text("status", { enum: INQUIRY_STATUSES }).notNull().default("new"),
    adminNotes: text("admin_notes"),
    source: text("source"),
    ...timestamps,
  },
  (t) => [index("inquiries_status_idx").on(t.status)],
);

export const adminUsers = pgTable("admin_users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("admin"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
});

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 of the session token (the raw token only lives in the cookie). */
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export type Location = typeof locations.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;

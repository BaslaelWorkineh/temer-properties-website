import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
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

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
};

const seo = {
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
};

export const locations = sqliteTable(
  "locations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    city: text("city").notNull().default("Addis Ababa"),
    /** 1–2 sentence intro; also the meta description fallback. */
    summary: text("summary"),
    /** Long-form area guide in Markdown. Unique content is what makes area pages rank. */
    description: text("description"),
    highlights: text("highlights", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    faqs: text("faqs", { mode: "json" }).$type<FaqItem[]>().notNull().default(sql`'[]'`),
    image: text("image", { mode: "json" }).$type<ImageItem | null>(),
    latitude: real("latitude"),
    longitude: real("longitude"),
    sortOrder: integer("sort_order").notNull().default(0),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    ...seo,
    ...timestamps,
  },
  (t) => [index("locations_published_idx").on(t.isPublished)],
);

export const projects = sqliteTable(
  "projects",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
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
    unitTypes: text("unit_types", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    amenities: text("amenities", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    paymentPlan: text("payment_plan"),
    /** Free text such as "Q4 2027" or "Delivered 2015 E.C." */
    completion: text("completion"),
    address: text("address"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    images: text("images", { mode: "json" }).$type<ImageItem[]>().notNull().default(sql`'[]'`),
    videoUrl: text("video_url"),
    faqs: text("faqs", { mode: "json" }).$type<FaqItem[]>().notNull().default(sql`'[]'`),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...seo,
    ...timestamps,
  },
  (t) => [index("projects_location_idx").on(t.locationId), index("projects_status_idx").on(t.status)],
);

export const properties = sqliteTable(
  "properties",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
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
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    areaSqm: real("area_sqm"),
    /** 0 = ground floor. */
    floor: integer("floor"),
    /** e.g. "Ready to move in", "December 2027" */
    completion: text("completion"),
    summary: text("summary"),
    description: text("description"),
    features: text("features", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    paymentPlan: text("payment_plan"),
    images: text("images", { mode: "json" }).$type<ImageItem[]>().notNull().default(sql`'[]'`),
    videoUrl: text("video_url"),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
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

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt"),
    /** Markdown */
    content: text("content").notNull().default(""),
    coverImage: text("cover_image", { mode: "json" }).$type<ImageItem | null>(),
    authorName: text("author_name").notNull().default("Temer Properties"),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    ...seo,
    ...timestamps,
  },
  (t) => [index("posts_published_idx").on(t.isPublished, t.publishedAt)],
);

export const bookings = sqliteTable(
  "bookings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
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

export const inquiries = sqliteTable(
  "inquiries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
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

export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("admin"),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  ...timestamps,
});

export const sessions = sqliteTable(
  "sessions",
  {
    /** SHA-256 of the session token (the raw token only lives in the cookie). */
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
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

import "server-only";
import { and, asc, desc, eq, gte, lte, ne, sql, type SQL } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { locations, projects, properties, type ImageItem } from "@/db/schema";
import { TAGS } from "@/lib/cache-tags";
import { PROPERTY_TYPES, type PropertyStatus, type PropertyType } from "@/lib/config/property-types";

/*
 * Public, cached reads. Every function here runs inside `use cache` so pages
 * that use it are prerendered into static HTML (fast TTFB, full content for
 * crawlers) and refreshed on demand when an admin edits data (see
 * src/lib/revalidate.ts).
 */

export type PropertyCardData = {
  id: number;
  slug: string;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number | null;
  promo: string | null;
  discountPercent: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  floor: number | null;
  isFeatured: boolean;
  image: ImageItem | null;
  imageCount: number;
  location: { name: string; slug: string } | null;
  project: { name: string; slug: string } | null;
};

const cardColumns = {
  id: properties.id,
  slug: properties.slug,
  title: properties.title,
  type: properties.type,
  status: properties.status,
  price: properties.price,
  promo: properties.promo,
  discountPercent: properties.discountPercent,
  bedrooms: properties.bedrooms,
  bathrooms: properties.bathrooms,
  areaSqm: properties.areaSqm,
  floor: properties.floor,
  isFeatured: properties.isFeatured,
  images: properties.images,
  locationName: locations.name,
  locationSlug: locations.slug,
  projectName: projects.name,
  projectSlug: projects.slug,
};

type CardRow = Awaited<ReturnType<typeof cardQuery>>[number];

function toCard(row: CardRow): PropertyCardData {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    status: row.status,
    price: row.price,
    promo: row.promo,
    discountPercent: row.discountPercent,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqm: row.areaSqm,
    floor: row.floor,
    isFeatured: row.isFeatured,
    image: row.images[0] ?? null,
    imageCount: row.images.length,
    location: row.locationSlug && row.locationName ? { name: row.locationName, slug: row.locationSlug } : null,
    project: row.projectSlug && row.projectName ? { name: row.projectName, slug: row.projectSlug } : null,
  };
}

function cardQuery() {
  return db
    .select(cardColumns)
    .from(properties)
    .leftJoin(locations, eq(properties.locationId, locations.id))
    .leftJoin(projects, eq(properties.projectId, projects.id));
}

const recommendedOrder = [desc(properties.isFeatured), asc(properties.sortOrder), desc(properties.createdAt), desc(properties.id)];

export const PROPERTY_SORTS = ["recommended", "newest", "price-asc", "price-desc", "size-desc"] as const;
export type PropertySort = (typeof PROPERTY_SORTS)[number];

export const propertySortLabels: Record<PropertySort, string> = {
  recommended: "Recommended",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "size-desc": "Largest first",
};

function orderFor(sort: PropertySort) {
  switch (sort) {
    case "newest":
      return [desc(properties.createdAt), desc(properties.id)];
    case "price-asc":
      return [sql`${properties.price} is null`, asc(properties.price), desc(properties.id)];
    case "price-desc":
      return [sql`${properties.price} is null`, desc(properties.price), desc(properties.id)];
    case "size-desc":
      return [sql`${properties.areaSqm} is null`, desc(properties.areaSqm), desc(properties.id)];
    default:
      return recommendedOrder;
  }
}

export type PropertyFilters = {
  type?: PropertyType;
  location?: string;
  project?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  includeSold?: boolean;
  sort?: PropertySort;
  page?: number;
  pageSize?: number;
};

export async function searchProperties(filters: PropertyFilters) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.properties, TAGS.locations, TAGS.projects);

  const pageSize = filters.pageSize ?? 24;
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const conditions: SQL[] = [eq(properties.isPublished, true)];
  if (!filters.includeSold) conditions.push(ne(properties.status, "sold"));
  if (filters.type) conditions.push(eq(properties.type, filters.type));
  if (filters.location) conditions.push(eq(locations.slug, filters.location));
  if (filters.project) conditions.push(eq(projects.slug, filters.project));
  if (filters.bedrooms) conditions.push(gte(properties.bedrooms, filters.bedrooms));
  if (filters.minPrice) conditions.push(gte(properties.price, filters.minPrice));
  if (filters.maxPrice) conditions.push(lte(properties.price, filters.maxPrice));
  const where = and(...conditions);

  const [rows, totals] = await Promise.all([
    cardQuery()
      .where(where)
      .orderBy(...orderFor(filters.sort ?? "recommended"))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ total: sql<number>`count(*)` })
      .from(properties)
      .leftJoin(locations, eq(properties.locationId, locations.id))
      .leftJoin(projects, eq(properties.projectId, projects.id))
      .where(where),
  ]);
  const total = Number(totals[0]?.total ?? 0);
  return { items: rows.map(toCard), total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getFeaturedProperties(limit = 6) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.properties, TAGS.locations, TAGS.projects);
  const rows = await cardQuery()
    .where(and(eq(properties.isPublished, true), ne(properties.status, "sold")))
    .orderBy(...recommendedOrder)
    .limit(limit);
  return rows.map(toCard);
}

export async function getPropertyBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.properties, TAGS.locations, TAGS.projects);
  const [row] = await db
    .select({
      property: properties,
      location: {
        id: locations.id,
        name: locations.name,
        slug: locations.slug,
        city: locations.city,
        latitude: locations.latitude,
        longitude: locations.longitude,
      },
      project: {
        id: projects.id,
        name: projects.name,
        slug: projects.slug,
        status: projects.status,
        summary: projects.summary,
        completion: projects.completion,
        paymentPlan: projects.paymentPlan,
        address: projects.address,
        latitude: projects.latitude,
        longitude: projects.longitude,
        images: projects.images,
      },
    })
    .from(properties)
    .leftJoin(locations, eq(properties.locationId, locations.id))
    .leftJoin(projects, eq(properties.projectId, projects.id))
    .where(and(eq(properties.slug, slug), eq(properties.isPublished, true)))
    .limit(1);
  if (!row) return null;
  return { ...row.property, location: row.location?.id ? row.location : null, project: row.project?.id ? row.project : null };
}

export type PropertyDetail = NonNullable<Awaited<ReturnType<typeof getPropertyBySlug>>>;

/** Same area first, then same type. Never includes sold units. */
export async function getSimilarProperties(id: number, type: PropertyType, locationId: number | null, limit = 3) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.properties, TAGS.locations, TAGS.projects);
  const rows = await cardQuery()
    .where(and(eq(properties.isPublished, true), ne(properties.status, "sold"), ne(properties.id, id)))
    .orderBy(
      sql`case when ${properties.locationId} = ${locationId ?? -1} then 0 else 1 end`,
      sql`case when ${properties.type} = ${type} then 0 else 1 end`,
      ...recommendedOrder,
    )
    .limit(limit);
  return rows.map(toCard);
}

/** Slugs for generateStaticParams and the sitemap. */
export async function getPropertySitemapEntries() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.properties);
  return db
    .select({ slug: properties.slug, status: properties.status, updatedAt: properties.updatedAt, images: properties.images })
    .from(properties)
    .where(eq(properties.isPublished, true))
    .orderBy(desc(properties.updatedAt));
}

/** Count of on-market (published, not sold) listings per type. */
export async function getTypeCounts() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.properties);
  const rows = await db
    .select({ type: properties.type, count: sql<number>`count(*)` })
    .from(properties)
    .where(and(eq(properties.isPublished, true), ne(properties.status, "sold")))
    .groupBy(properties.type);
  const counts = Object.fromEntries(PROPERTY_TYPES.map((t) => [t, 0])) as Record<PropertyType, number>;
  for (const row of rows) counts[row.type] = Number(row.count);
  return counts;
}

/** Type × area combinations that have on-market listings: the /for-sale/[type]/[location] pages. */
export async function getTypeLocationCombos() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.properties, TAGS.locations);
  const rows = await db
    .select({
      type: properties.type,
      locationSlug: locations.slug,
      locationName: locations.name,
      count: sql<number>`count(*)`,
      updatedAt: sql<number>`max(${properties.updatedAt})`,
    })
    .from(properties)
    .innerJoin(locations, eq(properties.locationId, locations.id))
    .where(and(eq(properties.isPublished, true), ne(properties.status, "sold"), eq(locations.isPublished, true)))
    .groupBy(properties.type, locations.id)
    .orderBy(desc(sql`count(*)`));
  return rows.map((r) => ({ ...r, count: Number(r.count), updatedAt: new Date(Number(r.updatedAt) * 1000) }));
}

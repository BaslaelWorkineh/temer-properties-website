import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { locations, projects, properties } from "@/db/schema";
import { TAGS } from "@/lib/cache-tags";
import type { Locale } from "@/lib/i18n/config";
import { isTranslated, localizeRow } from "@/lib/i18n/localize";

// The outer table is written out ("locations"."id"): in a single-table select drizzle prints a bare "id", which
// inside the subquery means the INNER table's id and silently miscounts every area.
const propertyCount = sql<number>`(select count(*) from ${properties} where ${properties.locationId} = "locations"."id" and ${properties.isPublished} = 1 and ${properties.status} != 'sold')`;
const projectCount = sql<number>`(select count(*) from ${projects} where ${projects.locationId} = "locations"."id" and ${projects.isPublished} = 1)`;

export type LocationSummary = {
  id: number;
  name: string;
  slug: string;
  city: string;
  summary: string | null;
  image: { url: string; alt: string; width?: number; height?: number } | null;
  propertyCount: number;
  projectCount: number;
  updatedAt: Date;
  /** True when the Amharic text is complete enough to index the Amharic page. */
  translated: boolean;
};

/** A location page is only worth indexing when it has something to show. */
export function isLocationIndexable(l: { propertyCount: number; projectCount: number }) {
  return l.propertyCount + l.projectCount > 0;
}

export async function getLocations(lang: Locale = "en"): Promise<LocationSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.locations, TAGS.properties, TAGS.projects);
  const rows = await db
    .select({
      id: locations.id,
      name: locations.name,
      slug: locations.slug,
      city: locations.city,
      summary: locations.summary,
      image: locations.image,
      propertyCount,
      projectCount,
      updatedAt: locations.updatedAt,
      translations: locations.translations,
    })
    .from(locations)
    .where(eq(locations.isPublished, true))
    .orderBy(asc(locations.sortOrder), asc(locations.name));
  return rows.map(({ translations, ...r }) => ({
    ...localizeRow(r, translations, lang),
    propertyCount: Number(r.propertyCount),
    projectCount: Number(r.projectCount),
    translated: isTranslated(translations, ["name", "description"]),
  }));
}

export async function getLocationBySlug(slug: string, lang: Locale = "en") {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.locations, TAGS.properties, TAGS.projects);
  const [row] = await db
    .select({ location: locations, propertyCount, projectCount })
    .from(locations)
    .where(and(eq(locations.slug, slug), eq(locations.isPublished, true)))
    .limit(1);
  if (!row) return null;
  return {
    ...localizeRow(row.location, row.location.translations, lang),
    propertyCount: Number(row.propertyCount),
    projectCount: Number(row.projectCount),
    translated: isTranslated(row.location.translations, ["name", "description"]),
  };
}

import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { locations, projects, properties } from "@/db/schema";
import { TAGS } from "@/lib/cache-tags";

const propertyCount = sql<number>`(select count(*) from ${properties} where ${properties.locationId} = ${locations.id} and ${properties.isPublished} = 1 and ${properties.status} != 'sold')`;
const projectCount = sql<number>`(select count(*) from ${projects} where ${projects.locationId} = ${locations.id} and ${projects.isPublished} = 1)`;

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
};

/** A location page is only worth indexing when it has something to show. */
export function isLocationIndexable(l: { propertyCount: number; projectCount: number }) {
  return l.propertyCount + l.projectCount > 0;
}

export async function getLocations(): Promise<LocationSummary[]> {
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
    })
    .from(locations)
    .where(eq(locations.isPublished, true))
    .orderBy(asc(locations.sortOrder), asc(locations.name));
  return rows.map((r) => ({ ...r, propertyCount: Number(r.propertyCount), projectCount: Number(r.projectCount) }));
}

export async function getLocationBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.locations, TAGS.properties, TAGS.projects);
  const [row] = await db
    .select({ location: locations, propertyCount, projectCount })
    .from(locations)
    .where(and(eq(locations.slug, slug), eq(locations.isPublished, true)))
    .limit(1);
  if (!row) return null;
  return { ...row.location, propertyCount: Number(row.propertyCount), projectCount: Number(row.projectCount) };
}

import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { locations, projects, properties } from "@/db/schema";
import { TAGS } from "@/lib/cache-tags";

const availableUnits = sql<number>`(select count(*) from ${properties} where ${properties.projectId} = "projects"."id" and ${properties.isPublished} = 1 and ${properties.status} != 'sold')`;

/** Selling projects first, delivered last. */
const statusOrder = sql`case ${projects.status} when 'selling' then 0 when 'under_construction' then 1 when 'pre_launch' then 2 else 3 end`;

const summaryColumns = {
  id: projects.id,
  name: projects.name,
  slug: projects.slug,
  status: projects.status,
  category: projects.category,
  summary: projects.summary,
  totalUnits: projects.totalUnits,
  unitTypes: projects.unitTypes,
  completion: projects.completion,
  images: projects.images,
  isFeatured: projects.isFeatured,
  updatedAt: projects.updatedAt,
  locationName: locations.name,
  locationSlug: locations.slug,
  availableUnits,
};

function summaryQuery() {
  return db.select(summaryColumns).from(projects).leftJoin(locations, eq(projects.locationId, locations.id));
}

function toSummary(r: Awaited<ReturnType<typeof summaryQuery>>[number]): ProjectSummary {
  const { locationName, locationSlug, images, availableUnits: units, ...rest } = r;
  return {
    ...rest,
    image: images[0] ?? null,
    images,
    availableUnits: Number(units),
    location: locationSlug && locationName ? { name: locationName, slug: locationSlug } : null,
  };
}

export type ProjectSummary = {
  id: number;
  name: string;
  slug: string;
  status: "pre_launch" | "under_construction" | "selling" | "delivered";
  category: string | null;
  summary: string | null;
  totalUnits: number | null;
  unitTypes: string[];
  completion: string | null;
  image: { url: string; alt: string; width?: number; height?: number } | null;
  images: { url: string; alt: string; width?: number; height?: number }[];
  isFeatured: boolean;
  updatedAt: Date;
  availableUnits: number;
  location: { name: string; slug: string } | null;
};

export async function getProjects(options: { locationId?: number } = {}): Promise<ProjectSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.projects, TAGS.locations, TAGS.properties);
  const conditions = [eq(projects.isPublished, true)];
  if (options.locationId) conditions.push(eq(projects.locationId, options.locationId));
  const rows = await summaryQuery()
    .where(and(...conditions))
    .orderBy(statusOrder, asc(projects.sortOrder), asc(projects.name));
  return rows.map(toSummary);
}

export async function getProjectBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.projects, TAGS.locations, TAGS.properties);
  const [row] = await db
    .select({
      project: projects,
      availableUnits,
      location: {
        id: locations.id,
        name: locations.name,
        slug: locations.slug,
        city: locations.city,
        latitude: locations.latitude,
        longitude: locations.longitude,
      },
    })
    .from(projects)
    .leftJoin(locations, eq(projects.locationId, locations.id))
    .where(and(eq(projects.slug, slug), eq(projects.isPublished, true)))
    .limit(1);
  if (!row) return null;
  return { ...row.project, availableUnits: Number(row.availableUnits), location: row.location?.id ? row.location : null };
}

/** For the booking form's "Which project?" select. */
export async function getProjectOptions() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.projects);
  return db
    .select({ id: projects.id, name: projects.name, slug: projects.slug, status: projects.status })
    .from(projects)
    .where(eq(projects.isPublished, true))
    .orderBy(statusOrder, asc(projects.name));
}

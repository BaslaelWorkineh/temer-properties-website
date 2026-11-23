import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { locations, projects, properties } from "@/db/schema";
import { TAGS } from "@/lib/cache-tags";
import type { Locale } from "@/lib/i18n/config";
import { isTranslated, localizeRow } from "@/lib/i18n/localize";

const availableUnits = sql<number>`(select count(*) from ${properties} where ${properties.projectId} = "projects"."id" and ${properties.isPublished} = true and ${properties.status} != 'sold')`;

const hasDescription = sql<number>`(${projects.description} is not null and trim(${projects.description}) <> '')`;

/**
 * The Amharic page stands on its own (self-canonical + hreflang, listed in the sitemap) when the name and summary are
 * translated, plus the description if the English page has one. The list (sitemap) and the detail page (canonical)
 * must use this same rule, or the sitemap lists /am pages whose canonical points to English.
 */
function projectTranslated(translations: Parameters<typeof isTranslated>[0], withDescription: boolean) {
  return isTranslated(translations, withDescription ? ["name", "summary", "description"] : ["name", "summary"]);
}

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
  translations: projects.translations,
  locationTranslations: locations.translations,
  availableUnits,
  hasDescription,
};

function summaryQuery() {
  return db.select(summaryColumns).from(projects).leftJoin(locations, eq(projects.locationId, locations.id));
}

function toSummary(r: Awaited<ReturnType<typeof summaryQuery>>[number], lang: Locale = "en"): ProjectSummary {
  const { locationName, locationSlug, images, availableUnits: units, translations, locationTranslations, hasDescription: described, ...rest } = r;
  const text = localizeRow(rest, translations, lang);
  const placeName = locationName ? localizeRow({ name: locationName }, locationTranslations, lang).name : null;
  return {
    ...text,
    image: images[0] ?? null,
    images,
    availableUnits: Number(units),
    translated: projectTranslated(translations, Boolean(Number(described))),
    location: locationSlug && placeName ? { name: placeName, slug: locationSlug } : null,
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
  /** True when the Amharic text is complete enough to index the Amharic page. */
  translated: boolean;
  location: { name: string; slug: string } | null;
};

export async function getProjects(options: { locationId?: number } = {}, lang: Locale = "en"): Promise<ProjectSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.projects, TAGS.locations, TAGS.properties);
  const conditions = [eq(projects.isPublished, true)];
  if (options.locationId) conditions.push(eq(projects.locationId, options.locationId));
  const rows = await summaryQuery()
    .where(and(...conditions))
    .orderBy(statusOrder, asc(projects.sortOrder), asc(projects.name));
  return rows.map((r) => toSummary(r, lang));
}

export async function getProjectBySlug(slug: string, lang: Locale = "en") {
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
        translations: locations.translations,
      },
    })
    .from(projects)
    .leftJoin(locations, eq(projects.locationId, locations.id))
    .where(and(eq(projects.slug, slug), eq(projects.isPublished, true)))
    .limit(1);
  if (!row) return null;
  return {
    ...localizeRow(row.project, row.project.translations, lang),
    availableUnits: Number(row.availableUnits),
    translated: projectTranslated(row.project.translations, Boolean(row.project.description?.trim())),
    location: row.location?.id ? { ...localizeRow(row.location, row.location.translations, lang) } : null,
  };
}

/** For the booking form's "Which project?" select. */
export async function getProjectOptions(lang: Locale = "en") {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.projects);
  const rows = await db
    .select({ id: projects.id, name: projects.name, slug: projects.slug, status: projects.status, translations: projects.translations })
    .from(projects)
    .where(eq(projects.isPublished, true))
    .orderBy(statusOrder, asc(projects.name));
  return rows.map(({ translations, ...r }) => localizeRow(r, translations, lang));
}

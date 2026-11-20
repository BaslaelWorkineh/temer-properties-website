import "server-only";
import { asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { locations, posts, projects, properties, type ImageItem } from "@/db/schema";
import { slugify } from "@/lib/utils";

const sluggedTables = { properties, projects, locations, posts } as const;
export type SluggedTable = keyof typeof sluggedTables;

async function slugTaken(table: SluggedTable, slug: string, excludeId?: number) {
  const t = sluggedTables[table];
  const rows = await db.all<{ id: number }>(
    excludeId
      ? sql`select ${t.id} as id from ${t} where ${t.slug} = ${slug} and ${t.id} <> ${excludeId} limit 1`
      : sql`select ${t.id} as id from ${t} where ${t.slug} = ${slug} limit 1`,
  );
  return rows.length > 0;
}

/**
 * Picks the slug to save.
 * - Explicit slug typed by the admin: must be free, otherwise a field error.
 * - Blank on edit: keep the current slug (never silently change a live URL).
 * - Blank on create: generate from the title/name and append -2, -3… until free.
 */
export async function resolveSlug(
  table: SluggedTable,
  opts: { requested?: string; source: string; currentSlug?: string; excludeId?: number },
): Promise<{ slug: string } | { error: string }> {
  const requested = opts.requested ? slugify(opts.requested, 90) : "";
  if (requested) {
    if (await slugTaken(table, requested, opts.excludeId)) {
      return { error: "This URL is already used by another item. Choose a different slug." };
    }
    return { slug: requested };
  }
  if (opts.currentSlug) return { slug: opts.currentSlug };

  const base = slugify(opts.source) || table.replace(/s$/, "");
  let candidate = base;
  for (let n = 2; await slugTaken(table, candidate, opts.excludeId); n++) candidate = `${base}-${n}`;
  return { slug: candidate };
}

/** Images must come from our own media store: next/image only allows these local paths. */
export function invalidImageMessage(images: Array<ImageItem | null | undefined>) {
  const bad = images.find((img) => img && !img.url.startsWith("/media/") && !img.url.startsWith("/images/"));
  return bad ? "Images must be uploaded here (external image links are not supported)." : null;
}

export function getLocationOptions() {
  return db.select({ id: locations.id, name: locations.name }).from(locations).orderBy(asc(locations.name));
}

export function getProjectOptions() {
  return db.select({ id: projects.id, name: projects.name }).from(projects).orderBy(asc(projects.name));
}

export function toId(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

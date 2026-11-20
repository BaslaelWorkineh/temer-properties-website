/**
 * Replaces the generated "Sample image" placeholders with real Temer photos
 * stored in public/images/sample, so the site looks real before the sales team
 * uploads their own pictures in /admin.
 *
 *   npx tsx scripts/apply-sample-photos.ts
 *
 * Projects get 3 photos each (rotating through the pool); a property reuses the
 * photos of its project. Re-running is safe. Photos you upload in /admin later
 * replace these.
 */
import "./load-env";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import sharp from "sharp";
import path from "node:path";
import * as schema from "../src/db/schema";
import { databaseUrl } from "../src/db/url";

const { projects, properties, locations } = schema;
const db = drizzle(createClient({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN }), { schema });

const POOL = [
  "project-1.jpg", "project-2.jpg", "project-3.jpg", "project-4.jpg", "project-5.jpg", "project-6.jpg",
  "site-1.jpg", "site-2.jpg", "site-3.jpg", "site-4.jpg", "site-5.jpg", "hero-1.jpg", "hero-2.jpg", "hero-3.jpg",
];

async function image(file: string, alt: string): Promise<schema.ImageItem> {
  const meta = await sharp(path.resolve("public/images/sample", file)).metadata();
  return { url: `/images/sample/${file}`, alt, width: meta.width, height: meta.height };
}

async function main() {
  const locs = new Map((await db.select({ id: locations.id, name: locations.name }).from(locations)).map((l) => [l.id, l.name]));
  const projectRows = await db.select().from(projects).orderBy(projects.id);
  const byProject = new Map<number, schema.ImageItem[]>();

  for (const [i, p] of projectRows.entries()) {
    const where = (p.locationId && locs.get(p.locationId)) || "Addis Ababa";
    const images = await Promise.all(
      [0, 1, 2].map((n) => image(POOL[(i * 2 + n) % POOL.length], `${p.name} apartments in ${where}, Addis Ababa`)),
    );
    byProject.set(p.id, images);
    await db.update(projects).set({ images }).where(eq(projects.id, p.id));
  }

  const propertyRows = await db.select().from(properties).orderBy(properties.id);
  for (const [i, p] of propertyRows.entries()) {
    const shared = p.projectId ? byProject.get(p.projectId) : undefined;
    const images = shared
      ? [...shared.slice(i % shared.length), ...shared.slice(0, i % shared.length)].map((im) => ({ ...im, alt: `${p.title}` }))
      : await Promise.all([0, 1].map((n) => image(POOL[(i + n * 3) % POOL.length], p.title)));
    await db.update(properties).set({ images }).where(eq(properties.id, p.id));
  }
  console.log(`✓ Applied real photos to ${projectRows.length} projects and ${propertyRows.length} properties`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

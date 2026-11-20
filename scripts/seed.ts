/**
 * Seeds the database with locations, projects, guides, DEMO listings and the
 * first admin user.
 *
 *   npm run db:seed            # seeds an empty database; never touches existing content
 *   npm run db:seed -- --reset # DELETES all content, bookings and enquiries, then re-seeds
 *
 * Placeholder photos are generated (clearly labelled "Sample image") into UPLOAD_DIR/seed.
 */
import "./load-env";
import { createClient } from "@libsql/client";
import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import * as schema from "../src/db/schema";
import { databaseUrl, ensureLocalDbDir } from "../src/db/url";
import { hashPassword } from "../src/lib/auth/password";
import { locationSeeds, postSeeds, projectSeeds, propertySeeds } from "./seed-content";

const { adminUsers, bookings, inquiries, locations, posts, projects, properties, sessions } = schema;

ensureLocalDbDir(databaseUrl);
const client = createClient({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN });
const db = drizzle(client, { schema });

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./storage/uploads");
const reset = process.argv.includes("--reset");

/* ---------------- Placeholder images ---------------- */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const palettes = [
  { sky: ["#dcebe0", "#9cc7a6"], buildings: ["#2c5f34", "#3a7d44", "#214c2b", "#183326"] },
  { sky: ["#f3ead2", "#d9c08a"], buildings: ["#3a7d44", "#c9a24a", "#214c2b", "#5d6b63"] },
  { sky: ["#e4eef3", "#a9c7d6"], buildings: ["#183326", "#2c5f34", "#5d6b63", "#3a7d44"] },
];

function escapeXml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

function sceneSvg(seed: number, label: string, w = 1600, h = 1000) {
  const r = rng(seed);
  const p = palettes[seed % palettes.length];
  const ground = h * 0.82;
  let shapes = "";
  let x = -40;
  while (x < w) {
    const bw = 140 + r() * 220;
    const bh = 260 + r() * 460;
    const color = p.buildings[Math.floor(r() * p.buildings.length)];
    const top = ground - bh;
    shapes += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="${color}"/>`;
    for (let wy = top + 28; wy < ground - 40; wy += 46) {
      for (let wx = x + 22; wx < x + bw - 34; wx += 40) {
        const lit = r() > 0.55;
        shapes += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="20" height="26" rx="2" fill="${lit ? "#f6edd6" : "#ffffff"}" fill-opacity="${lit ? 0.85 : 0.18}"/>`;
      }
    }
    x += bw + 10 + r() * 30;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <circle cx="${(w * (0.15 + r() * 0.7)).toFixed(0)}" cy="${(h * 0.18).toFixed(0)}" r="70" fill="#ffffff" fill-opacity="0.55"/>
  ${shapes}
  <rect y="${ground}" width="${w}" height="${h - ground}" fill="#c9cfc6"/>
  <rect x="40" y="${h - 96}" width="${Math.min(w - 80, 60 + label.length * 19)}" height="60" rx="30" fill="#102219" fill-opacity="0.78"/>
  <text x="72" y="${h - 56}" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#ffffff">${escapeXml(label)}</text>
</svg>`;
}

let imageSeed = 7;
async function placeholderImage(slug: string, n: number, caption: string, alt: string): Promise<schema.ImageItem> {
  const dir = path.join(UPLOAD_DIR, "seed");
  await mkdir(dir, { recursive: true });
  const file = `${slug}-${n}.jpg`;
  const data = await sharp(Buffer.from(sceneSvg(imageSeed++ * 97, `Sample image · ${caption}`)))
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  await writeFile(path.join(dir, file), data);
  return { url: `/media/seed/${file}`, alt, width: 1600, height: 1000 };
}

/* ---------------- Seed ---------------- */

async function seedContent() {
  const locationIds = new Map<string, { id: number; name: string; city: string }>();
  for (const [i, l] of locationSeeds.entries()) {
    const city = l.city ?? "Addis Ababa";
    const image = await placeholderImage(`area-${l.slug}`, 1, l.name, `Street view in ${l.name}, ${city} (sample image)`);
    const [row] = await db
      .insert(locations)
      .values({
        name: l.name,
        slug: l.slug,
        city,
        summary: l.summary,
        description: l.description,
        highlights: l.highlights,
        faqs: l.faqs ?? [],
        image,
        sortOrder: i,
      })
      .returning({ id: locations.id });
    locationIds.set(l.slug, { id: row.id, name: l.name, city });
  }

  const projectIds = new Map<string, { id: number; locationId: number; location: string; paymentPlan?: string }>();
  for (const [i, p] of projectSeeds.entries()) {
    const loc = locationIds.get(p.location)!;
    const images: schema.ImageItem[] = [];
    for (let n = 1; n <= p.imageCount; n++) {
      const view = n === 1 ? "building exterior" : n === 2 ? "street view" : "entrance";
      images.push(await placeholderImage(p.slug, n, p.name, `${p.name} ${view}, ${loc.name}, ${loc.city} (sample image)`));
    }
    const [row] = await db
      .insert(projects)
      .values({
        name: p.name,
        slug: p.slug,
        locationId: loc.id,
        status: p.status,
        category: p.category,
        summary: p.summary,
        description: p.description ?? null,
        unitTypes: p.unitTypes,
        amenities: p.amenities ?? [],
        paymentPlan: p.paymentPlan ?? null,
        images,
        isFeatured: p.isFeatured ?? false,
        sortOrder: i,
      })
      .returning({ id: projects.id });
    projectIds.set(p.slug, { id: row.id, locationId: loc.id, location: loc.name, paymentPlan: p.paymentPlan });
  }

  for (const [i, p] of propertySeeds.entries()) {
    const project = projectIds.get(p.project)!;
    const projectName = projectSeeds.find((s) => s.slug === p.project)!.name;
    const slug = p.title
      .toLowerCase()
      .replace(/m²/g, "sqm")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const isShop = p.type === "shop";
    const rooms = isShop ? ["shopfront", "interior"] : ["living room", "bedroom", "kitchen"];
    const images: schema.ImageItem[] = [];
    for (const [n, room] of rooms.entries()) {
      images.push(
        await placeholderImage(slug, n + 1, `${projectName}`, `${p.title}: ${room} (sample image)`),
      );
    }
    const summary = isShop
      ? `A ${p.areaSqm} m² commercial shop ${p.floor === 0 ? "on the ground floor" : `on floor ${p.floor}`} of ${projectName}, ${project.location}.`
      : `A ${p.bedrooms}-bedroom, ${p.bathrooms}-bathroom apartment of ${p.areaSqm} m² on floor ${p.floor} of ${projectName}, ${project.location}.`;
    const description = `**DEMO LISTING: sample data for development. Replace or delete before launch.**

${summary} ${
      isShop
        ? "The unit suits retail, a pharmacy, a café or professional services, with steady footfall from residents and passers-by."
        : "Living spaces are arranged for natural light and privacy, with a separate kitchen and a balcony."
    }

Contact our sales team for the floor plan, current price and payment options, or book a site visit to see the unit.`;
    await db.insert(properties).values({
      title: p.title,
      slug,
      type: p.type,
      status: p.status ?? "available",
      projectId: project.id,
      locationId: project.locationId,
      price: p.price,
      promo: p.promo ?? null,
      bedrooms: p.bedrooms ?? null,
      bathrooms: p.bathrooms ?? null,
      areaSqm: p.areaSqm,
      floor: p.floor,
      summary,
      description,
      features: p.features,
      images,
      isFeatured: p.isFeatured ?? false,
      sortOrder: i,
    });
  }

  const now = Date.now();
  for (const [i, post] of postSeeds.entries()) {
    await db.insert(posts).values({
      ...post,
      isPublished: true,
      publishedAt: new Date(now - (postSeeds.length - i) * 7 * 86_400_000),
    });
  }

  console.log(
    `✓ Seeded ${locationSeeds.length} locations, ${projectSeeds.length} projects, ${propertySeeds.length} DEMO listings, ${postSeeds.length} guides`,
  );
}

async function seedAdmin() {
  const [{ value: admins }] = await db.select({ value: count() }).from(adminUsers);
  if (admins > 0) return console.log("• Admin user already exists, skipped");
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    return console.log("• No admin created: set ADMIN_EMAIL and ADMIN_PASSWORD, or run `npm run admin:create`");
  }
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters");
  await db.insert(adminUsers).values({ email, name: "Administrator", passwordHash: await hashPassword(password) });
  console.log(`✓ Admin user created: ${email}`);
}

async function main() {
  if (reset) {
    // Children first (foreign keys).
    await db.delete(sessions);
    await db.delete(bookings);
    await db.delete(inquiries);
    await db.delete(properties);
    await db.delete(projects);
    await db.delete(posts);
    await db.delete(locations);
    console.log("• Existing content, bookings and enquiries deleted (--reset)");
  }

  const [{ value: existing }] = await db.select({ value: count() }).from(locations);
  if (existing > 0) console.log("• Content already present, skipped (use --reset to start over)");
  else await seedContent();

  await seedAdmin();
  // Sanity check for the person running the script.
  const [{ value: listed }] = await db.select({ value: count() }).from(properties).where(eq(properties.isPublished, true));
  console.log(`  ${listed} published listings in ${databaseUrl.startsWith("file:") ? databaseUrl : "remote database"}`);
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

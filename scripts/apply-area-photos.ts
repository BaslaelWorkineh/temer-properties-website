/**
 * Gives each area a real Temer photo from public/images/areas (taken from Temer's own websites) and clears the
 * generated "Sample image" skyline from areas that have no photo yet, so their cards fall back to a plain tinted
 * background instead of fake art.
 *
 *   npx tsx scripts/apply-area-photos.ts
 *
 * Re-running is safe. Photos uploaded later in /admin replace these.
 */
import "./load-env";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import path from "node:path";
import * as schema from "../src/db/schema";
import { closeDb, db } from "./db";

const { locations } = schema;

/** area slug -> file in public/images/areas. Areas not listed here get no photo (tinted card). */
const PHOTOS: Record<string, string> = {
  sarbet: "sarbet.jpg",
  megenagna: "megenagna.jpg",
  ayat: "ayat.jpg",
  "haile-garment": "haile-garment.jpg",
  lebu: "lebu.jpg",
  "atena-tera": "atena-tera.jpg",
  bulgaria: "bulgaria.jpg",
  piassa: "piassa.jpg",
  gelan: "gelan.jpg",
};

async function main() {
  const rows = await db.select({ id: locations.id, slug: locations.slug, name: locations.name, city: locations.city }).from(locations);
  let withPhoto = 0;
  for (const row of rows) {
    const file = PHOTOS[row.slug];
    if (!file) {
      await db.update(locations).set({ image: null }).where(eq(locations.id, row.id));
      continue;
    }
    const meta = await sharp(path.resolve("public/images/areas", file)).metadata();
    const image: schema.ImageItem = {
      url: `/images/areas/${file}`,
      alt: `${row.name}, ${row.city}`,
      width: meta.width,
      height: meta.height,
    };
    await db.update(locations).set({ image }).where(eq(locations.id, row.id));
    withPhoto++;
  }
  console.log(`✓ ${withPhoto} areas have a real photo, ${rows.length - withPhoto} use the tinted fallback`);
}

main()
  .then(() => closeDb())
  .catch((e) => {
  console.error(e);
  process.exit(1);
});

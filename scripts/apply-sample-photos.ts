/**
 * Gives every project and property real Temer photos taken from Temer's own websites, so the sample site looks
 * real before the sales team uploads their own pictures in /admin.
 *
 *   npx tsx scripts/apply-sample-photos.ts
 *
 * Photos are matched to the building they show (the sample photos carry the project name in their caption).
 * A property shows exactly the photos of its project, in the same order, so the picture on the home page, on the
 * project card and on the detail page is always the same building. Re-running is safe; photos uploaded in
 * /admin later replace these.
 */
import "./load-env";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import path from "node:path";
import * as schema from "../src/db/schema";
import { closeDb, db } from "./db";

const { projects, properties, locations } = schema;

/** A photo under public/images, with an optional description (otherwise "<project>, <area>"). */
type Photo = string | { file: string; alt: string };

/**
 * Example interiors (3D renders Temer reuses across its apartment listings). They show a typical finish, not a
 * specific unit, so their descriptions say "Example". Three combinations are rotated between projects.
 */
function interiors(variant: 0 | 1 | 2): Photo[] {
  const living = ["gallery/interior-living-1.jpg", "gallery/interior-living-2.jpg", "gallery/interior-living-1.jpg"][variant];
  const kitchen = ["gallery/interior-kitchen-1.jpg", "gallery/interior-dining.jpg", "gallery/interior-kitchen-2.jpg"][variant];
  return [
    { file: living, alt: "Example living room in a Temer Properties apartment (3D render)" },
    { file: kitchen, alt: "Example kitchen and dining area in a Temer Properties apartment (3D render)" },
    { file: "gallery/interior-bedroom.jpg", alt: "Example bedroom in a Temer Properties apartment (3D render)" },
  ];
}

/**
 * project slug -> photos (the first one is the cover). Beyond the cover, projects get the other real photos Temer
 * published for that building: 3D renders from other angles and, for Sarbet City Plus, its interiors.
 */
const PROJECT_PHOTOS: Record<string, Photo[]> = {
  "sarbet-city-plus": [
    "sample/project-3.jpg", // "Sarbet site" aerial
    { file: "gallery/sarbet-city-plus-day.jpg", alt: "Sarbet City Plus towers by day (3D render)" },
    { file: "gallery/sarbet-city-plus-living.jpg", alt: "Living and dining room of a Sarbet City Plus apartment (3D render)" },
    { file: "gallery/sarbet-city-plus-bedroom.jpg", alt: "Bedroom of a Sarbet City Plus apartment (3D render)" },
    { file: "gallery/sarbet-city-plus-bathroom.jpg", alt: "Bathroom of a Sarbet City Plus apartment (3D render)" },
    { file: "gallery/sarbet-city-plus-night.jpg", alt: "Sarbet City Plus towers at night (3D render)" },
    { file: "gallery/sarbet-city-plus-dusk.jpg", alt: "Sarbet City Plus towers at dusk (3D render)" },
    { file: "gallery/sarbet-city-plus-1-bedroom.jpg", alt: "One-bedroom apartment at Sarbet City Plus (3D render)" },
    { file: "gallery/sarbet-city-plus-2-bedroom.jpg", alt: "Two-bedroom apartment at Sarbet City Plus (3D render)" },
    { file: "gallery/sarbet-city-plus-3-bedroom.jpg", alt: "Bedroom of a three-bedroom apartment at Sarbet City Plus (3D render)" },
  ],
  "megenagna-diaspora-site": ["areas/megenagna-tower.jpg", ...interiors(0)],
  // Temer Legacy (see scripts/seed-temer-legacy.ts): the official render of the building.
  "aware-megenagna": [
    { file: "projects/temer-legacy-aware.jpg", alt: "Temer Legacy, the B+G+16+T apartment towers of the Aware site in Megenagna, Addis Ababa (3D render)" },
  ],
  "haile-garment-apartments": [
    "sample/project-2.jpg", // "Garment site"
    "sample/project-5.jpg", // "Garment site"
    { file: "gallery/haile-garment-bathroom.jpg", alt: "Bathroom with a glass shower in a Haile Garment apartment (3D render)" },
    ...interiors(2),
  ],
  "ayat-49": [
    { file: "gallery/ayat-49-poster.jpg", alt: "Ayat 49 apartment building, Temer Properties sales poster (3D render)" },
    "sample/project-4.jpg", // "Ayat sites" aerial
    ...interiors(0),
  ],
  "ajewa-bulgaria": [
    "areas/bulgaria.jpg",
    { file: "gallery/ajewa-bulgaria-progress.jpg", alt: "Construction progress at the Bulgaria site, Temer Properties update poster" },
    ...interiors(1),
  ],
  "piassa-empire": [
    "areas/piassa.jpg",
    { file: "gallery/piassa-empire-1.jpg", alt: "Piassa Empire building seen from the street (3D render)" },
    { file: "gallery/piassa-empire-2.jpg", alt: "Front of the Piassa Empire building with its large screens (3D render)" },
    { file: "gallery/piassa-empire-3.jpg", alt: "Main entrance of Piassa Empire (3D render)" },
    { file: "gallery/piassa-empire-4.jpg", alt: "Piassa Empire at night (3D render)" },
  ],
  "gelan-shops": [
    "areas/gelan.jpg",
    { file: "gallery/gelan-commercial-center.jpg", alt: "Gelan Commercial Center, a B+G+7 shopping building (3D render)" },
    { file: "gallery/gelan-1.jpg", alt: "Gelan shopping building facade with ground-floor shops (3D render)" },
    { file: "gallery/gelan-2.jpg", alt: "Gelan shopping building seen from the corner (3D render)" },
    { file: "gallery/gelan-3.jpg", alt: "Glass front of the Gelan shopping building (3D render)" },
    { file: "gallery/gelan-4.jpg", alt: "Street level view of the Gelan shopping building (3D render)" },
  ],
  "achante-ayat": [
    { file: "gallery/achante.jpg", alt: "Achante, a B+G+10 apartment building in Ayat (3D render)" },
    { file: "sample/project-4.jpg", alt: "Aerial view of Temer's Ayat sites with Achante marked" },
    ...interiors(1),
  ],
  "feresbet-ayat": [
    { file: "gallery/feresbet.jpg", alt: "Feresbet, a 2B+G+16 apartment building in Ayat (3D render)" },
    { file: "sample/project-1.jpg", alt: "Aerial view of the Feresbet site in Ayat" },
    ...interiors(2),
  ],
  "ayat-new-road": [
    { file: "gallery/ayat-new-road.jpg", alt: "Ayat New Road, a 3B+G+22 apartment tower (3D render)" },
    ...interiors(0),
  ],
  "ayat-two-center": [
    { file: "gallery/ayat-two-center.jpg", alt: "Ayat Two Center, a 3B+G+15 apartment building (3D render)" },
    { file: "sample/project-4.jpg", alt: "Aerial view of Temer's Ayat sites with Two Center marked" },
    ...interiors(1),
  ],
  "blue-point-zuhra-sarbet": [
    { file: "gallery/blue-point-zuhra.jpg", alt: "Blue Point Zuhra, a B+G+21+T apartment tower in Sarbet (3D render)" },
    { file: "gallery/blue-point-3-bedroom.jpg", alt: "Three-bedroom apartment at Blue Point, Sarbet (3D render)" },
    ...interiors(2),
  ],
  "lycee-burat": [
    { file: "gallery/lycee-burat.jpg", alt: "Burat, a B+G+22 apartment tower at Lycee (3D render)" },
    ...interiors(0),
  ],
  "lycee-seken": [
    { file: "gallery/lycee-seken.jpg", alt: "Seken, a B+G+19+T apartment tower at Lycee (3D render)" },
    ...interiors(1),
  ],
  "maw-ayat": ["sample/site-5.jpg", "sample/project-4.jpg", ...interiors(2)], // MAW building, then the Ayat aerial that marks MAW
  "2ma-lebu": ["sample/site-4.jpg", ...interiors(0)], // "2MA"
  "sahil-lebu": ["sample/site-2.jpg", ...interiors(1)], // "SAHIL"
  "mohammed-lebu": ["sample/site-3.jpg", ...interiors(2)], // "MOHAMMED.S"
  "ag-trading-atena-tera": ["sample/site-1.jpg", ...interiors(0)], // "AGT TRADING"
};

/** Fallback for a property without a project: the photo of its area (see apply-area-photos.ts). */
const AREA_PHOTO: Record<string, string> = {
  sarbet: "sample/project-3.jpg",
  megenagna: "areas/megenagna-tower.jpg",
  ayat: "sample/project-4.jpg",
  "haile-garment": "sample/project-2.jpg",
  lebu: "sample/site-4.jpg",
  "atena-tera": "sample/site-1.jpg",
  bulgaria: "areas/bulgaria.jpg",
  piassa: "areas/piassa.jpg",
  gelan: "areas/gelan.jpg",
};

async function image(file: string, alt: string): Promise<schema.ImageItem> {
  const meta = await sharp(path.resolve("public/images", file)).metadata();
  return { url: `/images/${file}`, alt, width: meta.width, height: meta.height };
}

/** A photo entry -> ImageItem. A described photo keeps its own description; a plain one uses `fallbackAlt`. */
async function photo(entry: Photo, fallbackAlt: string, keepOwnAlt = false): Promise<schema.ImageItem> {
  if (typeof entry === "string") return image(entry, fallbackAlt);
  return image(entry.file, keepOwnAlt ? `${fallbackAlt}: ${entry.alt}` : entry.alt);
}

async function main() {
  const locs = new Map((await db.select({ id: locations.id, name: locations.name, slug: locations.slug }).from(locations)).map((l) => [l.id, l]));
  const projectRows = await db.select().from(projects).orderBy(projects.id);
  const byProject = new Map<number, Photo[]>();
  let missing = 0;

  for (const p of projectRows) {
    const files = PROJECT_PHOTOS[p.slug];
    if (!files) {
      missing++;
      console.warn(`• No photo mapped for project "${p.slug}"`);
      continue;
    }
    const where = (p.locationId && locs.get(p.locationId)?.name) || "Addis Ababa";
    const images = await Promise.all(files.map((f) => photo(f, `${p.name}, ${where}`)));
    byProject.set(p.id, files);
    await db.update(projects).set({ images }).where(eq(projects.id, p.id));
  }

  const propertyRows = await db.select().from(properties).orderBy(properties.id);
  for (const p of propertyRows) {
    const files =
      (p.projectId && byProject.get(p.projectId)) ||
      (p.locationId && locs.get(p.locationId) && AREA_PHOTO[locs.get(p.locationId)!.slug] ? [AREA_PHOTO[locs.get(p.locationId)!.slug]] : []);
    if (!files || !files.length) {
      missing++;
      console.warn(`• No photo for property "${p.slug}"`);
      continue;
    }
    const images = await Promise.all(files.map((f) => photo(f, p.title, true)));
    await db.update(properties).set({ images }).where(eq(properties.id, p.id));
  }
  console.log(`✓ Photos matched to ${projectRows.length} projects and ${propertyRows.length} properties${missing ? ` (${missing} without a photo)` : ""}`);
}

main()
  .then(() => closeDb())
  .catch((e) => {
  console.error(e);
  process.exit(1);
});

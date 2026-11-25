/**
 * Temer Legacy (the Aware site, Megenagna): project details and its 51 listings, from the official launch memo
 * of 4 Nov 2026. One listing per unit plan per floor band (17 plans x 3 bands), priced exactly as the memo.
 * Safe to re-run: the project is updated by slug and listings are upserted by slug.
 *
 *   npx tsx scripts/seed-temer-legacy.ts
 */
import { eq, sql } from "drizzle-orm";
import { locations, projects, properties, type ImageItem } from "../src/db/schema";
import { closeDb, db, describeDb } from "./db";

const PROJECT_SLUG = "aware-megenagna";
const NAME = "Temer Legacy / Aware Site";

const IMAGE: ImageItem = {
  url: "/images/projects/temer-legacy-aware.jpg",
  alt: "Temer Legacy, the B+G+16+T apartment towers of the Aware site in Megenagna, Addis Ababa (3D render)",
  width: 2400,
  height: 1350,
};

type View = "standard" | "morning" | "studio";
type Plan = { unit: string; bedrooms: number; net: number; total: number; view: View };

/** Price per m² (ETB) by floor band and view, from the memo's floor range and view matrix. */
const BANDS = [
  { from: 2, to: 6, rate: { standard: 115_000, morning: 120_000, studio: 120_000 } },
  { from: 7, to: 11, rate: { standard: 110_000, morning: 115_000, studio: 115_000 } },
  { from: 12, to: 16, rate: { standard: 107_000, morning: 112_000, studio: 112_000 } },
] as const;

const PLANS: Plan[] = [
  { unit: "A-01", bedrooms: 2, net: 80, total: 111, view: "standard" },
  { unit: "A-02", bedrooms: 1, net: 51, total: 75, view: "standard" },
  { unit: "A-03", bedrooms: 3, net: 96, total: 131, view: "standard" },
  { unit: "A-04", bedrooms: 2, net: 75, total: 105, view: "morning" },
  { unit: "A-05", bedrooms: 3, net: 103, total: 139, view: "morning" },
  { unit: "A-06", bedrooms: 1, net: 55, total: 80, view: "morning" },
  { unit: "A-07", bedrooms: 3, net: 106, total: 143, view: "morning" },
  { unit: "B-01", bedrooms: 0, net: 33, total: 42, view: "studio" },
  { unit: "B-02", bedrooms: 0, net: 36, total: 46, view: "studio" },
  { unit: "B-03", bedrooms: 2, net: 85, total: 120, view: "standard" },
  { unit: "B-04", bedrooms: 2, net: 75, total: 108, view: "standard" },
  { unit: "B-05", bedrooms: 0, net: 36, total: 46, view: "studio" },
  { unit: "B-06", bedrooms: 1, net: 44, total: 68, view: "standard" },
  { unit: "B-07", bedrooms: 1, net: 46, total: 71, view: "standard" },
  { unit: "B-08", bedrooms: 1, net: 52, total: 78, view: "standard" },
  { unit: "B-09", bedrooms: 1, net: 44, total: 68, view: "standard" },
  { unit: "B-10", bedrooms: 2, net: 82, total: 116, view: "standard" },
];

/** Prices printed in the memo, to check the computed ones against: [floors 2–6, 7–11, 12–16]. */
const MEMO_PRICES: Record<string, [number, number, number]> = {
  "A-01": [12_765_000, 12_210_000, 11_877_000],
  "A-02": [8_625_000, 8_250_000, 8_025_000],
  "A-03": [15_065_000, 14_410_000, 14_017_000],
  "A-04": [12_600_000, 12_075_000, 11_760_000],
  "A-05": [16_680_000, 15_985_000, 15_568_000],
  "A-06": [9_600_000, 9_200_000, 8_960_000],
  "A-07": [17_160_000, 16_445_000, 16_016_000],
  "B-01": [5_040_000, 4_830_000, 4_704_000],
  "B-02": [5_520_000, 5_290_000, 5_152_000],
  "B-03": [13_800_000, 13_200_000, 12_840_000],
  "B-04": [12_420_000, 11_880_000, 11_556_000],
  "B-05": [5_520_000, 5_290_000, 5_152_000],
  "B-06": [7_820_000, 7_480_000, 7_276_000],
  "B-07": [8_165_000, 7_810_000, 7_597_000],
  "B-08": [8_970_000, 8_580_000, 8_346_000],
  "B-09": [7_820_000, 7_480_000, 7_276_000],
  "B-10": [13_340_000, 12_760_000, 12_412_000],
};

const etb = (n: number) => `ETB ${n.toLocaleString("en-US")}`;
const typology = (b: number) => (b === 0 ? "Studio Apartment" : `${b}-Bedroom Apartment`);
const viewLabel: Record<View, string> = { standard: "Standard view", morning: "Morning View", studio: "Studio" };

const PAYMENT_PLAN = `**1% monthly plan (standard)**

- 20% advance when the sales contract is signed (the minimum, no discount)
- 1% of the total price every month during construction
- 11% at month 14 (half structure completed), month 24 (block work completed) and month 30 (external paint completed)
- 15% on delivery (month 36)

**40/60 plan**

- 40% at contract signing, with a 10% discount on that amount
- 56% of the total price on delivery instead of 60%, so 96% in total

**Discounts for a larger advance**

| Paid at signing | Discount |
|---|---|
| 30–49% | 15% off the amount paid |
| 50–69% | 20% off the amount paid |
| 100% | 30% off the total price |

The 40/60 plan cannot be combined with these discounts. All amounts are in Ethiopian Birr (ETB).`;

const PROJECT_DESCRIPTION = `Temer Legacy is Temer Properties' residential development at the Aware site in Megenagna, Addis Ababa. The building rises B+G+16+T (basement, ground floor, 16 upper floors and a terrace) in two blocks, with homes on floors 2 to 16: **255 apartments** in total.

## Blocks and unit mix

- **Block A:** 7 apartments per floor, 105 in total. Units A-04 to A-07 are **Morning View** units.
- **Block B:** 10 apartments per floor, 150 in total, including the studios (B-01, B-02 and B-05).
- Studios from 42 m², one-bedroom apartments from 68 m², two-bedroom apartments from 105 m² and three-bedroom apartments up to 143 m² (total area, including parking where allocated).

## Price per square metre

Prices depend on the floor and the view. Lower floors are priced higher.

| Floors | Standard view | Morning View | Studio |
|---|---|---|---|
| 2–6 | ETB 115,000 | ETB 120,000 | ETB 120,000 |
| 7–11 | ETB 110,000 | ETB 115,000 | ETB 115,000 |
| 12–16 | ETB 107,000 | ETB 112,000 | ETB 112,000 |

The total price of a unit is its total area multiplied by the price per square metre for its floor and view.`;

const FAQS = [
  {
    question: "How much is the advance payment at Temer Legacy?",
    answer: "The minimum advance is 20% of the total price, paid when the sales contract is signed. The rest is paid at 1% a month, with larger payments at construction milestones and 15% on delivery.",
  },
  {
    question: "Is there a discount for paying more up front?",
    answer: "Yes. Paying 30–49% at signing gives a 15% discount on the amount paid, 50–69% gives 20%, and paying the full price gives 30% off the total. The 40/60 plan gives a 10% discount on the 40% paid at signing.",
  },
  {
    question: "What are the Morning View units?",
    answer: "Units A-04, A-05, A-06 and A-07 in Block A. They are priced ETB 5,000 per square metre above the standard units on the same floors.",
  },
  {
    question: "Do the studios come with parking?",
    answer: "No. The studios (B-01, B-02 and B-05) have no allocated parking. The one-, two- and three-bedroom apartments include parking in their total area.",
  },
];

function listing(plan: Plan, bandIndex: number, projectId: number, locationId: number | null) {
  const band = BANDS[bandIndex];
  const rate = band.rate[plan.view];
  const price = plan.total * rate;
  const expected = MEMO_PRICES[plan.unit][bandIndex];
  if (price !== expected) throw new Error(`${plan.unit} floors ${band.from}-${band.to}: computed ${price}, memo says ${expected}`);
  const floors = `Floors ${band.from}–${band.to}`;
  const block = plan.unit.slice(0, 1);
  const parking = plan.view === "studio" ? "No allocated parking" : "Allocated parking (included in the total area)";
  const advance = price * 0.2;
  return {
    title: `${typology(plan.bedrooms)} ${plan.unit}, ${floors}`,
    slug: `temer-legacy-${plan.unit.toLowerCase()}-floors-${band.from}-${band.to}`,
    type: "apartment" as const,
    status: "available" as const,
    projectId,
    locationId,
    price,
    promo: "Up to 30% off for full payment",
    bedrooms: plan.bedrooms,
    areaSqm: plan.total,
    floor: band.from,
    summary: `${viewLabel[plan.view]} · ${plan.total} m² total, ${plan.net} m² net · Block ${block}`,
    description: `${typology(plan.bedrooms).replace("Studio Apartment", "Studio apartment")} ${plan.unit} in Block ${block} of Temer Legacy, the Aware site in Megenagna, Addis Ababa, on ${floors.toLowerCase()}.

| | |
|---|---|
| Unit | ${plan.unit} (Block ${block}) |
| Type | ${plan.bedrooms === 0 ? "Studio" : `${plan.bedrooms} bedroom${plan.bedrooms > 1 ? "s" : ""}`} |
| View | ${viewLabel[plan.view]} |
| Net area | ${plan.net} m² |
| Total area | ${plan.total} m² |
| ${floors} | ${etb(rate)} per m² |
| Total price | ${etb(price)} |
| 20% advance | ${etb(advance)} |

${plan.view === "studio" ? "Studios have no allocated parking." : "The total area includes the unit's allocated parking."} The same unit is also offered on other floors at a different price per square metre.`,
    features: [`Block ${block}`, viewLabel[plan.view], `${plan.net} m² net, ${plan.total} m² total`, floors, parking],
    paymentPlan: PAYMENT_PLAN,
    images: [IMAGE],
    isFeatured: false,
    isPublished: true,
    sortOrder: PLANS.indexOf(plan) * 3 + bandIndex,
    seoTitle: `${typology(plan.bedrooms)} for Sale in Aware, Addis Ababa – Temer Legacy ${plan.unit} (${floors})`,
    seoDescription: `${typology(plan.bedrooms)} ${plan.unit} at Temer Legacy, Aware: ${plan.total} m² total, ${viewLabel[plan.view].toLowerCase()}, ${floors.toLowerCase()}. ${etb(price)}, 20% advance ${etb(advance)}.`,
  };
}

async function main() {
  console.log(`Seeding Temer Legacy into ${describeDb()}`);
  const [project] = await db.select().from(projects).where(eq(projects.slug, PROJECT_SLUG));
  if (!project) throw new Error(`Project "${PROJECT_SLUG}" not found`);
  const [megenagna] = await db.select({ id: locations.id }).from(locations).where(eq(locations.slug, "megenagna"));
  const locationId = project.locationId ?? megenagna?.id ?? null;

  await db
    .update(projects)
    .set({
      name: NAME,
      status: "selling",
      category: "Residential apartments",
      summary:
        "Temer Legacy is a B+G+16+T residential development at the Aware site in Megenagna, Addis Ababa: 255 studio, one-, two- and three-bedroom apartments in two blocks, from ETB 4.7 million.",
      description: PROJECT_DESCRIPTION,
      totalUnits: 255,
      floors: 16,
      unitTypes: [
        "Studios (42–46 m²)",
        "1-bedroom apartments (68–80 m²)",
        "2-bedroom apartments (105–120 m²)",
        "3-bedroom apartments (131–143 m²)",
      ],
      amenities: ["Allocated parking for 1-, 2- and 3-bedroom apartments", "Morning View units in Block A", "Basement and terrace level"],
      paymentPlan: PAYMENT_PLAN,
      images: [IMAGE],
      faqs: FAQS,
      // The home page's featured building: Featured, and first among featured projects (lowest sort order).
      isFeatured: true,
      sortOrder: -1,
      locationId,
      isPublished: true,
      seoTitle: "Temer Legacy – Apartments for Sale in Aware, Addis Ababa",
      seoDescription:
        "Studios and 1-, 2- and 3-bedroom apartments for sale at Temer Legacy, the Aware site in Megenagna. 255 units, prices from ETB 4.7M, 20% advance and 1% monthly payments.",
      translations: sql`jsonb_set(coalesce(${projects.translations}, '{}'::jsonb), '{am,name}', to_jsonb(${"ቴምር ሌጋሲ / አዋሬ ሳይት"}::text), true)`,
    })
    .where(eq(projects.id, project.id));
  console.log(`Updated project #${project.id}: ${NAME}`);

  const rows = PLANS.flatMap((plan) => BANDS.map((_, i) => listing(plan, i, project.id, locationId)));
  for (const row of rows) {
    await db
      .insert(properties)
      .values(row)
      .onConflictDoUpdate({ target: properties.slug, set: { ...row, updatedAt: new Date() } });
  }
  console.log(`Upserted ${rows.length} listings`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(closeDb);

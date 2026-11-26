/**
 * The November 2026 launches and price lists, from the official memos and the sales team's price notes:
 *
 * - City+ (CIT-SAR5) Phase II, Blocks 02 (B) and 03 (C), Sarbet: memo of 8 July 2026.
 * - Temer Convention+ (CON-TEM1), Addis Convention Centre area, CMC: memo of 4 Nov 2026 (new project and area).
 * - AJWA (PAN-AJW2), Pan Africa / AU HQ area, Bulgaria: revised memo of 4 Nov 2026.
 * - Ayat 49: two three-bedroom units.
 * - Shops at Sarbet, the Ajwa (Bulgaria) site, Gelan and Piassa: starting prices.
 *
 * Apartments get one listing per unit plan per floor band, priced exactly as the memo (checked below).
 * Safe to re-run: projects are updated by slug, the CMC area is upserted, listings are upserted by slug.
 *
 *   npx tsx scripts/seed-launches.ts
 */
import { existsSync } from "node:fs";
import { eq, sql } from "drizzle-orm";
import { locations, projects, properties, type ImageItem } from "../src/db/schema";
import { closeDb, db, describeDb } from "./db";

type View = "standard" | "morning" | "studio";
type Band = { from: number; to: number; rate: Partial<Record<View, number>> };
/** One unit plan. `extra` is the memo's typology beyond the bedrooms ("Maid", "2 Baths"…). */
type Plan = { unit: string; bedrooms: number; extra?: string; net: number; gross: number; view: View };

type Launch = {
  projectSlug: string;
  /** Short name used in listing titles and slugs. */
  short: string;
  slugPrefix: string;
  areaName: string;
  bands: Band[];
  plans: Plan[];
  /** Prices printed in the memo, one per band, to check the computed ones against. */
  memoPrices: Record<string, number[]>;
  paymentPlan: string;
};

const etb = (n: number) => `ETB ${n.toLocaleString("en-US")}`;
const typology = (b: number) => (b === 0 ? "Studio Apartment" : `${b}-Bedroom Apartment`);
const viewLabel: Record<View, string> = { standard: "Standard view", morning: "Morning View", studio: "Studio" };
const extraLabel = (extra?: string) => (extra === "Maid" ? "maid's room" : extra?.toLowerCase());

/* ----------------------------------------------------------------------------------------------------------------
 * Payment plans
 * -------------------------------------------------------------------------------------------------------------- */

const DISCOUNTS_70 = `**Discounts for a larger advance**

| Paid at signing | Discount on the amount paid |
|---|---|
| 30–49% | 15% |
| 50–69% | 20% |
| 70% and above | 30% |`;

const CITY_PLUS_PAYMENT = `**Standard plan**

- 20% advance at contract signing (the minimum, no discount)
- The remaining balance per the payment schedule in the sales contract

${DISCOUNTS_70}

The discount applies to the amount paid. All amounts are in Ethiopian Birr (ETB).`;

const MEMO_NOV_PAYMENT = `**Progress-based plan (standard)**

- 20% advance when the sales contract is signed (the minimum, no discount)
- The rest in payments tied to construction milestones

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

const SHOP_PAYMENT = `**Shop payment plan**

- 25% down payment when the sales contract is signed
- 1% of the price every month after that

Prices start from the amount shown; the final price depends on the shop's size and position. All amounts are in Ethiopian Birr (ETB).`;

/* ----------------------------------------------------------------------------------------------------------------
 * The three apartment launches
 * -------------------------------------------------------------------------------------------------------------- */

const CITY_PLUS: Launch = {
  projectSlug: "sarbet-city-plus",
  short: "City Plus",
  slugPrefix: "city-plus",
  areaName: "Sarbet",
  bands: [
    { from: 7, to: 10, rate: { standard: 130_000 } },
    { from: 11, to: 14, rate: { standard: 125_000 } },
    { from: 15, to: 23, rate: { standard: 120_000 } },
  ],
  plans: [
    { unit: "B-01", bedrooms: 1, net: 62, gross: 93, view: "standard" },
    { unit: "B-02", bedrooms: 3, net: 120, gross: 168, view: "standard" },
    { unit: "B-03", bedrooms: 1, net: 47, gross: 73, view: "standard" },
    { unit: "B-04", bedrooms: 3, net: 94, gross: 134, view: "standard" },
    { unit: "B-05", bedrooms: 3, net: 107, gross: 151, view: "standard" },
    { unit: "B-06", bedrooms: 2, net: 69, gross: 102, view: "standard" },
    { unit: "B-07", bedrooms: 2, net: 77, gross: 112, view: "standard" },
    { unit: "C-01", bedrooms: 2, net: 93, gross: 132, view: "standard" },
    { unit: "C-02", bedrooms: 3, net: 123, gross: 171, view: "standard" },
    { unit: "C-03", bedrooms: 3, net: 126, gross: 175, view: "standard" },
    { unit: "C-04", bedrooms: 3, net: 113, gross: 158, view: "standard" },
    { unit: "C-05", bedrooms: 3, net: 116, gross: 162, view: "standard" },
  ],
  memoPrices: {
    "B-01": [12_090_000, 11_625_000, 11_160_000],
    "B-02": [21_840_000, 21_000_000, 20_160_000],
    "B-03": [9_490_000, 9_125_000, 8_760_000],
    "B-04": [17_420_000, 16_750_000, 16_080_000],
    "B-05": [19_630_000, 18_875_000, 18_120_000],
    "B-06": [13_260_000, 12_750_000, 12_240_000],
    "B-07": [14_560_000, 14_000_000, 13_440_000],
    "C-01": [17_160_000, 16_500_000, 15_840_000],
    "C-02": [22_230_000, 21_375_000, 20_520_000],
    "C-03": [22_750_000, 21_875_000, 21_000_000],
    "C-04": [20_540_000, 19_750_000, 18_960_000],
    "C-05": [21_060_000, 20_250_000, 19_440_000],
  },
  paymentPlan: CITY_PLUS_PAYMENT,
};

const CONVENTION: Launch = {
  projectSlug: "temer-convention-plus-cmc",
  short: "Temer Convention+",
  slugPrefix: "temer-convention",
  areaName: "CMC",
  bands: [
    { from: 1, to: 7, rate: { standard: 115_000, morning: 120_000 } },
    { from: 8, to: 14, rate: { standard: 110_000, morning: 115_000 } },
    { from: 15, to: 21, rate: { standard: 105_000, morning: 110_000 } },
  ],
  plans: [
    { unit: "A-01", bedrooms: 1, extra: "1 Bath", net: 50, gross: 73, view: "standard" },
    { unit: "A-02", bedrooms: 2, extra: "Maid", net: 90, gross: 122, view: "morning" },
    { unit: "A-03", bedrooms: 3, extra: "Maid", net: 96, gross: 130, view: "morning" },
    { unit: "A-04", bedrooms: 2, extra: "Maid", net: 83, gross: 114, view: "standard" },
    { unit: "A-05", bedrooms: 3, extra: "Maid", net: 92, gross: 125, view: "standard" },
    { unit: "A-06", bedrooms: 3, extra: "Maid", net: 108, gross: 145, view: "standard" },
    { unit: "B-01", bedrooms: 1, extra: "1 Bath", net: 50, gross: 74, view: "standard" },
    { unit: "B-02", bedrooms: 3, extra: "2 Baths", net: 92, gross: 125, view: "standard" },
    { unit: "B-03", bedrooms: 2, extra: "Maid", net: 81, gross: 112, view: "standard" },
    { unit: "B-04", bedrooms: 2, extra: "2 Baths", net: 81, gross: 112, view: "standard" },
    { unit: "B-05", bedrooms: 2, extra: "Maid", net: 83, gross: 114, view: "standard" },
    { unit: "B-06", bedrooms: 3, extra: "Maid", net: 96, gross: 130, view: "morning" },
    { unit: "B-07", bedrooms: 2, extra: "Maid", net: 90, gross: 123, view: "morning" },
  ],
  memoPrices: {
    "A-01": [8_395_000, 8_030_000, 7_665_000],
    "A-02": [14_640_000, 14_030_000, 13_420_000],
    "A-03": [15_600_000, 14_950_000, 14_300_000],
    "A-04": [13_110_000, 12_540_000, 11_970_000],
    "A-05": [14_375_000, 13_750_000, 13_125_000],
    "A-06": [16_675_000, 15_950_000, 15_225_000],
    "B-01": [8_510_000, 8_140_000, 7_770_000],
    "B-02": [14_375_000, 13_750_000, 13_125_000],
    "B-03": [12_880_000, 12_320_000, 11_760_000],
    "B-04": [12_880_000, 12_320_000, 11_760_000],
    "B-05": [13_110_000, 12_540_000, 11_970_000],
    "B-06": [15_600_000, 14_950_000, 14_300_000],
    "B-07": [14_760_000, 14_145_000, 13_530_000],
  },
  paymentPlan: MEMO_NOV_PAYMENT,
};

const AJWA: Launch = {
  projectSlug: "ajewa-bulgaria",
  short: "Ajwa",
  slugPrefix: "ajwa",
  areaName: "Bulgaria",
  bands: [
    { from: 7, to: 11, rate: { standard: 120_000, morning: 125_000, studio: 125_000 } },
    { from: 12, to: 16, rate: { standard: 115_000, morning: 120_000, studio: 120_000 } },
    { from: 17, to: 21, rate: { standard: 110_000, morning: 115_000, studio: 115_000 } },
  ],
  plans: [
    { unit: "A-01", bedrooms: 1, net: 46, gross: 70, view: "standard" },
    { unit: "A-02", bedrooms: 1, net: 40, gross: 62, view: "standard" },
    { unit: "A-03", bedrooms: 2, net: 81, gross: 113, view: "standard" },
    { unit: "A-04", bedrooms: 0, net: 32, gross: 40, view: "studio" },
    { unit: "A-05", bedrooms: 3, net: 98, gross: 135, view: "standard" },
    { unit: "A-06", bedrooms: 2, net: 78, gross: 110, view: "standard" },
    { unit: "A-07", bedrooms: 3, net: 112, gross: 152, view: "standard" },
    { unit: "A-08", bedrooms: 3, net: 112, gross: 152, view: "standard" },
    { unit: "B-01", bedrooms: 1, net: 46, gross: 70, view: "standard" },
    { unit: "B-02", bedrooms: 3, net: 112, gross: 152, view: "morning" },
    { unit: "B-03", bedrooms: 3, net: 112, gross: 152, view: "morning" },
    { unit: "B-04", bedrooms: 2, net: 78, gross: 110, view: "standard" },
    { unit: "B-05", bedrooms: 3, net: 98, gross: 135, view: "standard" },
    { unit: "B-06", bedrooms: 0, net: 32, gross: 40, view: "studio" },
    { unit: "B-07", bedrooms: 2, net: 81, gross: 113, view: "standard" },
    { unit: "B-08", bedrooms: 1, net: 40, gross: 62, view: "standard" },
  ],
  memoPrices: {
    "A-01": [8_400_000, 8_050_000, 7_700_000],
    "A-02": [7_440_000, 7_130_000, 6_820_000],
    "A-03": [13_560_000, 12_995_000, 12_430_000],
    "A-04": [5_000_000, 4_800_000, 4_600_000],
    "A-05": [16_200_000, 15_525_000, 14_850_000],
    "A-06": [13_200_000, 12_650_000, 12_100_000],
    "A-07": [18_240_000, 17_480_000, 16_720_000],
    "A-08": [18_240_000, 17_480_000, 16_720_000],
    "B-01": [8_400_000, 8_050_000, 7_700_000],
    "B-02": [19_000_000, 18_240_000, 17_480_000],
    "B-03": [19_000_000, 18_240_000, 17_480_000],
    "B-04": [13_200_000, 12_650_000, 12_100_000],
    "B-05": [16_200_000, 15_525_000, 14_850_000],
    "B-06": [5_000_000, 4_800_000, 4_600_000],
    "B-07": [13_560_000, 12_995_000, 12_430_000],
    "B-08": [7_440_000, 7_130_000, 6_820_000],
  },
  paymentPlan: MEMO_NOV_PAYMENT,
};

/* ----------------------------------------------------------------------------------------------------------------
 * Project details
 * -------------------------------------------------------------------------------------------------------------- */


const CMC_AREA = {
  name: "CMC",
  slug: "cmc",
  summary: "A residential area in eastern Addis Ababa, around the Addis Convention Centre, home to Temer Convention+.",
  // Draft for the sales team to review and expand.
  description: `CMC is a residential area in eastern Addis Ababa, on the corridor between Megenagna and Ayat. Temer Properties' Temer Convention+ project is being built here, in the Addis Convention Centre area.

Temer Convention+ offers one-, two- and three-bedroom apartments in two blocks over 21 residential floors, with Morning View units priced slightly above the standard ones.`,
  highlights: ["Temer Convention+ apartments", "Addis Convention Centre area", "Eastern Addis Ababa, between Megenagna and Ayat"],
};

/** Project photos that lead each project's gallery, in this order. */
const LEAD_IMAGES: Record<string, ImageItem[]> = {
  "ayat-49": [
    {
      url: "/images/projects/ayat-49-tower.jpg",
      alt: "Ayat 49 Apartments, a white apartment tower with staggered balconies in Ayat, Addis Ababa (3D render)",
      width: 1152,
      height: 2472,
    },
  ],
  "aware-1-megenagna": [
    {
      url: "/images/projects/aware-1-towers.jpg",
      alt: "Aware 1 Site, twin white apartment towers joined at the top, in the Aware area of Megenagna, Addis Ababa (3D render)",
      width: 1920,
      height: 1067,
    },
    {
      url: "/images/projects/aware-1-street.jpg",
      alt: "Aware 1 Site seen from the street, with the roads and trees around the towers, Megenagna, Addis Ababa (3D render)",
      width: 1920,
      height: 1073,
    },
  ],
  "ajewa-bulgaria": [
    {
      url: "/images/projects/ajwa-bulgaria-tower.jpg",
      alt: "Ajwa, the 3B+G+21 apartment towers of Temer Properties near the AU HQ in Bulgaria, Addis Ababa (3D render)",
      width: 1880,
      height: 1716,
    },
  ],
  "temer-convention-plus-cmc": [
    {
      url: "/images/projects/temer-convention-cmc-towers.jpg",
      alt: "Temer Convention+, the apartment towers of the CMC site in Addis Ababa, seen from the street below (3D render)",
      width: 1500,
      height: 700,
    },
  ],
  "gelan-shops": [
    {
      url: "/images/projects/commercial-center-shops.jpg",
      alt: "Gelan Commercial Center, a glass-fronted shopping building with a large screen on its corner, Gelan (3D render)",
      width: 1098,
      height: 1494,
    },
  ],
};

type ProjectUpdate =Partial<typeof projects.$inferInsert>;

const PROJECT_UPDATES: Record<string, ProjectUpdate> = {
  "sarbet-city-plus": {
    category: "Apartments & shops",
    summary:
      "City Plus (CIT-SAR5) is a B+G+23 development at Sar Bet Adebabay, Sarbet. Phase II, Blocks 02 and 03, offers one-, two- and three-bedroom apartments on floors 7 to 23 from ETB 8.8 million, plus shops from ETB 2.5 million.",
    description: `City Plus (project code CIT-SAR5) is Temer Properties' residential development at Sar Bet Adebabay in Sarbet, Addis Ababa. The building rises B+G+23 and the homes are on floors 7 to 23. Phase I (Block 01) launched first; **Phase II, Blocks 02 (B) and 03 (C)**, launched on 8 July 2026, with delivery in 36 months.

## Blocks and unit mix

- **Block 02 (B):** 7 apartments per floor, floors 7–23: one-bedroom (73–93 m²), two-bedroom (102–112 m²) and three-bedroom (134–168 m²) apartments.
- **Block 03 (C):** 5 apartments per floor, floors 7–23: two-bedroom (132 m²) and three-bedroom (158–175 m²) apartments.
- **Shops** on the lower floors, from ETB 2.5 million with 25% down and 1% a month.

## Price per square metre

The same rates apply to both blocks. Lower floors are priced higher.

| Floors | Price per m² |
|---|---|
| 7–10 | ETB 130,000 |
| 11–14 | ETB 125,000 |
| 15–23 | ETB 120,000 |

The total price of an apartment is its gross area multiplied by the price per square metre for its floor.`,
    unitTypes: ["1-bedroom apartments (73–93 m²)", "2-bedroom apartments (102–132 m²)", "3-bedroom apartments (134–175 m²)", "Commercial shops"],
    completion: "36 months from the Phase II launch (8 July 2026)",
    address: "Sar Bet Adebabay, Sarbet, Addis Ababa",
    floors: 23,
    paymentPlan: CITY_PLUS_PAYMENT,
    faqs: [
      {
        question: "Which blocks of City Plus are for sale now?",
        answer: "Phase II: Block 02 (B), with 7 apartments per floor, and Block 03 (C), with 5 apartments per floor, on floors 7 to 23.",
      },
      {
        question: "How much is the advance payment at City Plus?",
        answer: "The minimum advance is 20% of the total price at contract signing. Paying 30–49% gives a 15% discount on the amount paid, 50–69% gives 20% and 70% or more gives 30%.",
      },
      {
        question: "How much are the shops at City Plus?",
        answer: "Shops start from ETB 2.5 million, with a 25% down payment and 1% of the price a month after that.",
      },
    ],
    seoTitle: "City Plus Sarbet – Apartments & Shops for Sale at Sar Bet Adebabay",
    seoDescription:
      "1-, 2- and 3-bedroom apartments for sale at City Plus, Sar Bet Adebabay, Sarbet (Phase II, Blocks 02 & 03), from ETB 8.8M with a 20% advance. Shops from ETB 2.5M.",
  },
  "temer-convention-plus-cmc": {
    name: "Temer Convention+ / CMC Site",
    status: "selling",
    category: "Residential apartments",
    summary:
      "Temer Convention+ (CON-TEM1) is a 2B+G+21 residential development in the Addis Convention Centre area, CMC: 273 one-, two- and three-bedroom apartments in two blocks, from ETB 7.7 million.",
    description: `Temer Convention+ (project code CON-TEM1) is Temer Properties' residential development in the Addis Convention Centre area, CMC, in eastern Addis Ababa. It was launched on 4 November 2026. The building rises 2B+G+21 (two basements, ground floor and 21 floors) with homes on floors 1 to 21: **273 apartments** in total.

## Blocks and unit mix

- **Block A:** 6 apartments per floor, 126 in total. Units A-02 and A-03 are **Morning View** units.
- **Block B:** 7 apartments per floor, 147 in total. Units B-06 and B-07 are **Morning View** units.
- One-bedroom apartments of 73–74 m², two-bedroom apartments of 112–123 m² and three-bedroom apartments of 125–145 m² (gross area). Most two- and three-bedroom plans include a maid's room.

## Price per square metre

| Floors | Standard view | Morning View |
|---|---|---|
| 1–7 | ETB 115,000 | ETB 120,000 |
| 8–14 | ETB 110,000 | ETB 115,000 |
| 15–21 | ETB 105,000 | ETB 110,000 |

The total price of a unit is its gross area multiplied by the price per square metre for its floor and view.`,
    totalUnits: 273,
    floors: 21,
    unitTypes: ["1-bedroom apartments (73–74 m²)", "2-bedroom apartments (112–123 m²)", "3-bedroom apartments (125–145 m²)"],
    amenities: ["Morning View units in both blocks", "Maid's room in most 2- and 3-bedroom plans", "Two basement levels"],
    address: "Addis Convention Centre area, CMC, Addis Ababa",
    paymentPlan: MEMO_NOV_PAYMENT,
    faqs: [
      {
        question: "Where is Temer Convention+?",
        answer: "In the Addis Convention Centre area, CMC, in eastern Addis Ababa.",
      },
      {
        question: "How much is the advance payment at Temer Convention+?",
        answer: "The minimum advance is 20% of the total price at contract signing; the rest follows construction milestones. The 40/60 plan and discounts of up to 30% for paying more up front are also available.",
      },
      {
        question: "What are the Morning View units?",
        answer: "Units A-02 and A-03 in Block A and B-06 and B-07 in Block B. They are priced ETB 5,000 per square metre above the standard units on the same floors.",
      },
    ],
    seoTitle: "Temer Convention+ – Apartments for Sale in CMC, Addis Ababa",
    seoDescription:
      "1-, 2- and 3-bedroom apartments for sale at Temer Convention+, Addis Convention Centre area, CMC. 273 units from ETB 7.7M, 20% advance or the 40/60 plan.",
  },
  "ajewa-bulgaria": {
    name: "Ajwa Bulgaria",
    category: "Apartments & shops",
    summary:
      "AJWA (PAN-AJW2) is a 3B+G+21 development in the AU HQ area, Bulgaria: 240 studios and one-, two- and three-bedroom apartments on floors 7 to 21 from ETB 4.6 million, plus shops from ETB 2.5 million.",
    description: `AJWA (project code PAN-AJW2) is Temer Properties' development in the AU HQ (Pan Africa) area around Bulgaria, Addis Ababa. Its updated launch was on 4 November 2026. The building rises 3B+G+21 (three basements, ground floor and 21 floors); the homes for sale are on floors 7 to 21: **240 apartments** in total.

## Blocks and unit mix

- **Block A:** 8 apartments per floor, 120 for sale. Unit A-04 is a studio.
- **Block B:** 8 apartments per floor, 120 for sale. Units B-02 and B-03 are **Morning View** units and B-06 is a studio.
- Studios of 40 m², one-bedroom apartments of 62–70 m², two-bedroom apartments of 110–113 m² and three-bedroom apartments of 135–152 m² (gross area).
- **Shops** at the site, from ETB 2.5 million with 25% down and 1% a month.

## Price per square metre

| Floors | Standard view | Morning View | Studio |
|---|---|---|---|
| 7–11 | ETB 120,000 | ETB 125,000 | ETB 125,000 |
| 12–16 | ETB 115,000 | ETB 120,000 | ETB 120,000 |
| 17–21 | ETB 110,000 | ETB 115,000 | ETB 115,000 |

The total price of a unit is its gross area multiplied by the price per square metre for its floor and view.`,
    totalUnits: 240,
    floors: 21,
    unitTypes: ["Studios (40 m²)", "1-bedroom apartments (62–70 m²)", "2-bedroom apartments (110–113 m²)", "3-bedroom apartments (135–152 m²)", "Commercial shops"],
    amenities: ["Morning View units in Block B", "Three basement levels"],
    address: "AU HQ area (Pan Africa), Bulgaria, Addis Ababa",
    paymentPlan: MEMO_NOV_PAYMENT,
    faqs: [
      {
        question: "Which floors are for sale at Ajwa?",
        answer: "Floors 7 to 21 in both blocks: 8 apartments per floor in each block, 240 in total.",
      },
      {
        question: "How much is the advance payment at Ajwa?",
        answer: "The minimum advance is 20% of the total price at contract signing; the rest follows construction milestones. The 40/60 plan and discounts of up to 30% for paying more up front are also available.",
      },
      {
        question: "How much are the shops at the Ajwa site?",
        answer: "Shops start from ETB 2.5 million, with a 25% down payment and 1% of the price a month after that.",
      },
    ],
    seoTitle: "Ajwa Bulgaria – Apartments & Shops for Sale near the AU HQ, Addis Ababa",
    seoDescription:
      "Studios and 1-, 2- and 3-bedroom apartments for sale at Ajwa, AU HQ area, Bulgaria. 240 units from ETB 4.6M with a 20% advance or the 40/60 plan. Shops from ETB 2.5M.",
  },
  "aware-1-megenagna": {
    category: "Residential apartments",
    summary:
      "Aware 1 Site is a Temer Properties apartment development in the Aware area of Megenagna, Addis Ababa: three-bedroom apartments of 121–157 m² and one-bedroom apartments of 80 m², from ETB 107,000 per m².",
    description: `Aware 1 Site is Temer Properties' residential development in the Aware area of Megenagna, Addis Ababa, near Temer Legacy.

## Apartments

- **Three-bedroom apartments** of 121 to 157 m²
- **One-bedroom apartments** of 80 m²

## Price per square metre

The price depends on the floor: ETB 107,000, ETB 110,000 or ETB 115,000 per m². A 145 m² three-bedroom apartment, for example, starts at ETB 15,515,000.

Contact our sales team for the floors available and the payment plan.`,
    unitTypes: ["1-bedroom apartments (80 m²)", "3-bedroom apartments (121–157 m²)"],
    address: "Aware, Megenagna, Addis Ababa",
    seoTitle: "Aware 1 Site – Apartments for Sale in Aware, Megenagna",
    seoDescription:
      "Three-bedroom (121–157 m²) and one-bedroom (80 m²) apartments for sale at Aware 1 Site, Megenagna, Addis Ababa, from ETB 107,000 per m².",
  },
  "ayat-49": {
    description:`Ayat 49 Apartments are three-bedroom apartments for sale at Temer Properties' Ayat 49 site in eastern Addis Ababa.

| Size | Price |
|---|---|
| 146 m² | ETB 13,651,000 |
| 180 m² | ETB 16,830,000 |

Contact our sales team for the payment plan and to book a site visit.`,
    unitTypes: ["3-bedroom apartments (146 and 180 m²)"],
  },
  "gelan-shops": {
    paymentPlan: SHOP_PAYMENT,
    unitTypes: ["Commercial shops from ETB 2.5 million"],
  },
  "piassa-empire": {
    unitTypes: ["Commercial shops from ETB 4.8 million"],
  },
};

/* ----------------------------------------------------------------------------------------------------------------
 * Listings
 * -------------------------------------------------------------------------------------------------------------- */

type Ctx = { projectId: number; locationId: number | null; image: ImageItem | null };

function apartment(launch: Launch, plan: Plan, bandIndex: number, ctx: Ctx, projectName: string) {
  const band = launch.bands[bandIndex];
  const rate = band.rate[plan.view];
  if (!rate) throw new Error(`${launch.short} ${plan.unit}: no ${plan.view} rate for floors ${band.from}-${band.to}`);
  const price = plan.gross * rate;
  const expected = launch.memoPrices[plan.unit]?.[bandIndex];
  if (price !== expected) throw new Error(`${launch.short} ${plan.unit} floors ${band.from}-${band.to}: computed ${price}, memo says ${expected}`);
  const floors = `Floors ${band.from}–${band.to}`;
  const block = plan.unit.slice(0, 1);
  const advance = price * 0.2;
  const extra = extraLabel(plan.extra);
  const type = typology(plan.bedrooms);
  // Only memos that price by view (Morning View, studios) get a view label; City Plus has one rate per floor band.
  const view = launch.plans.some((p) => p.view !== "standard") ? viewLabel[plan.view] : null;
  return {
    title: `${type} ${plan.unit}, ${floors}`,
    slug: `${launch.slugPrefix}-${plan.unit.toLowerCase()}-floors-${band.from}-${band.to}`,
    type: "apartment" as const,
    status: "available" as const,
    projectId: ctx.projectId,
    locationId: ctx.locationId,
    price,
    promo: launch === CITY_PLUS ? "Up to 30% off the amount paid" : "Up to 30% off for full payment",
    bedrooms: plan.bedrooms,
    areaSqm: plan.gross,
    floor: band.from,
    summary: [view, extra ? `with ${extra}` : null, `${plan.gross} m² gross, ${plan.net} m² net`, `Block ${block}`]
      .filter(Boolean)
      .join(" · "),
    description: `${type.replace("Studio Apartment", "Studio apartment")} ${plan.unit} in Block ${block} of ${projectName}, ${launch.areaName}, Addis Ababa, on ${floors.toLowerCase()}.

| | |
|---|---|
| Unit | ${plan.unit} (Block ${block}) |
| Type | ${plan.bedrooms === 0 ? "Studio" : `${plan.bedrooms} bedroom${plan.bedrooms > 1 ? "s" : ""}`}${extra ? ` + ${extra}` : ""} |
${view ? `| View | ${view} |\n` : ""}| Net area | ${plan.net} m² |
| Gross area | ${plan.gross} m² |
| ${floors} | ${etb(rate)} per m² |
| Total price | ${etb(price)} |
| 20% advance | ${etb(advance)} |

The same unit is also offered on other floors at a different price per square metre.`,
    features: [`Block ${block}`, ...(view ? [view] : []), ...(extra ? [`Includes ${extra}`] : []), `${plan.net} m² net, ${plan.gross} m² gross`, floors],
    paymentPlan: launch.paymentPlan,
    images: ctx.image ? [ctx.image] : [],
    isFeatured: false,
    isPublished: true,
    sortOrder: launch.plans.indexOf(plan) * launch.bands.length + bandIndex,
    seoTitle: `${type} for Sale in ${launch.areaName}, Addis Ababa – ${launch.short} ${plan.unit} (${floors})`,
    seoDescription: `${type} ${plan.unit} at ${projectName}, ${launch.areaName}: ${plan.gross} m² gross, ${view ? `${view.toLowerCase()}, ` : ""}${floors.toLowerCase()}. ${etb(price)}, 20% advance ${etb(advance)}.`,
  };
}

type Shop = { projectSlug: string; slug: string; site: string; areaName: string; from: number; plan: boolean };

const SHOPS: Shop[] = [
  { projectSlug: "sarbet-city-plus", slug: "city-plus-sarbet-shops", site: "City Plus, Sarbet", areaName: "Sarbet", from: 2_500_000, plan: true },
  { projectSlug: "ajewa-bulgaria", slug: "ajwa-bulgaria-shops", site: "the Ajwa site, Bulgaria", areaName: "Bulgaria", from: 2_500_000, plan: true },
  { projectSlug: "gelan-shops", slug: "gelan-shops-from-2-5-million", site: "Gelan", areaName: "Gelan", from: 2_500_000, plan: true },
  { projectSlug: "piassa-empire", slug: "piassa-empire-shops", site: "Piassa Empire, Piassa", areaName: "Piassa", from: 4_800_000, plan: false },
];

function shop(s: Shop, ctx: Ctx) {
  const millions = `${s.from / 1_000_000} million`;
  const terms = s.plan ? "25% down payment, then 1% a month" : null;
  return {
    title: `Commercial Shops at ${s.site}`,
    slug: s.slug,
    type: "shop" as const,
    status: "available" as const,
    projectId: ctx.projectId,
    locationId: ctx.locationId,
    price: s.from,
    promo: terms ? "25% down, then 1% a month" : null,
    bedrooms: null,
    areaSqm: null,
    floor: null,
    summary: [`From ETB ${millions}`, terms].filter(Boolean).join(" · "),
    description: `Commercial shops for sale at ${s.site}, Addis Ababa, starting from ${etb(s.from)}.${
      terms ? `\n\nPay a 25% down payment when the contract is signed, then 1% of the price every month.` : ""
    }

The final price depends on the shop's size and position. Contact our sales team for the shops available now, or book a site visit.`,
    features: [`From ${etb(s.from)}`, ...(terms ? ["25% down payment", "1% a month"] : [])],
    paymentPlan: s.plan ? SHOP_PAYMENT : null,
    images: ctx.image ? [ctx.image] : [],
    isFeatured: false,
    isPublished: true,
    sortOrder: 1000,
    seoTitle: `Shops for Sale in ${s.areaName}, Addis Ababa – from ETB ${millions}`,
    seoDescription: `Commercial shops for sale at ${s.site}, from ${etb(s.from)}${terms ? ` with a ${terms}` : ""}. Built and sold by Temer Properties.`,
  };
}

/**
 * Aware 1 Site (Megenagna), from the sales team's note: rates of ETB 107,000, 110,000 and 115,000 per m² depending
 * on the floor (which floors is not given yet), so each size is listed from the lowest rate. Sizes that repeat in the
 * note (145 m² three times) are one listing.
 */
const AWARE_1 = {
  projectSlug: "aware-1-megenagna",
  fromRate: 107_000,
  rates: [107_000, 110_000, 115_000],
  units: [
    { bedrooms: 3, sizes: [145, 121, 146, 157, 145, 131, 150, 145, 140, 142, 135] },
    { bedrooms: 1, sizes: [80] },
  ],
};

function aware1(bedrooms: number, gross: number, i: number, ctx: Ctx) {
  const price = gross * AWARE_1.fromRate;
  const type = typology(bedrooms);
  return {
    title: `${type}, ${gross} m²`,
    slug: `aware-1-${bedrooms}-bedroom-${gross}-sqm`,
    type: "apartment" as const,
    status: "available" as const,
    projectId: ctx.projectId,
    locationId: ctx.locationId,
    price,
    promo: null,
    bedrooms,
    areaSqm: gross,
    floor: null,
    summary: `${gross} m² · from ${etb(AWARE_1.fromRate)} per m², depending on the floor`,
    description: `A ${gross} m² ${type.toLowerCase()} for sale at Aware 1 Site, in the Aware area of Megenagna, Addis Ababa.

The price per square metre depends on the floor: ${AWARE_1.rates.map(etb).join(", ")}. From the lowest rate, this unit starts at ${etb(price)}.

Contact our sales team for the floors available and the payment plan, or book a site visit.`,
    features: [`${gross} m²`, `${bedrooms} bedroom${bedrooms > 1 ? "s" : ""}`, `From ${etb(AWARE_1.fromRate)} per m²`],
    paymentPlan: null,
    images: ctx.image ? [ctx.image] : [],
    isFeatured: false,
    isPublished: true,
    sortOrder: i,
    seoTitle: `${type} for Sale in Aware, Megenagna – ${gross} m², Aware 1 Site`,
    seoDescription: `${gross} m² ${type.toLowerCase()} for sale at Aware 1 Site, Megenagna, Addis Ababa: from ${etb(price)} (${etb(AWARE_1.fromRate)} per m²). Built and sold by Temer Properties.`,
  };
}

const AYAT_49 = [
  { gross: 146, price: 13_651_000 },
  { gross: 180, price: 16_830_000 },
];

function ayat49(unit: (typeof AYAT_49)[number], i: number, ctx: Ctx) {
  return {
    title: `3-Bedroom Apartment, ${unit.gross} m²`,
    slug: `ayat-49-3-bedroom-${unit.gross}-sqm`,
    type: "apartment" as const,
    status: "available" as const,
    projectId: ctx.projectId,
    locationId: ctx.locationId,
    price: unit.price,
    promo: null,
    bedrooms: 3,
    areaSqm: unit.gross,
    floor: null,
    summary: `${unit.gross} m² · Ayat 49`,
    description: `A ${unit.gross} m² three-bedroom apartment for sale at Ayat 49 Apartments in eastern Addis Ababa, priced at ${etb(unit.price)}.

Contact our sales team for the payment plan and the floors available, or book a site visit.`,
    features: [`${unit.gross} m²`, "3 bedrooms"],
    paymentPlan: null,
    images: ctx.image ? [ctx.image] : [],
    isFeatured: false,
    isPublished: true,
    sortOrder: i,
    seoTitle: `3-Bedroom Apartment for Sale in Ayat, Addis Ababa – ${unit.gross} m², Ayat 49`,
    seoDescription: `${unit.gross} m² three-bedroom apartment for sale at Ayat 49, Addis Ababa: ${etb(unit.price)}. Built and sold by Temer Properties.`,
  };
}

/* ----------------------------------------------------------------------------------------------------------------
 * Run
 * -------------------------------------------------------------------------------------------------------------- */

async function upsertListing(row: typeof properties.$inferInsert) {
  await db
    .insert(properties)
    .values(row)
    .onConflictDoUpdate({ target: properties.slug, set: { ...row, updatedAt: new Date() } });
}

async function locationId(slug: string) {
  const [row] = await db.select({ id: locations.id }).from(locations).where(eq(locations.slug, slug));
  return row?.id ?? null;
}

async function main() {
  console.log(`Seeding the November 2026 launches into ${describeDb()}`);

  // The CMC area and the Temer Convention+ project are new.
  await db
    .insert(locations)
    .values({ ...CMC_AREA, sortOrder: 20 })
    .onConflictDoNothing({ target: locations.slug });
  const cmcId = await locationId("cmc");
  await db
    .insert(projects)
    .values({ name: "Temer Convention+ / CMC Site", slug: CONVENTION.projectSlug, status: "selling", locationId: cmcId })
    .onConflictDoNothing({ target: projects.slug });
  // Aware 1 Site is new too, in Megenagna next to Temer Legacy.
  await db
    .insert(projects)
    .values({ name: "Aware 1 Site", slug: AWARE_1.projectSlug, status: "selling", locationId: await locationId("megenagna"), sortOrder: 3 })
    .onConflictDoNothing({ target: projects.slug });

  for (const [slug, update] of Object.entries(PROJECT_UPDATES)) {
    await db.update(projects).set(update).where(eq(projects.slug, slug));
  }
  // New launches lead the home page's project switcher after Temer Legacy and City Plus (Featured, then sort order).
  await db
    .update(projects)
    .set({
      isFeatured: true,
      sortOrder: 2,
      isPublished: true,
      locationId: cmcId,
      translations: sql`jsonb_set(coalesce(${projects.translations}, '{}'::jsonb), '{am,name}', to_jsonb(${"ቴምር ኮንቬንሽን+ / ሲኤምሲ ሳይት"}::text), true)`,
    })
    .where(eq(projects.slug, CONVENTION.projectSlug));
  await db.update(projects).set({ isFeatured: true }).where(eq(projects.slug, AJWA.projectSlug));
  await db
    .update(projects)
    // Featured and right after Temer Convention+, so the two share a row on the home page.
    .set({ isFeatured: true, sortOrder: 3, translations: sql`jsonb_set(coalesce(${projects.translations}, '{}'::jsonb), '{am,name}', to_jsonb(${"አዋሬ 1 ሳይት"}::text), true)` })
    .where(eq(projects.slug, AWARE_1.projectSlug));
  // City Plus: the daytime render of the building first (it is the photo the home page shows).
  const [cityPlus] = await db.select({ images: projects.images }).from(projects).where(eq(projects.slug, CITY_PLUS.projectSlug));
  if (cityPlus) {
    const day = cityPlus.images.find((i) => i.url.endsWith("sarbet-city-plus-day.jpg"));
    if (day) await db.update(projects).set({ images: [day, ...cityPlus.images.filter((i) => i !== day && !i.url.includes("/sample/"))] }).where(eq(projects.slug, CITY_PLUS.projectSlug));
  }
  // Photos from the sales team, put first (the home page shows the first two).
  for (const [slug, lead] of Object.entries(LEAD_IMAGES)) {
    const [row] = await db.select({ images: projects.images }).from(projects).where(eq(projects.slug, slug));
    if (!row) continue;
    const urls = new Set(lead.map((i) => i.url));
    // Earlier versions of these photos that were renamed (so caches pick up the new file) are dropped.
    const gone = (url: string) => url.startsWith("/images/projects/") && !existsSync(`public${url}`);
    await db
      .update(projects)
      .set({ images: [...lead, ...row.images.filter((i) => !urls.has(i.url) && !gone(i.url))] })
      .where(eq(projects.slug, slug));
  }

  const projectRows = await db.select().from(projects);
  const ctxFor = (slug: string): Ctx & { name: string } => {
    const p = projectRows.find((r) => r.slug === slug);
    if (!p) throw new Error(`Project "${slug}" not found`);
    return { projectId: p.id, locationId: p.locationId, image: p.images[0] ?? null, name: p.name };
  };

  let count = 0;
  for (const launch of [CITY_PLUS, CONVENTION, AJWA]) {
    const ctx = ctxFor(launch.projectSlug);
    for (const plan of launch.plans) {
      for (let b = 0; b < launch.bands.length; b++) {
        await upsertListing(apartment(launch, plan, b, ctx, ctx.name));
        count++;
      }
    }
    console.log(`${ctx.name}: ${launch.plans.length * launch.bands.length} listings`);
  }
  const aware = ctxFor(AWARE_1.projectSlug);
  let awareCount = 0;
  for (const { bedrooms, sizes } of AWARE_1.units) {
    for (const gross of [...new Set(sizes)].sort((a, b) => a - b)) {
      await upsertListing(aware1(bedrooms, gross, awareCount++, aware));
      count++;
    }
  }
  console.log(`${aware.name}: ${awareCount} listings`);
  const ayat = ctxFor("ayat-49");
  for (const [i, unit] of AYAT_49.entries()) {
    await upsertListing(ayat49(unit, i, ayat));
    count++;
  }
  for (const s of SHOPS) {
    await upsertListing(shop(s, ctxFor(s.projectSlug)));
    count++;
  }
  console.log(`Upserted ${count} listings`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(closeDb);


/**
 * Seed content. Locations and projects mirror temerpropertiesapartment.com.
 * Everything marked DEMO (unit listings, prices, features, payment plans) is
 * sample data for development: replace it in the admin before launch.
 * Area descriptions are drafts for the sales team to review and expand.
 */
import type { FaqItem } from "../src/db/schema";

type LocationSeed = {
  name: string;
  slug: string;
  city?: string;
  summary: string;
  description: string;
  highlights: string[];
  faqs?: FaqItem[];
};

export const locationSeeds: LocationSeed[] = [
  {
    name: "Sarbet",
    slug: "sarbet",
    summary:
      "An established residential and commercial neighbourhood in south-western Addis Ababa, close to Old Airport and Mekanisa, and home to Temer Properties' head office.",
    description: `Sarbet is a mature, well-connected part of south-western Addis Ababa. It sits close to the Old Airport and Mekanisa neighbourhoods, with banks, cafés, schools and daily shopping within easy reach, and quick routes towards the city centre.

For buyers, Sarbet offers a rare mix: the convenience of a central location with a calmer residential feel than the busiest commercial districts. Mixed-use buildings here combine shops at street level with apartments above, which suits both homeowners and investors looking for rental demand.

Temer Properties' office is on the Sarbet to Kera road, so a site visit in Sarbet is easy to combine with a meeting with our sales team.`,
    highlights: [
      "Close to Old Airport and Mekanisa",
      "Mixed-use buildings with shops and apartments",
      "Temer Properties' head office is in Sarbet",
    ],
    faqs: [
      {
        question: "What does Temer Properties sell in Sarbet?",
        answer:
          "Our Sarbet City Plus project offers one-, two- and three-bedroom apartments together with commercial shops on the lower floors. Check the listings on this page for units currently for sale.",
      },
      {
        question: "Can I visit Sarbet City Plus and the sales office on the same day?",
        answer: "Yes. Our office is on the Sarbet to Kera road, a short drive from the site. Book a visit and we will arrange both.",
      },
    ],
  },
  {
    name: "Megenagna",
    slug: "megenagna",
    summary:
      "One of eastern Addis Ababa's busiest transport and commercial hubs, served by the light rail, with malls, banks and shops on the doorstep.",
    description: `Megenagna is a major junction in eastern Addis Ababa, where routes to Bole, CMC, Ayat and the city centre meet. The light rail and frequent minibus and bus routes make it one of the easiest places in the city to commute from without a car.

Around the main interchange you will find shopping malls, banks, restaurants and offices, so daily errands rarely need a long trip. That convenience keeps demand for homes here consistently high, both from owner-occupiers and from tenants.

Temer Properties is building at two sites in the Megenagna area: the Megenagna Diaspora Site and the Aware site.`,
    highlights: ["Light rail and major bus routes", "Malls, banks and restaurants nearby", "Strong rental demand"],
    faqs: [
      {
        question: "Which Temer Properties projects are in Megenagna?",
        answer: "The Megenagna Diaspora Site and the Aware site, both residential apartment projects. See the project pages for unit types and availability.",
      },
    ],
  },
  {
    name: "Ayat",
    slug: "ayat",
    summary:
      "A fast-growing, family-friendly residential district in eastern Addis Ababa, known for planned housing developments and the light rail's eastern terminus.",
    description: `Ayat, on the eastern side of Addis Ababa, has grown into one of the city's most popular residential districts. Planned housing developments, wider roads and a quieter feel than the centre make it a favourite with families.

The light rail's east-west line ends in Ayat, linking the area to Megenagna and onwards into the city. Schools, shops and services have followed the population, and new apartment buildings continue to be completed across the district.

Temer Properties is selling three-bedroom apartments at Ayat 49 and has already delivered the Maw building at our Ayat site.`,
    highlights: ["Popular with families", "Eastern terminus of the light rail", "Delivered and ongoing Temer projects"],
    faqs: [
      {
        question: "Does Temer Properties have completed buildings in Ayat?",
        answer: "Yes. The Maw building at our Ayat site has been delivered, and three-bedroom apartments are currently for sale at Ayat 49.",
      },
    ],
  },
  {
    name: "Haile Garment",
    slug: "haile-garment",
    summary:
      "A busy, fast-growing residential area in south-western Addis Ababa next to Lebu, with new apartment buildings, shops and frequent public transport.",
    description: `Haile Garment takes its name from the garment factory that once defined the area. Today it is a lively residential district in south-western Addis Ababa, next to Lebu, with a steady stream of new apartment buildings, local markets and shops.

Prices in Haile Garment have historically been more accessible than in the most central neighbourhoods, which makes the area attractive to first-time buyers and to investors looking for value.

Temer Properties is selling spacious three-bedroom apartments of 139 m² at Haile Garment.`,
    highlights: ["Spacious 3-bedroom apartments (139 m²)", "Good value compared with central areas", "Next to Lebu"],
  },
  {
    name: "Piassa",
    slug: "piassa",
    summary:
      "The historic heart of Addis Ababa, famous for its old architecture, cafés, jewellery shops and some of the city's busiest shopping streets.",
    description: `Piassa is one of the oldest and most recognisable districts of Addis Ababa. Its streets are lined with historic buildings, cafés, jewellery and clothing shops, and the area draws shoppers from across the city every day.

That constant footfall makes Piassa one of the strongest locations in Addis Ababa for retail. Owning a shop here is a long-term investment in one of the city's established commercial centres.

Temer Properties' Piassa Empire project offers commercial shop units in Piassa.`,
    highlights: ["Historic commercial centre", "High daily footfall", "Commercial shop units at Piassa Empire"],
  },
  {
    name: "Bulgaria",
    slug: "bulgaria",
    summary:
      "A central residential and commercial neighbourhood around Bulgaria Mazoria, with established shops, schools and quick access to the city centre.",
    description: `The Bulgaria area, centred on Bulgaria Mazoria (roundabout), is an established neighbourhood within easy reach of the city centre. It combines residential streets with busy commercial frontage, schools and everyday services.

Its central position makes Bulgaria attractive both for homeowners who want short commutes and for business owners looking for a shop in a well-known location.

Temer Properties' Ajewa Bulgaria project offers one-, two- and three-bedroom apartments together with commercial shops.`,
    highlights: ["Central location", "Apartments and shops at Ajewa Bulgaria", "Established services and schools"],
  },
  {
    name: "Gelan",
    slug: "gelan",
    city: "Gelan",
    summary:
      "A growing town on the south-eastern edge of Addis Ababa, along the corridor towards Dukem and Adama, with expanding industry and commerce.",
    description: `Gelan lies just outside Addis Ababa to the south-east, along the busy corridor towards Dukem and Adama. Industrial parks, logistics businesses and new housing have brought fast growth and a rising population.

Commercial property in a growing town can offer an earlier entry point than in central Addis Ababa, with demand rising as the area develops.

Temer Properties' Gelan Shops project offers commercial shop units.`,
    highlights: ["On the corridor towards Dukem and Adama", "Fast-growing commercial area", "Commercial shop units"],
  },
  {
    name: "Lebu",
    slug: "lebu",
    summary:
      "A growing residential area in south-western Addis Ababa, next to Haile Garment, where Temer Properties has delivered several buildings.",
    description: `Lebu is a growing residential area in south-western Addis Ababa, neighbouring Haile Garment. New apartment buildings, local shops and services have made it a popular choice for buyers who want more space for their money.

Temer Properties has completed and handed over several buildings in Lebu, including 2MA, Sahil and Mohammed: a track record you can visit and see for yourself.`,
    highlights: ["Several delivered Temer buildings", "More space for your money", "Next to Haile Garment"],
  },
  {
    name: "Atena Tera",
    slug: "atena-tera",
    summary:
      "A busy trading section of Merkato, Addis Ababa's vast open-air market district, and a sought-after location for commercial property.",
    description: `Atena Tera is one of the trading sections of Merkato, the enormous open-air market district in Addis Ababa. Thousands of traders and shoppers pass through every day, which makes commercial space here valuable and in demand.

Temer Properties delivered the AG Trading building in Atena Tera.`,
    highlights: ["Part of Merkato", "Very high commercial footfall", "AG Trading building delivered"],
  },
];

type ProjectSeed = {
  name: string;
  slug: string;
  /** Area slug; omitted when the area has no page of its own yet (e.g. Lycee). */
  location?: string;
  status: "pre_launch" | "under_construction" | "selling" | "delivered";
  category: string | null;
  summary: string;
  description?: string;
  unitTypes: string[];
  amenities?: string[];
  /** DEMO */
  paymentPlan?: string;
  isFeatured?: boolean;
  imageCount: number;
};

const demoPaymentPlan = `**DEMO: replace with the real terms for this project.**

- Down payment on reservation
- Remaining balance in instalments linked to construction progress
- Discount available for full upfront payment`;

export const projectSeeds: ProjectSeed[] = [
  {
    name: "Sarbet City Plus",
    slug: "sarbet-city-plus",
    location: "sarbet",
    status: "selling",
    category: "Apartments & shops",
    summary: "A mixed-use building in Sarbet with one-, two- and three-bedroom apartments above commercial shops.",
    description: `Sarbet City Plus brings homes and commercial space together in one of south-western Addis Ababa's most convenient neighbourhoods. The lower floors are planned as shops, with one-, two- and three-bedroom apartments on the floors above.

The project suits owner-occupiers who want a central address and investors looking for either rental apartments or a shop with built-in footfall from the residents above.`,
    unitTypes: ["1-bedroom apartments", "2-bedroom apartments", "3-bedroom apartments", "Commercial shops"],
    amenities: ["Lift", "Parking", "Standby generator", "24/7 security"],
    paymentPlan: demoPaymentPlan,
    isFeatured: true,
    imageCount: 3,
  },
  {
    name: "Megenagna Diaspora Site",
    slug: "megenagna-diaspora-site",
    location: "megenagna",
    status: "selling",
    category: "Residential apartments",
    summary: "Modern apartments for sale at the Diaspora site in Megenagna, one of eastern Addis Ababa's best-connected hubs.",
    unitTypes: ["Apartments"],
    paymentPlan: demoPaymentPlan,
    imageCount: 2,
  },
  {
    name: "Temer Legacy / Aware Site",
    slug: "aware-megenagna",
    location: "megenagna",
    status: "selling",
    category: "Residential apartments",
    summary: "Temer Legacy: studio, one-, two- and three-bedroom apartments at the Aware site in Megenagna, Addis Ababa. Run scripts/seed-temer-legacy.ts for its full details and listings.",
    unitTypes: ["Apartments"],
    imageCount: 2,
  },
  {
    name: "Haile Garment Apartments",
    slug: "haile-garment-apartments",
    location: "haile-garment",
    status: "selling",
    category: "Three-bedroom apartments",
    summary: "Spacious three-bedroom apartments of 139 m² at Haile Garment in south-western Addis Ababa.",
    unitTypes: ["3-bedroom apartments (139 m²)"],
    paymentPlan: demoPaymentPlan,
    isFeatured: true,
    imageCount: 2,
  },
  {
    name: "Ayat 49 Apartments",
    slug: "ayat-49",
    location: "ayat",
    status: "selling",
    category: "Three-bedroom apartments",
    summary: "Three-bedroom apartments for sale at Ayat 49 in eastern Addis Ababa.",
    unitTypes: ["3-bedroom apartments"],
    imageCount: 2,
  },
  {
    name: "Ajewa Bulgaria",
    slug: "ajewa-bulgaria",
    location: "bulgaria",
    status: "selling",
    category: "Apartments & shops",
    summary: "One-, two- and three-bedroom apartments and commercial shops in the Bulgaria area of Addis Ababa.",
    unitTypes: ["1-bedroom apartments", "2-bedroom apartments", "3-bedroom apartments", "Commercial shops"],
    imageCount: 2,
  },
  {
    name: "Piassa Empire",
    slug: "piassa-empire",
    location: "piassa",
    status: "selling",
    category: "Commercial shops",
    summary: "Commercial shop units at Piassa Empire, in the historic commercial heart of Addis Ababa.",
    unitTypes: ["Commercial shops"],
    imageCount: 2,
  },
  {
    name: "Gelan Shops",
    slug: "gelan-shops",
    location: "gelan",
    status: "selling",
    category: "Commercial shops",
    summary: "Commercial shop units for sale at the Gelan site, on the growing south-eastern edge of Addis Ababa.",
    unitTypes: ["Commercial shops"],
    imageCount: 1,
  },
  // Buildings from Temer's own marketing posters (name, area and floor configuration as printed on them).
  // Status is not stated on the posters: confirm with the sales team.
  {
    name: "Achante",
    slug: "achante-ayat",
    location: "ayat",
    status: "selling",
    category: "Residential apartments",
    summary: "Achante is a B+G+10 apartment building (basement, ground floor and 10 upper floors) by Temer Properties in Ayat.",
    unitTypes: ["Apartments"],
    imageCount: 1,
  },
  {
    name: "Feresbet",
    slug: "feresbet-ayat",
    location: "ayat",
    status: "selling",
    category: "Residential apartments",
    summary: "Feresbet is a 2B+G+16 apartment building (two basements, ground floor and 16 upper floors) by Temer Properties in Ayat.",
    unitTypes: ["Apartments"],
    imageCount: 1,
  },
  {
    name: "Ayat New Road",
    slug: "ayat-new-road",
    location: "ayat",
    status: "selling",
    category: "Residential apartments",
    summary: "A 3B+G+22 apartment tower (three basements, ground floor and 22 upper floors) by Temer Properties on the new road in Ayat.",
    unitTypes: ["Apartments"],
    imageCount: 1,
  },
  {
    name: "Ayat Two Center",
    slug: "ayat-two-center",
    location: "ayat",
    status: "selling",
    category: "Residential apartments",
    summary: "Two Center is a 3B+G+15 apartment building (three basements, ground floor and 15 upper floors) by Temer Properties in Ayat.",
    unitTypes: ["Apartments"],
    imageCount: 1,
  },
  {
    name: "Blue Point Zuhra",
    slug: "blue-point-zuhra-sarbet",
    location: "sarbet",
    status: "selling",
    category: "Residential apartments",
    summary: "Blue Point Zuhra is a B+G+21+T apartment tower (basement, ground floor, 21 upper floors and a terrace) by Temer Properties in Sarbet.",
    unitTypes: ["Apartments", "3-bedroom apartments"],
    imageCount: 1,
  },
  {
    name: "Lycee Burat",
    slug: "lycee-burat",
    status: "selling",
    category: "Residential apartments",
    summary: "Burat is a B+G+22 apartment tower (basement, ground floor and 22 upper floors) by Temer Properties at Lycee, Addis Ababa.",
    unitTypes: ["Apartments"],
    imageCount: 1,
  },
  {
    name: "Lycee Seken",
    slug: "lycee-seken",
    status: "selling",
    category: "Residential apartments",
    summary: "Seken is a B+G+19+T apartment tower (basement, ground floor, 19 upper floors and a terrace) by Temer Properties at Lycee, Addis Ababa.",
    unitTypes: ["Apartments"],
    imageCount: 1,
  },
  { name: "Maw", slug: "maw-ayat", location: "ayat", status: "delivered", category: null, summary: "A completed Temer Properties building at our Ayat site, handed over to its owners.", unitTypes: [], imageCount: 1 },
  { name: "2MA", slug: "2ma-lebu", location: "lebu", status: "delivered", category: null, summary: "A completed Temer Properties building in Lebu, handed over to its owners.", unitTypes: [], imageCount: 1 },
  { name: "Sahil", slug: "sahil-lebu", location: "lebu", status: "delivered", category: null, summary: "A completed Temer Properties building in Lebu, handed over to its owners.", unitTypes: [], imageCount: 1 },
  { name: "Mohammed", slug: "mohammed-lebu", location: "lebu", status: "delivered", category: null, summary: "A completed Temer Properties building in Lebu, handed over to its owners.", unitTypes: [], imageCount: 1 },
  {
    name: "AG Trading",
    slug: "ag-trading-atena-tera",
    location: "atena-tera",
    status: "delivered",
    category: null,
    summary: "A completed Temer Properties building in Atena Tera, Merkato.",
    unitTypes: [],
    imageCount: 1,
  },
];

type PropertySeed = {
  title: string;
  project: string;
  type: "apartment" | "villa" | "townhouse" | "shop" | "office";
  status?: "available" | "reserved" | "sold";
  bedrooms?: number;
  bathrooms?: number;
  areaSqm: number;
  floor: number;
  /** DEMO price in ETB (null = price on request) */
  price: number | null;
  promo?: string;
  isFeatured?: boolean;
  features: string[];
};

const aptFeatures = ["Open-plan living and dining area", "Separate kitchen", "Balcony", "Lift access", "Parking space", "Standby generator"];
const shopFeatures = ["Street-facing frontage", "Glass shopfront", "Own electricity meter", "Suitable for retail or services"];

/** DEMO listings: realistic shapes for testing the site; not real units or prices. */
export const propertySeeds: PropertySeed[] = [
  { title: "3-Bedroom Apartment at Sarbet City Plus", project: "sarbet-city-plus", type: "apartment", bedrooms: 3, bathrooms: 2, areaSqm: 165, floor: 6, price: 23_100_000, promo: "DEMO offer: 5% discount for full payment", isFeatured: true, features: [...aptFeatures, "Master bedroom with en-suite bathroom"] },
  { title: "2-Bedroom Apartment at Sarbet City Plus", project: "sarbet-city-plus", type: "apartment", bedrooms: 2, bathrooms: 2, areaSqm: 118, floor: 4, price: 16_500_000, features: aptFeatures },
  { title: "1-Bedroom Apartment at Sarbet City Plus", project: "sarbet-city-plus", type: "apartment", bedrooms: 1, bathrooms: 1, areaSqm: 72, floor: 3, price: 10_100_000, features: aptFeatures.slice(0, 5) },
  { title: "Ground-Floor Shop at Sarbet City Plus", project: "sarbet-city-plus", type: "shop", areaSqm: 45, floor: 0, price: 18_000_000, features: shopFeatures },
  { title: "2-Bedroom Corner Apartment at Sarbet City Plus", project: "sarbet-city-plus", type: "apartment", status: "sold", bedrooms: 2, bathrooms: 2, areaSqm: 121, floor: 7, price: 17_200_000, features: aptFeatures },
  { title: "3-Bedroom Apartment at Haile Garment, 139 m²", project: "haile-garment-apartments", type: "apartment", bedrooms: 3, bathrooms: 2, areaSqm: 139, floor: 5, price: 18_800_000, isFeatured: true, features: [...aptFeatures, "Master bedroom with en-suite bathroom"] },
  { title: "3-Bedroom Apartment at Haile Garment (2nd floor)", project: "haile-garment-apartments", type: "apartment", status: "reserved", bedrooms: 3, bathrooms: 2, areaSqm: 139, floor: 2, price: 18_200_000, features: aptFeatures },
  { title: "3-Bedroom Apartment at Ayat 49", project: "ayat-49", type: "apartment", bedrooms: 3, bathrooms: 2, areaSqm: 150, floor: 7, price: 19_500_000, isFeatured: true, features: aptFeatures },
  { title: "2-Bedroom Apartment at Megenagna Diaspora Site", project: "megenagna-diaspora-site", type: "apartment", bedrooms: 2, bathrooms: 2, areaSqm: 110, floor: 8, price: 17_600_000, features: aptFeatures },
  { title: "3-Bedroom Apartment at Aware, Megenagna", project: "aware-megenagna", type: "apartment", bedrooms: 3, bathrooms: 3, areaSqm: 160, floor: 9, price: null, features: [...aptFeatures, "Master bedroom with en-suite bathroom"] },
  { title: "2-Bedroom Apartment at Ajewa Bulgaria", project: "ajewa-bulgaria", type: "apartment", bedrooms: 2, bathrooms: 2, areaSqm: 105, floor: 5, price: 15_200_000, features: aptFeatures },
  { title: "Commercial Shop at Ajewa Bulgaria", project: "ajewa-bulgaria", type: "shop", areaSqm: 38, floor: 0, price: 14_400_000, features: shopFeatures },
  { title: "Commercial Shop at Piassa Empire", project: "piassa-empire", type: "shop", areaSqm: 32, floor: 1, price: 16_000_000, isFeatured: true, features: shopFeatures },
  { title: "Commercial Shop at Gelan", project: "gelan-shops", type: "shop", areaSqm: 40, floor: 0, price: 7_200_000, features: shopFeatures },
];

export const postSeeds = [
  {
    title: "How to Buy an Apartment in Addis Ababa: A Step-by-Step Guide",
    slug: "how-to-buy-an-apartment-in-addis-ababa",
    excerpt:
      "From setting a budget to receiving your keys: the steps, documents and questions that matter when you buy a new apartment from a developer in Addis Ababa.",
    content: `Buying a new apartment is one of the biggest financial decisions most families make. This guide walks through the process of buying directly from a developer in Addis Ababa, and the questions worth asking at each step.

## 1. Set your budget and how you will pay

Decide early whether you will pay in full or use a payment plan. Many developers offer a down payment followed by instalments linked to construction progress, and some give a discount for full payment. Knowing your monthly capacity narrows your search quickly.

## 2. Choose the area

Think about commute, schools, family and how you will use the property. Central areas such as [Piassa](/locations/piassa) and [Bulgaria](/locations/bulgaria) offer convenience; growing districts such as [Ayat](/locations/ayat) and [Haile Garment](/locations/haile-garment) usually offer more space for the money.

## 3. Compare projects and units

Compare floor area in square metres, floor level, orientation, finishing standard and the expected completion date, not just the headline price. [Browse current listings](/properties) to compare units side by side.

## 4. Visit the site

Always see the building, a finished sample unit and the surrounding street before you commit. [Book a free site visit](/book-a-visit), in person or by video call.

## 5. Check the documents

Ask the developer to explain the land and building documents for the project, the building permit and the sale agreement. We recommend having an independent lawyer review the contract before you sign.

## 6. Reserve and sign

Once you are ready, you reserve the unit with the agreed down payment and sign the sale agreement, which should state the price, payment schedule, specifications and handover date.

## 7. Handover

At completion you inspect the unit, settle any remaining balance and receive your keys, followed by the title transfer process.

*This guide is general information, not legal advice. Rules and procedures change: confirm the current requirements with the relevant authorities or a lawyer.*`,
  },
  {
    title: "Buying Property in Addis Ababa from Abroad: A Guide for the Diaspora",
    slug: "buying-property-in-addis-ababa-from-abroad",
    excerpt:
      "Living abroad and planning to buy a home in Addis Ababa? How video walkthroughs, powers of attorney and payments from overseas usually work.",
    content: `Many of our buyers are Ethiopians living abroad. Distance adds a few extra steps, but buying from abroad is common and straightforward when you plan ahead.

## See the property without travelling

Ask for a **live video walkthrough** rather than relying only on photos. A sales advisor can show you the unit, the view from the windows, the finishing and the street outside, and answer questions in real time. You can [book a video call visit](/book-a-visit) online.

## Who can buy

Ethiopian citizens can buy residential property. Foreign nationals of Ethiopian origin can apply for the Ethiopian Origin ID card (often called the Yellow Card), which grants many of the rights of citizens, including in relation to residential property. Check the current rules for your situation with the immigration authorities or a lawyer.

## Appointing someone in Ethiopia

Buyers abroad often authorise a trusted family member through a **power of attorney**. It typically needs to be prepared and authenticated through an Ethiopian embassy or consulate, or according to the procedures that apply where you live. Ask us which documents the representative will need to sign on your behalf.

## Paying from abroad

Payments are made by bank transfer to the developer's company account, never to an individual. Keep every receipt and make sure each payment is recorded against your sale agreement.

## Staying informed

Ask for regular progress updates (photos or short videos of construction) and keep in touch with a named sales advisor.

*This guide is general information, not legal advice.*`,
  },
  {
    title: "Understanding Payment Plans for New Apartments",
    slug: "understanding-apartment-payment-plans",
    excerpt:
      "Down payments, construction-linked instalments and full-payment discounts: how developer payment plans work and what to check before you sign.",
    content: `Payment plans let you buy a new apartment without paying the full price on day one. Here is how they usually work and what to look for.

## The common structure

1. **Down payment** when you reserve the unit.
2. **Instalments** during construction, often linked to milestones (for example, when the structure or the finishing is completed).
3. **Final payment** at or near handover.

Some developers offer a **discount for full payment**, which can be worth comparing against what you would pay in instalments.

## What to check in the agreement

- The total price and whether it is fixed.
- The amount and due date of every instalment.
- What happens if a payment is late, on either side.
- The finishing specifications included in the price.
- The expected handover date.

## Compare like with like

When comparing projects, compare the price per square metre, the finishing level and the payment terms together. A slightly higher price with a longer instalment period can suit some buyers better than a lower price that must be paid quickly.

Ask our sales team for the current payment plan of any unit you like, or [book a visit](/book-a-visit) to discuss your options.`,
  },
];

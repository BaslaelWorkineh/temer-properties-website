/**
 * Property types drive the /for-sale/[type] landing pages, filters, labels and
 * the schema.org type used in structured data. The `slug` is part of public
 * URLs: changing it later requires a redirect.
 */
export const PROPERTY_TYPES = ["apartment", "villa", "townhouse", "shop", "office"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_STATUSES = ["available", "reserved", "sold"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const PROJECT_STATUSES = ["pre_launch", "under_construction", "selling", "delivered"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

type TypeMeta = {
  label: string;
  plural: string;
  slug: string;
  /** schema.org type for the listed item (RealEstateListing.mainEntity). */
  schemaType: "Apartment" | "SingleFamilyResidence" | "House" | "Accommodation";
  residential: boolean;
  /** Unique intro copy for the /for-sale/[type] hub. Keep it specific and helpful. */
  intro: string;
};

export const propertyTypes: Record<PropertyType, TypeMeta> = {
  apartment: {
    label: "Apartment",
    plural: "Apartments",
    slug: "apartments",
    schemaType: "Apartment",
    residential: true,
    intro:
      "Browse new one-, two- and three-bedroom apartments for sale in Addis Ababa, offered by Temer Properties. Every listing shows the size in square metres, the floor, the project it belongs to and the payment options, so you can compare units across Sarbet, Megenagna, Ayat, Haile Garment and other neighbourhoods before you book a site visit.",
  },
  villa: {
    label: "Villa",
    plural: "Villas & Homes",
    slug: "villas",
    schemaType: "SingleFamilyResidence",
    residential: true,
    intro:
      "Find modern villas and family homes for sale in Addis Ababa. These standalone homes suit buyers who want private outdoor space, room for a growing family and long-term value in a quieter residential neighbourhood.",
  },
  townhouse: {
    label: "Townhouse",
    plural: "Townhouses",
    slug: "townhouses",
    schemaType: "House",
    residential: true,
    intro:
      "Townhouses combine the space of a home with the security and shared upkeep of a managed compound. Explore townhouses for sale in Addis Ababa and compare layouts, sizes and payment plans.",
  },
  shop: {
    label: "Commercial Shop",
    plural: "Commercial Shops",
    slug: "shops",
    schemaType: "Accommodation",
    residential: false,
    intro:
      "Invest in commercial shop units for sale in busy Addis Ababa locations such as Piassa, Sarbet and Bulgaria, plus Gelan on the city's southern edge. Shops in mixed-use buildings benefit from residents above and steady street traffic, making them a popular choice for owner-operators and investors.",
  },
  office: {
    label: "Office",
    plural: "Offices",
    slug: "offices",
    schemaType: "Accommodation",
    residential: false,
    intro:
      "Office space for sale in Addis Ababa for companies that want to own their premises instead of renting. Compare floor areas, locations and access before booking a viewing.",
  },
};

export function typeFromSlug(slug: string): PropertyType | undefined {
  return PROPERTY_TYPES.find((t) => propertyTypes[t].slug === slug);
}

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  pre_launch: "Pre-launch",
  under_construction: "In progress",
  selling: "For sale",
  delivered: "Delivered",
};

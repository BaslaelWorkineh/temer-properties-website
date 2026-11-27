import type { FaqItem, ImageItem } from "@/db/schema";
import { absoluteUrl, site, siteUrl } from "@/lib/config/site";
import { propertyTypes, type PropertyStatus, type PropertyType } from "@/lib/config/property-types";
import { formatFloor } from "@/lib/format";
import { locales } from "@/lib/i18n/config";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/metadata";

/**
 * schema.org builders. Entities reference each other by @id, so Google can
 * connect every listing to the same RealEstateAgent (the business entity that
 * also appears in the Knowledge Panel / Google Business Profile).
 */
export type JsonLdObject = { [key: string]: unknown };

export const ORG_ID = `${siteUrl}/#organization`;
export const WEBSITE_ID = `${siteUrl}/#website`;

const imageUrls = (images: Array<ImageItem | null | undefined>) =>
  images.filter((i): i is ImageItem => Boolean(i?.url)).map((i) => absoluteUrl(i.url));

function postalAddress(locality?: string | null, street?: string | null): JsonLdObject {
  const city = locality || "Addis Ababa";
  return {
    "@type": "PostalAddress",
    ...(street ? { streetAddress: street } : {}),
    addressLocality: city,
    // Addis Ababa is a chartered city (its own region); other towns (e.g. Gelan) are in Oromia.
    ...(city === "Addis Ababa" ? { addressRegion: "Addis Ababa" } : {}),
    addressCountry: "ET",
  };
}

function geo(lat?: number | null, lng?: number | null) {
  return lat != null && lng != null ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng } } : {};
}

export function organizationJsonLd(): JsonLdObject {
  const a = site.address;
  return {
    "@type": "RealEstateAgent",
    "@id": ORG_ID,
    name: site.name,
    alternateName: site.alternateNames,
    description: site.description,
    url: siteUrl,
    logo: { "@type": "ImageObject", url: absoluteUrl("/images/logo.png"), width: 512, height: 512 },
    image: absoluteUrl(DEFAULT_OG_IMAGE.url),
    telephone: site.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: a.locality,
      addressRegion: a.region,
      addressCountry: a.country,
      ...(a.postalCode ? { postalCode: a.postalCode } : {}),
    },
    ...geo(a.latitude, a.longitude),
    hasMap: a.mapUrl,
    openingHoursSpecification: site.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: { "@type": "City", name: "Addis Ababa", sameAs: "https://en.wikipedia.org/wiki/Addis_Ababa" },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: site.contact.phone,
        contactType: "sales",
        areaServed: "ET",
        availableLanguage: ["English", "Amharic"],
      },
    ],
    sameAs: [...Object.values(site.social), ...site.profiles],
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteUrl,
    name: site.name,
    alternateName: site.alternateNames,
    description: site.description,
    inLanguage: [...locales],
    publisher: { "@id": ORG_ID },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLdObject {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function faqJsonLd(faqs: FaqItem[]): JsonLdObject | null {
  if (!faqs.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function itemListJsonLd(items: Array<{ path: string; name: string }>, name?: string): JsonLdObject | null {
  if (!items.length) return null;
  return {
    "@type": "ItemList",
    ...(name ? { name } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(item.path),
      name: item.name,
    })),
  };
}

const availabilityByStatus: Record<PropertyStatus, string> = {
  available: "https://schema.org/InStock",
  reserved: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
};

export function propertyListingJsonLd(p: {
  slug: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  floor: number | null;
  features: string[];
  images: ImageItem[];
  createdAt: Date;
  updatedAt: Date;
  location: { name: string; city: string; latitude: number | null; longitude: number | null } | null;
  project: { name: string; slug: string; latitude: number | null; longitude: number | null; address: string | null } | null;
}): JsonLdObject {
  const meta = propertyTypes[p.type];
  const url = absoluteUrl(`/properties/${p.slug}`);
  const lat = p.project?.latitude ?? p.location?.latitude;
  const lng = p.project?.longitude ?? p.location?.longitude;
  const street = [p.project?.address, p.location?.name].filter(Boolean).join(", ");

  const item: JsonLdObject = {
    "@type": meta.schemaType,
    "@id": `${url}#property`,
    name: p.title,
    ...(meta.residential && p.bedrooms != null ? { numberOfBedrooms: p.bedrooms } : {}),
    ...(p.bathrooms != null ? { numberOfBathroomsTotal: p.bathrooms } : {}),
    ...(p.areaSqm ? { floorSize: { "@type": "QuantitativeValue", value: p.areaSqm, unitCode: "MTK", unitText: "m²" } } : {}),
    ...(p.floor != null ? { floorLevel: formatFloor(p.floor) } : {}),
    ...(p.features.length
      ? { amenityFeature: p.features.map((f) => ({ "@type": "LocationFeatureSpecification", name: f, value: true })) }
      : {}),
    address: postalAddress(p.location?.city, street || null),
    ...geo(lat, lng),
    ...(p.project
      ? { containedInPlace: { "@type": "Place", name: p.project.name, url: absoluteUrl(`/projects/${p.project.slug}`) } }
      : {}),
    image: imageUrls(p.images),
  };

  return {
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    url,
    name: p.title,
    description: p.description,
    image: imageUrls(p.images),
    datePosted: p.createdAt.toISOString(),
    dateModified: p.updatedAt.toISOString(),
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    mainEntity: item,
    offers: {
      "@type": "Offer",
      url,
      businessFunction: "http://purl.org/goodrelations/v1#Sell",
      availability: availabilityByStatus[p.status],
      ...(p.price ? { price: p.price, priceCurrency: site.currency } : {}),
      seller: { "@id": ORG_ID },
      itemOffered: { "@id": `${url}#property` },
    },
  };
}

export function projectJsonLd(p: {
  slug: string;
  name: string;
  description: string;
  residential: boolean;
  totalUnits: number | null;
  amenities: string[];
  images: ImageItem[];
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  location: { name: string; city: string; latitude: number | null; longitude: number | null } | null;
}): JsonLdObject {
  const url = absoluteUrl(`/projects/${p.slug}`);
  return {
    "@type": p.residential ? "ApartmentComplex" : "Place",
    "@id": `${url}#project`,
    name: p.name,
    description: p.description,
    url,
    image: imageUrls(p.images),
    address: postalAddress(p.location?.city, [p.address, p.location?.name].filter(Boolean).join(", ") || null),
    ...geo(p.latitude ?? p.location?.latitude, p.longitude ?? p.location?.longitude),
    ...(p.residential && p.totalUnits ? { numberOfAccommodationUnits: { "@type": "QuantitativeValue", value: p.totalUnits } } : {}),
    ...(p.residential ? { tourBookingPage: absoluteUrl(`/book-a-visit?project=${p.slug}`) } : {}),
    ...(p.amenities.length
      ? { amenityFeature: p.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a, value: true })) }
      : {}),
    containedInPlace: { "@type": "City", name: "Addis Ababa" },
  };
}

export function articleJsonLd(p: {
  slug: string;
  title: string;
  description: string;
  image: ImageItem | null;
  publishedAt: Date | null;
  updatedAt: Date;
}): JsonLdObject {
  const url = absoluteUrl(`/blog/${p.slug}`);
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: p.title,
    description: p.description,
    url,
    mainEntityOfPage: url,
    image: p.image ? [absoluteUrl(p.image.url)] : [absoluteUrl(DEFAULT_OG_IMAGE.url)],
    datePublished: (p.publishedAt ?? p.updatedAt).toISOString(),
    dateModified: p.updatedAt.toISOString(),
    inLanguage: "en",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

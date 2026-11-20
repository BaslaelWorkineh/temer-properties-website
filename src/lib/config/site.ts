/**
 * Single source of truth for brand, contact (NAP) and social details.
 *
 * NAP (Name, Address, Phone) must be identical everywhere: this site, Google
 * Business Profile, Facebook, directories. The two legacy sites publish
 * DIFFERENT phone numbers, emails and offices — confirm the values below with
 * the business before launch. See README "Before launch".
 */

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");

if (!rawSiteUrl && process.env.NODE_ENV === "production") {
  // A wrong canonical domain silently wrecks SEO, so fail loudly.
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is not set. Set it to the canonical production origin, e.g. https://temerproperties.com",
  );
}

export const siteUrl = rawSiteUrl || "http://localhost:3000";

export const site = {
  name: "Temer Properties",
  legalName: "Eyerus Temer Properties",
  alternateNames: ["Temer Real Estate", "Temer Properties Addis Ababa"],
  tagline: "Apartments, homes & shops for sale in Addis Ababa",
  description:
    "Licensed real estate developer in Addis Ababa. Buy apartments, modern homes and commercial shops with flexible payment plans, and book a site visit online.",
  /** Founded in 2010 E.C. (Ethiopian calendar) per the company's own copy. Confirm before using in structured data. */
  foundedEthiopianCalendar: "2010 E.C.",
  locale: "en_US",
  language: "en",
  country: "ET",
  currency: "ETB",
  timeZone: "Africa/Addis_Ababa",
  themeColor: "#3a7d44",

  contact: {
    /** Primary number, used in structured data. E.164 format. */
    phone: "+251904192923",
    phoneDisplay: "0904 192 923",
    /** Secondary sales line from temerpropertiessales.com. Remove if not official. */
    salesPhone: "+251913455624",
    salesPhoneDisplay: "0913 455 624",
    email: "info@temerpropertiesapartment.com",
    whatsapp: "251904192923",
    telegram: "https://t.me/+251904192923",
  },

  address: {
    street: "Woldemaryam Building, Sarbet to Kera Road",
    locality: "Addis Ababa",
    region: "Addis Ababa",
    postalCode: "",
    country: "ET",
    /** Fill from Google Maps (right-click the office pin). Left empty rather than guessed. */
    latitude: null as number | null,
    longitude: null as number | null,
    mapUrl: "https://maps.google.com/?q=Woldemaryam+Building+Sarbet+Addis+Ababa",
  },

  /** Monday–Saturday 6:00 AM – 8:00 PM (from the current website). */
  openingHours: [
    {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const,
      opens: "06:00",
      closes: "20:00",
    },
  ],
  openingHoursText: "Monday – Saturday, 6:00 AM – 8:00 PM",

  social: {
    facebook: "https://www.facebook.com/temerproperties",
    instagram: "https://www.instagram.com/temerproperties",
    tiktok: "https://www.tiktok.com/@temer_properties",
    youtube: "https://www.youtube.com/@TemerProperties",
    x: "https://x.com/TemerProperties",
  },

  /** Company claims from the current website. Keep only what can be backed up. */
  stats: [
    { value: "10,000+", label: "Happy customers" },
    { value: "10+", label: "Major projects completed" },
    { value: "400+", label: "Units delivered" },
  ],
} as const;

export type SiteConfig = typeof site;

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/projects", label: "Projects" },
  { href: "/locations", label: "Locations" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Buying guides" },
  { href: "/contact", label: "Contact" },
] as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

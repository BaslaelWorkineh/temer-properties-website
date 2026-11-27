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
    "NEXT_PUBLIC_SITE_URL is not set. Set it to the canonical production origin, https://www.temerpropertiesethiopia.com",
  );
}

export const siteUrl = rawSiteUrl || "http://localhost:3000";

export const site = {
  name: "Temer Properties",
  /** The one-word name people search for. Short title suffix when the full name doesn't fit (see buildMetadata). */
  shortName: "Temer",
  /**
   * Other names people search for, most common first (structured data alternateName). The YouTube and X
   * accounts are called "Temer Real Estate", and Amharic listing sites write ቴምር ሪል እስቴት.
   */
  alternateNames: ["Temer", "Temer Real Estate", "Temer Properties Addis Ababa", "ቴምር ፕሮፐርቲስ", "ቴምር ሪል እስቴት"],
  tagline: "Apartments, homes & shops for sale in Addis Ababa",
  description:
    "Apartments, modern homes and commercial shops for sale in Addis Ababa, with clear prices, flexible payment plans and online site-visit booking.",
  /** Founded in 2010 E.C. (Ethiopian calendar) per the company's own copy. Confirm before using in structured data. */
  foundedEthiopianCalendar: "2010 E.C.",
  locale: "en_US",
  language: "en",
  country: "ET",
  currency: "ETB",
  timeZone: "Africa/Addis_Ababa",
  themeColor: "#3a7d44",

  contact: {
    /** The sales number (calls and WhatsApp), used in structured data. E.164 format. */
    phone: "+251911986550",
    phoneDisplay: "0911 986 550",
    whatsapp: "251911986550",
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

  /**
   * Directory and partner pages about THIS business (structured data sameAs). Left empty on purpose: several unrelated
   * sales businesses share the "Temer Properties" name, and a page that belongs to another seller must not be listed
   * here or Google will merge the two identities. Add a URL only after confirming it is this business's own page.
   * Candidates found while researching, NOT yet confirmed as ours:
   *   https://www.2merkato.com/directory/41080-temer-real-estate-s
   *   https://www.betoch.com/developers/temer-properties
   *   https://www.goafricaonline.com/et/1197540-temer-properties-agences-immobilieres-addis-abeba-ethiopia
   *   https://ethiopiapropertycentre.com/agents/temer-realestate-1009
   *   https://shebamiles.ethiopianairlines.com/partners/real-estate-partners/TEMER-PROPERTIES
   */
  profiles: [] as readonly string[],

  /**
   * Track-record numbers. Empty on purpose: "10,000+ customers, 10+ projects, 400+ units delivered" are claims of the
   * Temer developer, not of this sales business. Add figures here only if they can be backed up for this business;
   * the home and About pages then show them again.
   */
  stats: [] as ReadonlyArray<{ value: string; label: string }>,
} as const;

export type SiteConfig = typeof site;

export const mainNav = [
  { href: "/", label: "Home", key: "home" },
  { href: "/properties", label: "Properties", key: "properties" },
  { href: "/projects", label: "Projects", key: "projects" },
  { href: "/locations", label: "Locations", key: "locations" },
  { href: "/about", label: "About", key: "about" },
  { href: "/blog", label: "Buying guides", key: "guides" },
  { href: "/contact", label: "Contact", key: "contact" },
] as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

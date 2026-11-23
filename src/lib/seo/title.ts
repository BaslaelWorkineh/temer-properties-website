import { site } from "@/lib/config/site";

/** Google shows about 60 characters of a title. */
const MAX_TITLE_LENGTH = 65;
const brandInTitle = new RegExp(`\\b${site.shortName}\\b`, "i");

/**
 * Keeps the brand in as many titles as possible, so searches for "Temer" match every page: the full name when it
 * fits, else the short name people search for, else nothing (the page's own words come first). A title that
 * already names the brand ("Contact Temer Properties") is used as is. Shared by buildMetadata and the admin
 * search preview.
 */
export function brandedTitle(title: string): string {
  if (brandInTitle.test(title)) return title;
  for (const brand of [site.name, site.shortName]) {
    const branded = `${title} | ${brand}`;
    if (branded.length <= MAX_TITLE_LENGTH) return branded;
  }
  return title;
}

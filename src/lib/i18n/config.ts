/**
 * Languages. English is the default and keeps its URLs unprefixed (/properties); Amharic lives under /am
 * (/am/properties). The proxy rewrites unprefixed URLs to /en/... internally, so the `[lang]` route segment
 * always has a value without changing any English URL.
 */
export const locales = ["en", "am"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Prefix an internal path with the language ("/properties" -> "/am/properties"); English stays unprefixed. */
export function localePath(lang: Locale, path: string): string {
  if (lang === defaultLocale) return path;
  if (path === "/") return `/${lang}`;
  return `/${lang}${path}`;
}

/** Remove a leading language segment ("/am/properties" -> "/properties"). */
export function stripLocale(pathname: string): string {
  for (const l of locales) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

/** Open Graph locale codes. */
export const ogLocale: Record<Locale, string> = { en: "en_US", am: "am_ET" };

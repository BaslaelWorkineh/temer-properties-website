import type { MetadataRoute } from "next";
import { PROPERTY_TYPES, propertyTypes } from "@/lib/config/property-types";
import { absoluteUrl } from "@/lib/config/site";
import { getLocations, isLocationIndexable } from "@/lib/data/locations";
import { getPublishedPosts } from "@/lib/data/posts";
import { getProjects } from "@/lib/data/projects";
import { getPropertySitemapEntries, getTypeCounts, getTypeLocationCombos } from "@/lib/data/properties";
import { localePath } from "@/lib/i18n/config";

/**
 * XML sitemap generated from the database. Lists only indexable URLs (no sold
 * units, no empty hubs), with real lastModified dates and image entries.
 * Rebuilt automatically when admins change content (same cache tags as the pages).
 *
 * Pages that exist in both languages are listed once per language, each with hreflang alternates for both.
 * Detail pages (a property, a project, an area, a guide) stay English-only here: their text comes from the
 * database, and their /am versions point their canonical at the English page.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, projects, locations, posts, typeCounts, combos] = await Promise.all([
    getPropertySitemapEntries(),
    getProjects(),
    getLocations(),
    getPublishedPosts(),
    getTypeCounts(),
    getTypeLocationCombos(),
  ]);

  const onMarket = properties.filter((p) => p.status !== "sold");
  const latest = (dates: Date[]) => (dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined);
  const contentUpdated = latest([...onMarket.map((p) => p.updatedAt), ...projects.map((p) => p.updatedAt)]);

  /** One entry per language, each listing both as alternates. */
  const bilingual = (path: string, lastModified?: Date): MetadataRoute.Sitemap => {
    const languages = { en: absoluteUrl(localePath("en", path)), am: absoluteUrl(localePath("am", path)) };
    return [
      { url: languages.en, lastModified, alternates: { languages } },
      { url: languages.am, lastModified, alternates: { languages } },
    ];
  };

  /** A detail page is listed in Amharic too once its record has a complete Amharic translation. */
  const detail = (path: string, translated: boolean, lastModified: Date, images?: string[]): MetadataRoute.Sitemap => {
    const extra = images?.length ? { images } : {};
    if (!translated) return [{ url: absoluteUrl(path), lastModified, ...extra }];
    const languages = { en: absoluteUrl(localePath("en", path)), am: absoluteUrl(localePath("am", path)) };
    return [
      { url: languages.en, lastModified, alternates: { languages }, ...extra },
      { url: languages.am, lastModified, alternates: { languages }, ...extra },
    ];
  };

  const staticPages: MetadataRoute.Sitemap = [
    ...bilingual("/", contentUpdated),
    ...bilingual("/properties", latest(onMarket.map((p) => p.updatedAt))),
    ...bilingual("/projects", latest(projects.map((p) => p.updatedAt))),
    ...bilingual("/locations", latest(locations.map((l) => l.updatedAt))),
    ...bilingual("/book-a-visit"),
    ...bilingual("/about"),
    ...bilingual("/contact"),
    ...bilingual("/faq"),
    ...(posts.length ? [{ url: absoluteUrl("/blog"), lastModified: latest(posts.map((p) => p.updatedAt)) }] : []),
    ...bilingual("/privacy-policy"),
    ...bilingual("/terms"),
  ];

  return [
    ...staticPages,
    ...PROPERTY_TYPES.filter((t) => typeCounts[t] > 0).flatMap((t) => bilingual(`/for-sale/${propertyTypes[t].slug}`, contentUpdated)),
    ...combos.flatMap((c) => bilingual(`/for-sale/${propertyTypes[c.type].slug}/${c.locationSlug}`, c.updatedAt)),
    ...locations
      .filter(isLocationIndexable)
      .flatMap((l) => detail(`/locations/${l.slug}`, l.translated, l.updatedAt, l.image ? [absoluteUrl(l.image.url)] : undefined)),
    ...projects.flatMap((p) =>
      detail(`/projects/${p.slug}`, p.translated, p.updatedAt, p.images.slice(0, 10).map((i) => absoluteUrl(i.url))),
    ),
    ...onMarket.flatMap((p) =>
      detail(`/properties/${p.slug}`, p.translated, p.updatedAt, p.images.slice(0, 10).map((i) => absoluteUrl(i.url))),
    ),
    ...posts.flatMap((p) => detail(`/blog/${p.slug}`, p.translated, p.updatedAt, p.coverImage ? [absoluteUrl(p.coverImage.url)] : undefined)),
  ];
}

import type { MetadataRoute } from "next";
import { PROPERTY_TYPES, propertyTypes } from "@/lib/config/property-types";
import { absoluteUrl } from "@/lib/config/site";
import { getLocations, isLocationIndexable } from "@/lib/data/locations";
import { getPublishedPosts } from "@/lib/data/posts";
import { getProjects } from "@/lib/data/projects";
import { getPropertySitemapEntries, getTypeCounts, getTypeLocationCombos } from "@/lib/data/properties";

/**
 * XML sitemap generated from the database. Lists only indexable URLs (no sold
 * units, no empty hubs), with real lastModified dates and image entries.
 * Rebuilt automatically when admins change content (same cache tags as the pages).
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

  const staticPages: MetadataRoute.Sitemap = [
    // The home page exists in English and Amharic; each URL lists the other as its alternate (hreflang).
    { url: absoluteUrl("/"), lastModified: contentUpdated, alternates: { languages: { en: absoluteUrl("/"), am: absoluteUrl("/am") } } },
    { url: absoluteUrl("/am"), lastModified: contentUpdated, alternates: { languages: { en: absoluteUrl("/"), am: absoluteUrl("/am") } } },
    { url: absoluteUrl("/properties"), lastModified: latest(onMarket.map((p) => p.updatedAt)) },
    { url: absoluteUrl("/projects"), lastModified: latest(projects.map((p) => p.updatedAt)) },
    { url: absoluteUrl("/locations"), lastModified: latest(locations.map((l) => l.updatedAt)) },
    { url: absoluteUrl("/book-a-visit") },
    { url: absoluteUrl("/about") },
    { url: absoluteUrl("/contact") },
    { url: absoluteUrl("/faq") },
    ...(posts.length ? [{ url: absoluteUrl("/blog"), lastModified: latest(posts.map((p) => p.updatedAt)) }] : []),
    { url: absoluteUrl("/privacy-policy") },
    { url: absoluteUrl("/terms") },
  ];

  return [
    ...staticPages,
    ...PROPERTY_TYPES.filter((t) => typeCounts[t] > 0).map((t) => ({
      url: absoluteUrl(`/for-sale/${propertyTypes[t].slug}`),
      lastModified: contentUpdated,
    })),
    ...combos.map((c) => ({
      url: absoluteUrl(`/for-sale/${propertyTypes[c.type].slug}/${c.locationSlug}`),
      lastModified: c.updatedAt,
    })),
    ...locations.filter(isLocationIndexable).map((l) => ({
      url: absoluteUrl(`/locations/${l.slug}`),
      lastModified: l.updatedAt,
      ...(l.image ? { images: [absoluteUrl(l.image.url)] } : {}),
    })),
    ...projects.map((p) => ({
      url: absoluteUrl(`/projects/${p.slug}`),
      lastModified: p.updatedAt,
      ...(p.images.length ? { images: p.images.slice(0, 10).map((i) => absoluteUrl(i.url)) } : {}),
    })),
    ...onMarket.map((p) => ({
      url: absoluteUrl(`/properties/${p.slug}`),
      lastModified: p.updatedAt,
      ...(p.images.length ? { images: p.images.slice(0, 10).map((i) => absoluteUrl(i.url)) } : {}),
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: p.updatedAt,
      ...(p.coverImage ? { images: [absoluteUrl(p.coverImage.url)] } : {}),
    })),
  ];
}

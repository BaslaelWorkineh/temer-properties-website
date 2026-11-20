/**
 * Cache tags for public, prerendered content. Every cached read tags itself
 * with each table it reads, so one admin mutation refreshes every page that
 * shows that data (listing pages, hubs, sitemap, …).
 */
export const TAGS = {
  properties: "properties",
  projects: "projects",
  locations: "locations",
  posts: "posts",
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];

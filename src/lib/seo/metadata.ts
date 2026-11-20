import type { Metadata } from "next";
import type { ImageItem } from "@/db/schema";
import { site } from "@/lib/config/site";
import { truncate } from "@/lib/utils";

/** Branded fallback share image (1200×630) for pages without their own photo. */
export const DEFAULT_OG_IMAGE = {
  url: "/images/og-default.jpg",
  width: 1200,
  height: 630,
  alt: "Temer Properties: apartments, homes and shops for sale in Addis Ababa",
};

type BuildMetadataInput = {
  /** Page title without the brand suffix (the root layout template appends " | Temer Properties"). */
  title: string;
  /** Use the title exactly as given (home page). */
  absoluteTitle?: boolean;
  description: string;
  /** Canonical path, e.g. "/properties/3-bedroom-apartment-sarbet". Resolved against metadataBase. */
  path: string;
  images?: Array<ImageItem | null | undefined>;
  type?: "website" | "article";
  /** noindex,follow: the page stays usable and its links are crawled, but it is kept out of search results. */
  noindex?: boolean;
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
};

/**
 * Every public page builds its metadata here, so each one gets a unique
 * title/description, a self-referencing canonical, Open Graph + Twitter cards
 * and consistent robots handling.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const description = truncate(input.description, 160);
  // Google shows ~60 characters: drop the brand suffix rather than lose the page's own words.
  const branded = `${input.title} | ${site.name}`;
  const absolute = input.absoluteTitle || branded.length > 65;
  const fullTitle = absolute ? input.title : branded;
  const images = (input.images ?? [])
    .filter((img): img is ImageItem => Boolean(img?.url))
    .slice(0, 4)
    .map((img) => ({ url: img.url, width: img.width, height: img.height, alt: img.alt || input.title }));
  const ogImages = images.length ? images : [DEFAULT_OG_IMAGE];

  return {
    title: absolute ? { absolute: input.title } : input.title,
    description,
    alternates: { canonical: input.path },
    openGraph: {
      type: input.type ?? "website",
      url: input.path,
      siteName: site.name,
      locale: site.locale,
      title: fullTitle,
      description,
      images: ogImages,
      ...(input.type === "article"
        ? {
            publishedTime: input.publishedTime?.toISOString(),
            modifiedTime: input.modifiedTime?.toISOString(),
            authors: [site.name],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ogImages.map((img) => ({ url: img.url, alt: img.alt })),
    },
    ...(input.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

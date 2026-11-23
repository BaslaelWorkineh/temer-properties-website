import type { Metadata } from "next";
import type { ImageItem } from "@/db/schema";
import { site } from "@/lib/config/site";
import { localePath, ogLocale, type Locale } from "@/lib/i18n/config";
import { brandedTitle } from "@/lib/seo/title";
import { truncate } from "@/lib/utils";

/** Branded fallback share image (1200×630) for pages without their own photo. */
export const DEFAULT_OG_IMAGE = {
  url: "/images/og-default.jpg",
  width: 1200,
  height: 630,
  alt: "Temer Properties: apartments, homes and shops for sale in Addis Ababa",
};

type BuildMetadataInput = {
  /** Page title without the brand suffix: buildMetadata adds " | Temer Properties" or " | Temer" when it fits. */
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
  /**
   * Set only on pages that exist in this language. They get a self-referencing canonical and hreflang links to
   * every translation. Without it the page is treated as the English original: an untranslated /am/... page then
   * points its canonical at the English URL, so it never competes with it in search.
   */
  lang?: Locale;
  /** Languages this page is available in (default: English only). */
  translations?: readonly Locale[];
};

/**
 * Every public page builds its metadata here, so each one gets a unique
 * title/description, a self-referencing canonical, Open Graph + Twitter cards
 * and consistent robots handling.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const description = truncate(input.description, 160);
  const fullTitle = input.absoluteTitle ? input.title : brandedTitle(input.title);
  const images = (input.images ?? [])
    .filter((img): img is ImageItem => Boolean(img?.url))
    .slice(0, 4)
    .map((img) => ({ url: img.url, width: img.width, height: img.height, alt: img.alt || input.title }));
  const ogImages = images.length ? images : [DEFAULT_OG_IMAGE];

  const lang = input.lang ?? "en";
  const canonical = localePath(lang, input.path);
  const translations = input.translations ?? [];
  const languages =
    translations.length > 1
      ? {
          ...Object.fromEntries(translations.map((l) => [l, localePath(l, input.path)])),
          "x-default": localePath("en", input.path),
        }
      : undefined;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical, ...(languages ? { languages } : {}) },
    openGraph: {
      type: input.type ?? "website",
      url: canonical,
      siteName: site.name,
      locale: ogLocale[lang],
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

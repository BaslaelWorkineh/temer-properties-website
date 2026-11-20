import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config/site";

/**
 * Crawl everything public, including /_next/ (CSS/JS needed to render) and
 * /media/ (listing photos for Google Images). The old sales site blocked
 * /_next/static and /_next/image, which stops Google rendering its pages.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_NOINDEX === "true") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

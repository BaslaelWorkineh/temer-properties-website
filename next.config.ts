import type { NextConfig } from "next";
import { legacyRedirects } from "./src/lib/config/legacy-redirects";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Prerendering reads the database (Neon). Fewer workers and pages in parallel keep the build from opening dozens of
  // connections at once (which timed out against a waking Neon database); failed pages are retried.
  experimental: {
    staticGenerationRetryCount: 3,
    staticGenerationMaxConcurrency: 4,
    staticGenerationMinPagesPerWorker: 60,
  },
  partialPrefetching: true,
  poweredByHeader: false,
  // Loaded from node_modules at runtime instead of being bundled (pg has optional native bindings).
  serverExternalPackages: ["pg", "sharp"],
  images: {
    formats: ["image/avif", "image/webp"],
    // 75 for everything; 90 only for the full-screen home hero, where compression blur shows most.
    qualities: [75, 90],
    // Uploaded media get random, never-reused file names, so optimized variants can be cached for a long time.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    localPatterns: [
      { pathname: "/media/**", search: "" },
      { pathname: "/images/**", search: "" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return legacyRedirects;
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Private areas must never be indexed (robots.txt alone does not prevent indexing).
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      // Filtered /properties views are consolidated with rel=canonical (-> /properties) rather than
      // noindex: Google advises against combining noindex with a canonical that points elsewhere.
      // Uploaded media never change once written.
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, s-maxage=31536000, immutable" }] },
    ];
  },
};

export default nextConfig;

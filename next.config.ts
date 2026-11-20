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
  partialPrefetching: true,
  poweredByHeader: false,
  // Native libSQL bindings must not be bundled.
  serverExternalPackages: ["@libsql/client", "libsql", "sharp"],
  images: {
    formats: ["image/avif", "image/webp"],
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
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default nextConfig;

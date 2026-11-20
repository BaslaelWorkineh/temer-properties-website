import type { Metadata } from "next";

// The admin area must never be indexed. next.config.ts also sends
// `X-Robots-Tag: noindex, nofollow` and robots.txt disallows /admin.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin | Temer Properties" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

// Authenticated, per-request pages: prefetching them would only cost a server
// render per sidebar link (and runtime prefetches of session-gated segments
// stay open). Admin pages load on click instead, behind loading.tsx.
export const prefetch = "force-disabled";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh flex-1 flex-col bg-soft">{children}</div>;
}

import type { Metadata } from "next";
import { ContactBar } from "@/components/site/contact-bar";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { NotFoundContent } from "@/components/site/not-found-content";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** Unmatched URLs: rendered inside the root layout only, so it brings the site chrome itself. */
export default function GlobalNotFound() {
  return (
    <>
      <Header lang="en" />
      <main id="main" className="flex-1">
        <NotFoundContent />
      </main>
      <Footer lang="en" />
      <ContactBar />
    </>
  );
}

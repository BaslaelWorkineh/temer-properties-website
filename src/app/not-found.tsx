import type { Metadata } from "next";
import { ContactBar } from "@/components/site/contact-bar";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { NotFoundContent } from "@/components/site/not-found-content";
import { NotFoundSwitch } from "@/components/site/not-found-switch";
import type { Locale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

function Page({ lang }: { lang: Locale }) {
  return (
    <div lang={lang} className="contents">
      <Header lang={lang} />
      <main id="main" className="flex-1">
        <NotFoundContent />
      </main>
      <Footer lang={lang} />
      <ContactBar lang={lang} />
    </div>
  );
}

/** Unmatched URLs: rendered inside the root layout only, so it brings the site chrome itself (in English or Amharic). */
export default function GlobalNotFound() {
  return <NotFoundSwitch en={<Page lang="en" />} am={<Page lang="am" />} />;
}

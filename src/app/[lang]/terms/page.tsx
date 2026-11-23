import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Container } from "@/components/site/section";
import { site } from "@/lib/config/site";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getPagesDict } from "@/lib/i18n/dict/pages";
import { buildMetadata } from "@/lib/seo/metadata";

export const ensureStatic = "navigation";

export async function generateMetadata({ params }: PageProps<"/[lang]/terms">): Promise<Metadata> {
  const { lang } = await params;
  const l: Locale = hasLocale(lang) ? lang : "en";
  const pages = getPagesDict(l);
  return buildMetadata({
    title: pages.terms.metaTitle,
    description: pages.terms.metaDescription(l === "en" ? site.name : pages.brand),
    path: "/terms",
    lang: l,
    translations: locales,
  });
}

// Template text: have it reviewed by the company's legal adviser before launch (the Amharic too).
export default async function TermsPage({ params }: PageProps<"/[lang]/terms">) {
  const { lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const dict = getPagesDict(lang).terms;

  return (
    <Container className="max-w-3xl py-10">
      <Breadcrumbs items={[{ name: dict.breadcrumb, path: "/terms" }]} lang={lang} />
      <article className="prose-content mt-8">
        <h1 className="text-4xl font-bold">{dict.h1}</h1>
        <h2>{dict.listingTitle}</h2>
        <p>{dict.listing}</p>
        <h2>{dict.pricesTitle}</h2>
        <p>{dict.prices}</p>
        <h2>{dict.bookingsTitle}</h2>
        <p>{dict.bookings}</p>
        <h2>{dict.contactTitle}</h2>
        <p>
          {dict.contact.pre}
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          {dict.contact.post}
        </p>
      </article>
    </Container>
  );
}

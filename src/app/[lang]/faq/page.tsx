import type { Metadata } from "next";
import Link from "@/components/site/link";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { FaqList } from "@/components/site/faq-list";
import { JsonLd } from "@/components/site/json-ld";
import { Container, PageHero } from "@/components/site/section";
import { getGeneralFaqs } from "@/lib/content/faqs";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getPagesDict } from "@/lib/i18n/dict/pages";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

const groups = ["Buying", "Payments", "Visits", "Diaspora"] as const;

export async function generateMetadata({ params }: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const { lang } = await params;
  const l: Locale = hasLocale(lang) ? lang : "en";
  const dict = getPagesDict(l).faq;
  return buildMetadata({ title: dict.metaTitle, description: dict.metaDescription, path: "/faq", lang: l, translations: locales });
}

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const { lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const dict = getPagesDict(lang).faq;
  const faqs = getGeneralFaqs(lang);

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHero>
        <Breadcrumbs items={[{ name: dict.breadcrumb, path: "/faq" }]} inverted lang={lang} />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{dict.h1}</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">
          {dict.cantFind}{" "}
          <Link href="/contact" className="font-semibold text-gold-300 underline">
            {dict.askSales}
          </Link>
          {lang === "en" ? "." : "።"}
        </p>
      </PageHero>
      <Container className="max-w-4xl py-14">
        {groups.map((group) => (
          <section key={group} className="mt-10 first:mt-0">
            <h2 className="text-2xl font-bold">{dict.groups[group]}</h2>
            <div className="mt-4">
              <FaqList faqs={faqs.filter((f) => f.group === group)} />
            </div>
          </section>
        ))}
      </Container>
      <CtaBand />
    </>
  );
}

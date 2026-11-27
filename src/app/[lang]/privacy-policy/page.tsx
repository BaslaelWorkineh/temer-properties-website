import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Container } from "@/components/site/section";
import { site } from "@/lib/config/site";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getPagesDict } from "@/lib/i18n/dict/pages";
import { buildMetadata } from "@/lib/seo/metadata";

export const ensureStatic = "navigation";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy-policy">): Promise<Metadata> {
  const { lang } = await params;
  const l: Locale = hasLocale(lang) ? lang : "en";
  const pages = getPagesDict(l);
  return buildMetadata({
    title: pages.privacy.metaTitle,
    description: pages.privacy.metaDescription(l === "en" ? site.name : pages.brand),
    path: "/privacy-policy",
    lang: l,
    translations: locales,
  });
}

// Template text: have it reviewed by the company's legal adviser before launch (the Amharic too).
export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy-policy">) {
  const { lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const pages = getPagesDict(lang);
  const dict = pages.privacy;
  const name = lang === "en" ? site.name : pages.brand;

  return (
    <Container className="max-w-3xl py-10">
      <Breadcrumbs items={[{ name: dict.breadcrumb, path: "/privacy-policy" }]} lang={lang} />
      <article className="prose-content mt-8">
        <h1 className="text-4xl font-bold">{dict.h1}</h1>
        <p>{dict.intro(name)}</p>
        <h2>{dict.collectTitle}</h2>
        <p>{dict.collect}</p>
        <h2>{dict.useTitle}</h2>
        <ul>
          {dict.uses.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
        <p>{dict.noSell}</p>
        <h2>{dict.keepTitle}</h2>
        <p>{dict.keep}</p>
        <h2>{dict.choicesTitle}</h2>
        <p>
          {dict.choices.pre}
          <a href={`tel:${site.contact.phone}`}>{site.contact.phoneDisplay}</a>
          {dict.choices.post}
        </p>
        <h2>{dict.cookiesTitle}</h2>
        <p>{dict.cookies}</p>
      </article>
    </Container>
  );
}

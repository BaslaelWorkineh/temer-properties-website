import type { Metadata } from "next";
import Link from "@/components/site/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { PropertyGrid } from "@/components/site/property-card";
import { Container, PageHero } from "@/components/site/section";
import { buttonStyles } from "@/components/ui/button";
import { PROPERTY_TYPES, propertyTypes, typeFromSlug } from "@/lib/config/property-types";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getAreasDict } from "@/lib/i18n/dict/areas";
import { getDictionary, localizedAreaName } from "@/lib/i18n/dictionaries";
import { getTypeCounts, getTypeLocationCombos, searchProperties } from "@/lib/data/properties";
import { itemListJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return PROPERTY_TYPES.map((t) => ({ type: propertyTypes[t].slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/for-sale/[type]">): Promise<Metadata> {
  const { type: typeSlug, lang: raw } = await params;
  const lang: Locale = hasLocale(raw) ? raw : "en";
  const t = getAreasDict(lang).forSale;
  const dict = getDictionary(lang);
  const type = typeFromSlug(typeSlug);
  if (!type) return { title: t.notFound, robots: { index: false, follow: true } };
  const meta = propertyTypes[type];
  const count = (await getTypeCounts())[type];
  return buildMetadata({
    title: t.hubTitle(dict.types[type].plural),
    description: t.hubDescription(count, dict.types[type].label, t.typeIntro(type)),
    path: `/for-sale/${meta.slug}`,
    lang,
    translations: locales,
    // An empty hub is a thin page: keep it out of the index until listings exist.
    noindex: count === 0,
  });
}

export default async function ForSaleTypePage({ params }: PageProps<"/[lang]/for-sale/[type]">) {
  const { type: typeSlug, lang: raw } = await params;
  const lang: Locale = hasLocale(raw) ? raw : "en";
  const t = getAreasDict(lang).forSale;
  const common = getAreasDict(lang).common;
  const dict = getDictionary(lang);
  const type = typeFromSlug(typeSlug);
  if (!type) notFound();
  const meta = propertyTypes[type];
  const plural = dict.types[type].plural;
  // Only Amharic pages override the call-to-action text; English keeps the component's own defaults.
  const cta = lang === "am" ? { title: getAreasDict(lang).projects.ctaTitle, text: getAreasDict(lang).projects.ctaText } : {};

  const [result, combos] = await Promise.all([searchProperties({ type, pageSize: 48 }, lang), getTypeLocationCombos(lang)]);
  const areas = combos.filter((c) => c.type === type);

  return (
    <>
      <JsonLd data={itemListJsonLd(result.items.map((p) => ({ path: `/properties/${p.slug}`, name: p.title })), t.forSaleLabel(plural))} />
      <PageHero>
        <Breadcrumbs
          items={[
            { name: t.propertiesCrumb, path: "/properties" },
            { name: t.forSaleLabel(plural), path: `/for-sale/${meta.slug}` },
          ]}
          inverted
          lang={lang}
        />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{t.hubH1(plural)}</h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-white/80">{t.typeIntro(type)}</p>
        <p className="mt-5 text-sm font-semibold text-gold-300">{t.available(result.total)}</p>
      </PageHero>

      <Container className="py-14">
        {areas.length ? (
          <nav aria-label={t.byArea(plural)} className="mb-10">
            <h2 className="text-lg font-bold">{t.byArea(plural)}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {areas.map((a) => (
                <li key={a.locationSlug}>
                  <Link
                    href={`/for-sale/${meta.slug}/${a.locationSlug}`}
                    className="inline-block rounded-none bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100"
                  >
                    {localizedAreaName(lang, a.locationName)} ({a.count})
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {result.items.length ? (
          <PropertyGrid properties={result.items} eagerCount={3} lang={lang} />
        ) : (
          <div className="rounded-none bg-soft p-10 text-center">
            <h2 className="text-2xl font-bold">{t.emptyTitle(plural)}</h2>
            <p className="mx-auto mt-2 max-w-lg text-muted">{t.emptyText}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/projects" className={buttonStyles({ variant: "outline" })}>
                {common.seeAllProjects}
              </Link>
              <Link href="/contact" className={buttonStyles()}>
                {common.registerInterest}
              </Link>
            </div>
          </div>
        )}

        <nav aria-label={t.otherTypes} className="mt-16 border-t border-line pt-10">
          <h2 className="text-2xl font-bold">{t.otherTypes}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {PROPERTY_TYPES.filter((x) => x !== type).map((ty) => (
              <li key={ty}>
                <Link
                  href={`/for-sale/${propertyTypes[ty].slug}`}
                  className="inline-block rounded-none bg-soft px-4 py-2 text-sm font-medium ring-1 ring-line hover:ring-brand-400"
                >
                  {t.forSaleLabel(dict.types[ty].plural)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <CtaBand {...cta} />
    </>
  );
}

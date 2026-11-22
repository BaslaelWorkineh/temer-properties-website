import type { Metadata } from "next";
import Link from "@/components/site/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { PropertyGrid } from "@/components/site/property-card";
import { Container, PageHero } from "@/components/site/section";
import { propertyTypes, typeFromSlug } from "@/lib/config/property-types";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getAreasDict } from "@/lib/i18n/dict/areas";
import { getDictionary, localizedAreaName } from "@/lib/i18n/dictionaries";
import { getLocationBySlug } from "@/lib/data/locations";
import { getTypeLocationCombos, searchProperties } from "@/lib/data/properties";
import { itemListJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * Long-tail landing pages such as "Apartments for sale in Sarbet". Only
 * combinations with at least one on-market listing exist; everything else is a
 * real 404, so there are never empty doorway pages.
 */
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const combos = await getTypeLocationCombos();
  return combos.length
    ? combos.map((c) => ({ type: propertyTypes[c.type].slug, location: c.locationSlug }))
    : [{ type: "apartments", location: "__none__" }];
}

async function load(typeSlug: string, locationSlug: string, lang: Locale = "en") {
  const type = typeFromSlug(typeSlug);
  if (!type) return null;
  const location = await getLocationBySlug(locationSlug, lang);
  if (!location) return null;
  const result = await searchProperties({ type, location: location.slug, pageSize: 48 }, lang);
  if (!result.total) return null;
  return { type, meta: propertyTypes[type], location, result };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/for-sale/[type]/[location]">): Promise<Metadata> {
  const { type, location, lang: raw } = await params;
  const lang: Locale = hasLocale(raw) ? raw : "en";
  const t = getAreasDict(lang).forSale;
  const dict = getDictionary(lang);
  const data = await load(type, location, lang);
  if (!data) return { title: t.notFound, robots: { index: false, follow: true } };
  const { meta, location: l, result } = data;
  return buildMetadata({
    title: t.locTitle(dict.types[data.type].plural, l.name, l.city),
    // Amharic: facts and template only (the area summary is English database text).
    description: t.locDescription(result.total, dict.types[data.type].label, l.name, l.city, l.summary ?? ""),
    path: `/for-sale/${meta.slug}/${l.slug}`,
    images: [result.items[0]?.image],
    lang,
    translations: locales,
  });
}

export default async function ForSaleTypeLocationPage({ params }: PageProps<"/[lang]/for-sale/[type]/[location]">) {
  const { type, location, lang: raw } = await params;
  const lang: Locale = hasLocale(raw) ? raw : "en";
  const t = getAreasDict(lang).forSale;
  const dict = getDictionary(lang);
  const data = await load(type, location, lang);
  if (!data) notFound();
  const { meta, location: l, result } = data;
  const plural = dict.types[data.type].plural;
  const label = dict.types[data.type].label;
  const name = localizedAreaName(lang, l.name);
  const prices = result.items.map((p) => p.price).filter((p): p is number => Boolean(p));
  const priceRange = prices.length > 1 ? { min: Math.min(...prices), max: Math.max(...prices) } : null;
  // Only Amharic pages override the call-to-action text; English keeps the component's own defaults.
  const cta = lang === "am" ? { title: getAreasDict(lang).projects.ctaTitle, text: getAreasDict(lang).projects.ctaText } : {};

  return (
    <>
      <JsonLd data={itemListJsonLd(result.items.map((p) => ({ path: `/properties/${p.slug}`, name: p.title })), t.locH1(plural, l.name))} />
      <PageHero>
        <Breadcrumbs
          items={[
            { name: t.forSaleLabel(plural), path: `/for-sale/${meta.slug}` },
            { name, path: `/for-sale/${meta.slug}/${l.slug}` },
          ]}
          inverted
          lang={lang}
        />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{t.locH1(plural, l.name)}</h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-white/80">
          {t.locLead(result.total, label, l.name, l.city, priceRange?.min ?? null, priceRange?.max ?? null, l.summary ?? "")}
        </p>
      </PageHero>
      <Container className="py-14">
        <PropertyGrid properties={result.items} eagerCount={3} lang={lang} />
        <p className="mt-12 text-muted">
          {t.widerPrefix}
          <Link href={`/for-sale/${meta.slug}`} className="font-semibold text-brand-700 hover:underline">
            {t.widerLink1(plural)}
          </Link>
          {t.widerMid}
          <Link href={`/locations/${l.slug}`} className="font-semibold text-brand-700 hover:underline">
            {t.widerLink2(l.name)}
          </Link>
          {t.widerSuffix}
        </p>
      </Container>
      <CtaBand {...cta} />
    </>
  );
}

import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { LocationCard } from "@/components/site/location-card";
import { Container, PageHero } from "@/components/site/section";
import { getLocations, isLocationIndexable } from "@/lib/data/locations";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getAreasDict } from "@/lib/i18n/dict/areas";
import { itemListJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/locations">): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = hasLocale(raw) ? raw : "en";
  const t = getAreasDict(lang).locations;
  return buildMetadata({ title: t.title, description: t.description, path: "/locations", lang, translations: locales });
}

export default async function LocationsPage({ params }: PageProps<"/[lang]/locations">) {
  const { lang: raw } = await params;
  const lang: Locale = hasLocale(raw) ? raw : "en";
  const t = getAreasDict(lang).locations;
  const locations = (await getLocations(lang)).filter(isLocationIndexable);
  // Only Amharic pages override the call-to-action text; English keeps the component's own defaults.
  const cta = lang === "am" ? { title: t.ctaTitle, text: t.ctaText } : {};
  return (
    <>
      <JsonLd data={itemListJsonLd(locations.map((l) => ({ path: `/locations/${l.slug}`, name: l.name })), t.listName)} />
      <PageHero>
        <Breadcrumbs items={[{ name: t.breadcrumb, path: "/locations" }]} inverted lang={lang} />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{t.h1}</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">{t.lead}</p>
      </PageHero>
      <section className="py-14">
        <Container>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {locations.map((l) => (
              <li key={l.id}>
                <LocationCard location={l} lang={lang} />
                {l.summary ? <p className="mt-3 text-sm leading-relaxed text-muted">{l.summary}</p> : null}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <CtaBand {...cta} />
    </>
  );
}

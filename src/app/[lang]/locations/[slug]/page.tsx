import { Check, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "@/components/site/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { FaqList } from "@/components/site/faq-list";
import { JsonLd } from "@/components/site/json-ld";
import { Markdown } from "@/components/site/markdown";
import { ProjectCard } from "@/components/site/project-card";
import { PropertyGrid } from "@/components/site/property-card";
import { Container, PageHero, SectionHeading } from "@/components/site/section";
import { buttonStyles } from "@/components/ui/button";
import { propertyTypes } from "@/lib/config/property-types";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { cityName, getAreasDict } from "@/lib/i18n/dict/areas";
import { getDictionary, localizedAreaName } from "@/lib/i18n/dictionaries";
import { getLocationBySlug, getLocations, isLocationIndexable } from "@/lib/data/locations";
import { getProjects } from "@/lib/data/projects";
import { getTypeLocationCombos, searchProperties } from "@/lib/data/properties";
import { faqJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { stripMarkdown } from "@/lib/utils";

export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const locations = await getLocations();
  return locations.length ? locations.map((l) => ({ slug: l.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/locations/[slug]">): Promise<Metadata> {
  const { slug, lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const l = await getLocationBySlug(slug, lang);
  if (!l) return { title: getAreasDict("en").locationDetail.notFound, robots: { index: false, follow: true } };
  // With a complete Amharic translation the page exists in both languages (self-canonical + hreflang).
  // Without one, /am/... points its canonical at the English page.
  if (l.translated && lang === "am") {
    return buildMetadata({
      title: l.name,
      description: l.summary || stripMarkdown(l.description ?? "") || l.name,
      path: `/locations/${l.slug}`,
      images: [l.image],
      noindex: !isLocationIndexable(l),
      lang: "am",
      translations: locales,
    });
  }
  return buildMetadata({
    title: l.seoTitle || `Property for Sale in ${l.name}, ${l.city}`,
    description:
      l.seoDescription ||
      `Apartments, homes and shops for sale in ${l.name}, ${l.city}. ${l.summary ?? stripMarkdown(l.description ?? "")} Compare listings and book a site visit with Temer Properties.`,
    path: `/locations/${l.slug}`,
    images: [l.image],
    // Thin pages (no listings, no projects) stay out of the index until there is something to show.
    noindex: !isLocationIndexable(l),
    ...(l.translated ? { lang: "en" as const, translations: locales } : {}),
  });
}

export default async function LocationPage({ params }: PageProps<"/[lang]/locations/[slug]">) {
  const { slug, lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const dict = getDictionary(lang);
  const t = getAreasDict(lang).locationDetail;
  const l = await getLocationBySlug(slug, lang);
  if (!l) notFound();
  const name = localizedAreaName(lang, l.name);
  // Only Amharic pages override the call-to-action text; English keeps the component's own defaults.
  const ctaBase = getAreasDict(lang).projects;
  const cta = lang === "am" ? { title: t.ctaTitle(l.name), text: ctaBase.ctaText } : { title: t.ctaTitle(l.name) };

  const [listings, projects, combos, allLocations] = await Promise.all([
    searchProperties({ location: l.slug, pageSize: 24 }, lang),
    getProjects({ locationId: l.id }, lang),
    getTypeLocationCombos(),
    getLocations(lang),
  ]);
  const typesHere = combos.filter((c) => c.locationSlug === l.slug);
  const otherAreas = allLocations.filter((o) => o.slug !== l.slug && isLocationIndexable(o)).slice(0, 8);

  return (
    <>
      <JsonLd
        data={[
          itemListJsonLd(listings.items.map((p) => ({ path: `/properties/${p.slug}`, name: p.title })), `Property for sale in ${l.name}`),
          faqJsonLd(l.faqs),
        ]}
      />
      <PageHero>
        <Breadcrumbs
          items={[
            { name: t.locationsCrumb, path: "/locations" },
            { name, path: `/locations/${l.slug}` },
          ]}
          inverted
          lang={lang}
        />
        <p className="mt-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">
          <MapPin className="size-4" aria-hidden="true" /> {cityName(lang, l.city)}
        </p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{t.h1(l.name)}</h1>
        {l.summary ? <p className="mt-3 max-w-3xl text-lg text-white/80">{l.summary}</p> : null}
        <p className="mt-6 text-sm text-white/70">
          {t.counts(l.propertyCount, l.projectCount)}
        </p>
      </PageHero>

      <Container className="py-14">
        {typesHere.length ? (
          <nav aria-label={t.typesNav(l.name)} className="mb-10 flex flex-wrap gap-2">
            {typesHere.map((c) => (
              <Link
                key={c.type}
                href={`/for-sale/${propertyTypes[c.type].slug}/${l.slug}`}
                className="rounded-none bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100"
              >
                {t.typeLink(dict.types[c.type].plural, l.name, c.count)}
              </Link>
            ))}
          </nav>
        ) : null}

        {listings.items.length ? (
          <section>
            <SectionHeading
              title={t.listingsIn(l.name)}
              action={
                listings.total > listings.items.length ? (
                  <Link href={`/properties?location=${l.slug}`} className={buttonStyles({ variant: "outline" })}>
                    {t.seeAll(listings.total)}
                  </Link>
                ) : null
              }
            />
            <div className="mt-8">
              <PropertyGrid properties={listings.items} lang={lang} />
            </div>
          </section>
        ) : null}

        {projects.length ? (
          <section className={listings.items.length ? "mt-16" : ""}>
            <SectionHeading title={t.projectsIn(l.name)} />
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((p) => (
                <li key={p.id}>
                  <ProjectCard project={p} lang={lang} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {!listings.items.length && !projects.length ? (
          <p className="rounded-none bg-soft p-8 text-center text-muted">
            {t.noListings(l.name)}{" "}
            <Link href="/contact" className="font-semibold text-brand-700 underline">
              {t.tellUs}
            </Link>{" "}
            {t.noListingsTail}
          </p>
        ) : null}

        {l.description || l.highlights.length ? (
          <section className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="min-w-0">
              <h2 className="text-3xl font-bold">{t.living(l.name)}</h2>
              {l.description ? <Markdown content={l.description} className="mt-5" /> : null}
            </div>
            {l.highlights.length ? (
              <aside className="self-start rounded-none bg-soft p-6 ring-1 ring-line">
                <h2 className="text-xl font-bold">{t.glance(name)}</h2>
                <ul className="mt-4 space-y-3">
                  {l.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-sm leading-relaxed">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </section>
        ) : null}

        {l.faqs.length ? (
          <section className="mt-16 max-w-3xl">
            <h2 className="text-3xl font-bold">{t.faq(l.name)}</h2>
            <div className="mt-6">
              <FaqList faqs={l.faqs} />
            </div>
          </section>
        ) : null}

        {otherAreas.length ? (
          <nav aria-label={t.otherAreas} className="mt-16 border-t border-line pt-10">
            <h2 className="text-2xl font-bold">{t.otherAreas}</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {otherAreas.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/locations/${o.slug}`}
                    className="inline-block rounded-none bg-soft px-4 py-2 text-sm font-medium ring-1 ring-line hover:ring-brand-400"
                  >
                    {t.propertyIn(o.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </Container>
      <CtaBand {...cta} />
    </>
  );
}

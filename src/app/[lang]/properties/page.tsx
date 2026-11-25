import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "@/components/site/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { Pagination } from "@/components/site/pagination";
import { PropertyFilters } from "@/components/site/property-filters";
import { PropertyGrid } from "@/components/site/property-card";
import { Container, PageHero } from "@/components/site/section";
import { buttonStyles } from "@/components/ui/button";
import { PROPERTY_TYPES, propertyTypes } from "@/lib/config/property-types";
import { getLocations, isLocationIndexable, type LocationSummary } from "@/lib/data/locations";
import { searchProperties } from "@/lib/data/properties";
import { filtersToSearchParams, parsePropertyFilters } from "@/lib/filters";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary, localizedAreaName } from "@/lib/i18n/dictionaries";
import { getPropertiesDict } from "@/lib/i18n/dict/properties";
import { buildMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd } from "@/lib/seo/jsonld";

/*
 * Filtered views (?type=…, ?location=…) all declare /properties as canonical,
 * so only the clean URL and the keyword landing pages (/for-sale/…,
 * /locations/…) compete in search. Link to those landing pages, not to
 * filter URLs, from navigation and content.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/properties">): Promise<Metadata> {
  const { lang } = await params;
  const l: Locale = hasLocale(lang) ? lang : "en";
  const pd = getPropertiesDict(l);
  // The list page exists in every language, so each version points to itself and to its translations.
  return buildMetadata({ title: pd.list.title, description: pd.list.description, path: "/properties", lang: l, translations: locales });
}

export default async function PropertiesPage({ params, searchParams }: PageProps<"/[lang]/properties">) {
  const { lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const pd = getPropertiesDict(lang);
  const locations = await getLocations(lang);
  return (
    <>
      <PageHero>
        <Breadcrumbs items={[{ name: pd.list.breadcrumb, path: "/properties" }]} inverted lang={lang} />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{pd.list.h1}</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">{pd.list.intro}</p>
      </PageHero>
      <Container className="-mt-6 pb-16">
        <Suspense fallback={<ResultsSkeleton />}>
          <Results searchParams={searchParams} locations={locations} lang={lang} />
        </Suspense>
        <BrowseLinks locations={locations} lang={lang} />
      </Container>
    </>
  );
}

async function Results({
  searchParams,
  locations,
  lang,
}: {
  searchParams: PageProps<"/[lang]/properties">["searchParams"];
  locations: LocationSummary[];
  lang: Locale;
}) {
  const pd = getPropertiesDict(lang);
  const filters = parsePropertyFilters(await searchParams);
  const result = await searchProperties(filters, lang);
  const areaOptions = locations.filter((l) => l.propertyCount > 0 || l.slug === filters.location);
  const isFiltered = Object.keys(filters).some((k) => k !== "page");

  return (
    <>
      {/* Keyed by the search: Next keeps visited pages alive and restores their form as it was, so without a new key a
          search from the home page would show the old dropdown choices above the new results. */}
      <PropertyFilters key={filtersToSearchParams(filters)} filters={filters} locations={areaOptions} className="relative" lang={lang} />
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {pd.list.found(result.total)}
          {result.pageCount > 1 ? pd.list.pageOf(result.page, result.pageCount) : ""}
        </p>
        {isFiltered ? (
          <Link href="/properties" className="text-sm font-semibold text-brand-700 hover:underline">
            {pd.list.clear}
          </Link>
        ) : null}
      </div>
      {result.items.length ? (
        <>
          <JsonLd data={itemListJsonLd(result.items.map((p) => ({ path: `/properties/${p.slug}`, name: p.title })))} />
          <div className="mt-6">
            <PropertyGrid properties={result.items} eagerCount={3} lang={lang} />
          </div>
          <Pagination
            page={result.page}
            lang={lang}
            pageCount={result.pageCount}
            hrefFor={(page) => `/properties${filtersToSearchParams(filters, { page })}`}
          />
        </>
      ) : (
        <div className="mt-6 rounded-none border border-dashed border-line bg-soft px-6 py-16 text-center">
          <SearchX className="mx-auto size-10 text-muted" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-bold">{pd.list.noMatchTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">{pd.list.noMatchText}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/properties" className={buttonStyles({ variant: "outline" })}>
              {pd.list.showAll}
            </Link>
            <Link href="/contact" className={buttonStyles()}>
              {pd.list.askSales}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/** Internal links to every landing page, always in the static HTML. */
function BrowseLinks({ locations, lang }: { locations: LocationSummary[]; lang: Locale }) {
  const dict = getDictionary(lang);
  const pd = getPropertiesDict(lang);
  const areas = locations.filter(isLocationIndexable);
  return (
    <section className="mt-16 grid gap-10 border-t border-line pt-10 md:grid-cols-2">
      <div>
        <h2 className="text-2xl font-bold">{pd.list.browseType}</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((t) => (
            <li key={t}>
              <Link
                href={`/for-sale/${propertyTypes[t].slug}`}
                className="inline-block rounded-none bg-soft px-4 py-2 text-sm font-medium ring-1 ring-line hover:ring-brand-400"
              >
                {pd.list.forSale(dict.types[t].plural)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {areas.length ? (
        <div>
          <h2 className="text-2xl font-bold">{pd.list.browseArea}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {areas.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/locations/${l.slug}`}
                  className="inline-block rounded-none bg-soft px-4 py-2 text-sm font-medium ring-1 ring-line hover:ring-brand-400"
                >
                  {localizedAreaName(lang, l.name)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="h-[4.5rem] rounded-none bg-white shadow-lg ring-1 ring-line" />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-none border border-line">
            <div className="aspect-[4/3] animate-pulse bg-soft" />
            <div className="space-y-3 p-5">
              <div className="h-6 w-1/2 animate-pulse rounded-none bg-soft" />
              <div className="h-4 w-3/4 animate-pulse rounded-none bg-soft" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

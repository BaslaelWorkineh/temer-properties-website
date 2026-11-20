import { SearchX } from "lucide-react";
import Link from "next/link";
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
import { buildMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd } from "@/lib/seo/jsonld";
import { pluralize } from "@/lib/utils";

/*
 * Filtered views (?type=…, ?location=…) all declare /properties as canonical,
 * so only the clean URL and the keyword landing pages (/for-sale/…,
 * /locations/…) compete in search. Link to those landing pages, not to
 * filter URLs, from navigation and content.
 */
export const metadata = buildMetadata({
  title: "Properties for Sale in Addis Ababa",
  description:
    "Browse apartments, homes and commercial shops for sale in Addis Ababa. Filter by area, type, bedrooms and price, compare payment plans, and book a free site visit.",
  path: "/properties",
});

export default async function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  const locations = await getLocations();
  return (
    <>
      <PageHero>
        <Breadcrumbs items={[{ name: "Properties", path: "/properties" }]} inverted />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Properties for sale in Addis Ababa</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">
          Every listing below is sold directly by Temer Properties: real prices in Ethiopian Birr, real floor areas and
          the payment options for each unit.
        </p>
      </PageHero>
      <Container className="-mt-6 pb-16">
        <Suspense fallback={<ResultsSkeleton />}>
          <Results searchParams={searchParams} locations={locations} />
        </Suspense>
        <BrowseLinks locations={locations} />
      </Container>
    </>
  );
}

async function Results({
  searchParams,
  locations,
}: {
  searchParams: PageProps<"/properties">["searchParams"];
  locations: LocationSummary[];
}) {
  const filters = parsePropertyFilters(await searchParams);
  const result = await searchProperties(filters);
  const areaOptions = locations.filter((l) => l.propertyCount > 0 || l.slug === filters.location);
  const isFiltered = Object.keys(filters).some((k) => k !== "page");

  return (
    <>
      <PropertyFilters filters={filters} locations={areaOptions} className="relative" />
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {pluralize(result.total, "property", "properties")} found
          {result.pageCount > 1 ? ` · page ${result.page} of ${result.pageCount}` : ""}
        </p>
        {isFiltered ? (
          <Link href="/properties" className="text-sm font-semibold text-brand-700 hover:underline">
            Clear filters
          </Link>
        ) : null}
      </div>
      {result.items.length ? (
        <>
          <JsonLd data={itemListJsonLd(result.items.map((p) => ({ path: `/properties/${p.slug}`, name: p.title })))} />
          <div className="mt-6">
            <PropertyGrid properties={result.items} eagerCount={3} />
          </div>
          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            hrefFor={(page) => `/properties${filtersToSearchParams(filters, { page })}`}
          />
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-soft px-6 py-16 text-center">
          <SearchX className="mx-auto size-10 text-muted" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-bold">No properties match these filters</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Try a different area or price range, or tell us what you need. New units are released regularly and not every
            unit is listed online.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/properties" className={buttonStyles({ variant: "outline" })}>
              Show all properties
            </Link>
            <Link href="/contact" className={buttonStyles()}>
              Ask our sales team
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/** Internal links to every landing page, always in the static HTML. */
function BrowseLinks({ locations }: { locations: LocationSummary[] }) {
  const areas = locations.filter(isLocationIndexable);
  return (
    <section className="mt-16 grid gap-10 border-t border-line pt-10 md:grid-cols-2">
      <div>
        <h2 className="text-2xl font-bold">Browse by property type</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((t) => (
            <li key={t}>
              <Link
                href={`/for-sale/${propertyTypes[t].slug}`}
                className="inline-block rounded-full bg-soft px-4 py-2 text-sm font-medium ring-1 ring-line hover:ring-brand-400"
              >
                {propertyTypes[t].plural} for sale
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {areas.length ? (
        <div>
          <h2 className="text-2xl font-bold">Browse by area</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {areas.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/locations/${l.slug}`}
                  className="inline-block rounded-full bg-soft px-4 py-2 text-sm font-medium ring-1 ring-line hover:ring-brand-400"
                >
                  {l.name}
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
      <div className="h-[4.5rem] rounded-2xl bg-white shadow-lg ring-1 ring-line" />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-line">
            <div className="aspect-[4/3] animate-pulse bg-soft" />
            <div className="space-y-3 p-5">
              <div className="h-6 w-1/2 animate-pulse rounded bg-soft" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-soft" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "@/components/site/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { PropertyGrid } from "@/components/site/property-card";
import { Container, PageHero } from "@/components/site/section";
import { propertyTypes, typeFromSlug } from "@/lib/config/property-types";
import { getLocationBySlug } from "@/lib/data/locations";
import { getTypeLocationCombos, searchProperties } from "@/lib/data/properties";
import { itemListJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { pluralize } from "@/lib/utils";

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

async function load(typeSlug: string, locationSlug: string) {
  const type = typeFromSlug(typeSlug);
  if (!type) return null;
  const location = await getLocationBySlug(locationSlug);
  if (!location) return null;
  const result = await searchProperties({ type, location: location.slug, pageSize: 48 });
  if (!result.total) return null;
  return { type, meta: propertyTypes[type], location, result };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/for-sale/[type]/[location]">): Promise<Metadata> {
  const { type, location } = await params;
  const data = await load(type, location);
  if (!data) return { title: "Not found", robots: { index: false, follow: true } };
  const { meta, location: l, result } = data;
  return buildMetadata({
    title: `${meta.plural} for Sale in ${l.name}, ${l.city}`,
    description: `${pluralize(result.total, meta.label.toLowerCase())} for sale in ${l.name}, ${l.city}, sold directly by Temer Properties. ${l.summary ?? ""} Compare prices and sizes, then book a free site visit.`,
    path: `/for-sale/${meta.slug}/${l.slug}`,
    images: [result.items[0]?.image],
  });
}

export default async function ForSaleTypeLocationPage({ params }: PageProps<"/[lang]/for-sale/[type]/[location]">) {
  const { type, location } = await params;
  const data = await load(type, location);
  if (!data) notFound();
  const { meta, location: l, result } = data;
  const prices = result.items.map((p) => p.price).filter((p): p is number => Boolean(p));

  return (
    <>
      <JsonLd data={itemListJsonLd(result.items.map((p) => ({ path: `/properties/${p.slug}`, name: p.title })), `${meta.plural} for sale in ${l.name}`)} />
      <PageHero>
        <Breadcrumbs
          items={[
            { name: `${meta.plural} for sale`, path: `/for-sale/${meta.slug}` },
            { name: l.name, path: `/for-sale/${meta.slug}/${l.slug}` },
          ]}
          inverted
        />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
          {meta.plural} for sale in {l.name}
        </h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-white/80">
          {pluralize(result.total, meta.label.toLowerCase())} for sale in {l.name}, {l.city}
          {prices.length > 1
            ? `, from ETB ${Math.min(...prices).toLocaleString("en-US")} to ETB ${Math.max(...prices).toLocaleString("en-US")}`
            : ""}
          . {l.summary}
        </p>
      </PageHero>
      <Container className="py-14">
        <PropertyGrid properties={result.items} eagerCount={3} />
        <p className="mt-12 text-muted">
          Looking more widely? See{" "}
          <Link href={`/for-sale/${meta.slug}`} className="font-semibold text-brand-700 hover:underline">
            all {meta.plural.toLowerCase()} for sale in Addis Ababa
          </Link>{" "}
          or{" "}
          <Link href={`/locations/${l.slug}`} className="font-semibold text-brand-700 hover:underline">
            everything we offer in {l.name}
          </Link>
          .
        </p>
      </Container>
      <CtaBand />
    </>
  );
}

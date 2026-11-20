import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { PropertyGrid } from "@/components/site/property-card";
import { Container, PageHero } from "@/components/site/section";
import { buttonStyles } from "@/components/ui/button";
import { PROPERTY_TYPES, propertyTypes, typeFromSlug } from "@/lib/config/property-types";
import { getTypeCounts, getTypeLocationCombos, searchProperties } from "@/lib/data/properties";
import { itemListJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { pluralize } from "@/lib/utils";

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return PROPERTY_TYPES.map((t) => ({ type: propertyTypes[t].slug }));
}

export async function generateMetadata({ params }: PageProps<"/for-sale/[type]">): Promise<Metadata> {
  const { type: typeSlug } = await params;
  const type = typeFromSlug(typeSlug);
  if (!type) return { title: "Not found", robots: { index: false, follow: true } };
  const meta = propertyTypes[type];
  const count = (await getTypeCounts())[type];
  return buildMetadata({
    title: `${meta.plural} for Sale in Addis Ababa`,
    description: `${count ? `${pluralize(count, meta.label.toLowerCase())} for sale now. ` : ""}${meta.intro}`,
    path: `/for-sale/${meta.slug}`,
    // An empty hub is a thin page: keep it out of the index until listings exist.
    noindex: count === 0,
  });
}

export default async function ForSaleTypePage({ params }: PageProps<"/for-sale/[type]">) {
  const { type: typeSlug } = await params;
  const type = typeFromSlug(typeSlug);
  if (!type) notFound();
  const meta = propertyTypes[type];

  const [result, combos] = await Promise.all([searchProperties({ type, pageSize: 48 }), getTypeLocationCombos()]);
  const areas = combos.filter((c) => c.type === type);

  return (
    <>
      <JsonLd data={itemListJsonLd(result.items.map((p) => ({ path: `/properties/${p.slug}`, name: p.title })), `${meta.plural} for sale`)} />
      <PageHero>
        <Breadcrumbs
          items={[
            { name: "Properties", path: "/properties" },
            { name: `${meta.plural} for sale`, path: `/for-sale/${meta.slug}` },
          ]}
          inverted
        />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{meta.plural} for sale in Addis Ababa</h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-white/80">{meta.intro}</p>
        <p className="mt-5 text-sm font-semibold text-gold-300">{pluralize(result.total, "listing")} available</p>
      </PageHero>

      <Container className="py-14">
        {areas.length ? (
          <nav aria-label={`${meta.plural} by area`} className="mb-10">
            <h2 className="text-lg font-bold">{meta.plural} by area</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {areas.map((a) => (
                <li key={a.locationSlug}>
                  <Link
                    href={`/for-sale/${meta.slug}/${a.locationSlug}`}
                    className="inline-block rounded-none bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100"
                  >
                    {a.locationName} ({a.count})
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {result.items.length ? (
          <PropertyGrid properties={result.items} eagerCount={3} />
        ) : (
          <div className="rounded-2xl bg-soft p-10 text-center">
            <h2 className="text-2xl font-bold">No {meta.plural.toLowerCase()} listed right now</h2>
            <p className="mx-auto mt-2 max-w-lg text-muted">
              New units are released regularly. Tell us what you are looking for and our sales team will contact you first.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/projects" className={buttonStyles({ variant: "outline" })}>
                See our projects
              </Link>
              <Link href="/contact" className={buttonStyles()}>
                Register your interest
              </Link>
            </div>
          </div>
        )}

        <nav aria-label="Other property types" className="mt-16 border-t border-line pt-10">
          <h2 className="text-2xl font-bold">Other property types</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {PROPERTY_TYPES.filter((t) => t !== type).map((t) => (
              <li key={t}>
                <Link
                  href={`/for-sale/${propertyTypes[t].slug}`}
                  className="inline-block rounded-none bg-soft px-4 py-2 text-sm font-medium ring-1 ring-line hover:ring-brand-400"
                >
                  {propertyTypes[t].plural} for sale
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <CtaBand />
    </>
  );
}

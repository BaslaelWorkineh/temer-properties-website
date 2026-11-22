import { Building, MapPin, PlayCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "@/components/site/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/site/booking-form";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ContactPanel } from "@/components/site/contact-panel";
import { Gallery } from "@/components/site/gallery";
import { ImagePlaceholder } from "@/components/site/image-placeholder";
import { JsonLd } from "@/components/site/json-ld";
import { Markdown } from "@/components/site/markdown";
import { PropertyGrid } from "@/components/site/property-card";
import { Container } from "@/components/site/section";
import { buttonStyles } from "@/components/ui/button";
import { propertyTypes } from "@/lib/config/property-types";
import { site } from "@/lib/config/site";
import { getPropertyBySlug, getPropertySitemapEntries, getSimilarProperties } from "@/lib/data/properties";
import { discountedPrice, formatArea, formatDate, formatFloor, formatPrice } from "@/lib/format";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary, localizedAreaName } from "@/lib/i18n/dictionaries";
import { getPropertiesDict } from "@/lib/i18n/dict/properties";
import { propertySeoDescription, propertySeoTitle } from "@/lib/seo/copy";
import { propertyListingJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { stripMarkdown } from "@/lib/utils";

/**
 * Every response must be the complete page (metadata in <head>, content in
 * the HTML, correct 404 status). Listings created after the build are rendered
 * on their first request, then served statically.
 */
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const entries = await getPropertySitemapEntries();
  // Cache Components requires at least one param; the placeholder renders a 404.
  return entries.length ? entries.map((e) => ({ slug: e.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/properties/[slug]">): Promise<Metadata> {
  const { slug, lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const p = await getPropertyBySlug(slug, lang);
  if (!p) return { title: "Property not found", robots: { index: false, follow: true } };
  // With a complete Amharic translation the page exists in both languages (self-canonical + hreflang).
  // Without one, /am/... points its canonical at the English page.
  if (p.translated && lang === "am") {
    return buildMetadata({
      title: p.title,
      description: p.summary || stripMarkdown(p.description ?? "") || p.title,
      path: `/properties/${p.slug}`,
      images: p.images,
      noindex: p.status === "sold",
      lang: "am",
      translations: locales,
    });
  }
  return buildMetadata({
    title: propertySeoTitle(p),
    description: propertySeoDescription(p),
    path: `/properties/${p.slug}`,
    images: p.images,
    // Sold units stay reachable (old links keep working) but leave the index.
    noindex: p.status === "sold",
    ...(p.translated ? { lang: "en" as const, translations: locales } : {}),
  });
}

export default async function PropertyPage({ params }: PageProps<"/[lang]/properties/[slug]">) {
  const { slug, lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const dict = getDictionary(lang);
  const pd = getPropertiesDict(lang);
  const d = pd.detail;
  const p = await getPropertyBySlug(slug, lang);
  if (!p) notFound();

  const similar = await getSimilarProperties(p.id, p.type, p.locationId, 3, lang);
  const meta = propertyTypes[p.type];
  const typeLabel = dict.types[p.type].label;
  const typePlural = dict.types[p.type].plural;
  const areaName = p.location ? localizedAreaName(lang, p.location.name) : d.addis;
  // City names come from the database ("Addis Ababa"); show the Amharic name on Amharic pages.
  const cityName = !p.location || p.location.city === "Addis Ababa" ? d.addis : p.location.city;
  const description = p.description || p.summary || "";
  const lat = p.project?.latitude ?? p.location?.latitude;
  const lng = p.project?.longitude ?? p.location?.longitude;

  const facts = [
    { label: d.facts.type, value: typeLabel },
    meta.residential && p.bedrooms != null ? { label: d.facts.bedrooms, value: p.bedrooms === 0 ? d.studio : String(p.bedrooms) } : null,
    p.bathrooms != null ? { label: d.facts.toilets, value: String(p.bathrooms) } : null,
    p.areaSqm ? { label: d.facts.area, value: formatArea(p.areaSqm)! } : null,
    p.floor != null ? { label: d.facts.floor, value: formatFloor(p.floor, lang)! } : null,
    p.completion || p.project?.completion ? { label: d.facts.handover, value: (p.completion || p.project?.completion)! } : null,
  ].filter((f): f is { label: string; value: string } => Boolean(f));

  return (
    <>
      <JsonLd
        data={propertyListingJsonLd({
          ...p,
          description: p.summary || stripMarkdown(description).slice(0, 300) || p.title,
        })}
      />
      <div className="bg-[#eef1f6]">
      <Container className="pt-6 pb-16">
        <Breadcrumbs
          items={[
            { name: d.breadcrumb, path: "/properties" },
            ...(p.location ? [{ name: areaName, path: `/locations/${p.location.slug}` }] : []),
            { name: p.title, path: `/properties/${p.slug}` },
          ]}
          lang={lang}
        />

        {p.status === "sold" ? (
          <p role="status" className="mt-5 bg-red-50 px-5 py-4 text-red-900 ring-1 ring-red-200">
            {d.sold}{" "}
            <Link href="/contact" className="font-semibold underline">
              {d.soldLink}
            </Link>
            .
          </p>
        ) : null}

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0 bg-white p-5 ring-1 ring-line">
            {p.images.length ? (
              <Gallery images={p.images} title={p.title} />
            ) : (
              <div className="relative aspect-[16/10] overflow-hidden">
                <ImagePlaceholder label={typeLabel} />
              </div>
            )}

            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{p.title}</h1>
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                {p.project ? (
                  <>
                    <Link href={`/projects/${p.project.slug}`} className="hover:underline">
                      {p.project.name}
                    </Link>
                    ,{" "}
                  </>
                ) : null}
                {p.location ? (
                  <Link href={`/locations/${p.location.slug}`} className="hover:underline">
                    {areaName}
                  </Link>
                ) : (
                  d.addis
                )}
                , {p.location ? cityName : d.addis}
              </span>
            </p>
            {p.promo ? <p className="mt-3 inline-block bg-gold-100 px-3 py-1.5 text-sm font-semibold text-[#6b5016]">{p.promo}</p> : null}

            <h2 className="sr-only">{d.keyFacts}</h2>
            <dl className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-2.5">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col-reverse bg-soft p-3 text-[0.8125rem] text-muted">
                  <dt>{f.label}</dt>
                  <dd className="font-display text-[1.0625rem] font-bold text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>

            {description ? (
              <section className="mt-6">
                <h2 className="text-lg font-bold">{d.description}</h2>
                <Markdown content={description} className="mt-1.5" />
              </section>
            ) : null}

            {p.features.length ? (
              <section className="mt-6">
                <h2 className="text-lg font-bold">{d.features}</h2>
                <ul className="mt-1.5 list-disc pl-5 text-muted">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {p.paymentPlan || p.project?.paymentPlan ? (
              <section className="mt-6">
                <h2 className="text-lg font-bold">{d.paymentPlan}</h2>
                <Markdown content={(p.paymentPlan || p.project?.paymentPlan)!} className="mt-1.5" />
                <p className="mt-2 text-sm text-muted">{d.confirmTerms}</p>
              </section>
            ) : null}

            {p.videoUrl ? (
              <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "outline", className: "mt-6" })}>
                <PlayCircle className="size-5" aria-hidden="true" /> {d.video}
              </a>
            ) : null}

            {p.project ? (
              <section className="mt-8 bg-soft p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">{d.partOfProject}</p>
                <h2 className="mt-1 text-xl font-bold">
                  <Link href={`/projects/${p.project.slug}`} className="hover:text-brand-700">
                    {p.project.name}
                  </Link>
                </h2>
                <p className="mt-1 text-sm font-medium text-brand-700">{dict.projectStatus[p.project.status]}</p>
                {p.project.summary ? <p className="mt-2 text-ink/80">{p.project.summary}</p> : null}
                <Link href={`/projects/${p.project.slug}`} className="mt-3 inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                  <Building className="size-4" aria-hidden="true" /> {d.seeProject}
                </Link>
              </section>
            ) : null}

            {p.location ? (
              <section className="mt-6">
                <h2 className="text-lg font-bold">{d.location}</h2>
                <p className="mt-1.5 text-muted">
                  {d.locationLine(typeLabel.toLowerCase(), areaName, cityName)}{" "}
                  <Link href={`/locations/${p.location.slug}`} className="font-semibold text-brand-700 hover:underline">
                    {d.areaGuide(areaName)}
                  </Link>{" "}
                  {d.orBrowse}{" "}
                  <Link href={`/for-sale/${meta.slug}`} className="font-semibold text-brand-700 hover:underline">
                    {d.allForSale(typePlural.toLowerCase())}
                  </Link>
                  .
                </p>
                {lat != null && lng != null ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles({ variant: "outline", className: "mt-3" })}
                  >
                    <MapPin className="size-4" aria-hidden="true" /> {d.openMaps}
                  </a>
                ) : null}
              </section>
            ) : null}

            <p className="mt-8 text-sm text-muted">
              {d.updated} <time dateTime={p.updatedAt.toISOString()}>{formatDate(p.updatedAt, undefined, lang)}</time>. {d.reference(p.id)}
            </p>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24" aria-label={d.asideLabel}>
            <div className="bg-white p-5 ring-1 ring-line">
              {p.price && p.discountPercent ? (
                <div className="flex flex-wrap items-baseline gap-x-2.5">
                  <p className="font-display text-3xl font-bold text-ink">{formatPrice(discountedPrice(p.price, p.discountPercent), lang)}</p>
                  <p className="text-sm text-muted line-through decoration-red-500/70">{formatPrice(p.price, lang)}</p>
                  <p className="text-sm font-bold text-red-600">-{p.discountPercent}%</p>
                </div>
              ) : (
                <p className="font-display text-3xl font-bold text-ink">{formatPrice(p.price, lang)}</p>
              )}
              <ContactPanel subject={p.title} className="mt-3" lang={lang} />
              <p className="mt-3 text-[0.8125rem] text-muted">{d.orBook}</p>
            </div>
            <div className="bg-white p-5 ring-1 ring-line">
              <h2 className="text-xl font-bold">{p.status === "sold" ? d.interestedSimilar : d.bookVisit}</h2>
              <p className="mt-1 text-sm text-muted">{d.bookHint}</p>
              <BookingForm propertyId={p.id} subject={p.title} whatsapp={site.contact.whatsapp} className="mt-4" />
            </div>
          </aside>
        </div>

        {similar.length ? (
          <section className="mt-20">
            <h2 className="text-3xl font-bold">{d.similarHeading}</h2>
            <div className="mt-8">
              <PropertyGrid properties={similar} lang={lang} />
            </div>
          </section>
        ) : null}
      </Container>
      </div>
    </>
  );
}

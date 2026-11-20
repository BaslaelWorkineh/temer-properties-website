import { Bath, BedDouble, Building, CalendarClock, Check, Layers, MapPin, Phone, PlayCircle, Ruler, Tag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/site/booking-form";
import { TelegramIcon, WhatsAppIcon } from "@/components/site/brand-icons";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Gallery } from "@/components/site/gallery";
import { ImagePlaceholder } from "@/components/site/image-placeholder";
import { JsonLd } from "@/components/site/json-ld";
import { Markdown } from "@/components/site/markdown";
import { PropertyGrid } from "@/components/site/property-card";
import { Container } from "@/components/site/section";
import { buttonStyles } from "@/components/ui/button";
import { projectStatusLabels, propertyTypes } from "@/lib/config/property-types";
import { absoluteUrl, site, whatsappLink } from "@/lib/config/site";
import { getPropertyBySlug, getPropertySitemapEntries, getSimilarProperties } from "@/lib/data/properties";
import { formatArea, formatDate, formatFloor, formatPrice } from "@/lib/format";
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

export async function generateMetadata({ params }: PageProps<"/properties/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPropertyBySlug(slug);
  if (!p) return { title: "Property not found", robots: { index: false, follow: true } };
  return buildMetadata({
    title: propertySeoTitle(p),
    description: propertySeoDescription(p),
    path: `/properties/${p.slug}`,
    images: p.images,
    // Sold units stay reachable (old links keep working) but leave the index.
    noindex: p.status === "sold",
  });
}

export default async function PropertyPage({ params }: PageProps<"/properties/[slug]">) {
  const { slug } = await params;
  const p = await getPropertyBySlug(slug);
  if (!p) notFound();

  const similar = await getSimilarProperties(p.id, p.type, p.locationId);
  const meta = propertyTypes[p.type];
  const pageUrl = absoluteUrl(`/properties/${p.slug}`);
  const askText = `Hello Temer Properties, I'm interested in "${p.title}" (${pageUrl}). Is it still available?`;
  const description = p.description || p.summary || "";
  const lat = p.project?.latitude ?? p.location?.latitude;
  const lng = p.project?.longitude ?? p.location?.longitude;

  const facts = [
    { icon: Tag, label: "Type", value: meta.label },
    meta.residential && p.bedrooms != null ? { icon: BedDouble, label: "Bedrooms", value: p.bedrooms === 0 ? "Studio" : String(p.bedrooms) } : null,
    p.bathrooms != null ? { icon: Bath, label: "Bathrooms", value: String(p.bathrooms) } : null,
    p.areaSqm ? { icon: Ruler, label: "Size", value: formatArea(p.areaSqm)! } : null,
    p.floor != null ? { icon: Layers, label: "Floor", value: formatFloor(p.floor)! } : null,
    p.completion || p.project?.completion
      ? { icon: CalendarClock, label: "Completion", value: (p.completion || p.project?.completion)! }
      : null,
  ].filter((f): f is { icon: typeof Tag; label: string; value: string } => Boolean(f));

  return (
    <>
      <JsonLd
        data={propertyListingJsonLd({
          ...p,
          description: p.summary || stripMarkdown(description).slice(0, 300) || p.title,
        })}
      />
      <Container className="pt-6 pb-16">
        <Breadcrumbs
          items={[
            { name: "Properties", path: "/properties" },
            ...(p.location ? [{ name: p.location.name, path: `/locations/${p.location.slug}` }] : []),
            { name: p.title, path: `/properties/${p.slug}` },
          ]}
        />

        {p.status === "sold" ? (
          <p role="status" className="mt-5 rounded-2xl bg-red-50 px-5 py-4 text-red-900 ring-1 ring-red-200">
            This property has been sold. See similar available properties below, or{" "}
            <Link href="/contact" className="font-semibold underline">
              tell us what you are looking for
            </Link>
            .
          </p>
        ) : null}

        <div className="mt-5">
          {p.images.length ? (
            <Gallery images={p.images} title={p.title} />
          ) : (
            <div className="relative aspect-[16/7] overflow-hidden rounded-2xl">
              <ImagePlaceholder label={meta.label} />
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{p.title}</h1>
            <p className="mt-3 flex items-start gap-2 text-lg text-muted">
              <MapPin className="mt-1 size-5 shrink-0 text-brand-500" aria-hidden="true" />
              <span>
                {p.project ? (
                  <>
                    <Link href={`/projects/${p.project.slug}`} className="font-medium text-brand-700 hover:underline">
                      {p.project.name}
                    </Link>
                    ,{" "}
                  </>
                ) : null}
                {p.location ? (
                  <Link href={`/locations/${p.location.slug}`} className="hover:underline">
                    {p.location.name}
                  </Link>
                ) : (
                  "Addis Ababa"
                )}
                , {p.location?.city ?? "Addis Ababa"}
              </span>
            </p>
            <p className="mt-6 font-display text-4xl font-bold text-brand-700 sm:text-5xl">{formatPrice(p.price)}</p>
            {p.promo ? (
              <p className="mt-3 inline-block rounded-xl bg-gold-100 px-4 py-2 text-sm font-semibold text-[#6b5016]">{p.promo}</p>
            ) : null}

            <h2 className="sr-only">Key facts</h2>
            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label} className="flex items-center gap-3 bg-white p-4">
                  <f.icon className="size-5 shrink-0 text-brand-500" aria-hidden="true" />
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">{f.label}</dt>
                    <dd className="font-semibold text-ink">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {description ? (
              <section className="mt-12">
                <h2 className="text-2xl font-bold sm:text-3xl">About this {meta.label.toLowerCase()}</h2>
                <Markdown content={description} className="mt-4" />
              </section>
            ) : null}

            {p.features.length ? (
              <section className="mt-12">
                <h2 className="text-2xl font-bold sm:text-3xl">Features</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {p.paymentPlan || p.project?.paymentPlan ? (
              <section className="mt-12 rounded-2xl bg-soft p-6 ring-1 ring-line">
                <h2 className="text-2xl font-bold">Payment plan</h2>
                <Markdown content={(p.paymentPlan || p.project?.paymentPlan)!} className="mt-3" />
                <p className="mt-4 text-sm text-muted">Confirm current terms with our sales team before reserving.</p>
              </section>
            ) : null}

            {p.videoUrl ? (
              <a
                href={p.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: "outline", size: "lg", className: "mt-10" })}
              >
                <PlayCircle className="size-5" aria-hidden="true" /> Watch the video tour
              </a>
            ) : null}

            {p.project ? (
              <section className="mt-12 rounded-2xl p-6 ring-1 ring-line">
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">Part of the project</p>
                <h2 className="mt-1 text-2xl font-bold">
                  <Link href={`/projects/${p.project.slug}`} className="hover:text-brand-700">
                    {p.project.name}
                  </Link>
                </h2>
                <p className="mt-1 text-sm font-medium text-brand-700">{projectStatusLabels[p.project.status]}</p>
                {p.project.summary ? <p className="mt-3 text-ink/80">{p.project.summary}</p> : null}
                <Link href={`/projects/${p.project.slug}`} className="mt-4 inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                  <Building className="size-4" aria-hidden="true" /> See the project and other units
                </Link>
              </section>
            ) : null}

            {p.location ? (
              <section className="mt-12">
                <h2 className="text-2xl font-bold sm:text-3xl">Location</h2>
                <p className="mt-3 text-ink/80">
                  This {meta.label.toLowerCase()} is in {p.location.name}, {p.location.city}.{" "}
                  <Link href={`/locations/${p.location.slug}`} className="font-semibold text-brand-700 hover:underline">
                    Read our {p.location.name} area guide
                  </Link>{" "}
                  or browse{" "}
                  <Link href={`/for-sale/${meta.slug}`} className="font-semibold text-brand-700 hover:underline">
                    all {meta.plural.toLowerCase()} for sale
                  </Link>
                  .
                </p>
                {lat != null && lng != null ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles({ variant: "outline", className: "mt-4" })}
                  >
                    <MapPin className="size-4" aria-hidden="true" /> Open in Google Maps
                  </a>
                ) : null}
              </section>
            ) : null}

            <p className="mt-12 text-sm text-muted">
              Listing updated <time dateTime={p.updatedAt.toISOString()}>{formatDate(p.updatedAt)}</time>. Reference #{p.id}.
            </p>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Book a site visit">
            <div className="rounded-2xl bg-white p-6 shadow-xl shadow-brand-950/5 ring-1 ring-line">
              <h2 className="text-2xl font-bold">{p.status === "sold" ? "Interested in similar units?" : "Book a site visit"}</h2>
              <p className="mt-1 text-sm text-muted">Pick a time; we&apos;ll call to confirm. Free, no obligation.</p>
              <BookingForm
                propertyId={p.id}
                subject={p.title}
                whatsapp={site.contact.whatsapp}
                className="mt-5"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <a href={`tel:${site.contact.phone}`} className={buttonStyles({ variant: "outline", size: "sm" })}>
                <Phone className="size-4" aria-hidden="true" /> Call
              </a>
              <a href={whatsappLink(askText)} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "outline", size: "sm" })}>
                <WhatsAppIcon className="size-4 text-[#25D366]" /> Chat
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(p.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                <TelegramIcon className="size-4 text-[#229ED9]" /> Share
              </a>
            </div>
          </aside>
        </div>

        {similar.length ? (
          <section className="mt-20">
            <h2 className="text-3xl font-bold">Similar properties</h2>
            <div className="mt-8">
              <PropertyGrid properties={similar} />
            </div>
          </section>
        ) : null}
      </Container>
    </>
  );
}

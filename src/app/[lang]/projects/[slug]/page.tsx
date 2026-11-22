import { Building2, CalendarClock, Check, Layers, MapPin, PlayCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "@/components/site/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/site/booking-form";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { FaqList } from "@/components/site/faq-list";
import { ContactPanel } from "@/components/site/contact-panel";
import { Gallery } from "@/components/site/gallery";
import { ImagePlaceholder } from "@/components/site/image-placeholder";
import { InquiryForm } from "@/components/site/inquiry-form";
import { JsonLd } from "@/components/site/json-ld";
import { Markdown } from "@/components/site/markdown";
import { PropertyGrid } from "@/components/site/property-card";
import { Container } from "@/components/site/section";
import { StatusLabel } from "@/components/site/status-label";
import { buttonStyles } from "@/components/ui/button";
import { projectStatusLabels } from "@/lib/config/property-types";
import { site } from "@/lib/config/site";
import { getProjectBySlug, getProjects } from "@/lib/data/projects";
import { searchProperties } from "@/lib/data/properties";
import { faqJsonLd, itemListJsonLd, projectJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { stripMarkdown, truncate } from "@/lib/utils";

export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.length ? projects.map((p) => ({ slug: p.slug })) : [{ slug: "__none__" }];
}

type Project = NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>;

function seoTitle(p: Project) {
  if (p.seoTitle) return p.seoTitle;
  const what = p.category ?? "Apartments";
  const where = p.location?.name;
  return where && !p.name.toLowerCase().includes(where.toLowerCase()) ? `${p.name}: ${what} in ${where}` : `${p.name}: ${what}`;
}

function seoDescription(p: Project) {
  if (p.seoDescription) return p.seoDescription;
  const body = p.summary || (p.description ? stripMarkdown(p.description) : "");
  const where = p.location ? `${p.location.name}, ${p.location.city}` : "Addis Ababa";
  return `${p.name} by Temer Properties in ${where}. ${body} ${p.status === "delivered" ? "Completed project." : "Ask about available units and payment plans, or book a site visit."}`;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return { title: "Project not found", robots: { index: false, follow: true } };
  return buildMetadata({ title: seoTitle(p), description: seoDescription(p), path: `/projects/${p.slug}`, images: p.images });
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) notFound();

  const units = await searchProperties({ project: p.slug, pageSize: 48 });
  const residential = p.unitTypes.some((t) => /bed|apartment|studio|home|villa/i.test(t)) || /apartment|residential/i.test(p.category ?? "");
  const where = p.location ? `${p.location.name}, ${p.location.city}` : "Addis Ababa";
  const lat = p.latitude ?? p.location?.latitude;
  const lng = p.longitude ?? p.location?.longitude;

  const facts = [
    { icon: Building2, label: "Status", value: projectStatusLabels[p.status] },
    p.totalUnits ? { icon: Layers, label: "Units", value: String(p.totalUnits) } : null,
    p.floors ? { icon: Layers, label: "Floors", value: String(p.floors) } : null,
    p.completion ? { icon: CalendarClock, label: p.status === "delivered" ? "Delivered" : "Completion", value: p.completion } : null,
  ].filter((f): f is { icon: typeof Building2; label: string; value: string } => Boolean(f));

  return (
    <>
      <JsonLd
        data={[
          projectJsonLd({ ...p, residential, description: truncate(p.summary || stripMarkdown(p.description ?? "") || p.name, 300) }),
          faqJsonLd(p.faqs),
          itemListJsonLd(units.items.map((u) => ({ path: `/properties/${u.slug}`, name: u.title })), `Units for sale at ${p.name}`),
        ]}
      />
      <div className="bg-[#eef1f6]">
      <Container className="pt-6 pb-16">
        <Breadcrumbs
          items={[
            { name: "Projects", path: "/projects" },
            { name: p.name, path: `/projects/${p.slug}` },
          ]}
        />

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0 bg-white p-5 ring-1 ring-line">
            {p.images.length ? (
              <Gallery images={p.images} title={p.name} />
            ) : (
              <div className="relative aspect-[16/10] overflow-hidden">
                <ImagePlaceholder label="Project" />
              </div>
            )}
            <div className="mt-4"><StatusLabel status={p.status} /></div>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{p.name}</h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="size-4" aria-hidden="true" />
              {p.location ? (
                <Link href={`/locations/${p.location.slug}`} className="hover:underline">
                  {where}
                </Link>
              ) : (
                where
              )}
            </p>
            {p.summary ? <p className="mt-3 leading-relaxed text-ink/80">{p.summary}</p> : null}

            <dl className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-2.5">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col-reverse bg-soft p-3 text-[0.8125rem] text-muted">
                  <dt>{f.label}</dt>
                  <dd className="font-display text-[1.0625rem] font-bold text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>

            {p.unitTypes.length ? (
              <section className="mt-6">
                <h2 className="text-lg font-bold">Unit types</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {p.unitTypes.map((t) => (
                    <li key={t} className="rounded-none bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800 ring-1 ring-brand-200">
                      {t}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {p.description ? (
              <section className="mt-6">
                <h2 className="text-lg font-bold">About {p.name}</h2>
                <Markdown content={p.description} className="mt-1.5" />
              </section>
            ) : null}

            {p.amenities.length ? (
              <section className="mt-6">
                <h2 className="text-lg font-bold">Amenities</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {p.amenities.map((a) => (
                    <li key={a} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
                      {a}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {p.paymentPlan ? (
              <section className="mt-6">
                <h2 className="text-lg font-bold">Payment plan</h2>
                <Markdown content={p.paymentPlan} className="mt-1.5" />
              </section>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {lat != null && lng != null ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({ variant: "outline" })}
                >
                  <MapPin className="size-4" aria-hidden="true" /> Open in Google Maps
                </a>
              ) : null}
              {p.videoUrl ? (
                <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "outline" })}>
                  <PlayCircle className="size-4" aria-hidden="true" /> Watch the video
                </a>
              ) : null}
            </div>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24" aria-label={p.status === "delivered" ? "Contact us" : "Contact and book a site visit"}>
            <div className="bg-white p-5 ring-1 ring-line">
              <StatusLabel status={p.status} />
              <ContactPanel subject={p.name} className="mt-3" />
              <p className="mt-3 text-[0.8125rem] text-muted">Or book a free site visit and a sales person will show you around.</p>
            </div>
            <div className="bg-white p-5 ring-1 ring-line">
              {p.status === "delivered" ? (
                <>
                  <h2 className="text-xl font-bold">Ask about this project</h2>
                  <p className="mt-1 text-sm text-muted">Resale or similar units elsewhere? We&apos;ll advise.</p>
                  <InquiryForm projectId={p.id} defaultInterest="delivered" className="mt-4" />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold">Visit {p.name}</h2>
                  <p className="mt-1 text-sm text-muted">In person or by video call. We&apos;ll call to confirm.</p>
                  <BookingForm projectId={p.id} subject={p.name} whatsapp={site.contact.whatsapp} className="mt-4" />
                </>
              )}
            </div>
          </aside>
        </div>

        <section className="mt-20">
          <h2 className="text-3xl font-bold">Units for sale at {p.name}</h2>
          {units.items.length ? (
            <div className="mt-8">
              <PropertyGrid properties={units.items} />
            </div>
          ) : (
            <p className="mt-4 max-w-2xl text-muted">
              {p.status === "delivered"
                ? "All units in this project have been handed over."
                : "Individual units are not listed online yet. Contact our sales team for current availability, floor plans and prices."}
            </p>
          )}
        </section>

        {p.faqs.length ? (
          <section className="mt-20 max-w-3xl">
            <h2 className="text-3xl font-bold">Questions about {p.name}</h2>
            <div className="mt-6">
              <FaqList faqs={p.faqs} />
            </div>
          </section>
        ) : null}
      </Container>
      </div>
    </>
  );
}

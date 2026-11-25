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
import { site } from "@/lib/config/site";
import { getProjectBySlug, getProjects } from "@/lib/data/projects";
import { searchProperties } from "@/lib/data/properties";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { cityName, getAreasDict } from "@/lib/i18n/dict/areas";
import { getDictionary, localizedAreaName } from "@/lib/i18n/dictionaries";
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
  const { slug, lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const p = await getProjectBySlug(slug, lang);
  if (!p) return { title: getAreasDict("en").projectDetail.notFound, robots: { index: false, follow: true } };
  // With a complete Amharic translation the page exists in both languages (self-canonical + hreflang).
  // Without one, /am/... points its canonical at the English page.
  if (p.translated && lang === "am") {
    return buildMetadata({
      title: p.name,
      description: p.summary || stripMarkdown(p.description ?? "") || p.name,
      path: `/projects/${p.slug}`,
      images: p.images,
      lang: "am",
      translations: locales,
    });
  }
  return buildMetadata({
    title: seoTitle(p),
    description: seoDescription(p),
    path: `/projects/${p.slug}`,
    images: p.images,
    ...(p.translated ? { lang: "en" as const, translations: locales } : {}),
  });
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { slug, lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const dict = getDictionary(lang);
  const t = getAreasDict(lang).projectDetail;
  const p = await getProjectBySlug(slug, lang);
  if (!p) notFound();
  // "For sale" only when something is actually listed (published, not sold); other statuses always show.
  const showStatus = p.status !== "selling" || p.availableUnits > 0;

  const units = await searchProperties({ project: p.slug, pageSize: 48 }, lang);
  const residential = p.unitTypes.some((t) => /bed|apartment|studio|home|villa/i.test(t)) || /apartment|residential/i.test(p.category ?? "");
  const where = p.location
    ? `${localizedAreaName(lang, p.location.name)}, ${cityName(lang, p.location.city)}`
    : getAreasDict(lang).addisAbaba;
  const lat = p.latitude ?? p.location?.latitude;
  const lng = p.longitude ?? p.location?.longitude;

  const facts = [
    showStatus ? { icon: Building2, label: t.status, value: dict.projectStatus[p.status] } : null,
    p.totalUnits ? { icon: Layers, label: t.units, value: String(p.totalUnits) } : null,
    p.floors ? { icon: Layers, label: t.floors, value: String(p.floors) } : null,
    p.completion ? { icon: CalendarClock, label: p.status === "delivered" ? t.delivered : t.completion, value: p.completion } : null,
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
            { name: t.projectsCrumb, path: "/projects" },
            { name: p.name, path: `/projects/${p.slug}` },
          ]}
          lang={lang}
        />

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0 bg-white p-5 ring-1 ring-line">
            {p.images.length ? (
              <Gallery images={p.images} title={p.name} />
            ) : (
              <div className="relative aspect-[16/10] overflow-hidden">
                <ImagePlaceholder label={getAreasDict(lang).common.placeholderProject} />
              </div>
            )}
            {showStatus ? <div className="mt-4"><StatusLabel status={p.status} lang={lang} /></div> : null}
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
                <h2 className="text-lg font-bold">{t.unitTypes}</h2>
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
                <h2 className="text-lg font-bold">{t.about(p.name)}</h2>
                <Markdown content={p.description} className="mt-1.5" />
              </section>
            ) : null}

            {p.amenities.length ? (
              <section className="mt-6">
                <h2 className="text-lg font-bold">{t.amenities}</h2>
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
                <h2 className="text-lg font-bold">{t.paymentPlan}</h2>
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
                  <MapPin className="size-4" aria-hidden="true" /> {t.openMaps}
                </a>
              ) : null}
              {p.videoUrl ? (
                <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "outline" })}>
                  <PlayCircle className="size-4" aria-hidden="true" /> {t.watchVideo}
                </a>
              ) : null}
            </div>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24" aria-label={p.status === "delivered" ? t.asideDelivered : t.asideActive}>
            <div className="bg-white p-5 ring-1 ring-line">
              {showStatus ? <StatusLabel status={p.status} lang={lang} /> : null}
              <ContactPanel subject={p.name} className={showStatus ? "mt-3" : undefined} lang={lang} />
              <p className="mt-3 text-[0.8125rem] text-muted">{t.orBook}</p>
            </div>
            <div className="bg-white p-5 ring-1 ring-line">
              {p.status === "delivered" ? (
                <>
                  <h2 className="text-xl font-bold">{t.askAbout}</h2>
                  <p className="mt-1 text-sm text-muted">{t.askLead}</p>
                  <InquiryForm projectId={p.id} defaultInterest="delivered" className="mt-4" />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold">{t.visit(p.name)}</h2>
                  <p className="mt-1 text-sm text-muted">{t.visitLead}</p>
                  <BookingForm projectId={p.id} subject={p.name} whatsapp={site.contact.whatsapp} className="mt-4" />
                </>
              )}
            </div>
          </aside>
        </div>

        <section className="mt-20">
          <h2 className="text-3xl font-bold">{t.unitsForSale(p.name)}</h2>
          {units.items.length ? (
            <div className="mt-8">
              <PropertyGrid properties={units.items} lang={lang} />
            </div>
          ) : (
            <p className="mt-4 max-w-2xl text-muted">
              {p.status === "delivered" ? t.allHandedOver : t.notListed}
            </p>
          )}
        </section>

        {p.faqs.length ? (
          <section className="mt-20 max-w-3xl">
            <h2 className="text-3xl font-bold">{t.questionsAbout(p.name)}</h2>
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

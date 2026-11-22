import { CalendarCheck2, Phone, ShieldCheck, Video } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/site/booking-form";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Container, PageHero } from "@/components/site/section";
import { site } from "@/lib/config/site";
import { getProjectOptions } from "@/lib/data/projects";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getFormsDict } from "@/lib/i18n/dict/forms";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/book-a-visit">): Promise<Metadata> {
  const { lang } = await params;
  const l: Locale = hasLocale(lang) ? lang : "en";
  const t = getFormsDict(l).page;
  return buildMetadata({ title: t.metaTitle, description: t.metaDescription, path: "/book-a-visit", lang: l, translations: locales });
}

const icons = [CalendarCheck2, Video, ShieldCheck];

export default async function BookAVisitPage({ params, searchParams }: PageProps<"/[lang]/book-a-visit">) {
  const { lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const t = getFormsDict(lang).page;
  const projects = await getProjectOptions(lang);
  const options = projects.filter((p) => p.status !== "delivered").map((p) => ({ id: p.id, name: p.name }));

  return (
    <>
      <PageHero>
        <Breadcrumbs lang={lang} items={[{ name: t.breadcrumb, path: "/book-a-visit" }]} inverted />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{t.h1}</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">{t.lead}</p>
      </PageHero>
      <Container className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_30rem]">
        <div>
          <ul className="space-y-6">
            {t.points.map((p, i) => {
              const Icon = icons[i];
              return (
                <li key={p.title} className="flex gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-none bg-brand-50 text-brand-600">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold">{p.title}</h2>
                    <p className="mt-1 text-muted">{p.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-10 rounded-none bg-soft p-6 text-ink/80 ring-1 ring-line">
            {t.preferToTalk}{" "}
            <a href={`tel:${site.contact.phone}`} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
              <Phone className="size-4" aria-hidden="true" />
              {site.contact.phoneDisplay}
            </a>{" "}
            ({getFormsDict(lang).hours}).
          </p>
        </div>
        <div className="rounded-none bg-white p-6 shadow-xl shadow-brand-950/5 ring-1 ring-line sm:p-8">
          <h2 className="text-2xl font-bold">{t.yourVisit}</h2>
          {/* The fallback is a fully working form, so the static HTML never shows a spinner. */}
          <Suspense fallback={<BookingForm projectOptions={options} whatsapp={site.contact.whatsapp} className="mt-6" />}>
            <PreselectedBookingForm searchParams={searchParams} projects={projects} options={options} />
          </Suspense>
        </div>
      </Container>
    </>
  );
}

/** Pre-selects the project when linked as /book-a-visit?project=<slug>. */
async function PreselectedBookingForm({
  searchParams,
  projects,
  options,
}: {
  searchParams: PageProps<"/[lang]/book-a-visit">["searchParams"];
  projects: Array<{ id: number; slug: string }>;
  options: Array<{ id: number; name: string }>;
}) {
  const { project } = await searchParams;
  const slug = Array.isArray(project) ? project[0] : project;
  const match = slug ? projects.find((p) => p.slug === slug) : undefined;
  return <BookingForm projectOptions={options} defaultProjectId={match?.id} whatsapp={site.contact.whatsapp} className="mt-6" />;
}

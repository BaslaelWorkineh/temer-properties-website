import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { ProjectCard } from "@/components/site/project-card";
import { Container, PageHero, SectionHeading } from "@/components/site/section";
import { SlideCarousel } from "@/components/site/slide-carousel";
import { getProjects } from "@/lib/data/projects";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getAreasDict } from "@/lib/i18n/dict/areas";
import { itemListJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = hasLocale(raw) ? raw : "en";
  const t = getAreasDict(lang).projects;
  // Fully translated page (the cards show database text, but the page copy and the title are generated here).
  return buildMetadata({ title: t.title, description: t.description, path: "/projects", lang, translations: locales });
}

export default async function ProjectsPage({ params }: PageProps<"/[lang]/projects">) {
  const { lang: raw } = await params;
  const lang: Locale = hasLocale(raw) ? raw : "en";
  const t = getAreasDict(lang).projects;
  const projects = await getProjects({}, lang);
  const current = projects.filter((p) => p.status !== "delivered");
  const delivered = projects.filter((p) => p.status === "delivered");
  // Only Amharic pages override the call-to-action text; English keeps the component's own defaults.
  const cta = lang === "am" ? { title: t.ctaTitle, text: t.ctaText } : {};

  return (
    <>
      <JsonLd data={itemListJsonLd(projects.map((p) => ({ path: `/projects/${p.slug}`, name: p.name })), t.listName)} />
      <PageHero>
        <Breadcrumbs items={[{ name: t.breadcrumb, path: "/projects" }]} inverted lang={lang} />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{t.h1}</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">{t.lead}</p>
      </PageHero>

      {current.length ? (
        <section className="py-14">
          <Container>
            <SectionHeading title={t.currentTitle} description={t.currentDesc} />
          </Container>
          {/* Full-bleed, self-scrolling row (same as the home page). Every card is still server-rendered HTML. */}
          <SlideCarousel className="mt-8" label={t.currentTitle} slideClassName="h-[26rem] w-[min(56rem,88vw)] sm:h-[30rem]">
            {current.map((p) => (
              <ProjectCard key={p.id} project={p} variant="banner" lang={lang} />
            ))}
          </SlideCarousel>
        </section>
      ) : null}

      {delivered.length ? (
        <section className="bg-soft py-14">
          <Container>
            <SectionHeading title={t.deliveredTitle} description={t.deliveredDesc} />
          </Container>
          {/* A slightly different pace, so the two rows don't move in lockstep. */}
          <SlideCarousel
            className="mt-8"
            label={t.deliveredTitle}
            interval={3600}
            slideClassName="h-[26rem] w-[min(56rem,88vw)] sm:h-[30rem]"
          >
            {delivered.map((p) => (
              <ProjectCard key={p.id} project={p} variant="banner" lang={lang} />
            ))}
          </SlideCarousel>
        </section>
      ) : null}

      <CtaBand {...cta} />
    </>
  );
}

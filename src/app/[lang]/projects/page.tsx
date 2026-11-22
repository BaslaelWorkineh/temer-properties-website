import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { ProjectCard } from "@/components/site/project-card";
import { Container, PageHero, SectionHeading } from "@/components/site/section";
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
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {current.map((p) => (
                <li key={p.id}>
                  <ProjectCard project={p} lang={lang} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {delivered.length ? (
        <section className="bg-soft py-14">
          <Container>
            <SectionHeading title={t.deliveredTitle} description={t.deliveredDesc} />
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {delivered.map((p) => (
                <li key={p.id}>
                  <ProjectCard project={p} lang={lang} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <CtaBand {...cta} />
    </>
  );
}

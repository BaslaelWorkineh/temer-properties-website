import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { ProjectCard } from "@/components/site/project-card";
import { Container, PageHero, SectionHeading } from "@/components/site/section";
import { getProjects } from "@/lib/data/projects";
import { itemListJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Real Estate Projects in Addis Ababa",
  description:
    "Explore Temer Properties' current and completed real estate projects in Addis Ababa: apartment buildings and mixed-use developments with shops in Sarbet, Megenagna, Ayat, Haile Garment, Piassa and more.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getProjects();
  const current = projects.filter((p) => p.status !== "delivered");
  const delivered = projects.filter((p) => p.status === "delivered");

  return (
    <>
      <JsonLd data={itemListJsonLd(projects.map((p) => ({ path: `/projects/${p.slug}`, name: p.name })), "Temer Properties projects")} />
      <PageHero>
        <Breadcrumbs items={[{ name: "Projects", path: "/projects" }]} inverted />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Our projects in Addis Ababa</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">
          Apartment buildings and mixed-use developments, from pre-launch to handed-over. Each project page lists available
          units, unit types, progress and how to book a visit.
        </p>
      </PageHero>

      {current.length ? (
        <section className="py-14">
          <Container>
            <SectionHeading title="Current projects" description="Selling now, under construction or launching soon." />
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {current.map((p) => (
                <li key={p.id}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {delivered.length ? (
        <section className="bg-soft py-14">
          <Container>
            <SectionHeading title="Delivered projects" description="Completed buildings handed over to their owners." />
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {delivered.map((p) => (
                <li key={p.id}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <CtaBand />
    </>
  );
}

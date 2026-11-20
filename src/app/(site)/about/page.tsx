import { BadgeCheck, Handshake, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { Container, PageHero, SectionHeading } from "@/components/site/section";
import { site } from "@/lib/config/site";
import { getProjects } from "@/lib/data/projects";
import { organizationJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "About Temer Properties: Real Estate Developer in Addis Ababa",
  description:
    "Founded in 2010 E.C., Temer Properties is a licensed real estate developer in Addis Ababa with 10+ completed projects and 400+ homes delivered. Our mission, values and track record.",
  path: "/about",
});

const values = [
  {
    icon: Sparkles,
    title: "Mission",
    text: "To elevate the living experience in Addis Ababa with well-built, well-located homes and commercial spaces at fair prices.",
  },
  {
    icon: Heart,
    title: "Values",
    text: "Trust, integrity, a personalised approach and an unwavering commitment to excellence, from the first visit to handover.",
  },
  {
    icon: Handshake,
    title: "Vision",
    text: "To redefine the way real estate is sold in Ethiopia: transparent prices, clear payment plans and honest timelines.",
  },
];

export default async function AboutPage() {
  const delivered = (await getProjects()).filter((p) => p.status === "delivered");
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <PageHero>
        <Breadcrumbs items={[{ name: "About", path: "/about" }]} inverted />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">About Temer Properties</h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">
          A licensed and verified real estate developer building apartments, homes and shops across Addis Ababa since{" "}
          {site.foundedEthiopianCalendar}
        </p>
      </PageHero>

      <section className="py-16">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div className="prose-content">
            <h2>Who we are</h2>
            <p>
              Founded in {site.foundedEthiopianCalendar}, {site.name} develops residential and mixed-use buildings in some of
              Addis Ababa&apos;s fastest-growing neighbourhoods, including Sarbet, Megenagna, Ayat, Haile Garment, Piassa
              and Bulgaria. We sell directly to buyers, so you deal with the same company that designs, builds and hands over
              your home.
            </p>
            <p>
              Our buyers include first-time homeowners, growing families, business owners looking for a shop of their own,
              and Ethiopians abroad investing back home. For every one of them we aim for the same thing: a well-built
              property, a fair price and a payment plan that works.
            </p>
            <p>
              <Link href="/projects">See our current and completed projects</Link> or{" "}
              <Link href="/book-a-visit">book a site visit</Link> to see our work in person.
            </p>
          </div>
          <dl className="grid content-start gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {site.stats.map((s) => (
              <div key={s.label} className="flex flex-col rounded-2xl bg-soft p-6 ring-1 ring-line">
                <dt className="text-sm text-muted">{s.label}</dt>
                <dd className="order-first font-display text-4xl font-bold text-brand-600">{s.value}</dd>
              </div>
            ))}
            <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-6 text-brand-800 ring-1 ring-brand-200 sm:col-span-3 lg:col-span-1 xl:col-span-3">
              <BadgeCheck className="size-8 shrink-0" aria-hidden="true" />
              <p className="font-semibold">Licensed and verified real estate developer</p>
            </div>
          </dl>
        </Container>
      </section>

      <section className="bg-soft py-16">
        <Container>
          <SectionHeading title="What drives us" />
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <li key={v.title} className="rounded-2xl bg-white p-6 ring-1 ring-line">
                <span className="font-display text-sm font-bold text-gold-600">0{i + 1}</span>
                <v.icon className="mt-3 size-7 text-brand-500" aria-hidden="true" />
                <h3 className="mt-3 text-2xl font-bold">{v.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{v.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {delivered.length ? (
        <section className="py-16">
          <Container>
            <SectionHeading title="Projects we have delivered" />
            <ul className="mt-8 flex flex-wrap gap-3">
              {delivered.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="inline-block rounded-full bg-soft px-5 py-2.5 font-semibold ring-1 ring-line hover:ring-brand-400"
                  >
                    {p.name}
                    {p.location ? <span className="font-normal text-muted"> · {p.location.name}</span> : null}
                  </Link>
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

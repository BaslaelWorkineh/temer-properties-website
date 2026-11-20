import { ArrowRight, BadgeCheck, Building2, CalendarCheck2, HandCoins, KeyRound, MapPinned, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/site/cta-band";
import { FaqList } from "@/components/site/faq-list";
import { JsonLd } from "@/components/site/json-ld";
import { LocationCard } from "@/components/site/location-card";
import { ProjectCard } from "@/components/site/project-card";
import { PropertyFilters } from "@/components/site/property-filters";
import { PropertyGrid } from "@/components/site/property-card";
import { Container, SectionHeading } from "@/components/site/section";
import { buttonStyles } from "@/components/ui/button";
import { generalFaqs } from "@/lib/content/faqs";
import { PROPERTY_TYPES, propertyTypes } from "@/lib/config/property-types";
import { site } from "@/lib/config/site";
import { getLocations, isLocationIndexable } from "@/lib/data/locations";
import { getPublishedPosts } from "@/lib/data/posts";
import { getProjects } from "@/lib/data/projects";
import { getFeaturedProperties, getTypeCounts } from "@/lib/data/properties";
import { formatDate } from "@/lib/format";
import { buildMetadata } from "@/lib/seo/metadata";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { pluralize } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Temer Properties | Apartments, Homes & Shops for Sale in Addis Ababa",
  absoluteTitle: true,
  description:
    "Buy new apartments, homes and commercial shops in Addis Ababa directly from Temer Properties. Compare prices, sizes and payment plans in Sarbet, Megenagna, Ayat and more, then book a free site visit online.",
  path: "/",
});

const typeIcons = { apartment: Building2, villa: KeyRound, townhouse: KeyRound, shop: Store, office: Building2 } as const;

const steps = [
  { icon: MapPinned, title: "Choose", text: "Compare apartments, homes and shops by area, size, price and payment plan." },
  { icon: CalendarCheck2, title: "Visit", text: "Book a free site visit or a live video walkthrough at a time that suits you." },
  { icon: HandCoins, title: "Reserve", text: "Agree the payment plan and reserve your unit with a down payment." },
  { icon: KeyRound, title: "Move in", text: "Follow construction progress and receive your keys at handover." },
];

export default async function HomePage() {
  const [featured, projects, locations, typeCounts, posts] = await Promise.all([
    getFeaturedProperties(6),
    getProjects(),
    getLocations(),
    getTypeCounts(),
    getPublishedPosts(3),
  ]);
  const activeProjects = projects.filter((p) => p.status !== "delivered");
  const deliveredProjects = projects.filter((p) => p.status === "delivered");
  const areas = locations.filter(isLocationIndexable).slice(0, 8);
  const heroImage = featured.find((p) => p.image)?.image ?? activeProjects.find((p) => p.image)?.image ?? null;

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

      {/* Hero: the H1 is plain text, so it paints immediately as the LCP element. */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(70rem_35rem_at_85%_-10%,#3a7d44,transparent),radial-gradient(45rem_25rem_at_-10%_110%,#c9a24a40,transparent)]"
          aria-hidden="true"
        />
        <Container className="relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-gold-300 ring-1 ring-white/15">
              <BadgeCheck className="size-4" aria-hidden="true" /> Licensed real estate developer in Addis Ababa
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Apartments, homes &amp; shops for sale in Addis Ababa
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Buy directly from {site.name}. Compare real prices, sizes and payment plans across our projects, then see your
              future home with a free site visit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/properties" className={buttonStyles({ variant: "gold", size: "lg" })}>
                Browse properties <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/book-a-visit" className={buttonStyles({ variant: "light", size: "lg" })}>
                Book a site visit
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {site.stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="text-xs text-white/65 sm:text-sm">{s.label}</dt>
                  <dd className="order-first font-display text-3xl font-bold text-gold-400 sm:text-4xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          {heroImage ? (
            <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10 lg:block">
              <Image
                src={heroImage.url}
                alt={heroImage.alt}
                fill
                sizes="(min-width: 1280px) 560px, 45vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover"
              />
            </div>
          ) : null}
        </Container>
        <Container className="relative pb-10">
          <h2 className="sr-only">Search properties</h2>
          <PropertyFilters filters={{}} locations={areas} compact />
        </Container>
      </section>

      {featured.length ? (
        <section className="py-16 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="Featured"
              title="Latest properties for sale"
              description="Current prices, sizes and offers on apartments, homes and shops across our Addis Ababa projects."
              action={
                <Link href="/properties" className={buttonStyles({ variant: "outline" })}>
                  View all properties <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
            <div className="mt-10">
              <PropertyGrid properties={featured} />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="bg-soft py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Browse" title="What are you looking for?" />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PROPERTY_TYPES.map((type) => {
              const Icon = typeIcons[type];
              const meta = propertyTypes[type];
              return (
                <li key={type}>
                  <Link
                    href={`/for-sale/${meta.slug}`}
                    className="group flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand-300"
                  >
                    <Icon className="size-7 text-brand-500" aria-hidden="true" />
                    <span className="mt-4 font-display text-xl font-bold text-ink">{meta.plural}</span>
                    <span className="mt-1 text-sm text-muted">
                      {typeCounts[type] ? pluralize(typeCounts[type], "listing") : "Ask about upcoming units"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {activeProjects.length ? (
        <section className="py-16 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="Projects"
              title="Current projects"
              description="Buildings now selling or under construction. Units in projects under construction usually come with the most flexible payment plans."
              action={
                <Link href="/projects" className={buttonStyles({ variant: "outline" })}>
                  All projects <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {activeProjects.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {areas.length ? (
        <section className="bg-soft py-16 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="Neighbourhoods"
              title="Property by area"
              description="From central Piassa to fast-growing Ayat and Sarbet, find homes and shops in the part of Addis Ababa that fits your life."
              action={
                <Link href="/locations" className={buttonStyles({ variant: "outline" })}>
                  All areas <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {areas.map((l) => (
                <li key={l.id}>
                  <LocationCard location={l} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="How it works"
              title="Buying with Temer Properties"
              description="A clear, four-step process with the developer, not a middleman."
            />
            <ol className="mt-8 grid gap-4 sm:grid-cols-2">
              {steps.map((step, i) => (
                <li key={step.title} className="rounded-2xl bg-soft p-5 ring-1 ring-line">
                  <step.icon className="size-6 text-brand-500" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-xl font-bold">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionHeading eyebrow="FAQ" title="Common questions" />
            <div className="mt-8">
              <FaqList faqs={generalFaqs.filter((f) => ["Payments", "Visits", "Diaspora"].includes(f.group)).slice(0, 5)} />
            </div>
            <Link href="/faq" className="mt-5 inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
              More answers <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>

      {deliveredProjects.length ? (
        <section className="bg-brand-950 py-16 text-white sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="Track record"
              title={<span className="text-white">Projects we have delivered</span>}
              description={<span className="text-white/75">Completed buildings handed over to their owners.</span>}
            />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {deliveredProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="block rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 transition hover:bg-white/10"
                  >
                    <span className="font-display text-xl font-bold">{p.name}</span>
                    <span className="mt-1 block text-sm text-white/70">{p.location?.name ?? "Addis Ababa"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {posts.length ? (
        <section className="py-16 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="Buyer guides"
              title="Advice for property buyers"
              action={
                <Link href="/blog" className={buttonStyles({ variant: "outline" })}>
                  All guides <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <article className="relative h-full rounded-2xl p-6 ring-1 ring-line transition hover:shadow-lg">
                    {post.publishedAt ? (
                      <time dateTime={post.publishedAt.toISOString()} className="text-sm text-muted">
                        {formatDate(post.publishedAt)}
                      </time>
                    ) : null}
                    <h3 className="mt-2 text-xl font-bold leading-snug">
                      <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
                        {post.title}
                      </Link>
                    </h3>
                    {post.excerpt ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p> : null}
                  </article>
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

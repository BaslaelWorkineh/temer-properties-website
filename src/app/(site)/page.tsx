import { ArrowRight, CalendarCheck2, HandCoins, KeyRound, MapPinned } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import citySunset from "@/assets/hero/city-sunset-green.jpg";
import { CtaBand } from "@/components/site/cta-band";
import { FaqList } from "@/components/site/faq-list";
import { JsonLd } from "@/components/site/json-ld";
import { LocationCard } from "@/components/site/location-card";
import { ProjectCard } from "@/components/site/project-card";
import { PropertyFilters } from "@/components/site/property-filters";
import { Marquee } from "@/components/site/marquee";
import { PropertyCard } from "@/components/site/property-card";
import { Container, SectionHeading } from "@/components/site/section";
import { buttonStyles } from "@/components/ui/button";
import { generalFaqs } from "@/lib/content/faqs";
import { site } from "@/lib/config/site";
import { getLocations, isLocationIndexable } from "@/lib/data/locations";
import { getPublishedPosts } from "@/lib/data/posts";
import { getProjects } from "@/lib/data/projects";
import { getFeaturedProperties } from "@/lib/data/properties";
import { formatDate } from "@/lib/format";
import { buildMetadata } from "@/lib/seo/metadata";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";

export const metadata = buildMetadata({
  title: "Temer Properties | Apartments, Homes & Shops for Sale in Addis Ababa",
  absoluteTitle: true,
  description:
    "Buy new apartments, homes and commercial shops in Addis Ababa directly from Temer Properties. Compare prices, sizes and payment plans in Sarbet, Megenagna, Ayat and more, then book a free site visit online.",
  path: "/",
});

const steps = [
  { icon: MapPinned, title: "Choose", text: "Compare apartments, homes and shops by area, size, price and payment plan." },
  { icon: CalendarCheck2, title: "Visit", text: "Book a free site visit or a live video walkthrough at a time that suits you." },
  { icon: HandCoins, title: "Reserve", text: "Agree the payment plan and reserve your unit with a down payment." },
  { icon: KeyRound, title: "Move in", text: "Follow construction progress and receive your keys at handover." },
];

export default async function HomePage() {
  const [featured, projects, locations, posts] = await Promise.all([
    getFeaturedProperties(8),
    getProjects(),
    getLocations(),
    getPublishedPosts(3),
  ]);
  const activeProjects = projects.filter((p) => p.status !== "delivered");
  const deliveredProjects = projects.filter((p) => p.status === "delivered");
  // Two-column grid: keep an even count so every row is full (6 -> 3 rows, 9 -> 8 -> 4 rows).
  const latest = featured.slice(0, featured.length - (featured.length % 2));
  // "Our projects": first half as big cards, the rest as small tiles. A single project still gets the big row.
  const half = Math.ceil(activeProjects.length / 2);
  const projectRows = [activeProjects.slice(0, half), activeProjects.slice(half)];
  const areas = locations.filter(isLocationIndexable).slice(0, 8);

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

      {/*
        Hero: sized to its content, directly below the thin header. The header's logo tab hangs ~4rem into it,
        so the wordmark starts below that.
        The green sunset (baked by scripts/generate-brand-assets.ts) is anchored to the top so only its bottom
        is cropped; it is the only hero image and is preloaded. A "TEMER / PROPERTIES" wordmark sits in the sky
        at the top left (decorative: the logo and H1 already carry the name); the copy sits low over the city.
      */}
      <section className="relative isolate flex flex-col overflow-hidden bg-brand-950 text-white">
        <Image
          src={citySunset}
          alt=""
          fill
          preload
          sizes="100vw"
          placeholder="blur"
          className="-z-10 object-cover object-[72%_top]"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-950/75 via-brand-950/25 to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-brand-950 via-brand-950/75 to-transparent"
          aria-hidden="true"
        />
        <Container className="pt-24 sm:pt-28">
          <p className="hero-wordmark" aria-hidden="true">
            <span className="hero-wordmark__name">TEMER</span>
            <span className="hero-wordmark__sub">PROPERTIES</span>
          </p>
        </Container>
        <Container className="flex flex-1 flex-col justify-end pb-16 pt-4 sm:pt-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold leading-[1.05] sm:text-5xl">
                Apartments, homes &amp; shops for sale in Addis Ababa
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/80">
                Buy directly from {site.name}. Compare real prices, sizes and payment plans across our projects, then see
                your future home with a free site visit.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/properties" className={buttonStyles({ variant: "gold", size: "lg" })}>
                  Browse properties <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link href="/book-a-visit" className={buttonStyles({ variant: "light", size: "lg" })}>
                  Book a site visit
                </Link>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6 lg:gap-10 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
              {site.stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="text-xs text-white/65 sm:text-sm">{s.label}</dt>
                  <dd className="order-first font-display text-3xl font-bold text-gold-400 sm:text-4xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/*
        Latest listings: a thin bar with the title beside the search filter (it submits to /properties), then
        a near-edge-to-edge two-column grid of photo cards (an even count, so every row is full). The old
        "Browse by type" grid is gone: the filter covers it, and the footer still links every /for-sale/* hub.
      */}
      <section className="pb-16 sm:pb-20">
        <Container className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:gap-8">
          <h2 className="shrink-0 text-2xl font-bold text-ink">Latest properties for sale</h2>
          <PropertyFilters filters={{}} locations={areas} compact bare dense className="lg:flex-1" />
        </Container>
        {latest.length ? (
          <>
            <ul className="grid gap-3 px-3 sm:grid-cols-2">
              {latest.map((p) => (
                <li key={p.id} className="aspect-[4/3] sm:aspect-[16/10] xl:aspect-[16/9]">
                  <PropertyCard property={p} variant="overlay" />
                </li>
              ))}
            </ul>
            <Container className="mt-6 flex justify-end">
              <Link href="/properties" className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                View all properties <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Container>
          </>
        ) : null}
      </section>

      {activeProjects.length ? (
        <section className="py-16 sm:py-20">
          <Container>
            <SectionHeading
              title="Our projects"
              description="Buildings now selling or under construction. Units in projects under construction usually come with the most flexible payment plans."
              action={
                <Link href="/projects" className={buttonStyles({ variant: "outline" })}>
                  All projects <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
          </Container>
          {/* Two self-scrolling rows: big feature cards on top, small tiles below (different widths too). */}
          <Marquee
            className="mt-10"
            rows={[
              {
                heightClass: "h-80 sm:h-[26rem]",
                items: projectRows[0].map((p, i) => ({
                  key: p.id,
                  width: [44, 36, 48, 40][i % 4],
                  node: <ProjectCard project={p} variant="overlay" />,
                })),
              },
              {
                heightClass: "h-40 sm:h-44",
                items: projectRows[1].map((p, i) => ({
                  key: p.id,
                  width: [20, 17, 23, 18][i % 4],
                  node: <ProjectCard project={p} variant="overlay" compact />,
                })),
              },
            ]}
          />
        </section>
      ) : null}

      {areas.length ? (
        <section className="bg-soft py-16 sm:py-20">
          <Container>
            <SectionHeading
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
            <SectionHeading title="Common questions" />
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

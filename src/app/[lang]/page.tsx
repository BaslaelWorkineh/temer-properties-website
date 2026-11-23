import type { Metadata } from "next";
import { ArrowRight, CalendarCheck2, Clock, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "@/components/site/link";
import heroTowers from "@/assets/hero/towers-dusk.jpg";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { FaqList } from "@/components/site/faq-list";
import { JsonLd } from "@/components/site/json-ld";
import { LocationCard } from "@/components/site/location-card";
import { ProjectCard } from "@/components/site/project-card";
import { HomeSearch } from "@/components/site/home-search";
import { SlideCarousel } from "@/components/site/slide-carousel";
import { PropertyCard } from "@/components/site/property-card";
import { Container, SectionHeading } from "@/components/site/section";
import { buttonStyles } from "@/components/ui/button";
import { getGeneralFaqs } from "@/lib/content/faqs";
import { site, whatsappLink } from "@/lib/config/site";
import { getLocations, isLocationIndexable } from "@/lib/data/locations";
import { getPublishedPosts } from "@/lib/data/posts";
import { getProjects } from "@/lib/data/projects";
import { getFeaturedProperties, searchProperties } from "@/lib/data/properties";
import { formatDate } from "@/lib/format";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary, localizedAreaName } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo/metadata";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";

export const ensureStatic = "navigation";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const l: Locale = hasLocale(lang) ? lang : "en";
  const dict = getDictionary(l);
  // The home page exists in every language, so each version points to itself and to its translations.
  return buildMetadata({ title: dict.home.title, absoluteTitle: true, description: dict.home.description, path: "/", lang: l, translations: locales });
}

const stepMeta = [
  { href: "/properties", image: { src: "/images/sample/project-1.jpg", alt: "Aerial view of new apartment buildings under construction in Addis Ababa" } },
  { href: "/book-a-visit", image: { src: "/images/sample/site-1.jpg", alt: "A Temer Properties building on site with its street frontage" } },
  { href: "/contact", image: { src: "/images/sample/hero-2.jpg", alt: "Sales advisors helping buyers at a Temer Properties sales desk" } },
  { href: "/projects", image: { src: "/images/sample/site-3.jpg", alt: "A finished Temer Properties apartment tower at sunset" } },
];

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const dict = getDictionary(lang);
  const steps = stepMeta.map((m, i) => ({ ...m, ...dict.home.steps[i] }));
  const [featured, listingCount, projects, locations, posts] = await Promise.all([
    getFeaturedProperties(12, lang),
    searchProperties({ pageSize: 1 }, lang),
    getProjects({}, lang),
    getLocations(lang),
    getPublishedPosts(3, lang),
  ]);
  const activeProjects = projects.filter((p) => p.status !== "delivered");
  // Two columns: keep an even count so every row is full (up to 12 -> 6 rows).
  const latest = featured.slice(0, featured.length - (featured.length % 2));
  const areas = locations.filter(isLocationIndexable).slice(0, 8);
  // "Property by area": the six areas with the most listings get a card (real counts, ranked); the rest become links.
  const rankedAreas = locations
    .filter(isLocationIndexable)
    .sort((a, b) => b.propertyCount - a.propertyCount || b.projectCount - a.projectCount || a.name.localeCompare(b.name));
  const topAreas = rankedAreas.slice(0, 6);
  const otherAreas = rankedAreas.slice(6);

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

      {/*
        Hero: sized to its content, directly below the thin header. The header's logo tab hangs ~4rem into it,
        so the wordmark starts below that.
        The background is a 3D render of Temer towers at dusk (4K, right edge trimmed so the towers sit right of
        centre; see scripts/generate-brand-assets.ts), anchored to the top so the rooftops stay in view and only the
        street at the bottom is cropped; it is the only hero image and is preloaded. A big "TEMER / PROPERTIES" wordmark sits in the sky at
        the top left; the copy sits low over the city, with one primary action.
        The wordmark is the start of the H1 ("Temer Properties: apartments, homes & shops for sale in Addis Ababa"),
        so the page's main heading names the brand people search for. The H1 spans the whole left column: wordmark
        at the top, headline pushed to the bottom.
      */}
      {/* On desktop, hero + gold title bar fill exactly one screen (100svh minus the 3.5rem header, its 2px line and
          the 3.5rem gold bar), so the fold lands on the gold bar's bottom edge instead of showing a sliver of the
          white search panel. Never shorter than its content (36rem). Phones keep the content height: their
          fixed contact bar covers the bottom of the screen anyway. */}
      <section className="hero-split relative isolate flex min-h-[30rem] flex-col overflow-hidden bg-logo-green text-white sm:min-h-[36rem] lg:min-h-[max(36rem,calc(100svh-7rem-2px))]">
        {/* The photo is the background of the whole hero, towers in the centre. Desktop: the text sits in a green
            card on the left, beside the towers (.hero-split in globals.css). */}
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroTowers}
            alt=""
            fill
            preload
            quality={90}
            sizes="100vw"
            placeholder="blur"
            className="object-cover object-[64%_top] lg:object-left-top"
          />
        </div>
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-logo-green/80 via-logo-green/30 to-transparent lg:hidden"
          aria-hidden="true"
        />
        {/* Phones: green fade behind the bottom copy. Desktop has no tint: the photo shows in full colour and the
            text sits in its own green card instead. */}
        <div
          className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-logo-green via-logo-green/75 to-transparent lg:hidden"
          aria-hidden="true"
        />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-14 lg:max-w-none">
          {/* Desktop: wordmark, headline and buttons sit in a white card in the left column, centred vertically beside
              the towers, with a logo-green card offset behind it (a hard box-shadow). The H1 (wordmark + headline)
              stays one element. */}
          <div className="grid flex-1 lg:grid-cols-[var(--hero-text)_minmax(0,1fr)_var(--hero-text)] lg:grid-rows-[1fr_auto_1fr] lg:gap-x-12">
            <div className="flex flex-col lg:col-start-1 lg:row-start-2 lg:bg-white lg:p-8 lg:text-ink lg:shadow-[1.25rem_1.25rem_0_0_var(--color-logo-green)]">
              <h1 className="flex flex-1 flex-col items-start lg:flex-none">
                <span className="hero-wordmark">
                  <span className="hero-wordmark__name">{dict.brand.name}</span>{" "}
                  <span className="hero-wordmark__sub">{dict.brand.sub}</span>
                </span>{" "}
                <span className="mt-auto block max-w-2xl pt-8 text-4xl font-bold leading-[1.05] sm:pt-12 sm:text-5xl lg:mt-0 lg:max-w-none lg:pt-10 lg:text-[clamp(2.25rem,3.2vw,3.75rem)]">
                  {dict.home.h1}
                </span>
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 lg:gap-x-5">
                <Link href="/properties" className={buttonStyles({ variant: "gold", size: "lg", className: "lg:h-11 lg:px-5 lg:text-sm" })}>
                  {dict.home.browse} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link href="/book-a-visit" className="inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-white underline-offset-4 hover:underline lg:text-sm lg:text-logo-green">
                  {dict.common.bookSiteVisit} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*
        Latest listings: a thin bar with the title beside the search filter (it submits to /properties), then
        a near-edge-to-edge two-column grid of photo cards (an even count, so every row is full). The old
        "Browse by type" grid is gone: the filter covers it, and the footer still links every /for-sale/* hub.
      */}
      <section className="pb-12 sm:pb-14">
        {/* Gold title bar, sized like the header (h-14) and flush with the hero, so it reads as this section's nav
            bar. Heading, search and tiles share one edge (12px from the screen), like the tiles themselves. */}
        <div className="bg-gold-500 text-brand-950">
          <div className="flex h-14 items-center justify-between gap-4 px-3">
            <div className="flex min-w-0 items-baseline gap-3">
              <h2 className="truncate text-2xl font-bold sm:text-3xl">{dict.home.latestTitle}</h2>
              <p className="hidden text-sm font-medium text-brand-950/75 sm:block">
                {dict.home.latestCount(listingCount.total)}
              </p>
            </div>
          </div>
        </div>
        <div className="p-3">
          <HomeSearch locations={areas} lang={lang} />
        </div>
        {latest.length ? (
          <ul className="grid gap-3 px-3 sm:grid-cols-2">
            {latest.map((p, i) => (
              <li key={p.id} className="aspect-[5/4]">
                <PropertyCard property={p} variant="tile" eager={i < 2} lang={lang} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {activeProjects.length ? (
        <section className="border-t border-line bg-soft py-12 sm:py-14">
          {/* Same left edge as the properties heading above, so both section titles line up down the page. */}
          <div className="px-3">
            <SectionHeading
              title={dict.home.projectsTitle}
              description={dict.home.projectsDesc}
              action={
                <Link href="/projects" className={buttonStyles({ variant: "outline" })}>
                  {dict.common.allProjects} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
          </div>
          {/* Slides rest for a few seconds, then glide to the next project. */}
          <SlideCarousel
            className="mt-8"
            label={dict.home.projectsTitle}
            slideClassName="h-[26rem] w-[min(56rem,88vw)] sm:h-[30rem]"
          >
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} variant="banner" lang={lang} />
            ))}
          </SlideCarousel>
        </section>
      ) : null}

      {topAreas.length ? (
        <section className="py-12 sm:py-14">
          {/* Same 12px edge as the property tiles and the other section headings. */}
          <div className="px-3">
            <SectionHeading
              title={dict.home.areaTitle}
              description={dict.home.areaDesc}
              action={
                <Link href="/locations" className={buttonStyles({ variant: "outline" })}>
                  {dict.common.allAreas} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topAreas.map((l, i) => (
                <li key={l.id}>
                  <LocationCard location={l} rank={i + 1} tint={i} lang={lang} />
                </li>
              ))}
            </ul>
            {otherAreas.length ? (
              <p className="mt-5 text-muted">
                {dict.home.alsoIn}
                {otherAreas.map((l) => (
                  <Link key={l.id} href={`/locations/${l.slug}`} className="ml-3 font-semibold text-ink underline underline-offset-4 hover:text-brand-700">
                    {localizedAreaName(lang, l.name)}
                  </Link>
                ))}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="border-t border-line py-12 sm:py-14">
        {/* Same 12px edge as the sections above. */}
        <div className="px-3">
          <SectionHeading
            title={dict.home.buyingTitle}
            description={dict.home.buyingDesc}
            action={
              <Link href="/book-a-visit" className={buttonStyles({ variant: "primary" })}>
                {dict.common.bookSiteVisit} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          {/* Ranked photo cards: a huge outlined step number stands outside each card's left edge and runs behind it,
              so the card covers its right side. The number is decoration (the <ol> and the sr-only label carry
              the order); a real photo on top, a black body below with the text and its next action. */}
          <ol className="mt-8 grid gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="group relative isolate flex pl-14 sm:pl-16">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-[0.04em] left-0 -z-10 select-none font-display text-[11rem] font-extrabold leading-[0.74] tracking-tighter text-white transition-colors duration-500 [-webkit-text-stroke:3px_var(--color-ink)] [paint-order:stroke_fill] group-hover:text-gold-400 sm:text-[13rem] xl:text-[15rem]"
                >
                  {i + 1}
                </span>
                <div className="flex flex-1 flex-col overflow-hidden bg-[#0b0d0c] text-white shadow-[-12px_0_24px_-12px_rgb(0_0_0/0.45)]">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={step.image.src}
                      alt={step.image.alt}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-3xl font-bold leading-tight">
                      <span className="sr-only">{dict.home.step(i + 1)}: </span>
                      {step.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-white/75">{step.text}</p>
                    <Link href={step.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-gold-400 hover:text-white">
                      {step.cta} <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <div>
              <h2 className="text-3xl font-bold text-ink sm:text-4xl">{dict.home.faqTitle}</h2>
              <p className="mt-3 text-muted">{dict.home.faqDesc}</p>
              <Link href="/faq" className={buttonStyles({ variant: "outline", className: "mt-5" })}>
                {dict.common.allQuestions} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <FaqList faqs={getGeneralFaqs(lang).filter((f) => ["Payments", "Visits", "Diaspora"].includes(f.group)).slice(0, 5)} openFirst />
          </div>
        </div>
      </section>

      {/* Company track record (site.stats). */}
      <section className="bg-brand-950 py-12 text-white sm:py-16">
        <Container>
          <dl className="grid grid-cols-3 gap-4 sm:gap-10">
            {site.stats.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center text-center">
                <dt className="text-xs text-white/65 sm:text-sm">{[dict.stats.customers, dict.stats.projects, dict.stats.units][i] ?? s.label}</dt>
                <dd className="order-first font-display text-3xl font-bold text-gold-400 sm:text-5xl lg:text-6xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {posts.length ? (
        <section className="py-16 sm:py-20">
          <Container>
            <SectionHeading
              title={dict.home.adviceTitle}
              action={
                <Link href="/blog" className={buttonStyles({ variant: "outline" })}>
                  {dict.common.allGuides} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <article className="relative h-full rounded-none p-6 ring-1 ring-line transition hover:shadow-lg">
                    {post.publishedAt ? (
                      <time dateTime={post.publishedAt.toISOString()} className="text-sm text-muted">
                        {formatDate(post.publishedAt, undefined, lang)}
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

      <section className="border-t border-line px-3 py-12 sm:py-14" aria-labelledby="visit-heading">
        {/* One message, one primary action, the phone number once. Same 12px edge as the sections above. */}
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-center bg-brand-950 p-8 text-white sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">{dict.home.comeAndSee}</p>
            <h2 id="visit-heading" className="mt-3 text-4xl font-bold leading-[1.05] sm:text-5xl">
              {dict.home.visitTitle}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/75">
              {dict.home.visitText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book-a-visit" className={buttonStyles({ variant: "gold", size: "lg" })}>
                <CalendarCheck2 className="size-5" aria-hidden="true" /> {dict.common.bookFreeVisit}
              </Link>
              <a
                href={whatsappLink("Hello Temer Properties, I would like to book a site visit.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 border border-white/45 px-6 text-base font-semibold text-white transition hover:bg-white hover:text-brand-950"
              >
                <WhatsAppIcon className="size-5" /> {dict.common.whatsappUs}
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-soft p-8 ring-1 ring-line sm:p-10">
            <h3 className="font-display text-3xl font-bold text-ink">{dict.home.visitOffice}</h3>
            <dl className="mt-6 grid gap-5 text-ink">
              <div className="flex gap-3">
                <dt className="mt-0.5 text-brand-700">
                  <MapPin className="size-5" aria-hidden="true" />
                  <span className="sr-only">{dict.home.addressLabel}</span>
                </dt>
                <dd>
                  {dict.office.street}
                  <br />
                  {dict.office.locality}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="mt-0.5 text-brand-700">
                  <Clock className="size-5" aria-hidden="true" />
                  <span className="sr-only">{dict.home.hoursLabel}</span>
                </dt>
                <dd>{dict.footer.hours}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="mt-0.5 text-brand-700">
                  <Phone className="size-5" aria-hidden="true" />
                  <span className="sr-only">{dict.home.phoneLabel}</span>
                </dt>
                <dd>
                  <a href={`tel:${site.contact.phone}`} className="font-semibold hover:text-brand-700 hover:underline">
                    {site.contact.phoneDisplay}
                  </a>
                </dd>
              </div>
            </dl>
            <a
              href={site.address.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ variant: "secondary", size: "lg", className: "mt-8 self-start" })}
            >
              <MapPin className="size-5" aria-hidden="true" /> {dict.home.directions}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

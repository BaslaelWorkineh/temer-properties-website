import type { Metadata } from "next";
import { ArrowRight, CalendarCheck2, Clock, MapPin, Phone } from "lucide-react";
import Image, { getImageProps } from "next/image";
import Link from "@/components/site/link";
import heroTowers from "@/assets/hero/towers-dusk.jpg";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { FaqList } from "@/components/site/faq-list";
import { JsonLd } from "@/components/site/json-ld";
import { LocationCard } from "@/components/site/location-card";
import { ProjectCard } from "@/components/site/project-card";
import { SyncedRows } from "@/components/site/scroll-row";
import { HomeSearch } from "@/components/site/home-search";
import { PropertyCard } from "@/components/site/property-card";
import { Container, SectionHeading } from "@/components/site/section";
import { buttonStyles } from "@/components/ui/button";
import { getGeneralFaqs } from "@/lib/content/faqs";
import { site, whatsappLink } from "@/lib/config/site";
import { getLocations, isLocationIndexable } from "@/lib/data/locations";
import { getPublishedPosts } from "@/lib/data/posts";
import { getProjects } from "@/lib/data/projects";
import { getFeaturedProperties, getProjectShowcases, searchProperties, type ShowcaseListing } from "@/lib/data/properties";
import type { ShowcaseRow } from "@/components/site/project-showcase";
import { ProjectList, type ListedProject, type ShopsBlock } from "@/components/site/project-list";
import { formatDate, formatPrice, formatPriceCompact } from "@/lib/format";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary, localizedAreaName, type Dictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo/metadata";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";

export const ensureStatic = "navigation";

/** The photo beside the shop offers on the home page: a Temer commercial building, glass-fronted shops on every floor. */
const SHOPS_IMAGE = {
  url: "/images/projects/commercial-center-shops.jpg",
  alt: "A Temer commercial building with glass-fronted shops on every floor and a large screen on its corner (3D render)",
};

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

/** Row order: studios and bedroom counts ascending, then shops, then anything else. */
const SHOP_ROW = 1000;
const OTHER_ROW = 1001;

/** Groups the showcase listings into one row per unit type (studio first, shops last), with prices formatted for the client. */
function toShowcaseRows(listings: ShowcaseListing[], t: Dictionary["home"]["showcase"], lang: Locale): ShowcaseRow[] {
  const groups = new Map<number, ShowcaseListing[]>();
  for (const l of listings) {
    const key = l.type === "shop" ? SHOP_ROW : (l.bedrooms ?? OTHER_ROW);
    groups.set(key, [...(groups.get(key) ?? []), l]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([bedrooms, items]) => {
      const areas = items.map((l) => l.areaSqm).filter((a): a is number => a != null);
      const prices = items.map((l) => l.price).filter((p): p is number => p != null && p > 0);
      const min = Math.min(...areas);
      const max = Math.max(...areas);
      const meta = [
        areas.length ? (min === max ? `${min} m²` : `${min}–${max} m²`) : null,
        prices.length ? `${t.from} ${formatPriceCompact(Math.min(...prices), lang)}` : null,
      ];
      return {
        key: String(bedrooms),
        label: bedrooms === SHOP_ROW ? t.shops : bedrooms === OTHER_ROW ? t.other : t.typology(bedrooms),
        meta: meta.filter(Boolean).join(" · "),
        units: groupByUnit(items).map(({ name, listings: same }) => ({
          key: String(same[0].id),
          name,
          summary: same[0].summary,
          options: same.map((l) => ({
            id: l.id,
            href: `/properties/${l.slug}`,
            caption: floorsOf(l.title) ?? (l.type === "shop" ? t.startingPrice : null),
            total: formatPrice(l.price, lang),
            advance:
              l.price && l.advancePercent
                ? `${t.advance(l.advancePercent)}: ${formatPrice(Math.round((l.price * l.advancePercent) / 100), lang)}`
                : null,
          })),
        })),
      };
    });
}

/** "Studio Apartment B-01, Floors 2–6" -> ["Studio Apartment B-01", "Floors 2–6"]; titles without a floor part stay whole. */
const FLOORS_SUFFIX = /^(.*\S),\s*(Floors?\s+\d+(?:\s*[–-]\s*\d+)?)$/;
const floorsOf = (title: string) => FLOORS_SUFFIX.exec(title)?.[2] ?? null;

/** The same unit offered on several floors shares one entry (in listing order); other listings get their own. */
function groupByUnit(listings: ShowcaseListing[]) {
  const units = new Map<string, { name: string; listings: ShowcaseListing[] }>();
  for (const l of listings) {
    const name = FLOORS_SUFFIX.exec(l.title)?.[1] ?? l.title;
    const key = `${name}|${l.summary ?? ""}`;
    const unit = units.get(key) ?? { name, listings: [] };
    unit.listings.push(l);
    units.set(key, unit);
  }
  return [...units.values()];
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang: rawLang } = await params;
  const lang: Locale = hasLocale(rawLang) ? rawLang : "en";
  const dict = getDictionary(lang);
  const heroCommon = { src: heroTowers, alt: "", fill: true, sizes: "100vw", placeholder: "blur" as const, className: "object-cover object-[64%_top] lg:object-left-top" };
  const { props: heroDesktop } = getImageProps({ ...heroCommon, quality: 90 });
  const { props: heroMobile } = getImageProps({ ...heroCommon, quality: 75, fetchPriority: "high", loading: "eager" });

  const steps = stepMeta.map((m, i) => ({ ...m, ...dict.home.steps[i] }));
  const [featured, showcases, listingCount, projects, locations, posts] = await Promise.all([
    getFeaturedProperties(12, lang),
    getProjectShowcases(lang),
    searchProperties({ pageSize: 1 }, lang),
    getProjects({}, lang),
    getLocations(lang),
    getPublishedPosts(3, lang),
  ]);
  // Our projects: every project over two sliding rows (the top row larger). The first project listed above
  // leads, then the admin's featured ones, then projects still selling or being built, then delivered ones.
  const firstSlug = showcases[0]?.project.slug;
  const homeProjects = [...projects]
    .sort(
      (a, b) =>
        Number(b.slug === firstSlug) - Number(a.slug === firstSlug) ||
        Number(b.isFeatured) - Number(a.isFeatured) ||
        Number(a.status === "delivered") - Number(b.status === "delivered"),
    );
  const topProjects = homeProjects.slice(0, Math.ceil(homeProjects.length / 2));
  const bottomProjects = homeProjects.slice(topProjects.length);
  // Fallback grid (no listing belongs to a project): an even count so every row of two is full.
  const latest = featured.slice(0, featured.length - (featured.length % 2));
  const locationOf = (s: (typeof showcases)[number]) => (s.project.locationName ? `${s.project.locationName}, ${site.address.locality}` : null);
  // Shops are shown together in one block (one card per site, cheapest first); the project blocks list the homes.
  const listedProjects: ListedProject[] = showcases
    .map((s) => ({
      slug: s.project.slug,
      name: s.project.name,
      location: locationOf(s),
      images: s.project.images,
      rows: toShowcaseRows(
        s.listings.filter((l) => l.type !== "shop"),
        dict.home.showcase,
        lang,
      ),
    }))
    .filter((p) => p.rows.length);
  const shopListings = showcases
    .flatMap((s) => s.listings.filter((l) => l.type === "shop").map((l) => ({ l, s })))
    .sort((a, b) => (a.l.price ?? Infinity) - (b.l.price ?? Infinity));
  const shopPrices = shopListings.map(({ l }) => l.price).filter((p): p is number => p != null && p > 0);
  const shops: ShopsBlock | null = shopListings.length
    ? {
        title: dict.home.showcase.shopsTitle,
        intro: dict.home.showcase.shopsIntro(
          shopListings.length,
          shopPrices.length ? formatPriceCompact(Math.min(...shopPrices), lang) : null,
        ),
        image: SHOPS_IMAGE,
        offers: shopListings.map(({ l, s }) => ({
          id: l.id,
          href: `/properties/${l.slug}`,
          project: s.project.name,
          location: locationOf(s),
          summary: l.summary,
          caption: dict.home.showcase.startingPrice,
          total: formatPrice(l.price, lang),
          advance:
            l.price && l.advancePercent
              ? `${dict.home.showcase.advance(l.advancePercent)}: ${formatPrice(Math.round((l.price * l.advancePercent) / 100), lang)}`
              : null,
        })),
      }
    : null;
  // A listing can stand for several homes (one plan on a band of floors), so a project that gives its unit count counts
  // as that many homes (never fewer than its listings); listings outside a project count one each.
  const availableCount =
    listingCount.total +
    showcases.reduce((sum, s) => sum + Math.max(0, (s.project.totalUnits ?? 0) - s.listings.length), 0);
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
        {/* Art direction: desktop (lg and up) keeps the sharp quality-90 photo; phones get a lighter quality-75 copy so
            the hero (the page's largest paint) arrives sooner on slow mobile connections. A <picture> fetches only one
            source, and fetchPriority="high" starts that request as soon as the HTML is read. */}
        <picture className="absolute inset-0 -z-10 block">
          <source media="(min-width: 1024px)" srcSet={heroDesktop.srcSet} sizes="100vw" />
          <img {...heroMobile} alt="" />
        </picture>
        {/* Phones: the photo keeps its true colours (no green tint, like desktop). Only a soft neutral dark fade sits
            behind the bottom copy so the white text stays readable. Desktop has no overlay: the text sits in its own
            card instead. */}
        <div
          className="absolute inset-x-0 bottom-0 -z-10 h-3/5 bg-gradient-to-t from-black/70 via-black/35 to-transparent lg:hidden"
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
        Latest listings, three flush bands: the gold title bar (how many properties are available, and a button to the
        full list), the search filter (it submits to /properties), then (when listings belong to projects) every
        project with something for sale, one after the other (see ProjectList): a title bar with its name, then two flush halves,
        the building render beside its unit types (sides alternate), each type a row that opens to list every
        unit with its total price and the advance. Without such a project it falls back to a two-column grid of photo cards.
      */}
      <section className="pb-12 sm:pb-14">
        {/* Gold title bar, flush with the hero so it reads as this section's nav bar. */}
        <div className="bg-gold-500 text-brand-950">
          <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-3">
              <h2 className="text-2xl font-bold sm:text-3xl">{dict.home.latestTitle}</h2>
              <p className="text-sm font-medium text-brand-950/75">{dict.home.latestCount(availableCount)}</p>
            </div>
            <Link href="/properties" className={buttonStyles({ variant: "secondary", size: "sm", className: "shrink-0" })}>
              {dict.home.viewAvailable}
            </Link>
          </div>
        </div>
        <HomeSearch locations={areas} lang={lang} className="ring-0" />
        {listedProjects.length || shops ? (
          <ProjectList
            projects={listedProjects}
            shops={shops}
            labels={{
              forSaleIn: dict.home.showcase.forSaleIn,
              viewProject: dict.home.showcase.viewProject,
              total: dict.home.showcase.total,
            }}
          />
        ) : latest.length ? (
          <ul className="grid gap-3 p-3 sm:grid-cols-2">
            {latest.map((p, i) => (
              <li key={p.id} className="aspect-[5/4]">
                <PropertyCard property={p} variant="tile" eager={i < 2} lang={lang} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {homeProjects.length ? (
        /*
          Our projects, built like the latest-properties section: a green title bar (how many projects, and a button to
          all of them), then two rows of project cards the visitor scrolls sideways together.
        */
        <section>
          {/* Green bar (heading, count, arrows and "View all projects") and the two rows of project cards, which the
              visitor scrolls sideways together: three large cards across the top, four smaller ones across the
              bottom, 16px apart. Widths are shares of the row minus its 16px side padding and the gaps. */}
          <SyncedRows
            labels={{ previous: dict.home.projectsPrevious, next: dict.home.projectsNext }}
            title={
              <>
                <h2 className="text-2xl font-bold sm:text-3xl">{dict.home.projectsTitle}</h2>
                <p className="text-sm font-medium text-white/75">{dict.home.projectsCount(projects.length)}</p>
              </>
            }
            action={
              <Link href="/projects" className={buttonStyles({ variant: "gold", size: "sm" })}>
                {dict.home.viewAllProjects}
              </Link>
            }
            top={topProjects.map((p) => (
              <li key={p.id} className="h-[24rem] w-[85%] shrink-0 sm:h-[28rem] sm:w-[calc((100%-3rem)/2)] lg:w-[calc((100%-4rem)/3)]">
                <ProjectCard project={p} variant="banner" lang={lang} />
              </li>
            ))}
            bottom={bottomProjects.map((p) => (
              <li key={p.id} className="h-[18rem] w-[70%] shrink-0 sm:w-[calc((100%-4rem)/3)] lg:h-[20rem] lg:w-[calc((100%-5rem)/4)]">
                <ProjectCard project={p} variant="banner" compact lang={lang} />
              </li>
            ))}
          />
        </section>
      ) : null}

      {topAreas.length ? (
        <section className="pb-12 pt-8 sm:pb-14 sm:pt-10">
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
          {/* Ranked photo cards: a huge outlined step number stands outside each card's left edge. The gutter is wide
              enough to show the whole digit (a 4 keeps its stem and crossbar on the right), so only its edge tucks
              behind the card. The number is decoration (the <ol> and the sr-only label carry
              the order); a real photo on top, a black body below with the text and its next action. */}
          <ol className="mt-8 grid gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="group relative isolate flex pl-24 sm:pl-28 xl:pl-32">
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

      {site.stats.length ? (
        <>
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
        </>
      ) : null}

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

import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "@/components/site/link";
import {
  ProjectShowcase,
  type ShowcaseRow,
} from "@/components/site/project-showcase";

export type ListedProject = {
  slug: string;
  name: string;
  /** "Megenagna, Addis Ababa" */
  location: string | null;
  /** The project photos, the main one first. */
  images: { url: string; alt: string }[];
  rows: ShowcaseRow[];
};

/** One shop offer in the shops block: the shops of one project, from a starting price. */
export type ShopOffer = {
  id: number;
  href: string;
  project: string;
  location: string | null;
  /** "From ETB 2.5 million · 25% down payment, then 1% a month" */
  summary: string | null;
  caption: string | null;
  total: string;
  advance: string | null;
};

export type ShopsBlock = {
  title: string;
  /** "From ETB 2.5M · 25% down payment, then 1% a month" */
  intro: string;
  image: { url: string; alt: string };
  offers: ShopOffer[];
};

type Labels = { forSaleIn: string; viewProject: string; total: string };

/** Projects with at most this many listings get a compact card instead of the full block. */
const COMPACT_MAX = 3;
/** Projects with at most this many listings show every unit as a card in their block. */
const OPEN_MAX = 12;

/** Title bar colours, cycled so neighbouring blocks never look the same. */
const BARS = ["bg-brand-800", "bg-brand-950", "bg-logo-green"];
const CARD_BODIES = ["bg-brand-950", "bg-brand-800", "bg-logo-green"];

/**
 * The home page's projects for sale, one after the other so none is missed:
 * - Projects with many listings get the full block: a coloured title bar, then the building photo beside its unit
 *   types (each row opens to list every unit). The photo swaps sides and the bar changes colour from one block to the
 *   next; the first block is a full screen tall, the others a little shorter.
 * - Projects with a few listings (shops, a couple of units) share a row of tall photo cards with their listings shown
 *   directly.
 * Server-rendered, so every listing link is in the HTML.
 */
export function ProjectList({
  projects,
  shops,
  labels,
}: {
  projects: ListedProject[];
  shops: ShopsBlock | null;
  labels: Labels;
}) {
  const count = (p: ListedProject) =>
    p.rows.reduce(
      (n, r) => n + r.units.reduce((m, u) => m + u.options.length, 0),
      0,
    );
  const large = projects.filter((p) => count(p) > COMPACT_MAX);
  const compact = projects.filter((p) => count(p) <= COMPACT_MAX);
  // Last row, three columns on large screens: the shops block takes two of them, the compact cards fill the rest.
  const cells = compact.length + (shops ? 2 : 0);
  // A project with few units (OPEN_MAX or fewer) lists them all as cards instead of folded rows, and shares a row
  // with the project listed just before it (when that one is not already paired).
  const open = (p: ListedProject) => !p.images.length || count(p) <= OPEN_MAX;
  const groups: ListedProject[][] = [];
  for (const p of large) {
    const last = groups.at(-1);
    if (open(p) && last?.length === 1) last.push(p);
    else groups.push([p]);
  }
  const block = (q: ListedProject, half = false) => (
    <LargeProject
      key={q.slug}
      project={q}
      index={large.indexOf(q)}
      number={projects.indexOf(q) + 1}
      half={half}
      open={open(q)}
      labels={labels}
    />
  );

  return (
    <div className="space-y-3 bg-white">
      {groups.map((group) =>
        group.length === 1 ? (
          block(group[0])
        ) : (
          <div key={group[0].slug} className="grid gap-3 lg:grid-cols-2">
            {group.map((q) => block(q, true))}
          </div>
        ),
      )}
      {cells ? (
        // With the shops block, the row is one flush band of a fixed height on large screens: no gaps, and the photos
        // stretch or shrink to fill it, so neither side leaves empty space.
        <ul
          className={`grid px-3 pt-1 sm:grid-cols-2 ${cells >= 3 ? "lg:grid-cols-3" : ""} ${shops ? "gap-3 lg:h-[46rem] lg:gap-0" : "gap-3"}`}
        >
          {shops ? (
            <li className="min-h-0 sm:col-span-2">
              <Shops block={shops} />
            </li>
          ) : null}
          {compact.map((p, i) => (
            <li
              key={p.slug}
              className={cells === 1 ? "sm:col-span-2 sm:max-w-xl" : "min-h-0"}
            >
              <CompactProject
                project={p}
                index={i + 1}
                fit={Boolean(shops)}
                labels={labels}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Every shop offer together: a gold title bar with the shared terms, then the shops photo beside a card per site
 * (where, from what price, the down payment), each linking to its listing.
 */
function Shops({ block }: { block: ShopsBlock }) {
  return (
    <article
      aria-labelledby="shops-for-sale"
      className="flex h-full flex-col bg-gold-500 text-brand-950"
    >
      <div className="px-4 py-4 sm:px-5">
        <h3
          id="shops-for-sale"
          className="text-3xl font-extrabold uppercase leading-none tracking-wide sm:text-4xl"
        >
          {block.title}
        </h3>
        <p className="mt-2 text-sm font-semibold text-brand-950/80">
          {block.intro}
        </p>
      </div>
      <div className="grid min-h-0 flex-1 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="relative aspect-[4/5] border-8 border-b-0 border-logo-green bg-brand-950 sm:aspect-auto sm:border-b-8 sm:border-r-0">
          <Image
            src={block.image.url}
            alt={block.image.alt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
        <ul className="grid content-start gap-4 bg-brand-950 p-4 pr-6 sm:grid-cols-1">
          {block.offers.map((o) => (
            <li
              key={o.id}
              className="bg-white text-brand-950 shadow-[0.5rem_0.5rem_0_0_var(--color-gold-500)]"
            >
              <Link
                href={o.href}
                className="group flex flex-wrap items-end justify-between gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-brand-700 hover:text-white"
              >
                <span className="min-w-0">
                  <span className="block text-lg font-extrabold uppercase leading-tight tracking-wide">
                    {o.project}
                  </span>
                  {o.location ? (
                    <span className="mt-0.5 flex items-center gap-1 text-sm text-brand-950/70 group-hover:text-white/85">
                      <MapPin
                        className="size-3.5 shrink-0 text-gold-600 group-hover:text-gold-300"
                        aria-hidden="true"
                      />
                      {o.location}
                    </span>
                  ) : null}
                  {o.summary ? (
                    <span className="mt-1 block text-xs text-brand-950/70 group-hover:text-white/85">
                      {o.summary}
                    </span>
                  ) : null}
                </span>
                <span className="text-right">
                  {o.caption ? (
                    <span className="block text-xs font-semibold uppercase tracking-wide text-gold-600 group-hover:text-gold-300">
                      {o.caption}
                    </span>
                  ) : null}
                  <span className="block text-xl font-bold tabular-nums">
                    {o.total}
                  </span>
                  {o.advance ? (
                    <span className="block text-xs tabular-nums text-brand-950/70 group-hover:text-white/85">
                      {o.advance}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function LargeProject({
  project: p,
  index,
  number,
  half = false,
  open = false,
  labels,
}: {
  project: ListedProject;
  index: number;
  number: number;
  /** Shares its row with another project: a smaller title. */
  half?: boolean;
  /** Lists every unit as a card instead of folded rows by type. */
  open?: boolean;
  labels: Labels;
}) {
  const image = p.images[0] ?? null;
  const flipped = index % 2 === 1;
  // Photo frames alternate gold and green from one block to the next.
  const frame = index % 2 === 0 ? "border-gold-500" : "border-logo-green";
  return (
    <article
      aria-labelledby={`project-${p.slug}`}
      className={half ? "flex h-full flex-col" : undefined}
    >
      {/* Side by side, both bars keep the same height (one line of title at this width). */}
      <div
        className={`${BARS[index % BARS.length]} relative overflow-hidden text-white ${half ? "flex-none" : ""}`}
      >
        {/* The project's place in the list, as a large faint number behind the bar. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 right-40 select-none font-display text-[8rem] font-extrabold leading-none text-white/10 max-sm:hidden"
        >
          {String(number).padStart(2, "0")}
        </span>
        <div className="relative flex min-h-28 flex-wrap items-end justify-between gap-x-6 gap-y-3 px-3 py-4">
          <div className="min-w-0">
            <h3
              id={`project-${p.slug}`}
              className={`text-3xl font-extrabold uppercase leading-none tracking-wide sm:text-5xl ${half ? "lg:text-4xl" : ""}`}
            >
              <span className="text-gold-300">{labels.forSaleIn}</span> {p.name}
            </h3>
            {p.location ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-white/80">
                <MapPin
                  className="size-4 shrink-0 text-gold-300"
                  aria-hidden="true"
                />
                {p.location}
              </p>
            ) : null}
          </div>
          <Link
            href={`/projects/${p.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-gold-300 underline-offset-4 hover:text-white hover:underline"
          >
            {labels.viewProject}{" "}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
      {/* Fixed height on large screens; the one row track is capped (minmax 0) so an open list scrolls inside the
          typology column instead of stretching the block over what follows. Half width (sharing a row): the photo
          sits above the unit rows instead of beside them. */}
      <div
        className={
          half
            ? // Half width: no fixed height. A block that lists every unit sets the row height; the other stretches to
              // match (never under 34rem, so its unit rows keep room).
              "flex flex-col lg:min-h-[34rem] lg:flex-1"
            : `grid lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] ${
                // Without a photo every unit is listed, so the block grows with its cards.
                index === 0
                  ? "lg:h-[calc(100svh-3.5rem)] lg:max-h-[56rem] lg:min-h-[40rem]"
                  : image && !open
                    ? "lg:h-[42rem]"
                    : ""
              }`
        }
      >
        {image ? (
          <div
            className={
              half
                ? `relative aspect-[16/10] shrink-0 border-8 border-b-0 ${frame} bg-brand-950 lg:aspect-auto ${open ? "lg:h-[24rem]" : "lg:min-h-[24rem] lg:flex-1"}`
                : `relative aspect-[16/10] border-8 ${frame} bg-brand-950 lg:aspect-auto ${flipped ? "lg:order-last lg:border-l-0" : "lg:border-r-0"}`
            }
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={`object-cover ${half ? "object-[50%_8%]" : "object-[46%_center]"}`}
            />
          </div>
        ) : null}
        <div
          className={
            half
              ? image && !open
                ? // Folded rows keep a fixed height; when the neighbour is taller, the photo above grows instead.
                  "lg:h-[26rem] lg:flex-none"
                : "lg:flex-1"
              : image
                ? "min-h-0"
                : "min-h-0 lg:col-span-2"
          }
        >
          {/* Few units (or no photo): every unit is shown at once instead of folded by type. */}
          {image && !open ? (
            <ProjectShowcase
              image={image}
              rows={p.rows}
              labels={{ total: labels.total }}
            />
          ) : (
            <UnitList rows={p.rows} labels={labels} />
          )}
        </div>
      </div>
    </article>
  );
}

/** Every unit of a project, grouped by type, each a card linking to its listing. Grows with its cards (no inner scroll). */
function UnitList({ rows, labels }: { rows: ShowcaseRow[]; labels: Labels }) {
  return (
    <div className="h-full bg-gold-500/90 px-4 py-5 text-brand-950 [scrollbar-width:thin] sm:px-6">
      {rows.map((row) => (
        <section key={row.key} className="mb-5 last:mb-0">
          <h4 className="flex flex-wrap items-baseline gap-x-3 border-b-4 border-brand-950 pb-2">
            <span className="text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">
              {row.label}
            </span>
            <span className="text-sm font-medium text-brand-950/75">
              {row.meta}
            </span>
          </h4>
          <ul className="mt-4 mr-2 grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
            {row.units.flatMap((u) =>
              u.options.map((o) => (
                <li
                  key={o.id}
                  className="bg-white shadow-[0.5rem_0.5rem_0_0_var(--color-logo-green)]"
                >
                  <Link
                    href={o.href}
                    className="group block px-3 py-2 transition-colors hover:bg-brand-700 hover:text-white"
                  >
                    <span className="block font-semibold">{u.name}</span>
                    {u.summary ? (
                      <span className="block text-xs text-brand-950/70 group-hover:text-white/85">
                        {u.summary}
                      </span>
                    ) : null}
                    {o.caption ? (
                      <span className="block text-xs font-semibold uppercase tracking-wide text-gold-600 group-hover:text-gold-300">
                        {o.caption}
                      </span>
                    ) : null}
                    <span className="block font-bold tabular-nums">
                      <span className="sr-only">{labels.total}: </span>
                      {o.total}
                    </span>
                    {o.advance ? (
                      <span className="block text-xs tabular-nums text-brand-950/70 group-hover:text-white/85">
                        {o.advance}
                      </span>
                    ) : null}
                  </Link>
                </li>
              )),
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** fit: in the flush band beside the shops, the photo takes whatever height the listings leave (large screens). */
function CompactProject({
  project: p,
  index,
  fit = false,
  labels,
}: {
  project: ListedProject;
  index: number;
  fit?: boolean;
  labels: Labels;
}) {
  const [main] = p.images;
  const units = p.rows.flatMap((r) => r.units);
  return (
    <article
      aria-labelledby={`project-${p.slug}`}
      className={`flex h-full flex-col text-white ${CARD_BODIES[index % CARD_BODIES.length]}`}
    >
      <div
        className={`relative aspect-[4/5] overflow-hidden bg-brand-900 ${fit ? "lg:aspect-auto lg:min-h-0 lg:flex-1" : ""}`}
      >
        {main ? (
          <Image
            src={main.url}
            alt={main.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3
            id={`project-${p.slug}`}
            className="text-3xl font-extrabold uppercase leading-none tracking-wide sm:text-4xl"
          >
            <span className="block text-base text-gold-300">
              {labels.forSaleIn}
            </span>{" "}
            {p.name}
          </h3>
          {p.location ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-white/85">
              <MapPin
                className="size-4 shrink-0 text-gold-300"
                aria-hidden="true"
              />
              {p.location}
            </p>
          ) : null}
        </div>
      </div>
      <div
        className={`flex flex-col gap-4 p-4 ${fit ? "flex-1 lg:flex-none" : "flex-1"}`}
      >
        <ul className="grid gap-4">
          {units.flatMap((u) =>
            u.options.map((o) => (
              <li
                key={o.id}
                className="mr-2 bg-white text-brand-950 shadow-[0.5rem_0.5rem_0_0_var(--color-gold-500)]"
              >
                <Link
                  href={o.href}
                  className="group block px-4 py-3 transition-colors hover:bg-brand-700 hover:text-white"
                >
                  <span className="block font-semibold">{u.name}</span>
                  {u.summary ? (
                    <span className="block text-sm text-brand-950/70 group-hover:text-white/85">
                      {u.summary}
                    </span>
                  ) : null}
                  {o.caption ? (
                    <span className="mt-2 block text-xs font-semibold uppercase tracking-wide text-gold-600 group-hover:text-gold-300">
                      {o.caption}
                    </span>
                  ) : null}
                  <span
                    className={`block text-xl font-bold tabular-nums ${o.caption ? "" : "mt-2"}`}
                  >
                    <span className="sr-only">{labels.total}: </span>
                    {o.total}
                  </span>
                  {o.advance ? (
                    <span className="block text-xs tabular-nums text-brand-950/70 group-hover:text-white/85">
                      {o.advance}
                    </span>
                  ) : null}
                </Link>
              </li>
            )),
          )}
        </ul>
        <Link
          href={`/projects/${p.slug}`}
          className="mt-auto inline-flex items-center gap-1.5 self-start text-sm font-bold text-gold-300 underline-offset-4 hover:text-white hover:underline"
        >
          {labels.viewProject}{" "}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

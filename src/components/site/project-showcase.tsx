"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "@/components/site/link";

export type ShowcaseRow = {
  key: string;
  /** "Studio", "2 Bedroom"… */
  label: string;
  /** "68–80 m² · from ETB 7.3M" */
  meta: string;
  /** One entry per unit; its listings are the same unit on different floors ("Floors 2–6"…), each with its own page. */
  units: {
    key: string;
    name: string;
    summary: string | null;
    options: { id: number; href: string; floors: string | null; total: string; advance: string }[];
  }[];
};

/** Minimum height of a title bar: a full-size title plus its padding. */
const TITLE_BAR = 64;
/** The title button's vertical padding (py-3, top and bottom). */
const TITLE_PADDING = 24;
/** Each row's bottom border (border-b-4); the last row has none. */
const BORDER = 4;
/** Matches duration-500. */
const DURATION = 500;

/** What an open row wants: the height of its title bar, and of the whole row (title bar, full list and border). */
function measureOpen(container: HTMLElement | null, key: string) {
  const row = container?.querySelector<HTMLElement>(`[data-row="${key}"]`);
  const list = row?.querySelector<HTMLElement>(":scope > ul");
  const title = row?.querySelector<HTMLElement>("h4 button > span");
  if (!row || !list) return null;
  const bar = Math.max(TITLE_BAR, (title?.offsetHeight ?? 0) + TITLE_PADDING);
  return { bar, row: bar + list.scrollHeight + (row.offsetHeight - row.clientHeight) };
}

/**
 * Pixel heights for every row and its title, always summing to the column height. Closed: equal rows, each title
 * filling its row. Open: that row gets its full height (capped so the others keep a title bar each) and its title a
 * bar; the others share the rest. Animating every row between two such layouts keeps the total constant, so rows
 * slide in lockstep with no jumps at the start or the end.
 */
function layout(count: number, box: number, openIndex: number, want: { bar: number; row: number } | null) {
  const border = (i: number) => (i === count - 1 ? 0 : BORDER);
  if (openIndex < 0 || !want) {
    const each = box / count;
    return Array.from({ length: count }, (_, i) => ({ row: each, title: each - border(i) }));
  }
  const othersMin = Array.from({ length: count }, (_, i) => (i === openIndex ? 0 : TITLE_BAR + border(i))).reduce((a, b) => a + b, 0);
  const openRow = Math.max(want.bar + border(openIndex), Math.min(want.row, box - othersMin));
  const other = (box - openRow) / (count - 1);
  return Array.from({ length: count }, (_, i) =>
    i === openIndex ? { row: openRow, title: want.bar } : { row: other, title: other - border(i) },
  );
}

/**
 * The typology column beside the building photo: one row per unit type over a single copy of the building render
 * (under a constant 80% gold shade), split by solid green bars so the picture reads as broken into bands.
 *
 * Rows start equal. Opening one animates it to exactly the height of its listings (scrolling inside when that is more
 * than the column holds) while its title slides up into a bar and the other rows are pushed into the space that is
 * left; switching rows or closing animates the same way. Every row and title runs to a measured pixel height, and
 * a list only becomes scrollable once its row has settled, so no scrollbar flickers mid-animation.
 * Every listing stays in the HTML (closed lists are only invisible), so crawlers still follow each listing link.
 */
export function ProjectShowcase({
  image,
  rows,
  labels,
}: {
  image: { url: string; alt: string } | null;
  rows: ShowcaseRow[];
  labels: { total: string; advance: string };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<number | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [want, setWant] = useState<{ bar: number; row: number } | null>(null);
  // The row animating closed keeps its list visible until it has shrunk away; lists scroll only once settled.
  const [closing, setClosing] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function toggle(key: string) {
    const next = open === key ? null : key;
    setClosing(open);
    setMoving(true);
    if (next) {
      const list = containerRef.current?.querySelector<HTMLElement>(`[data-row="${next}"] > ul`);
      if (list) list.scrollTop = 0;
      setWant(measureOpen(containerRef.current, next));
    }
    setOpen(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setClosing(null);
      setMoving(false);
    }, DURATION);
  }

  // Track the column height (and the open row's needs, which change when its list rewraps at a new width).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      setBox(container.clientHeight);
      if (open) setWant(measureOpen(container, open));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const openIndex = rows.findIndex((r) => r.key === open);
  const sizes = box != null ? layout(rows.length, box, openIndex, want) : null;

  return (
    <div ref={containerRef} className="relative isolate flex h-[38rem] flex-col overflow-hidden bg-brand-900 text-brand-950 lg:h-full">
      {image ? (
        <Image
          src={image.url}
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          // Zoomed in on the façade so it reads as texture behind the rows, not as a second copy of the photo beside it.
          className="-z-10 origin-[50%_42%] scale-[2.6] object-cover object-[46%_center] opacity-60 mix-blend-luminosity"
        />
      ) : null}
      {rows.map((row, i) => {
        const isOpen = open === row.key;
        const squeezed = open !== null && !isOpen;
        const listShown = isOpen || closing === row.key;
        const panelId = `showcase-${row.key}`;
        const size = sizes?.[i];
        return (
          <section
            key={row.key}
            data-row={row.key}
            // Before the column is measured (server HTML), rows share it equally through flex-grow.
            style={size ? { flex: `0 0 ${size.row}px` } : undefined}
            className={`relative flex flex-col overflow-hidden border-b-4 border-brand-950 transition-[flex-basis] duration-500 ease-in-out last:border-b-0 motion-reduce:transition-none ${size ? "" : "grow basis-0"}`}
          >
            {/* A constant 80% gold shade over the photo, the same whether the row is open or closed. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gold-500/80" />
            {/* The title fills a closed row (centred) and eases up into a title bar as the row opens. */}
            <h4
              style={size ? { flex: `0 0 ${size.title}px` } : undefined}
              className={`relative flex transition-[flex-basis] duration-500 ease-in-out motion-reduce:transition-none ${size ? "" : "grow"}`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(row.key)}
                className="group flex w-full items-center justify-between gap-4 px-5 py-3 text-left transition-colors hover:bg-brand-700/90 hover:text-white sm:px-7"
              >
                <span className="flex min-w-0 flex-wrap items-baseline gap-x-4">
                  <span className="text-3xl font-extrabold uppercase tracking-wide sm:text-4xl">{row.label}</span>
                  {/* A squeezed row is one title bar tall: on phones the summary would wrap and be cut off, so it folds away. */}
                  <span
                    className={`overflow-hidden text-sm font-medium text-brand-950/75 transition-[color,opacity,max-height] duration-500 group-hover:text-white/85 sm:max-h-10 sm:opacity-100 ${squeezed ? "max-h-0 opacity-0" : "max-h-10 opacity-100"}`}
                  >
                    {row.meta}
                  </span>
                </span>
                <ChevronDown
                  className={`size-6 shrink-0 text-brand-950 transition-[transform,color] duration-500 group-hover:text-white ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </h4>
            <ul
              id={panelId}
              className={
                listShown
                  ? `relative min-h-0 flex-1 overscroll-contain px-5 pb-3 [scrollbar-color:rgb(16_34_25/0.25)_transparent] [scrollbar-width:thin] sm:px-7 ${isOpen && !moving ? "overflow-y-auto" : "overflow-hidden"}`
                  : "invisible absolute inset-x-0 top-0 px-5 pb-3 sm:px-7"
              }
            >
              {row.units.map((u) => (
                <li key={u.key} className="border-t border-brand-950/20 py-3">
                  <p className="font-semibold">{u.name}</p>
                  {u.summary ? <p className="text-sm text-brand-950/75">{u.summary}</p> : null}
                  {/* The unit's floor bands side by side, each linking to its own listing: separate white cards, each on a solid
                      logo-green offset layer like the hero card. */}
                  <ul className={`mt-2 mb-2 mr-2 grid gap-x-5 gap-y-4 ${u.options.length > 1 ? "sm:grid-cols-3" : ""}`}>
                    {u.options.map((o) => (
                      <li key={o.id} className="bg-white text-brand-950 shadow-[0.5rem_0.5rem_0_0_var(--color-logo-green)]">
                        <Link href={o.href} className="group block px-3 py-2 transition-colors hover:bg-brand-700 hover:text-white">
                          {o.floors ? <span className="block text-xs font-semibold uppercase tracking-wide text-gold-600 transition-colors group-hover:text-gold-300">{o.floors}</span> : null}
                          <span className="block font-bold tabular-nums">
                            <span className="sr-only">{labels.total}: </span>
                            {o.total}
                          </span>
                          <span className="block text-xs tabular-nums text-brand-950/70 transition-colors group-hover:text-white/85">
                            {labels.advance}: {o.advance}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

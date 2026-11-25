"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
  type UIEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Hidden scrollbar, sideways scrolling only (the page still scrolls vertically over the rows). */
const rowStyles =
  "flex gap-4 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const arrowStyles =
  "inline-flex size-9 items-center justify-center border border-white/30 text-white transition hover:bg-white hover:text-brand-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const noop = () => () => {};

/** Copies of a row's cards for the loop: hidden from screen readers and keyboard focus. */
function copies(items: ReactNode, copy: string) {
  return Children.map(items, (child) =>
    isValidElement(child)
      ? cloneElement(child as ReactElement<Record<string, unknown>>, { key: `${copy}-${child.key}`, "aria-hidden": true, inert: true })
      : child,
  );
}

/** Width of one full set of cards in a looping row: from the first card of the middle set to the first of the last. */
function cycleOf(row: HTMLElement, count: number) {
  const cards = row.children;
  const first = cards[count] as HTMLElement | undefined;
  const next = cards[count * 2] as HTMLElement | undefined;
  return first && next ? next.offsetLeft - first.offsetLeft : 0;
}

/**
 * The green title bar plus two rows of cards that the visitor scrolls sideways (trackpad, touch, shift + wheel, or the
 * arrow buttons in the bar). Both rows loop: once mounted each holds three sets of its cards and, when the visitor
 * nears either end, jumps by exactly one set, which looks the same, so there is no end. Scrolling either row moves
 * the other in proportion to its own set width, so the row of smaller cards moves at its own, slower speed and both
 * wrap together. The server HTML holds one set only (no duplicate links for crawlers).
 */
export function SyncedRows({
  title,
  action,
  top,
  bottom,
  labels,
}: {
  /** Left side of the bar: heading and count. */
  title: ReactNode;
  /** Right side of the bar, after the arrows: the "View all" link. */
  action: ReactNode;
  top: ReactNode;
  bottom: ReactNode;
  labels: { previous: string; next: string };
}) {
  const topRef = useRef<HTMLUListElement>(null);
  const bottomRef = useRef<HTMLUListElement>(null);
  // The row the visitor is moving; the other row's scroll events (caused by following it) are ignored meanwhile.
  const driver = useRef<HTMLElement | null>(null);
  const release = useRef<ReturnType<typeof setTimeout>>(undefined);
  // True in the browser after hydration, false in the server HTML: the copies are added only on the client.
  const looping = useSyncExternalStore(noop, () => true, () => false);
  const topCount = Children.count(top);
  const bottomCount = Children.count(bottom);

  // Once the copies are in, start both rows on their middle set.
  useLayoutEffect(() => {
    if (!looping) return;
    const t = topRef.current;
    const b = bottomRef.current;
    if (t) t.scrollLeft = cycleOf(t, topCount);
    if (b) b.scrollLeft = cycleOf(b, bottomCount);
  }, [looping, topCount, bottomCount]);

  function follow(event: UIEvent<HTMLUListElement>) {
    const source = event.currentTarget;
    if (driver.current && driver.current !== source) return;
    driver.current = source;
    const isTop = source === topRef.current;
    const other = isTop ? bottomRef.current : topRef.current;
    const sourceCycle = looping ? cycleOf(source, isTop ? topCount : bottomCount) : 0;
    const otherCycle = looping && other ? cycleOf(other, isTop ? bottomCount : topCount) : 0;

    if (sourceCycle > 0) {
      // Keep the visitor inside the middle set: jumping one set lands on identical cards.
      if (source.scrollLeft < sourceCycle * 0.5) source.scrollLeft += sourceCycle;
      else if (source.scrollLeft > sourceCycle * 1.5) source.scrollLeft -= sourceCycle;
    }
    if (other) {
      if (sourceCycle > 0 && otherCycle > 0) {
        other.scrollLeft = source.scrollLeft * (otherCycle / sourceCycle);
      } else {
        const sourceMax = source.scrollWidth - source.clientWidth;
        const otherMax = other.scrollWidth - other.clientWidth;
        other.scrollLeft = sourceMax > 0 ? (source.scrollLeft / sourceMax) * otherMax : 0;
      }
    }
    clearTimeout(release.current);
    release.current = setTimeout(() => {
      driver.current = null;
    }, 150);
  }

  function step(direction: 1 | -1) {
    const row = topRef.current;
    if (row) row.scrollBy({ left: direction * row.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <>
      <div className="bg-brand-800 text-white">
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3">{title}</div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => step(-1)} className={arrowStyles} aria-label={labels.previous}>
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => step(1)} className={arrowStyles} aria-label={labels.next}>
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
            <span className="ml-2">{action}</span>
          </div>
        </div>
      </div>
      <div className="space-y-4 py-4">
        <ul ref={topRef} onScroll={follow} className={rowStyles}>
          {looping ? copies(top, "before") : null}
          {top}
          {looping ? copies(top, "after") : null}
        </ul>
        <ul ref={bottomRef} onScroll={follow} className={rowStyles}>
          {looping ? copies(bottom, "before") : null}
          {bottom}
          {looping ? copies(bottom, "after") : null}
        </ul>
      </div>
    </>
  );
}

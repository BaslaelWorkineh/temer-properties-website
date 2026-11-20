"use client";

import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Circular full-bleed carousel. It rests on a slide for `interval` ms, then glides to the next one. It never
 * rewinds: the last slides are repeated before the first (and the first after the last), and once a glide
 * ends on a repeat the row jumps, unseen, to the identical real slide. So the first slide always has the last
 * one on its left, and after the last slide the first one follows immediately, like a circular queue.
 *
 * Hovering, focusing, touching or using the dots pauses it for a while, and it never moves by itself for
 * people who prefer reduced motion. The repeats are `inert` and
 * hidden from assistive technology, so each slide is announced and focusable once.
 */
export function SlideCarousel({
  children,
  label,
  interval = 4500,
  slideClassName,
  className,
}: {
  children: ReactNode;
  label: string;
  interval?: number;
  /** Width and height of one slide (Tailwind classes). */
  slideClassName: string;
  className?: string;
}) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const pad = count > 1 ? Math.min(2, count) : 0; // repeats on each side; a screen shows at most 3 slides
  const items = [
    ...slides.slice(count - pad).map((node, i) => ({ node, key: `before-${i}`, repeat: true })),
    ...slides.map((node, i) => ({ node, key: `slide-${i}`, repeat: false })),
    ...slides.slice(0, pad).map((node, i) => ({ node, key: `after-${i}`, repeat: true })),
  ];

  const track = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState(pad); // index in `items`
  const posRef = useRef(pad);
  const hovering = useRef(false);
  const holdUntil = useRef(0);
  const real = count ? (((pos - pad) % count) + count) % count : 0;

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  const leftFor = (el: HTMLElement, index: number) => {
    const slide = el.children[index] as HTMLElement | undefined;
    return slide ? slide.offsetLeft + slide.offsetWidth / 2 - el.clientWidth / 2 : null;
  };

  /** Move to an item. Smooth unless told otherwise (or the viewer prefers reduced motion). */
  const goTo = useCallback((index: number, smooth = true) => {
    const el = track.current;
    if (!el) return;
    const left = leftFor(el, index);
    if (left === null) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left, behavior: smooth && !calm ? "smooth" : "instant" });
  }, []);

  /** Jump (no animation, snapping paused for a frame) so a repeat is swapped for the real slide. */
  const jumpTo = useCallback((index: number) => {
    const el = track.current;
    if (!el) return;
    const left = leftFor(el, index);
    if (left === null) return;
    el.style.scrollSnapType = "none";
    el.scrollTo({ left, behavior: "instant" });
    requestAnimationFrame(() => {
      el.style.scrollSnapType = "";
    });
  }, []);

  const hold = useCallback((ms = 9000) => {
    holdUntil.current = Date.now() + ms;
  }, []);

  // Start on the first real slide (before paint), so the last one is already on its left.
  useLayoutEffect(() => {
    if (pad) jumpTo(pad);
  }, [pad, jumpTo]);

  // Track the centred slide while scrolling; once scrolling settles on a repeat, swap in the real slide.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    let settleTimer = 0;
    const nearest = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDistance = Infinity;
      for (let i = 0; i < el.children.length; i++) {
        const c = el.children[i] as HTMLElement;
        const distance = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (distance < bestDistance) {
          best = i;
          bestDistance = distance;
        }
      }
      return best;
    };
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          setPos(nearest());
        });
      }
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        const index = nearest();
        if (pad && index < pad) jumpTo(index + count);
        else if (pad && index >= pad + count) jumpTo(index - count);
      }, 120);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.clearTimeout(settleTimer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pad, count, jumpTo]);

  // The timer: rest on a slide, then move on (always forward, never rewinding).
  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (hovering.current || document.hidden || Date.now() < holdUntil.current) return;
      goTo(Math.min(posRef.current + 1, items.length - 1));
    }, interval);
    return () => window.clearInterval(id);
  }, [count, interval, goTo, items.length]);

  if (!count) return null;

  // For a dot: the copy of that slide closest to where we are, so the glide is short.
  const goToReal = (i: number) => {
    hold();
    const base = pad + i;
    const options = [base - count, base, base + count].filter((n) => n >= 0 && n < items.length);
    goTo(options.reduce((a, b) => (Math.abs(b - pos) < Math.abs(a - pos) ? b : a)));
  };

  return (
    <div
      className={className}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
      onFocusCapture={() => (hovering.current = true)}
      onBlurCapture={() => (hovering.current = false)}
      onTouchStart={() => hold(12000)}
    >
      <ul
        ref={track}
        tabIndex={0}
        aria-label={`${label}, scroll sideways`}
        className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto px-[calc((100%-min(56rem,88vw))/2)] pb-1 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-500 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <li
            key={item.key}
            role="group"
            aria-roledescription="slide"
            aria-label={item.repeat ? undefined : `${i - pad + 1} of ${count}`}
            aria-hidden={item.repeat || undefined}
            inert={item.repeat || undefined}
            className={cn("shrink-0 snap-center snap-always", slideClassName)}
          >
            {item.node}
          </li>
        ))}
      </ul>

      {/* Dots only: the current project is a wide pill, the others shrink the further they are from it. */}
      <div className="mt-6 flex items-center justify-center gap-2.5" role="group" aria-label="Choose a project">
        {slides.map((_, i) => {
          const distance = Math.min(Math.abs(i - real), count - Math.abs(i - real)); // circular distance
          const size = distance === 0 ? "" : distance <= 3 ? "size-2" : distance === 4 ? "size-1.5" : "size-1";
          return (
            <button
              key={i}
              type="button"
              onClick={() => goToReal(i)}
              aria-label={`Go to project ${i + 1}`}
              aria-current={i === real ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-full transition-all duration-300 hover:bg-ink/60",
                i === real ? "h-2 w-9 bg-ink/80" : cn(size, "bg-ink/35"),
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

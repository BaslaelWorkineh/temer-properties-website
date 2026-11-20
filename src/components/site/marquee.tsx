import type { CSSProperties, ReactNode } from "react";

/*
 * Full-bleed rows that scroll sideways on their own (pure CSS, no JS; styles in globals.css under
 * `.marquee`). Every item has its own width and each row its own height, so rows never line up.
 * Odd rows run in reverse.
 *
 * A track holds its content twice and slides by exactly one copy for a seamless loop. If a row's items
 * are too few to cover a wide screen, they are repeated inside each copy. Only the first pass is exposed:
 * every repeat is `inert` + `aria-hidden`, so keyboard and screen-reader users meet each item once.
 * Hovering or focusing a row pauses it; with reduced motion the repeats are hidden and the row scrolls
 * by hand instead.
 */

export type MarqueeItem = { key: string | number; /** rem */ width: number; node: ReactNode };
export type MarqueeRow = { items: MarqueeItem[]; /** Tailwind height classes */ heightClass: string };

const GAP_REM = 0.75;
const MIN_COPY_REM = 170; // one copy must be wider than the widest screen we design for (~2700px)
const SPEED_REM_PER_S = 3;

export function Marquee({ rows, className }: { rows: MarqueeRow[]; className?: string }) {
  return (
    <div className={["flex flex-col gap-3", className].filter(Boolean).join(" ")}>
      {rows
        .filter((row) => row.items.length)
        .map((row, r) => {
          const passRem = row.items.reduce((sum, item) => sum + item.width + GAP_REM, 0);
          const passes = Math.max(1, Math.ceil(MIN_COPY_REM / passRem));
          const copyRem = passRem * passes;

          const renderCopy = (copy: number) =>
            Array.from({ length: passes }, (_, pass) =>
              row.items.map((item) => {
                const hidden = copy > 0 || pass > 0;
                return (
                  <div
                    key={`${copy}-${pass}-${item.key}`}
                    className={`marquee__item shrink-0 ${row.heightClass}`}
                    style={{ "--w": `${item.width}rem` } as CSSProperties}
                    data-repeat={hidden ? "" : undefined}
                    aria-hidden={hidden || undefined}
                    inert={hidden || undefined}
                  >
                    {item.node}
                  </div>
                );
              }),
            );

          return (
            <div
              key={r}
              className="marquee"
              data-reverse={r % 2 === 1 ? "" : undefined}
              style={{ "--marquee-duration": `${Math.round(copyRem / SPEED_REM_PER_S)}s` } as CSSProperties}
            >
              <div className="marquee__track">
                <div className="marquee__copy">{renderCopy(0)}</div>
                <div className="marquee__copy">{renderCopy(1)}</div>
              </div>
            </div>
          );
        })}
    </div>
  );
}

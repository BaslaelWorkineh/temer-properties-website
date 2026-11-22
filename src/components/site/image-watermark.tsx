"use client";

import { useLang } from "@/components/site/lang";
import { cn } from "@/lib/utils";

/**
 * Fixed brand mark laid over listing photos. It matches the logo's wordmark: a heavy rounded "Temer" in mixed
 * case over spaced capitals "PROPERTIES", in the logo's olive green. It is drawn by the page, not baked into
 * the file, so it stays identical when the sales team replaces a photo.
 * Place it inside a `relative` image wrapper.
 */
export function ImageWatermark({ className }: { className?: string }) {
  const am = useLang() === "am";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-[1] select-none font-[family-name:var(--font-brand)] font-extrabold leading-none text-[#6b8d2c] [text-shadow:0_0_7px_rgba(255,255,255,0.8)]",
        className,
      )}
    >
      <span className={cn("block text-[1.35rem] tracking-tight", am && "font-[family-name:var(--font-ethiopic)] font-black")}>{am ? "ቴምር" : "Temer"}</span>
      <span className={cn("mt-0.5 block text-[0.6rem] tracking-[0.14em]", am && "font-[family-name:var(--font-ethiopic)] tracking-[0.06em]")}>
        {am ? "ፕሮፐርቲስ" : "PROPERTIES"}
      </span>
    </span>
  );
}

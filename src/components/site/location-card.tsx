import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "@/components/site/link";
import type { LocationSummary } from "@/lib/data/locations";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary, localizedAreaName } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

/** Solid backgrounds for areas without a photo. One is picked per card so a row does not look repeated. */
const TINTS = ["bg-[#143a2b]", "bg-[#0f2a47]", "bg-[#1d4f5c]", "bg-[#3b4a1c]", "bg-[#25395e]", "bg-[#1f3d36]"];

/**
 * Area card. With a photo it is a full-bleed photo under a dark fade; without one it is a plain tinted card,
 * never a placeholder illustration. The whole card is the link (through the name), the arrow shows it is
 * clickable, and counts are real (a zero is not printed). `rank` adds a small 01, 02... when areas are sorted
 * by number of listings.
 */
export function LocationCard({
  location,
  rank,
  tint = 0,
  lang = "en",
}: {
  location: LocationSummary;
  rank?: number;
  tint?: number;
  lang?: Locale;
}) {
  const dict = getDictionary(lang);
  const l = location;
  const counts = [
    l.propertyCount ? dict.home.propertyCount(l.propertyCount) : null,
    l.projectCount ? dict.home.projectCount(l.projectCount) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <article className="group relative isolate flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-none bg-brand-900 p-5 text-white">
      {l.image ? (
        <Image
          src={l.image.url}
          alt={l.image.alt || `${l.name}, ${l.city}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="-z-10 object-cover transition duration-500 group-hover:scale-[1.05]"
        />
      ) : (
        <div className={cn("absolute inset-0 -z-10", TINTS[tint % TINTS.length])} aria-hidden="true" />
      )}
      <div
        className={cn(
          "absolute inset-0 -z-10",
          l.image
            ? "bg-gradient-to-b from-black/30 via-transparent via-35% to-black/80"
            : "bg-gradient-to-br from-white/[0.07] to-black/25",
        )}
        aria-hidden="true"
      />
      {rank ? <span className="absolute left-5 top-5 text-[0.8rem] font-semibold text-white/85">{String(rank).padStart(2, "0")}</span> : null}
      <span
        className="absolute right-4 top-4 grid size-10 place-items-center border border-white/55 bg-white/10 backdrop-blur-sm transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-gold-500 group-hover:bg-gold-500 group-hover:text-brand-950"
        aria-hidden="true"
      >
        <ArrowUpRight className="size-[1.1rem]" />
      </span>
      <h3 className="text-2xl font-bold leading-tight sm:text-3xl">
        <Link href={`/locations/${l.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
          {localizedAreaName(lang, l.name)}
        </Link>
      </h3>
      <p className="mt-1 text-sm font-medium text-white">{counts || l.city}</p>
    </article>
  );
}

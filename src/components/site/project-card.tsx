import { ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/site/image-placeholder";
import type { ProjectSummary } from "@/lib/data/projects";
import { pluralize } from "@/lib/utils";

function availabilityLabel(p: ProjectSummary) {
  if (p.status === "delivered") return p.totalUnits ? `${p.totalUnits} units delivered` : "Completed project";
  return p.availableUnits ? `${pluralize(p.availableUnits, "unit")} listed` : (p.unitTypes[0] ?? "Ask for availability");
}

/**
 * `overlay`: the photo fills the card and the copy sits on a dark gradient (same look as the overlay
 * PropertyCard). It fills its parent, which sets the size. `compact` keeps only the name and area,
 * for small tiles.
 */
export function ProjectCard({
  project,
  variant = "default",
  compact,
}: {
  project: ProjectSummary;
  variant?: "default" | "overlay";
  compact?: boolean;
}) {
  const p = project;
  const where = p.location?.name ?? "Addis Ababa";

  if (variant === "overlay") {
    return (
      <article className="group relative isolate flex size-full flex-col justify-end overflow-hidden border-[3px] border-brand-800 bg-brand-950 text-white transition duration-300 hover:shadow-xl hover:shadow-brand-950/20">
        {p.image ? (
          <Image
            src={p.image.url}
            alt={p.image.alt || `${p.name}, ${where}`}
            fill
            sizes={compact ? "22rem" : "(min-width: 640px) 46rem, 80vw"}
            className="-z-10 object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 -z-10">
            <ImagePlaceholder label="Project" />
          </div>
        )}
        <div
          className={
            compact
              ? "absolute inset-0 -z-10 bg-gradient-to-t from-brand-950 via-brand-950/50 via-40% to-transparent to-70%"
              : "absolute inset-0 -z-10 bg-gradient-to-t from-brand-950 from-15% via-brand-950/60 via-40% to-transparent to-70%"
          }
          aria-hidden="true"
        />
        <div className={compact ? "p-4" : "p-6 sm:p-8"}>
          <h3 className={compact ? "text-lg font-bold leading-tight" : "text-3xl font-bold leading-tight sm:text-4xl"}>
            <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
              {p.name}
            </Link>
          </h3>
          <p className={compact ? "mt-0.5 flex items-center gap-1 text-xs text-white/75" : "mt-1.5 flex items-center gap-1.5 text-sm text-white/75"}>
            <MapPin className={compact ? "size-3.5 text-gold-400" : "size-4 text-gold-400"} aria-hidden="true" />
            {where}
          </p>
          {!compact ? (
            <>
              {p.summary ? <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/80">{p.summary}</p> : null}
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400">
                {availabilityLabel(p)} <ArrowUpRight className="size-4" aria-hidden="true" />
              </p>
            </>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-950/5">
      <div className="relative aspect-[16/10] overflow-hidden bg-soft">
        {p.image ? (
          <Image
            src={p.image.url}
            alt={p.image.alt || `${p.name}, ${where}`}
            fill
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <ImagePlaceholder label="Project" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {p.category ? <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">{p.category}</p> : null}
        <h3 className="mt-1 text-2xl font-bold text-ink">
          <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
            {p.name}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="size-4 text-brand-500" aria-hidden="true" />
          {where}
        </p>
        {p.summary ? <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink/75">{p.summary}</p> : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
          <span className="font-medium text-brand-700">{availabilityLabel(p)}</span>
          <ArrowUpRight className="size-5 text-muted transition group-hover:text-brand-600" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

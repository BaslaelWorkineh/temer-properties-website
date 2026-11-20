import { ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge, projectStatusTone } from "@/components/ui/badge";
import { ImagePlaceholder } from "@/components/site/image-placeholder";
import { projectStatusLabels } from "@/lib/config/property-types";
import type { ProjectSummary } from "@/lib/data/projects";
import { pluralize } from "@/lib/utils";

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const p = project;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-950/5">
      <div className="relative aspect-[16/10] overflow-hidden bg-soft">
        {p.image ? (
          <Image
            src={p.image.url}
            alt={p.image.alt || `${p.name}, ${p.location?.name ?? "Addis Ababa"}`}
            fill
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <ImagePlaceholder label="Project" />
        )}
        <div className="absolute left-3 top-3">
          <Badge tone={projectStatusTone[p.status]} className="shadow-sm">
            {projectStatusLabels[p.status]}
          </Badge>
        </div>
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
          {p.location?.name ?? "Addis Ababa"}
        </p>
        {p.summary ? <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink/75">{p.summary}</p> : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
          <span className="font-medium text-brand-700">
            {p.status === "delivered"
              ? p.totalUnits
                ? `${p.totalUnits} units delivered`
                : "Completed project"
              : p.availableUnits
                ? `${pluralize(p.availableUnits, "unit")} listed`
                : p.unitTypes[0] ?? "Ask for availability"}
          </span>
          <ArrowUpRight className="size-5 text-muted transition group-hover:text-brand-600" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

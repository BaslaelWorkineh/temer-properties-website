import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "@/components/site/link";
import { WhatsAppIcon } from "@/components/site/brand-icons";
import { ContactActions } from "@/components/site/contact-actions";
import { site, whatsappLink } from "@/lib/config/site";
import { getPropertiesDict } from "@/lib/i18n/dict/properties";
import type { Locale } from "@/lib/i18n/config";
import { getAreasDict } from "@/lib/i18n/dict/areas";
import { getDictionary, localizedAreaName } from "@/lib/i18n/dictionaries";
import { ImagePlaceholder } from "@/components/site/image-placeholder";
import { ImageWatermark } from "@/components/site/image-watermark";
import { StatusLabel } from "@/components/site/status-label";
import { buttonStyles } from "@/components/ui/button";
import type { ProjectSummary } from "@/lib/data/projects";
import type { AreasDict } from "@/lib/i18n/dict/areas";

function availabilityLabel(p: ProjectSummary, t: AreasDict) {
  if (p.status === "delivered") return p.totalUnits ? t.common.unitsDelivered(p.totalUnits) : t.common.completedProject;
  return p.availableUnits ? t.common.unitsListed(p.availableUnits) : (p.unitTypes[0] ?? t.common.askAvailability);
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
  lang = "en",
}: {
  project: ProjectSummary;
  variant?: "default" | "overlay" | "banner";
  compact?: boolean;
  lang?: Locale;
}) {
  const p = project;
  const t = getAreasDict(lang);
  const where = p.location?.name ? localizedAreaName(lang, p.location.name) : t.addisAbaba;
  // "For sale" only when the project has a listing that is published and not sold; other statuses always show.
  const showStatus = p.status !== "selling" || p.availableUnits > 0;

  if (variant === "banner") {
    // Photo fills the card; the project name (large) and the contact buttons (a round call button and an "Ask us"
    // WhatsApp pill) sit at the bottom. The whole card links to the project through its name. `compact` (small
    // tiles) uses a smaller name and tighter padding.
    const dict = getDictionary(lang);
    return (
      <article className="group relative isolate flex size-full flex-col justify-end overflow-hidden bg-brand-950 text-white">
        {p.image ? (
          <Image
            src={p.image.url}
            alt={p.image.alt || `${p.name}, ${where}`}
            fill
            sizes="(min-width: 640px) 56rem, 88vw"
            className="-z-10 object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 -z-10">
            <ImagePlaceholder label={t.common.placeholderProject} />
          </div>
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 via-45% to-transparent to-70%" aria-hidden="true" />
        <ImageWatermark className="left-5 top-4" />
        <div className="absolute right-5 top-5">
          {showStatus ? <StatusLabel status={p.status} lang={lang} /> : null}
        </div>
        <div className={`flex flex-col gap-3 ${compact ? "p-4" : "p-5 sm:flex-row sm:items-end sm:gap-4"}`}>
          {/* Just the project name, large; the details are on the project page. */}
          <h3 className={`min-w-0 flex-1 font-bold leading-none text-white ${compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"}`}>
            <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:underline">
              {p.name}
            </Link>
          </h3>
          <div className="relative z-10 flex shrink-0 items-center gap-2">
            <a
              href={`tel:${site.contact.phone}`}
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white hover:text-brand-950"
              title={dict.common.call}
            >
              <Phone className="size-4" aria-hidden="true" />
              <span className="sr-only">
                {dict.common.call} {site.contact.phoneDisplay}
              </span>
            </a>
            <a
              href={whatsappLink(getPropertiesDict(lang).contact.message(p.name))}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ variant: "light", className: "h-10 gap-2 rounded-full px-5" })}
            >
              <WhatsAppIcon className="size-4" />
              {dict.common.askUs}
            </a>
          </div>
        </div>
      </article>
    );
  }

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
            <ImagePlaceholder label={t.common.placeholderProject} />
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
        <ImageWatermark className="left-4 top-4" />
        <div className="absolute right-3 top-3">
          {showStatus ? <StatusLabel status={p.status} lang={lang} /> : null}
        </div>
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
                {availabilityLabel(p, t)} <ArrowUpRight className="size-4" aria-hidden="true" />
              </p>
              <div className="mt-4">
                <ContactActions subject={p.name} tone="dark" lang={lang} />
              </div>
            </>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-none border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-950/5">
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
          <ImagePlaceholder label={t.common.placeholderProject} />
        )}
        <ImageWatermark className="left-4 top-4" />
        <div className="absolute right-3 top-3">
          {showStatus ? <StatusLabel status={p.status} lang={lang} /> : null}
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
          {where}
        </p>
        {p.summary ? <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink/75">{p.summary}</p> : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
          <span className="font-medium text-brand-700">{availabilityLabel(p, t)}</span>
          <ArrowUpRight className="size-5 text-muted transition group-hover:text-brand-600" aria-hidden="true" />
        </div>
        <div className="mt-4 border-t border-line pt-4">
          <ContactActions subject={p.name} lang={lang} />
        </div>
      </div>
    </article>
  );
}

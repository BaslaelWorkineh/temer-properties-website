import { Bath, BedDouble, Camera, MapPin, Ruler } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/site/image-placeholder";
import { propertyTypes } from "@/lib/config/property-types";
import type { PropertyCardData } from "@/lib/data/properties";
import { formatArea, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "overlay";

export function PropertyCard({
  property,
  headingLevel = 3,
  eager,
  variant = "default",
}: {
  property: PropertyCardData;
  headingLevel?: 2 | 3;
  eager?: boolean;
  variant?: CardVariant;
}) {
  const p = property;
  const meta = propertyTypes[p.type];
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const place = [p.project?.name, p.location?.name ?? "Addis Ababa"].filter(Boolean).join(", ");

  if (variant === "overlay") {
    // Photo fills the whole card; the copy sits on a dark gradient at the bottom. The card fills its
    // parent, so the parent sets the size (an aspect box in PropertyGrid, free widths in the marquee).
    return (
      <article className="group relative isolate flex size-full flex-col justify-end overflow-hidden border-[3px] border-brand-800 bg-brand-950 text-white transition duration-300 hover:shadow-xl hover:shadow-brand-950/20">
        {p.image ? (
          <Image
            src={p.image.url}
            alt={p.image.alt || `${p.title} in ${place}`}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            loading={eager ? "eager" : "lazy"}
            className="-z-10 object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 -z-10">
            <ImagePlaceholder label={meta.label} />
          </div>
        )}
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950 from-30% via-brand-950/70 via-50% to-transparent to-75%"
          aria-hidden="true"
        />
        {p.imageCount > 1 ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
            <Camera className="size-3.5" aria-hidden="true" />
            {p.imageCount}
            <span className="sr-only"> photos</span>
          </span>
        ) : null}
        <div className="p-5">
          <p className="font-display text-2xl font-bold tracking-tight text-gold-400">{formatPrice(p.price)}</p>
          <Heading className="mt-1 font-sans text-[1.05rem] font-semibold leading-snug text-white">
            <Link href={`/properties/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
              {p.title}
            </Link>
          </Heading>
          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-white/75">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden="true" />
            {place}
          </p>
          {p.promo ? <p className="mt-3 bg-gold-500 px-3 py-1.5 text-xs font-semibold text-brand-950">{p.promo}</p> : null}
          <CardSpecs p={p} residential={meta.residential} className="mt-4 border-white/20 text-white/85" iconClassName="text-white/60" />
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-950/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-soft">
        {p.image ? (
          <Image
            src={p.image.url}
            alt={p.image.alt || `${p.title} in ${place}`}
            fill
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
            loading={eager ? "eager" : "lazy"}
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <ImagePlaceholder label={meta.label} />
        )}
        {p.imageCount > 1 ? (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-none bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
            <Camera className="size-3.5" aria-hidden="true" />
            {p.imageCount}
            <span className="sr-only"> photos</span>
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-2xl font-bold tracking-tight text-brand-700">{formatPrice(p.price)}</p>
        <Heading className="mt-1 font-sans text-[1.05rem] font-semibold leading-snug text-ink">
          <Link href={`/properties/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
            {p.title}
          </Link>
        </Heading>
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted">
          <MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
          {place}
        </p>
        {p.promo ? <p className="mt-3 rounded-lg bg-gold-100 px-3 py-1.5 text-xs font-semibold text-[#6b5016]">{p.promo}</p> : null}
        <CardSpecs
          p={p}
          residential={meta.residential}
          className="mt-auto border-line text-ink/80 [&:not(:first-child)]:mt-4"
          iconClassName="text-muted"
        />
      </div>
    </article>
  );
}

/** Beds / baths / size row shared by both card variants. */
function CardSpecs({
  p,
  residential,
  className,
  iconClassName,
}: {
  p: PropertyCardData;
  residential: boolean;
  className?: string;
  iconClassName?: string;
}) {
  const icon = cn("size-4", iconClassName);
  return (
    <dl className={cn("flex flex-wrap gap-x-5 gap-y-1 border-t pt-4 text-sm", className)}>
      {p.bedrooms != null && residential ? (
        <div className="flex items-center gap-1.5">
          <dt>
            <BedDouble className={icon} aria-hidden="true" />
            <span className="sr-only">Bedrooms</span>
          </dt>
          <dd>{p.bedrooms === 0 ? "Studio" : `${p.bedrooms} bed`}</dd>
        </div>
      ) : null}
      {p.bathrooms != null ? (
        <div className="flex items-center gap-1.5">
          <dt>
            <Bath className={icon} aria-hidden="true" />
            <span className="sr-only">Bathrooms</span>
          </dt>
          <dd>{p.bathrooms} bath</dd>
        </div>
      ) : null}
      {p.areaSqm ? (
        <div className="flex items-center gap-1.5">
          <dt>
            <Ruler className={icon} aria-hidden="true" />
            <span className="sr-only">Area</span>
          </dt>
          <dd>{formatArea(p.areaSqm)}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export function PropertyGrid({
  properties,
  eagerCount = 0,
  variant,
}: {
  properties: PropertyCardData[];
  eagerCount?: number;
  variant?: CardVariant;
}) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {properties.map((p, i) => (
        <li key={p.id} className="flex">
          <div className={cn("w-full", variant === "overlay" && "aspect-[4/5]")}>
            <PropertyCard property={p} eager={i < eagerCount} variant={variant} />
          </div>
        </li>
      ))}
    </ul>
  );
}

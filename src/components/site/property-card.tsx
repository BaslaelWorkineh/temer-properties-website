import { Bath, BedDouble, Camera, MapPin, Ruler } from "lucide-react";
import Image from "next/image";
import Link from "@/components/site/link";
import { CardActions } from "@/components/site/card-actions";
import { ContactActions } from "@/components/site/contact-actions";
import { ImagePlaceholder } from "@/components/site/image-placeholder";
import { ImageWatermark } from "@/components/site/image-watermark";
import { TypeLabel } from "@/components/site/status-label";
import { propertyTypes } from "@/lib/config/property-types";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { PropertyCardData } from "@/lib/data/properties";
import { discountedPrice, formatArea, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "overlay" | "tile";

export function PropertyCard({
  property,
  headingLevel = 3,
  eager,
  variant = "default",
  lang = "en",
}: {
  property: PropertyCardData;
  headingLevel?: 2 | 3;
  eager?: boolean;
  variant?: CardVariant;
  /** Language of the card text. Listing titles come from the database and stay as written. */
  lang?: Locale;
}) {
  const dict = getDictionary(lang);
  const p = property;
  const meta = propertyTypes[p.type];
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const place = [p.project?.name, p.location?.name ?? "Addis Ababa"].filter(Boolean).join(", ");
  const hasDiscount = !!p.price && !!p.discountPercent;

  if (variant === "tile") {
    // Apple-sized photo tile with the mockup's copy at the bottom: location, name, price, specs and one wide
    // "View details" button with a chat button for the contact icons. The tile fills its parent, which sets the size.
    return (
      <article className="group relative isolate flex size-full flex-col justify-end overflow-hidden bg-brand-950 text-white">
        {p.image ? (
          <Image
            src={p.image.url}
            alt={p.image.alt || `${p.title} in ${place}`}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            loading={eager ? "eager" : "lazy"}
            // Full opacity down to the middle of the photo, then it steps down (80% -> 60% -> 40% -> 20%) to the bottom.
            className="-z-10 object-cover transition duration-700 [mask-image:linear-gradient(to_bottom,rgb(0_0_0)_50%,rgb(0_0_0/0.8)_55%,rgb(0_0_0/0.6)_70%,rgb(0_0_0/0.4)_85%,rgb(0_0_0/0.2))] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 -z-10">
            <ImagePlaceholder label={meta.label} />
          </div>
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/40 via-40% to-transparent to-65%" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 -z-10 h-1/4 bg-gradient-to-b from-black/35 to-transparent" aria-hidden="true" />
        {/* The brand mark starts behind the type label, which sits on top of it. */}
        <ImageWatermark className="left-4 top-7 z-0" />
        <div className="absolute left-4 top-4 z-[2] flex gap-1.5">
          <TypeLabel>{dict.types[p.type].label}</TypeLabel>
          {p.status !== "available" ? <TypeLabel className="bg-gold-500 text-brand-950">{dict.propertyStatus[p.status]}</TypeLabel> : null}
        </div>
        {hasDiscount ? (
          <span className="absolute right-4 top-4 z-[2] bg-red-600 px-2.5 py-1 text-xs font-bold text-white">-{p.discountPercent}%</span>
        ) : null}
        <div className="relative p-4 sm:p-5">
          <p className="flex items-center gap-1.5 text-xs text-white/80">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {place}
          </p>
          <Heading className="mt-1 font-sans text-lg font-semibold leading-snug sm:text-xl">{p.title}</Heading>
          <PriceBlock p={p} className="mt-1 text-white" oldClassName="text-white/65" showPercent lang={lang} />
          <CardSpecs
            p={p}
            lang={lang}
            residential={meta.residential}
            className="mt-2 border-t-0 pt-0 text-xs text-white/85"
            iconClassName="size-3.5 text-white/70"
          />
          <CardActions href={`/properties/${p.slug}`} label={dict.common.viewDetails}>
            <ContactActions subject={p.title} tone="dark" />
          </CardActions>
        </div>
      </article>
    );
  }

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
        <ImageWatermark className="left-4 top-4" />
        {hasDiscount ? (
          <span className="absolute right-3 top-12 bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">-{p.discountPercent}%</span>
        ) : null}
        {p.imageCount > 1 ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
            <Camera className="size-3.5" aria-hidden="true" />
            {p.imageCount}
            <span className="sr-only"> photos</span>
          </span>
        ) : null}
        <div className="p-5">
          <PriceBlock p={p} className="text-gold-400" oldClassName="text-white/60" />
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
          <div className="mt-4">
            <ContactActions subject={p.title} tone="dark" />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-none border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-950/5">
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
        <ImageWatermark className="left-4 top-4" />
        {hasDiscount ? (
          <span className="absolute right-3 top-3 bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">-{p.discountPercent}%</span>
        ) : null}
        {p.imageCount > 1 ? (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-none bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
            <Camera className="size-3.5" aria-hidden="true" />
            {p.imageCount}
            <span className="sr-only"> photos</span>
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <PriceBlock p={p} className="text-brand-700" oldClassName="text-muted" />
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
        <div className="mt-4 border-t border-line pt-4">
          <ContactActions subject={p.title} />
        </div>
      </div>
    </article>
  );
}

/** Price, or the discounted price with the original crossed out. */
function PriceBlock({
  p,
  className,
  oldClassName,
  wrapperClassName,
  showPercent,
  lang = "en",
}: {
  p: PropertyCardData;
  className?: string;
  oldClassName?: string;
  wrapperClassName?: string;
  showPercent?: boolean;
  lang?: Locale;
}) {
  if (p.price && p.discountPercent) {
    return (
      <div className={cn("flex flex-wrap items-baseline gap-x-2.5", wrapperClassName)}>
        <p className={cn("font-display text-2xl font-bold tracking-tight", className)}>{formatPrice(discountedPrice(p.price, p.discountPercent))}</p>
        <p className={cn("text-sm line-through decoration-red-500/70", oldClassName)}>{formatPrice(p.price)}</p>
        {showPercent ? <p className="text-sm font-bold text-red-300">-{p.discountPercent}%</p> : null}
      </div>
    );
  }
  return (
    <p className={cn("font-display text-2xl font-bold tracking-tight", className, wrapperClassName)}>
      {p.price && p.price > 0 ? formatPrice(p.price) : getDictionary(lang).common.priceOnRequest}
    </p>
  );
}

/** Beds / baths / size row shared by both card variants. */
function CardSpecs({
  p,
  residential,
  className,
  iconClassName,
  lang = "en",
}: {
  p: PropertyCardData;
  residential: boolean;
  className?: string;
  iconClassName?: string;
  lang?: Locale;
}) {
  const dict = getDictionary(lang);
  const icon = cn("size-4", iconClassName);
  return (
    <dl className={cn("flex flex-wrap gap-x-5 gap-y-1 border-t pt-4 text-sm", className)}>
      {p.bedrooms != null && residential ? (
        <div className="flex items-center gap-1.5">
          <dt>
            <BedDouble className={icon} aria-hidden="true" />
            <span className="sr-only">Bedrooms</span>
          </dt>
          <dd>{p.bedrooms === 0 ? dict.common.studio : `${p.bedrooms} ${dict.common.bed}`}</dd>
        </div>
      ) : null}
      {p.bathrooms != null ? (
        <div className="flex items-center gap-1.5">
          <dt>
            <Bath className={icon} aria-hidden="true" />
            <span className="sr-only">Bathrooms</span>
          </dt>
          <dd>{dict.common.toilets(p.bathrooms)}</dd>
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

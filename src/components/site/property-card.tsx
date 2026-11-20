import { Bath, BedDouble, Camera, MapPin, Ruler } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge, propertyStatusTone } from "@/components/ui/badge";
import { ImagePlaceholder } from "@/components/site/image-placeholder";
import { propertyStatusLabels, propertyTypes } from "@/lib/config/property-types";
import type { PropertyCardData } from "@/lib/data/properties";
import { formatArea, formatPrice } from "@/lib/format";

export function PropertyCard({ property, headingLevel = 3, eager }: { property: PropertyCardData; headingLevel?: 2 | 3; eager?: boolean }) {
  const p = property;
  const meta = propertyTypes[p.type];
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const place = [p.project?.name, p.location?.name ?? "Addis Ababa"].filter(Boolean).join(", ");

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
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge tone="dark">{meta.label}</Badge>
          {p.status !== "available" ? <Badge tone={propertyStatusTone[p.status]}>{propertyStatusLabels[p.status]}</Badge> : null}
        </div>
        {p.isFeatured && p.status === "available" ? (
          <span className="absolute right-3 top-3 rounded-full bg-gold-500 px-2.5 py-0.5 text-xs font-bold text-brand-950 shadow">Hot</span>
        ) : null}
        {p.imageCount > 1 ? (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
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
        <dl className="mt-auto flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-4 text-sm text-ink/80 [&:not(:first-child)]:mt-4">
          {p.bedrooms != null && meta.residential ? (
            <div className="flex items-center gap-1.5">
              <dt>
                <BedDouble className="size-4 text-muted" aria-hidden="true" />
                <span className="sr-only">Bedrooms</span>
              </dt>
              <dd>{p.bedrooms === 0 ? "Studio" : `${p.bedrooms} bed`}</dd>
            </div>
          ) : null}
          {p.bathrooms != null ? (
            <div className="flex items-center gap-1.5">
              <dt>
                <Bath className="size-4 text-muted" aria-hidden="true" />
                <span className="sr-only">Bathrooms</span>
              </dt>
              <dd>{p.bathrooms} bath</dd>
            </div>
          ) : null}
          {p.areaSqm ? (
            <div className="flex items-center gap-1.5">
              <dt>
                <Ruler className="size-4 text-muted" aria-hidden="true" />
                <span className="sr-only">Area</span>
              </dt>
              <dd>{formatArea(p.areaSqm)}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}

export function PropertyGrid({ properties, eagerCount = 0 }: { properties: PropertyCardData[]; eagerCount?: number }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {properties.map((p, i) => (
        <li key={p.id} className="flex">
          <div className="w-full">
            <PropertyCard property={p} eager={i < eagerCount} />
          </div>
        </li>
      ))}
    </ul>
  );
}

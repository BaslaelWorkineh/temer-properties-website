import Image from "next/image";
import Link from "next/link";
import type { LocationSummary } from "@/lib/data/locations";
import { pluralize } from "@/lib/utils";

export function LocationCard({ location }: { location: LocationSummary }) {
  const l = location;
  const counts = [
    l.propertyCount ? pluralize(l.propertyCount, "property", "properties") : null,
    l.projectCount ? pluralize(l.projectCount, "project") : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <article className="group relative isolate flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-brand-900 p-5 text-white shadow-sm">
      {l.image ? (
        <Image
          src={l.image.url}
          alt={l.image.alt || `${l.name}, ${l.city}`}
          fill
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
          className="-z-10 object-cover transition duration-500 group-hover:scale-[1.05]"
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-700 to-brand-950" aria-hidden="true" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/90 via-brand-950/35 to-transparent" aria-hidden="true" />
      <h3 className="text-2xl font-bold">
        <Link href={`/locations/${l.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
          {l.name}
        </Link>
      </h3>
      <p className="text-sm text-white/80">{counts || l.city}</p>
    </article>
  );
}

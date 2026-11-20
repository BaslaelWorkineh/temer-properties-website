import { propertyTypes } from "@/lib/config/property-types";
import type { PropertyDetail } from "@/lib/data/properties";
import { formatArea, formatPrice } from "@/lib/format";
import { stripMarkdown } from "@/lib/utils";

/**
 * Default titles/descriptions generated from listing data, used when the
 * admin leaves the SEO fields empty. Unique per listing by construction.
 */
export function propertySpecs(p: Pick<PropertyDetail, "type" | "bedrooms" | "bathrooms" | "areaSqm">) {
  const meta = propertyTypes[p.type];
  return [
    meta.residential && p.bedrooms != null ? (p.bedrooms === 0 ? "studio" : `${p.bedrooms}-bedroom`) : null,
    p.bathrooms != null ? `${p.bathrooms}-bathroom` : null,
    formatArea(p.areaSqm),
  ].filter(Boolean) as string[];
}

export function propertySeoTitle(p: PropertyDetail) {
  if (p.seoTitle) return p.seoTitle;
  const area = p.location?.name;
  return area && !p.title.toLowerCase().includes(area.toLowerCase()) ? `${p.title}, ${area}` : p.title;
}

export function propertySeoDescription(p: PropertyDetail) {
  if (p.seoDescription) return p.seoDescription;
  const meta = propertyTypes[p.type];
  const specs = propertySpecs(p);
  const where = p.project ? `at ${p.project.name}, ${p.location?.name ?? "Addis Ababa"}` : `in ${p.location?.name ?? "Addis Ababa"}`;
  const lead = `${specs.length ? `${specs.join(", ")} ` : ""}${meta.label.toLowerCase()} for sale ${where}`;
  const status = p.status === "sold" ? "Sold." : p.price ? `${formatPrice(p.price)}.` : "Price on request.";
  // Facts + call to action first (they survive the 160-character cut); free text last.
  const extra = p.summary || (p.description ? stripMarkdown(p.description) : "");
  return `${lead.charAt(0).toUpperCase()}${lead.slice(1)}. ${status} Book a free site visit with Temer Properties. ${extra}`.replace(/\s+/g, " ");
}

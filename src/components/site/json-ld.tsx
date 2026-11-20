import type { JsonLdObject } from "@/lib/seo/jsonld";

/**
 * Renders schema.org JSON-LD. Several entities are emitted as one @graph so
 * their @id references resolve together. `<` is escaped to prevent breaking
 * out of the script tag (per the Next.js JSON-LD guide).
 */
export function JsonLd({ data }: { data: Array<JsonLdObject | null | undefined> | JsonLdObject | null | undefined }) {
  const items = (Array.isArray(data) ? data : [data]).filter((d): d is JsonLdObject => Boolean(d));
  if (!items.length) return null;
  const payload =
    items.length === 1 ? { "@context": "https://schema.org", ...items[0] } : { "@context": "https://schema.org", "@graph": items };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }}
    />
  );
}

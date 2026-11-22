import { Search } from "lucide-react";
import { AutoSubmitForm as Form } from "@/components/site/auto-submit-form";
import { buttonStyles } from "@/components/ui/button";
import { inputStyles } from "@/components/ui/form";
import { PROPERTY_TYPES, propertyTypes } from "@/lib/config/property-types";
import { PROPERTY_SORTS, propertySortLabels, type PropertyFilters as Filters } from "@/lib/data/properties";
import { cn } from "@/lib/utils";

export const PRICE_STEPS = [3_000_000, 5_000_000, 8_000_000, 12_000_000, 18_000_000, 25_000_000, 40_000_000];

/**
 * Plain GET form: works without JavaScript; next/form adds client-side navigation.
 * `bare` drops the card chrome (background, padding, ring, shadow) so the fields sit directly in a section.
 * `dense` makes the fields and button shorter (for a thin toolbar row).
 */
export function PropertyFilters({
  filters,
  locations,
  compact,
  bare,
  dense,
  className,
}: {
  filters: Filters;
  locations: Array<{ slug: string; name: string }>;
  compact?: boolean;
  bare?: boolean;
  dense?: boolean;
  className?: string;
}) {
  // `!` because cn() does not resolve conflicts and the button size already sets a height.
  const fieldHeight = dense ? "h-10!" : "h-12";
  const select = cn(inputStyles, fieldHeight);
  return (
    <Form
      action="/properties"
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        !bare && "rounded-none bg-white p-3 shadow-lg shadow-brand-950/5 ring-1 ring-line",
        compact ? "lg:grid-cols-[1fr_1fr_1fr_auto]" : "lg:grid-cols-[repeat(5,1fr)_auto]",
        className,
      )}
    >
      <label className="sr-only" htmlFor="filter-type">
        Property type
      </label>
      <select id="filter-type" name="type" defaultValue={filters.type ?? ""} className={select}>
        <option value="">All property types</option>
        {PROPERTY_TYPES.map((t) => (
          <option key={t} value={t}>
            {propertyTypes[t].plural}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="filter-location">
        Area
      </label>
      <select id="filter-location" name="location" defaultValue={filters.location ?? ""} className={select}>
        <option value="">All areas</option>
        {locations.map((l) => (
          <option key={l.slug} value={l.slug}>
            {l.name}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="filter-bedrooms">
        Bedrooms
      </label>
      <select id="filter-bedrooms" name="bedrooms" defaultValue={filters.bedrooms ? String(filters.bedrooms) : ""} className={select}>
        <option value="">Any bedrooms</option>
        {[1, 2, 3, 4].map((n) => (
          <option key={n} value={n}>
            {n}+ bedrooms
          </option>
        ))}
      </select>

      {!compact ? (
        <>
          <label className="sr-only" htmlFor="filter-max-price">
            Maximum price
          </label>
          <select id="filter-max-price" name="maxPrice" defaultValue={filters.maxPrice ? String(filters.maxPrice) : ""} className={select}>
            <option value="">Any price</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>
                Up to ETB {p / 1_000_000}M
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="filter-sort">
            Sort by
          </label>
          <select id="filter-sort" name="sort" defaultValue={filters.sort ?? "recommended"} className={select}>
            {PROPERTY_SORTS.map((s) => (
              <option key={s} value={s}>
                {propertySortLabels[s]}
              </option>
            ))}
          </select>
        </>
      ) : null}

      <button
        type="submit"
        className={buttonStyles({ size: dense ? "sm" : "lg", className: cn(fieldHeight, "sm:col-span-2 lg:col-span-1") })}
      >
        <Search className="size-4" aria-hidden="true" /> Search
      </button>
    </Form>
  );
}

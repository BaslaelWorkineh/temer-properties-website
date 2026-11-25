import { ChevronDown, Search } from "lucide-react";
import { AutoSubmitForm as Form } from "@/components/site/auto-submit-form";
import { buttonStyles } from "@/components/ui/button";
import { inputStyles } from "@/components/ui/form";
import { PROPERTY_TYPES } from "@/lib/config/property-types";
import { PROPERTY_SORTS, type PropertyFilters as Filters } from "@/lib/data/properties";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary, localizedAreaName } from "@/lib/i18n/dictionaries";
import { getPropertiesDict } from "@/lib/i18n/dict/properties";
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
  lang = "en",
}: {
  filters: Filters;
  locations: Array<{ slug: string; name: string }>;
  compact?: boolean;
  bare?: boolean;
  dense?: boolean;
  className?: string;
  lang?: Locale;
}) {
  const dict = getDictionary(lang);
  const f = getPropertiesDict(lang).filters;
  // `!` because cn() does not resolve conflicts and the button size already sets a height.
  const fieldHeight = dense ? "h-10!" : "h-12";
  // Own arrow (appearance-none + ChevronDown) so the value never runs into the browser's arrow.
  const select = cn(inputStyles, fieldHeight, "appearance-none rounded-none pr-10");
  return (
    <Form
      action="/properties"
      className={cn(
        "grid sm:grid-cols-2 lg:items-end",
        dense ? "gap-3" : "gap-x-4 gap-y-5",
        !bare && (dense ? "rounded-none bg-white p-3 ring-1 ring-line" : "rounded-none bg-white p-5 shadow-lg shadow-brand-950/5 ring-1 ring-line sm:p-7"),
        compact ? "lg:grid-cols-[1fr_1fr_1fr_auto]" : "lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]",
        className,
      )}
    >
      <Field id="filter-type" label={f.type} showLabel={!dense}>
        <select id="filter-type" name="type" defaultValue={filters.type ?? ""} className={select}>
          <option value="">{f.allTypes}</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {dict.types[t].plural}
            </option>
          ))}
        </select>
      </Field>

      <Field id="filter-location" label={f.area} showLabel={!dense}>
        <select id="filter-location" name="location" defaultValue={filters.location ?? ""} className={select}>
          <option value="">{f.allAreas}</option>
          {locations.map((l) => (
            <option key={l.slug} value={l.slug}>
              {localizedAreaName(lang, l.name)}
            </option>
          ))}
        </select>
      </Field>

      <Field id="filter-bedrooms" label={f.bedrooms} showLabel={!dense}>
        <select id="filter-bedrooms" name="bedrooms" defaultValue={filters.bedrooms === 0 ? "studio" : filters.bedrooms ? String(filters.bedrooms) : ""} className={select}>
          <option value="">{f.anyBedrooms}</option>
          <option value="studio">{dict.common.studio}</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {f.nBedrooms(n)}
            </option>
          ))}
        </select>
      </Field>

      {!compact ? (
        <>
          <Field id="filter-max-price" label={f.maxPrice} showLabel={!dense}>
            <select id="filter-max-price" name="maxPrice" defaultValue={filters.maxPrice ? String(filters.maxPrice) : ""} className={select}>
              <option value="">{f.anyPrice}</option>
              {PRICE_STEPS.map((p) => (
                <option key={p} value={p}>
                  {f.upTo(p / 1_000_000)}
                </option>
              ))}
            </select>
          </Field>

          <Field id="filter-sort" label={f.sortBy} showLabel={!dense}>
            <select id="filter-sort" name="sort" defaultValue={filters.sort ?? "recommended"} className={select}>
              {PROPERTY_SORTS.map((s) => (
                <option key={s} value={s}>
                  {f.sorts[s]}
                </option>
              ))}
            </select>
          </Field>
        </>
      ) : null}

      <button
        type="submit"
        className={buttonStyles({ size: dense ? "sm" : "lg", className: cn(fieldHeight, "px-8 sm:col-span-2 lg:col-span-1") })}
      >
        <Search className="size-4" aria-hidden="true" /> {f.search}
      </button>
    </Form>
  );
}

/** A dropdown with its label above it (screen-reader only in the dense toolbar) and its own arrow. */
function Field({ id, label, showLabel, children }: { id: string; label: string; showLabel: boolean; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={showLabel ? "mb-2 block text-xs font-semibold uppercase tracking-wider text-muted" : "sr-only"}>
        {label}
      </label>
      <div className="relative">
        {children}
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      </div>
    </div>
  );
}

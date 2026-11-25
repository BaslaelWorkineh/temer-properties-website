import { ChevronDown } from "lucide-react";
import Form from "next/form";
import { PRICE_STEPS } from "@/components/site/property-filters";
import { PROPERTY_TYPES } from "@/lib/config/property-types";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const selectStyles =
  "h-11 w-full appearance-none border border-line bg-white pl-3 pr-9 text-sm font-medium text-ink outline-none transition focus:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/25";

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </label>
      <div className="relative">
        {children}
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      </div>
    </div>
  );
}

/**
 * Search bar for the home page's "Latest properties" section. Every field has a visible label (so a chosen value
 * still says what it is for), price is included, and Search is a quiet dark button so "View details" on the
 * tiles stays the main action. It submits to /properties (plain GET form, works without JavaScript) only when Search
 * is pressed: unlike the /properties filters, choosing a dropdown here must not leave the home page.
 */
export function HomeSearch({
  locations,
  className,
  lang = "en",
}: {
  locations: Array<{ slug: string; name: string }>;
  className?: string;
  lang?: Locale;
}) {
  const dict = getDictionary(lang);
  return (
    <Form
      action={localePath(lang, "/properties")}
      className={cn("grid gap-x-3 gap-y-4 bg-white p-4 ring-1 ring-line sm:grid-cols-2 sm:p-5 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end", className)}
    >
      <Field id="home-type" label={dict.search.type}>
        <select id="home-type" name="type" defaultValue="" className={selectStyles}>
          <option value="">{dict.search.allTypes}</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {dict.types[t].plural}
            </option>
          ))}
        </select>
      </Field>

      <Field id="home-location" label={dict.search.area}>
        <select id="home-location" name="location" defaultValue="" className={selectStyles}>
          <option value="">{dict.search.allAreas}</option>
          {locations.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.name}
            </option>
          ))}
        </select>
      </Field>

      <Field id="home-bedrooms" label={dict.search.bedrooms}>
        <select id="home-bedrooms" name="bedrooms" defaultValue="" className={selectStyles}>
          <option value="">{dict.search.any}</option>
          <option value="studio">{dict.common.studio}</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {dict.search.nBedrooms(n)}
            </option>
          ))}
        </select>
      </Field>

      <Field id="home-max-price" label={dict.search.maxPrice}>
        <select id="home-max-price" name="maxPrice" defaultValue="" className={selectStyles}>
          <option value="">{dict.search.anyPrice}</option>
          {PRICE_STEPS.map((p) => (
            <option key={p} value={p}>
              {dict.search.upTo(p / 1_000_000)}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center gap-2 bg-brand-950 px-6 text-sm font-semibold text-white transition hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:col-span-2 lg:col-span-1"
      >
        {dict.search.search}
      </button>
    </Form>
  );
}

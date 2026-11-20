import { ArrowRight, ChevronDown } from "lucide-react";
import Form from "next/form";
import { PRICE_STEPS } from "@/components/site/property-filters";
import { PROPERTY_TYPES, propertyTypes } from "@/lib/config/property-types";
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
 * tiles stays the main action. It submits to /properties (plain GET form, works without JavaScript).
 */
export function HomeSearch({ locations, className }: { locations: Array<{ slug: string; name: string }>; className?: string }) {
  return (
    <Form
      action="/properties"
      className={cn("grid gap-x-3 gap-y-4 bg-white p-4 ring-1 ring-line sm:grid-cols-2 sm:p-5 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end", className)}
    >
      <Field id="home-type" label="Property type">
        <select id="home-type" name="type" defaultValue="" className={selectStyles}>
          <option value="">All types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {propertyTypes[t].plural}
            </option>
          ))}
        </select>
      </Field>

      <Field id="home-location" label="Area">
        <select id="home-location" name="location" defaultValue="" className={selectStyles}>
          <option value="">All areas</option>
          {locations.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.name}
            </option>
          ))}
        </select>
      </Field>

      <Field id="home-bedrooms" label="Bedrooms">
        <select id="home-bedrooms" name="bedrooms" defaultValue="" className={selectStyles}>
          <option value="">Any</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}+ bedrooms
            </option>
          ))}
        </select>
      </Field>

      <Field id="home-max-price" label="Max price">
        <select id="home-max-price" name="maxPrice" defaultValue="" className={selectStyles}>
          <option value="">Any price</option>
          {PRICE_STEPS.map((p) => (
            <option key={p} value={p}>
              Up to ETB {p / 1_000_000}M
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center gap-2 bg-brand-950 px-6 text-sm font-semibold text-white transition hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:col-span-2 lg:col-span-1"
      >
        Search <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </Form>
  );
}

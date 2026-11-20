import { PROPERTY_TYPES, type PropertyType } from "@/lib/config/property-types";
import { PROPERTY_SORTS, type PropertyFilters, type PropertySort } from "@/lib/data/properties";

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

function positiveInt(v: string | undefined, max: number) {
  if (!v || !/^\d+$/.test(v)) return undefined;
  const n = Number(v);
  return n > 0 && n <= max ? n : undefined;
}

/** Whitelists and normalises /properties query parameters (also keeps cache keys tidy). */
export function parsePropertyFilters(params: RawParams): PropertyFilters {
  const type = first(params.type);
  const location = first(params.location);
  const project = first(params.project);
  const sort = first(params.sort);
  const filters: PropertyFilters = {};
  if (type && (PROPERTY_TYPES as readonly string[]).includes(type)) filters.type = type as PropertyType;
  if (location && /^[a-z0-9-]{1,90}$/.test(location)) filters.location = location;
  if (project && /^[a-z0-9-]{1,90}$/.test(project)) filters.project = project;
  const bedrooms = positiveInt(first(params.bedrooms), 10);
  if (bedrooms) filters.bedrooms = bedrooms;
  const minPrice = positiveInt(first(params.minPrice), 10_000_000_000);
  if (minPrice) filters.minPrice = minPrice;
  const maxPrice = positiveInt(first(params.maxPrice), 10_000_000_000);
  if (maxPrice) filters.maxPrice = maxPrice;
  if (sort && (PROPERTY_SORTS as readonly string[]).includes(sort) && sort !== "recommended") filters.sort = sort as PropertySort;
  if (first(params.status) === "all") filters.includeSold = true;
  const page = positiveInt(first(params.page), 10_000);
  if (page && page > 1) filters.page = page;
  return filters;
}

export function filtersToSearchParams(filters: PropertyFilters, overrides: Partial<PropertyFilters> = {}) {
  const merged = { ...filters, ...overrides };
  const sp = new URLSearchParams();
  if (merged.type) sp.set("type", merged.type);
  if (merged.location) sp.set("location", merged.location);
  if (merged.project) sp.set("project", merged.project);
  if (merged.bedrooms) sp.set("bedrooms", String(merged.bedrooms));
  if (merged.minPrice) sp.set("minPrice", String(merged.minPrice));
  if (merged.maxPrice) sp.set("maxPrice", String(merged.maxPrice));
  if (merged.sort && merged.sort !== "recommended") sp.set("sort", merged.sort);
  if (merged.includeSold) sp.set("status", "all");
  if (merged.page && merged.page > 1) sp.set("page", String(merged.page));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

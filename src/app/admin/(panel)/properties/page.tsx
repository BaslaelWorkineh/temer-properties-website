import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { and, count, desc, eq, like, type SQL } from "drizzle-orm";
import { Building2, ExternalLink, Plus, Search } from "lucide-react";
import { PAGE_SIZE, firstParam, pageFromParam } from "@/components/admin/helpers";
import { EmptyState, Notice, PageHeader, Pagination, TableCard, Thumb, YesNo, td, th } from "@/components/admin/ui";
import { Badge, propertyStatusTone } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { inputStyles } from "@/components/ui/form";
import { db } from "@/db";
import { locations, projects, properties } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { PROPERTY_STATUSES, PROPERTY_TYPES, propertyStatusLabels, propertyTypes, type PropertyStatus, type PropertyType } from "@/lib/config/property-types";
import { formatDate, formatPriceCompact } from "@/lib/format";

export const metadata: Metadata = { title: "Properties" };

export default async function AdminPropertiesPage({ searchParams }: PageProps<"/admin/properties">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() ?? "";
  const statusParam = firstParam(sp.status);
  const typeParam = firstParam(sp.type);
  const status = PROPERTY_STATUSES.includes(statusParam as PropertyStatus) ? (statusParam as PropertyStatus) : undefined;
  const type = PROPERTY_TYPES.includes(typeParam as PropertyType) ? (typeParam as PropertyType) : undefined;
  const page = pageFromParam(sp.page);

  const filters: SQL[] = [];
  if (q) filters.push(like(properties.title, `%${q}%`));
  if (status) filters.push(eq(properties.status, status));
  if (type) filters.push(eq(properties.type, type));
  const where = filters.length ? and(...filters) : undefined;

  const [rows, [totalRow]] = await Promise.all([
    db
      .select({
        id: properties.id,
        title: properties.title,
        slug: properties.slug,
        type: properties.type,
        status: properties.status,
        price: properties.price,
        images: properties.images,
        isPublished: properties.isPublished,
        isFeatured: properties.isFeatured,
        updatedAt: properties.updatedAt,
        locationName: locations.name,
        projectName: projects.name,
      })
      .from(properties)
      .leftJoin(locations, eq(locations.id, properties.locationId))
      .leftJoin(projects, eq(projects.id, properties.projectId))
      .where(where)
      .orderBy(desc(properties.updatedAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(properties).where(where),
  ]);
  const total = totalRow?.n ?? 0;
  const filtered = Boolean(q || status || type);

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (p > 1) params.set("page", String(p));
    const query = params.toString();
    return `/admin/properties${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Properties"
        description="Every unit for sale. Each published property gets its own page on the website."
        actions={
          <Link href="/admin/properties/new" className={buttonStyles({ size: "sm" })}>
            <Plus className="size-4" aria-hidden="true" /> New property
          </Link>
        }
      />

      {firstParam(sp.deleted) ? <Notice>The property was deleted.</Notice> : null}

      <Form action="/admin/properties" className="mb-5 grid gap-3 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-line sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="sr-only" htmlFor="q">
          Search by title
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by title…" className={inputStyles} />
        <label className="sr-only" htmlFor="status">
          Status
        </label>
        <select id="status" name="status" defaultValue={status ?? ""} className={inputStyles}>
          <option value="">All statuses</option>
          {PROPERTY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {propertyStatusLabels[s]}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="type">
          Type
        </label>
        <select id="type" name="type" defaultValue={type ?? ""} className={inputStyles}>
          <option value="">All types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {propertyTypes[t].plural}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonStyles({ variant: "secondary" })}>
          <Search className="size-4" aria-hidden="true" /> Filter
        </button>
      </Form>

      {rows.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={filtered ? "No properties match these filters" : "No properties yet"}
          description={filtered ? "Try a different search or clear the filters." : "Add your first listing to publish it on the website."}
          action={
            filtered ? (
              <Link href="/admin/properties" className={buttonStyles({ variant: "outline", size: "sm" })}>
                Clear filters
              </Link>
            ) : (
              <Link href="/admin/properties/new" className={buttonStyles({ size: "sm" })}>
                <Plus className="size-4" aria-hidden="true" /> New property
              </Link>
            )
          }
        />
      ) : (
        <>
          <TableCard>
            <table className="min-w-full divide-y divide-line">
              <thead className="bg-soft/60">
                <tr>
                  <th scope="col" className={th}>Property</th>
                  <th scope="col" className={th}>Location / project</th>
                  <th scope="col" className={th}>Price</th>
                  <th scope="col" className={th}>Status</th>
                  <th scope="col" className={th}>Website</th>
                  <th scope="col" className={th}>Updated</th>
                  <th scope="col" className={th}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-soft/50">
                    <td className={td}>
                      <div className="flex min-w-64 items-center gap-3">
                        <Thumb src={p.images[0]?.url} />
                        <div className="min-w-0">
                          <Link href={`/admin/properties/${p.id}`} className="line-clamp-2 font-semibold text-ink hover:text-brand-700">
                            {p.title}
                          </Link>
                          <span className="text-xs text-muted">{propertyTypes[p.type].label}</span>
                        </div>
                      </div>
                    </td>
                    <td className={`${td} text-muted`}>
                      <span className="block text-ink">{p.locationName ?? "—"}</span>
                      <span className="block text-xs">{p.projectName ?? ""}</span>
                    </td>
                    <td className={`${td} whitespace-nowrap font-medium`}>{formatPriceCompact(p.price)}</td>
                    <td className={td}>
                      <Badge tone={propertyStatusTone[p.status]}>{propertyStatusLabels[p.status]}</Badge>
                    </td>
                    <td className={td}>
                      <YesNo value={p.isPublished} yes="Published" no="Hidden" />
                      {p.isFeatured ? <span className="mt-1 block text-xs font-medium text-[#6b5016]">★ Featured</span> : null}
                    </td>
                    <td className={`${td} whitespace-nowrap text-muted`}>{formatDate(p.updatedAt, { dateStyle: "medium" })}</td>
                    <td className={`${td} whitespace-nowrap text-right`}>
                      {p.isPublished ? (
                        <a href={`/properties/${p.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                          View <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} hrefFor={hrefFor} />
        </>
      )}
    </>
  );
}

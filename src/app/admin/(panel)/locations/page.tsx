import type { Metadata } from "next";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { ExternalLink, MapPin, Plus } from "lucide-react";
import { deletedMessage } from "@/components/admin/helpers";
import { EmptyState, Notice, PageHeader, TableCard, Thumb, YesNo, td, th } from "@/components/admin/ui";
import { buttonStyles } from "@/components/ui/button";
import { db } from "@/db";
import { locations, projects, properties } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { BulkDelete, RowCheckbox, SelectAllCheckbox } from "@/components/admin/bulk-delete";
import { deleteLocationAction } from "./actions";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Locations" };

export default async function AdminLocationsPage({ searchParams }: PageProps<"/admin/locations">) {
  const me = await requireAdmin();
  const canDelete = me.role === "admin";
  const sp = await searchParams;

  const propertyCounts = db
    .select({ locationId: properties.locationId, propertyN: count().as("property_n") })
    .from(properties)
    .where(eq(properties.isPublished, true))
    .groupBy(properties.locationId)
    .as("property_counts");
  const projectCounts = db
    .select({ locationId: projects.locationId, projectN: count().as("project_n") })
    .from(projects)
    .where(eq(projects.isPublished, true))
    .groupBy(projects.locationId)
    .as("project_counts");

  const rows = await db
    .select({
      id: locations.id,
      name: locations.name,
      slug: locations.slug,
      city: locations.city,
      image: locations.image,
      isPublished: locations.isPublished,
      sortOrder: locations.sortOrder,
      updatedAt: locations.updatedAt,
      propertyCount: propertyCounts.propertyN,
      projectCount: projectCounts.projectN,
    })
    .from(locations)
    .leftJoin(propertyCounts, eq(propertyCounts.locationId, locations.id))
    .leftJoin(projectCounts, eq(projectCounts.locationId, locations.id))
    .orderBy(asc(locations.sortOrder), asc(locations.name));

  return (
    <>
      <PageHeader
        title="Locations"
        description="Area pages target searches like “apartments for sale in Sarbet”. Areas with no published listings or projects are kept out of Google automatically."
        actions={
          <Link href="/admin/locations/new" className={buttonStyles({ size: "sm" })}>
            <Plus className="size-4" aria-hidden="true" /> New location
          </Link>
        }
      />
      {deletedMessage(sp.deleted, "location", "locations") ? <Notice>{deletedMessage(sp.deleted, "location", "locations", "Their properties and projects were kept and unlinked.")}</Notice> : null}

      {rows.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No locations yet"
          description="Add the neighbourhoods where you build so each gets its own search-friendly page."
          action={
            <Link href="/admin/locations/new" className={buttonStyles({ size: "sm" })}>
              <Plus className="size-4" aria-hidden="true" /> New location
            </Link>
          }
        />
      ) : (
        <BulkDelete key={rows.map((r) => r.id).join()} enabled={canDelete} action={deleteLocationAction} singular="location" plural="locations">
          <TableCard>
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-soft/60">
              <tr>
                {canDelete ? (
                  <th scope="col" className={`${th} w-10`}>
                    <SelectAllCheckbox />
                  </th>
                ) : null}
                <th scope="col" className={th}>Location</th>
                <th scope="col" className={th}>Listings</th>
                <th scope="col" className={th}>Projects</th>
                <th scope="col" className={th}>Website</th>
                <th scope="col" className={th}>Updated</th>
                <th scope="col" className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((l) => {
                const hasContent = (l.propertyCount ?? 0) + (l.projectCount ?? 0) > 0;
                return (
                  <tr key={l.id} className="hover:bg-soft/50">
                    {canDelete ? (
                      <td className={`${td} w-10`}>
                        <RowCheckbox id={l.id} label={l.name} />
                      </td>
                    ) : null}
                    <td className={td}>
                      <div className="flex min-w-48 items-center gap-3">
                        <Thumb src={l.image?.url} />
                        <div>
                          <Link href={`/admin/locations/${l.id}`} className="font-semibold text-ink hover:text-brand-700">
                            {l.name}
                          </Link>
                          <span className="block text-xs text-muted">{l.city}</span>
                        </div>
                      </div>
                    </td>
                    <td className={`${td} text-muted`}>{l.propertyCount ?? 0}</td>
                    <td className={`${td} text-muted`}>{l.projectCount ?? 0}</td>
                    <td className={td}>
                      <YesNo value={l.isPublished} yes="Published" no="Hidden" />
                      {l.isPublished && !hasContent ? <span className="mt-1 block text-xs text-amber-700">Not indexed (no content yet)</span> : null}
                    </td>
                    <td className={`${td} whitespace-nowrap text-muted`}>{formatDate(l.updatedAt, { dateStyle: "medium" })}</td>
                    <td className={`${td} whitespace-nowrap text-right`}>
                      {l.isPublished ? (
                        <a href={`/locations/${l.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                          View <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableCard>
          </BulkDelete>
      )}
    </>
  );
}

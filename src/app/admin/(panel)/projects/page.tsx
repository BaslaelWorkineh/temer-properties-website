import type { Metadata } from "next";
import Link from "next/link";
import { asc, count, desc, eq } from "drizzle-orm";
import { ExternalLink, Layers, Plus } from "lucide-react";
import { deletedMessage } from "@/components/admin/helpers";
import { EmptyState, Notice, PageHeader, TableCard, Thumb, YesNo, td, th } from "@/components/admin/ui";
import { Badge, projectStatusTone } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { db } from "@/db";
import { locations, projects, properties } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { BulkDelete, RowCheckbox, SelectAllCheckbox } from "@/components/admin/bulk-delete";
import { deleteProjectAction } from "./actions";
import { projectStatusLabels } from "@/lib/config/property-types";
import { formatDate } from "@/lib/format";

// Admin pages are per-request and authenticated; they are allowed to block (see the panel layout).
export const instant = false;

export const metadata: Metadata = { title: "Projects" };

export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  const me = await requireAdmin();
  const canDelete = me.role === "admin";
  const sp = await searchParams;

  const unitCounts = db
    .select({ projectId: properties.projectId, n: count().as("n") })
    .from(properties)
    .groupBy(properties.projectId)
    .as("unit_counts");

  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      status: projects.status,
      images: projects.images,
      totalUnits: projects.totalUnits,
      isPublished: projects.isPublished,
      isFeatured: projects.isFeatured,
      updatedAt: projects.updatedAt,
      locationName: locations.name,
      listings: unitCounts.n,
    })
    .from(projects)
    .leftJoin(locations, eq(locations.id, projects.locationId))
    .leftJoin(unitCounts, eq(unitCounts.projectId, projects.id))
    .orderBy(asc(projects.sortOrder), desc(projects.updatedAt));

  return (
    <>
      <PageHeader
        title="Projects"
        description="Developments and buildings. Each published project has its own page listing its available units."
        actions={
          <Link href="/admin/projects/new" className={buttonStyles({ size: "sm" })}>
            <Plus className="size-4" aria-hidden="true" /> New project
          </Link>
        }
      />
      {deletedMessage(sp.deleted, "project", "projects") ? <Notice>{deletedMessage(sp.deleted, "project", "projects", "Their properties were kept and unlinked.")}</Notice> : null}

      {rows.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No projects yet"
          description="Add your sites (current and delivered) so buyers can explore each development."
          action={
            <Link href="/admin/projects/new" className={buttonStyles({ size: "sm" })}>
              <Plus className="size-4" aria-hidden="true" /> New project
            </Link>
          }
        />
      ) : (
        <BulkDelete key={rows.map((r) => r.id).join()} enabled={canDelete} action={deleteProjectAction} singular="project" plural="projects">
          <TableCard>
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-soft/60">
              <tr>
                {canDelete ? (
                  <th scope="col" className={`${th} w-10`}>
                    <SelectAllCheckbox />
                  </th>
                ) : null}
                <th scope="col" className={th}>Project</th>
                <th scope="col" className={th}>Location</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}>Listings</th>
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
                    {canDelete ? (
                      <td className={`${td} w-10`}>
                        <RowCheckbox id={p.id} label={p.name} />
                      </td>
                    ) : null}
                  <td className={td}>
                    <div className="flex min-w-56 items-center gap-3">
                      <Thumb src={p.images[0]?.url} />
                      <Link href={`/admin/projects/${p.id}`} className="font-semibold text-ink hover:text-brand-700">
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td className={`${td} text-muted`}>{p.locationName ?? "—"}</td>
                  <td className={td}>
                    <Badge tone={projectStatusTone[p.status]}>{projectStatusLabels[p.status]}</Badge>
                  </td>
                  <td className={`${td} text-muted`}>
                    {p.listings ?? 0}
                    {p.totalUnits ? <span className="text-xs"> / {p.totalUnits} units</span> : null}
                  </td>
                  <td className={td}>
                    <YesNo value={p.isPublished} yes="Published" no="Hidden" />
                    {p.isFeatured ? <span className="mt-1 block text-xs font-medium text-[#6b5016]">★ Featured</span> : null}
                  </td>
                  <td className={`${td} whitespace-nowrap text-muted`}>{formatDate(p.updatedAt, { dateStyle: "medium" })}</td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    {p.isPublished ? (
                      <a href={`/projects/${p.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                        View <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
          </BulkDelete>
      )}
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { getLocationOptions, toId } from "@/app/admin/_lib/server";
import { deleteProjectAction } from "@/app/admin/(panel)/projects/actions";
import { DeleteButton } from "@/components/admin/form-controls";
import { OwnerOnly } from "@/components/admin/owner-only";
import { firstParam } from "@/components/admin/helpers";
import { ProjectForm } from "@/components/admin/project-form";
import { Notice, PageHeader } from "@/components/admin/ui";
import { Badge, projectStatusTone } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { projectStatusLabels } from "@/lib/config/property-types";
import { siteUrl } from "@/lib/config/site";
import { formatDateTime } from "@/lib/format";

// Admin pages are per-request and authenticated; they are allowed to block (see the panel layout).
export const instant = false;

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params, searchParams }: PageProps<"/admin/projects/[id]">) {
  await requireAdmin();
  const id = toId((await params).id);
  if (!id) notFound();

  const [[project], locationOptions, sp] = await Promise.all([
    db.select().from(projects).where(eq(projects.id, id)).limit(1),
    getLocationOptions(),
    searchParams,
  ]);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        title={project.name}
        back={{ href: "/admin/projects", label: "Projects" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={projectStatusTone[project.status]}>{projectStatusLabels[project.status]}</Badge>
            {project.isPublished ? <Badge tone="green">Published</Badge> : <Badge>Hidden</Badge>}
            <span>Last updated {formatDateTime(project.updatedAt)}</span>
          </span>
        }
        actions={
          <>
            {project.isPublished ? (
              <a href={`/projects/${project.slug}`} target="_blank" rel="noopener" className={buttonStyles({ variant: "outline", size: "sm" })}>
                <ExternalLink className="size-4" aria-hidden="true" /> View page
              </a>
            ) : null}
            <OwnerOnly><DeleteButton
              action={deleteProjectAction}
              id={project.id}
              confirmMessage={`Delete “${project.name}”? Its page disappears from the website. Linked properties are kept but unlinked.`}
            /></OwnerOnly>
          </>
        }
      />
      {firstParam(sp.saved) ? <Notice>Project created.</Notice> : null}
      <ProjectForm project={project} locations={locationOptions} siteUrl={siteUrl} />
    </>
  );
}

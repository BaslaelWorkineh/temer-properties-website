import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { toId } from "@/app/admin/_lib/server";
import { deleteLocationAction } from "@/app/admin/(panel)/locations/actions";
import { DeleteButton } from "@/components/admin/form-controls";
import { OwnerOnly } from "@/components/admin/owner-only";
import { firstParam } from "@/components/admin/helpers";
import { LocationForm } from "@/components/admin/location-form";
import { FreshOnNavigate } from "@/components/admin/fresh-on-navigate";
import { Notice, PageHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { siteUrl } from "@/lib/config/site";
import { formatDateTime } from "@/lib/format";

// Admin pages are per-request and authenticated; they are allowed to block (see the panel layout).
export const instant = false;

export const metadata: Metadata = { title: "Edit location" };

export default async function EditLocationPage({ params, searchParams }: PageProps<"/admin/locations/[id]">) {
  await requireAdmin();
  const id = toId((await params).id);
  if (!id) notFound();

  const [[location], sp] = await Promise.all([db.select().from(locations).where(eq(locations.id, id)).limit(1), searchParams]);
  if (!location) notFound();

  return (
    <>
      <PageHeader
        title={location.name}
        back={{ href: "/admin/locations", label: "Locations" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {location.isPublished ? <Badge tone="green">Published</Badge> : <Badge>Hidden</Badge>}
            <span>Last updated {formatDateTime(location.updatedAt)}</span>
          </span>
        }
        actions={
          <>
            {location.isPublished ? (
              <a href={`/locations/${location.slug}`} target="_blank" rel="noopener" className={buttonStyles({ variant: "outline", size: "sm" })}>
                <ExternalLink className="size-4" aria-hidden="true" /> View page
              </a>
            ) : null}
            <OwnerOnly><DeleteButton
              action={deleteLocationAction}
              id={location.id}
              confirmMessage={`Delete “${location.name}”? Its area page disappears. Properties and projects there are kept but unlinked.`}
            /></OwnerOnly>
          </>
        }
      />
      {firstParam(sp.saved) ? <Notice>Location created.</Notice> : null}
      <FreshOnNavigate>
        <LocationForm location={location} siteUrl={siteUrl} />
      </FreshOnNavigate>
    </>
  );
}

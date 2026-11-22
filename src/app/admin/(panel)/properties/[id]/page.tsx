import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { getLocationOptions, getProjectOptions, toId } from "@/app/admin/_lib/server";
import { deletePropertyAction } from "@/app/admin/(panel)/properties/actions";
import { DeleteButton } from "@/components/admin/form-controls";
import { OwnerOnly } from "@/components/admin/owner-only";
import { firstParam } from "@/components/admin/helpers";
import { PropertyForm } from "@/components/admin/property-form";
import { Notice, PageHeader } from "@/components/admin/ui";
import { Badge, propertyStatusTone } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { propertyStatusLabels } from "@/lib/config/property-types";
import { siteUrl } from "@/lib/config/site";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Edit property" };

export default async function EditPropertyPage({ params, searchParams }: PageProps<"/admin/properties/[id]">) {
  await requireAdmin();
  const id = toId((await params).id);
  if (!id) notFound();

  const [[property], locationOptions, projectOptions, sp] = await Promise.all([
    db.select().from(properties).where(eq(properties.id, id)).limit(1),
    getLocationOptions(),
    getProjectOptions(),
    searchParams,
  ]);
  if (!property) notFound();

  return (
    <>
      <PageHeader
        title={property.title}
        back={{ href: "/admin/properties", label: "Properties" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={propertyStatusTone[property.status]}>{propertyStatusLabels[property.status]}</Badge>
            {property.isPublished ? <Badge tone="green">Published</Badge> : <Badge>Hidden</Badge>}
            <span>Last updated {formatDateTime(property.updatedAt)}</span>
          </span>
        }
        actions={
          <>
            {property.isPublished ? (
              <a href={`/properties/${property.slug}`} target="_blank" rel="noopener" className={buttonStyles({ variant: "outline", size: "sm" })}>
                <ExternalLink className="size-4" aria-hidden="true" /> View page
              </a>
            ) : null}
            <OwnerOnly><DeleteButton
              action={deletePropertyAction}
              id={property.id}
              confirmMessage={`Delete “${property.title}”? Its page will disappear from the website. Consider marking it Sold instead to keep the page.`}
            /></OwnerOnly>
          </>
        }
      />
      {firstParam(sp.saved) ? <Notice>Property created. You can keep editing or view it on the website.</Notice> : null}
      <PropertyForm property={property} locations={locationOptions} projects={projectOptions} siteUrl={siteUrl} />
    </>
  );
}

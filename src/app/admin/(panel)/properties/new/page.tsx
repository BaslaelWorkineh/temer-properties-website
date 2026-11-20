import type { Metadata } from "next";
import { getLocationOptions, getProjectOptions } from "@/app/admin/_lib/server";
import { PropertyForm } from "@/components/admin/property-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { siteUrl } from "@/lib/config/site";

export const metadata: Metadata = { title: "New property" };

export default async function NewPropertyPage() {
  await requireAdmin();
  const [locationOptions, projectOptions] = await Promise.all([getLocationOptions(), getProjectOptions()]);

  return (
    <>
      <PageHeader title="New property" back={{ href: "/admin/properties", label: "Properties" }} />
      <PropertyForm property={null} locations={locationOptions} projects={projectOptions} siteUrl={siteUrl} />
    </>
  );
}

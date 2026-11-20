import type { Metadata } from "next";
import { LocationForm } from "@/components/admin/location-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { siteUrl } from "@/lib/config/site";

export const metadata: Metadata = { title: "New location" };

export default async function NewLocationPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="New location" back={{ href: "/admin/locations", label: "Locations" }} />
      <LocationForm location={null} siteUrl={siteUrl} />
    </>
  );
}

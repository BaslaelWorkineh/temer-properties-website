import type { Metadata } from "next";
import { getLocationOptions } from "@/app/admin/_lib/server";
import { ProjectForm } from "@/components/admin/project-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { siteUrl } from "@/lib/config/site";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  await requireAdmin();
  const locationOptions = await getLocationOptions();

  return (
    <>
      <PageHeader title="New project" back={{ href: "/admin/projects", label: "Projects" }} />
      <ProjectForm project={null} locations={locationOptions} siteUrl={siteUrl} />
    </>
  );
}

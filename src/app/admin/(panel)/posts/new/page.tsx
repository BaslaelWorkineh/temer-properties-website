import type { Metadata } from "next";
import { PostForm } from "@/components/admin/post-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { siteUrl } from "@/lib/config/site";

export const metadata: Metadata = { title: "New guide" };

export default async function NewPostPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="New guide" back={{ href: "/admin/posts", label: "Guides" }} />
      <PostForm post={null} siteUrl={siteUrl} />
    </>
  );
}

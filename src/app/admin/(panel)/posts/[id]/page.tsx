import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { toId } from "@/app/admin/_lib/server";
import { deletePostAction } from "@/app/admin/(panel)/posts/actions";
import { DeleteButton } from "@/components/admin/form-controls";
import { OwnerOnly } from "@/components/admin/owner-only";
import { firstParam } from "@/components/admin/helpers";
import { PostForm } from "@/components/admin/post-form";
import { FreshOnNavigate } from "@/components/admin/fresh-on-navigate";
import { Notice, PageHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { siteUrl } from "@/lib/config/site";
import { formatDateTime } from "@/lib/format";

// Admin pages are per-request and authenticated; they are allowed to block (see the panel layout).
export const instant = false;

export const metadata: Metadata = { title: "Edit guide" };

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/posts/[id]">) {
  await requireAdmin();
  const id = toId((await params).id);
  if (!id) notFound();

  const [[post], sp] = await Promise.all([db.select().from(posts).where(eq(posts.id, id)).limit(1), searchParams]);
  if (!post) notFound();

  return (
    <>
      <PageHeader
        title={post.title}
        back={{ href: "/admin/posts", label: "Guides" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {post.isPublished ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
            <span>Last updated {formatDateTime(post.updatedAt)}</span>
          </span>
        }
        actions={
          <>
            {post.isPublished ? (
              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener" className={buttonStyles({ variant: "outline", size: "sm" })}>
                <ExternalLink className="size-4" aria-hidden="true" /> View page
              </a>
            ) : null}
            <OwnerOnly><DeleteButton action={deletePostAction} id={post.id} confirmMessage={`Delete “${post.title}”? This cannot be undone.`} /></OwnerOnly>
          </>
        }
      />
      {firstParam(sp.saved) ? <Notice>Guide created.</Notice> : null}
      <FreshOnNavigate>
        <PostForm post={post} siteUrl={siteUrl} />
      </FreshOnNavigate>
    </>
  );
}

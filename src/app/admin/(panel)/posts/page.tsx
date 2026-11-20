import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { ExternalLink, Newspaper, Plus } from "lucide-react";
import { firstParam } from "@/components/admin/helpers";
import { EmptyState, Notice, PageHeader, TableCard, Thumb, td, th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Guides" };

export default async function AdminPostsPage({ searchParams }: PageProps<"/admin/posts">) {
  await requireAdmin();
  const sp = await searchParams;

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      coverImage: posts.coverImage,
      isPublished: posts.isPublished,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .orderBy(desc(posts.updatedAt));

  return (
    <>
      <PageHeader
        title="Guides"
        description="Articles published under /blog. Useful, original guides earn links and rank for questions buyers ask."
        actions={
          <Link href="/admin/posts/new" className={buttonStyles({ size: "sm" })}>
            <Plus className="size-4" aria-hidden="true" /> New guide
          </Link>
        }
      />
      {firstParam(sp.deleted) ? <Notice>The guide was deleted.</Notice> : null}

      {rows.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No guides yet"
          description="Start with the questions your sales team answers every day."
          action={
            <Link href="/admin/posts/new" className={buttonStyles({ size: "sm" })}>
              <Plus className="size-4" aria-hidden="true" /> New guide
            </Link>
          }
        />
      ) : (
        <TableCard>
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-soft/60">
              <tr>
                <th scope="col" className={th}>Guide</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}>Published</th>
                <th scope="col" className={th}>Updated</th>
                <th scope="col" className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-soft/50">
                  <td className={td}>
                    <div className="flex min-w-64 items-center gap-3">
                      <Thumb src={p.coverImage?.url} />
                      <Link href={`/admin/posts/${p.id}`} className="line-clamp-2 font-semibold text-ink hover:text-brand-700">
                        {p.title}
                      </Link>
                    </div>
                  </td>
                  <td className={td}>{p.isPublished ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}</td>
                  <td className={`${td} whitespace-nowrap text-muted`}>{p.publishedAt ? formatDate(p.publishedAt, { dateStyle: "medium" }) : "—"}</td>
                  <td className={`${td} whitespace-nowrap text-muted`}>{formatDate(p.updatedAt, { dateStyle: "medium" })}</td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    {p.isPublished ? (
                      <a href={`/blog/${p.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                        View <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      )}
    </>
  );
}

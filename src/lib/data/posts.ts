import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { TAGS } from "@/lib/cache-tags";

export async function getPublishedPosts(limit?: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts);
  const query = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      authorName: posts.authorName,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(eq(posts.isPublished, true))
    .orderBy(desc(posts.publishedAt), desc(posts.id));
  return limit ? query.limit(limit) : query;
}

export type PostSummary = Awaited<ReturnType<typeof getPublishedPosts>>[number];

export async function getPostBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts);
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.isPublished, true)))
    .limit(1);
  return post ?? null;
}

import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { TAGS } from "@/lib/cache-tags";
import type { Locale } from "@/lib/i18n/config";
import { isTranslated, localizeRow } from "@/lib/i18n/localize";

export async function getPublishedPosts(limit?: number, lang: Locale = "en") {
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
      translations: posts.translations,
    })
    .from(posts)
    .where(eq(posts.isPublished, true))
    .orderBy(desc(posts.publishedAt), desc(posts.id));
  const rows = await (limit ? query.limit(limit) : query);
  return rows.map(({ translations, ...r }) => ({
    ...localizeRow(r, translations, lang),
    translated: isTranslated(translations, ["title", "content"]),
  }));
}

export type PostSummary = Awaited<ReturnType<typeof getPublishedPosts>>[number];

export async function getPostBySlug(slug: string, lang: Locale = "en") {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts);
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.isPublished, true)))
    .limit(1);
  if (!post) return null;
  return { ...localizeRow(post, post.translations, lang), translated: isTranslated(post.translations, ["title", "content"]) };
}

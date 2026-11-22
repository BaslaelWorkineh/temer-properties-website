"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { invalidImageMessage, resolveSlug, toId } from "@/app/admin/_lib/server";
import { db } from "@/db";
import { posts, type ImageItem } from "@/db/schema";
import { requireAdmin, requireOwner } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { refreshPublicContent } from "@/lib/revalidate";
import { bool, errorState, json, optStr, postInputSchema, validationError, type FormState } from "@/lib/validation";

type Saved = { id: number; slug: string };

export async function savePostAction(_prev: FormState<Saved>, formData: FormData): Promise<FormState<Saved>> {
  await requireAdmin();

  const id = toId(formData.get("id"));
  const [existing] = id
    ? await db.select({ id: posts.id, slug: posts.slug, publishedAt: posts.publishedAt }).from(posts).where(eq(posts.id, id)).limit(1)
    : [];
  if (id && !existing) return errorState("This guide no longer exists.");

  const rawContent = formData.get("content");
  const parsed = postInputSchema.safeParse({
    title: optStr(formData, "title") ?? "",
    slug: optStr(formData, "slug"),
    excerpt: optStr(formData, "excerpt"),
    content: typeof rawContent === "string" ? rawContent.replace(/\r\n/g, "\n").trim() : "",
    coverImage: json<ImageItem | null>(formData, "coverImage", null),
    authorName: optStr(formData, "authorName"),
    isPublished: bool(formData, "isPublished"),
    seoTitle: optStr(formData, "seoTitle"),
    seoDescription: optStr(formData, "seoDescription"),
  });
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;

  if (data.isPublished && data.content.length < 200) {
    return errorState("Please correct the highlighted fields.", { content: ["Write at least a few paragraphs before publishing (200+ characters)."] });
  }

  const imageError = invalidImageMessage([data.coverImage]);
  if (imageError) return errorState(imageError, { coverImage: [imageError] });

  const slug = await resolveSlug("posts", { requested: data.slug, source: data.title, currentSlug: existing?.slug, excludeId: existing?.id });
  if ("error" in slug) return errorState("Please correct the highlighted fields.", { slug: [slug.error] });

  const values = {
    title: data.title,
    slug: slug.slug,
    excerpt: data.excerpt ?? null,
    content: data.content,
    coverImage: data.coverImage,
    authorName: data.authorName,
    isPublished: data.isPublished,
    // First publication date is kept forever (articles shouldn't jump to the top on every edit).
    publishedAt: existing?.publishedAt ?? (data.isPublished ? new Date() : null),
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
  };

  let savedId: number;
  try {
    if (existing) {
      await db.update(posts).set(values).where(eq(posts.id, existing.id));
      savedId = existing.id;
    } else {
      const [row] = await db.insert(posts).values(values).returning({ id: posts.id });
      savedId = row.id;
    }
  } catch (err) {
    console.error("[admin] saving guide failed", err);
    return errorState("Could not save the guide. Please try again.");
  }

  refreshPublicContent(TAGS.posts);

  if (!existing) redirect(`/admin/posts/${savedId}?saved=1`);
  refresh();
  return { status: "success", message: data.isPublished ? "Saved and live on the website." : "Draft saved.", data: { id: savedId, slug: values.slug } };
}

export async function deletePostAction(formData: FormData) {
  await requireOwner();
  const id = toId(formData.get("id"));
  if (!id) return;
  await db.delete(posts).where(eq(posts.id, id));
  refreshPublicContent(TAGS.posts);
  redirect("/admin/posts?deleted=1");
}

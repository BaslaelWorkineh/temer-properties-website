"use server";

import { eq, inArray } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { invalidImageMessage, resolveSlug, toId, toIds } from "@/app/admin/_lib/server";
import { db } from "@/db";
import { bookings, inquiries, projects, properties, type FaqItem, type ImageItem } from "@/db/schema";
import { requireAdmin, requireOwner } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { refreshPublicContent } from "@/lib/revalidate";
import { bool, errorState, json, lines, optStr, projectInputSchema, readAm, str, validationError, type FormState } from "@/lib/validation";

type Saved = { id: number; slug: string };

export async function saveProjectAction(_prev: FormState<Saved>, formData: FormData): Promise<FormState<Saved>> {
  await requireAdmin();

  const id = toId(formData.get("id"));
  const [existing] = id ? await db.select({ id: projects.id, slug: projects.slug }).from(projects).where(eq(projects.id, id)).limit(1) : [];
  if (id && !existing) return errorState("This project no longer exists.");

  const parsed = projectInputSchema.safeParse({
    name: str(formData, "name"),
    slug: optStr(formData, "slug"),
    locationId: optStr(formData, "locationId"),
    status: str(formData, "status"),
    category: optStr(formData, "category"),
    summary: optStr(formData, "summary"),
    description: optStr(formData, "description"),
    totalUnits: optStr(formData, "totalUnits"),
    floors: optStr(formData, "floors"),
    unitTypes: lines(formData, "unitTypes"),
    amenities: lines(formData, "amenities"),
    paymentPlan: optStr(formData, "paymentPlan"),
    completion: optStr(formData, "completion"),
    address: optStr(formData, "address"),
    latitude: optStr(formData, "latitude"),
    longitude: optStr(formData, "longitude"),
    images: json<ImageItem[]>(formData, "images", []),
    videoUrl: optStr(formData, "videoUrl"),
    faqs: json<FaqItem[]>(formData, "faqs", []),
    isFeatured: bool(formData, "isFeatured"),
    isPublished: bool(formData, "isPublished"),
    sortOrder: optStr(formData, "sortOrder"),
    seoTitle: optStr(formData, "seoTitle"),
    seoDescription: optStr(formData, "seoDescription"),
  });
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;

  const imageError = invalidImageMessage(data.images);
  if (imageError) return errorState(imageError, { images: [imageError] });

  const slug = await resolveSlug("projects", { requested: data.slug, source: data.name, currentSlug: existing?.slug, excludeId: existing?.id });
  if ("error" in slug) return errorState("Please correct the highlighted fields.", { slug: [slug.error] });

  const values = {
    name: data.name,
    slug: slug.slug,
    locationId: data.locationId ?? null,
    status: data.status,
    category: data.category ?? null,
    summary: data.summary ?? null,
    description: data.description ?? null,
    totalUnits: data.totalUnits ?? null,
    floors: data.floors ?? null,
    unitTypes: data.unitTypes,
    amenities: data.amenities,
    paymentPlan: data.paymentPlan ?? null,
    completion: data.completion ?? null,
    address: data.address ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    images: data.images,
    videoUrl: data.videoUrl ?? null,
    faqs: data.faqs,
    isFeatured: data.isFeatured,
    isPublished: data.isPublished,
    sortOrder: data.sortOrder ?? 0,
    translations: readAm(formData, {
      text: ["name", "summary", "description", "category", "paymentPlan", "completion", "address"],
      lines: ["unitTypes", "amenities"],
      faqs: true,
    }),
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
  };

  let savedId: number;
  try {
    if (existing) {
      await db.update(projects).set(values).where(eq(projects.id, existing.id));
      savedId = existing.id;
    } else {
      const [row] = await db.insert(projects).values(values).returning({ id: projects.id });
      savedId = row.id;
    }
  } catch (err) {
    console.error("[admin] saving project failed", err);
    return errorState("Could not save the project. Please try again.");
  }

  // Property pages show their project; area pages list projects.
  refreshPublicContent(TAGS.projects, TAGS.properties, TAGS.locations);

  if (!existing) redirect(`/admin/projects/${savedId}?saved=1`);
  refresh();
  return { status: "success", message: "Saved. The public page is up to date.", data: { id: savedId, slug: values.slug } };
}

export async function deleteProjectAction(formData: FormData) {
  await requireOwner();
  const ids = toIds(formData);
  if (!ids.length) return;

  await db.transaction(async (tx) => {
    await tx.update(properties).set({ projectId: null }).where(inArray(properties.projectId, ids));
    await tx.update(bookings).set({ projectId: null }).where(inArray(bookings.projectId, ids));
    await tx.update(inquiries).set({ projectId: null }).where(inArray(inquiries.projectId, ids));
    await tx.delete(projects).where(inArray(projects.id, ids));
  });

  refreshPublicContent(TAGS.projects, TAGS.properties, TAGS.locations);
  redirect(`/admin/projects?deleted=${ids.length}`);
}

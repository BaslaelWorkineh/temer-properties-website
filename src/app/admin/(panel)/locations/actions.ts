"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { invalidImageMessage, resolveSlug, toId } from "@/app/admin/_lib/server";
import { db } from "@/db";
import { locations, projects, properties, type FaqItem, type ImageItem } from "@/db/schema";
import { requireAdmin, requireOwner } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { refreshPublicContent } from "@/lib/revalidate";
import { bool, errorState, json, lines, locationInputSchema, optStr, str, validationError, type FormState } from "@/lib/validation";

type Saved = { id: number; slug: string };

export async function saveLocationAction(_prev: FormState<Saved>, formData: FormData): Promise<FormState<Saved>> {
  await requireAdmin();

  const id = toId(formData.get("id"));
  const [existing] = id ? await db.select({ id: locations.id, slug: locations.slug }).from(locations).where(eq(locations.id, id)).limit(1) : [];
  if (id && !existing) return errorState("This location no longer exists.");

  const parsed = locationInputSchema.safeParse({
    name: str(formData, "name"),
    slug: optStr(formData, "slug"),
    city: optStr(formData, "city"),
    summary: optStr(formData, "summary"),
    description: optStr(formData, "description"),
    highlights: lines(formData, "highlights"),
    faqs: json<FaqItem[]>(formData, "faqs", []),
    image: json<ImageItem | null>(formData, "image", null),
    latitude: optStr(formData, "latitude"),
    longitude: optStr(formData, "longitude"),
    isPublished: bool(formData, "isPublished"),
    sortOrder: optStr(formData, "sortOrder"),
    seoTitle: optStr(formData, "seoTitle"),
    seoDescription: optStr(formData, "seoDescription"),
  });
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;

  const imageError = invalidImageMessage([data.image]);
  if (imageError) return errorState(imageError, { image: [imageError] });

  const slug = await resolveSlug("locations", { requested: data.slug, source: data.name, currentSlug: existing?.slug, excludeId: existing?.id });
  if ("error" in slug) return errorState("Please correct the highlighted fields.", { slug: [slug.error] });

  const values = {
    name: data.name,
    slug: slug.slug,
    city: data.city,
    summary: data.summary ?? null,
    description: data.description ?? null,
    highlights: data.highlights,
    faqs: data.faqs,
    image: data.image,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    isPublished: data.isPublished,
    sortOrder: data.sortOrder ?? 0,
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
  };

  let savedId: number;
  try {
    if (existing) {
      await db.update(locations).set(values).where(eq(locations.id, existing.id));
      savedId = existing.id;
    } else {
      const [row] = await db.insert(locations).values(values).returning({ id: locations.id });
      savedId = row.id;
    }
  } catch (err) {
    console.error("[admin] saving location failed", err);
    return errorState("Could not save the location. Please try again.");
  }

  // Property and project pages show their area name and link to it.
  refreshPublicContent(TAGS.locations, TAGS.properties, TAGS.projects);

  if (!existing) redirect(`/admin/locations/${savedId}?saved=1`);
  refresh();
  return { status: "success", message: "Saved. The public page is up to date.", data: { id: savedId, slug: values.slug } };
}

export async function deleteLocationAction(formData: FormData) {
  await requireOwner();
  const id = toId(formData.get("id"));
  if (!id) return;

  await db.batch([
    db.update(properties).set({ locationId: null }).where(eq(properties.locationId, id)),
    db.update(projects).set({ locationId: null }).where(eq(projects.locationId, id)),
    db.delete(locations).where(eq(locations.id, id)),
  ]);

  refreshPublicContent(TAGS.locations, TAGS.properties, TAGS.projects);
  redirect("/admin/locations?deleted=1");
}

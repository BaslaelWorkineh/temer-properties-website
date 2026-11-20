"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { invalidImageMessage, resolveSlug, toId } from "@/app/admin/_lib/server";
import { db } from "@/db";
import { bookings, inquiries, properties, type ImageItem } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { refreshPublicContent } from "@/lib/revalidate";
import { bool, errorState, json, lines, optStr, propertyInputSchema, str, validationError, type FormState } from "@/lib/validation";

type Saved = { id: number; slug: string };

export async function savePropertyAction(_prev: FormState<Saved>, formData: FormData): Promise<FormState<Saved>> {
  await requireAdmin();

  const id = toId(formData.get("id"));
  const [existing] = id
    ? await db.select({ id: properties.id, slug: properties.slug }).from(properties).where(eq(properties.id, id)).limit(1)
    : [];
  if (id && !existing) return errorState("This property no longer exists.");

  const parsed = propertyInputSchema.safeParse({
    title: str(formData, "title"),
    slug: optStr(formData, "slug"),
    type: str(formData, "type"),
    status: str(formData, "status"),
    projectId: optStr(formData, "projectId"),
    locationId: optStr(formData, "locationId"),
    price: optStr(formData, "price"),
    promo: optStr(formData, "promo"),
    bedrooms: optStr(formData, "bedrooms"),
    bathrooms: optStr(formData, "bathrooms"),
    areaSqm: optStr(formData, "areaSqm"),
    floor: optStr(formData, "floor"),
    completion: optStr(formData, "completion"),
    summary: optStr(formData, "summary"),
    description: optStr(formData, "description"),
    features: lines(formData, "features"),
    paymentPlan: optStr(formData, "paymentPlan"),
    images: json<ImageItem[]>(formData, "images", []),
    videoUrl: optStr(formData, "videoUrl"),
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

  const slug = await resolveSlug("properties", {
    requested: data.slug,
    source: data.title,
    currentSlug: existing?.slug,
    excludeId: existing?.id,
  });
  if ("error" in slug) return errorState("Please correct the highlighted fields.", { slug: [slug.error] });

  // Explicit nulls: on update, `undefined` would leave the old value in place.
  const values = {
    title: data.title,
    slug: slug.slug,
    type: data.type,
    status: data.status,
    projectId: data.projectId ?? null,
    locationId: data.locationId ?? null,
    price: data.price ?? null,
    promo: data.promo ?? null,
    bedrooms: data.bedrooms ?? null,
    bathrooms: data.bathrooms ?? null,
    areaSqm: data.areaSqm ?? null,
    floor: data.floor ?? null,
    completion: data.completion ?? null,
    summary: data.summary ?? null,
    description: data.description ?? null,
    features: data.features,
    paymentPlan: data.paymentPlan ?? null,
    images: data.images,
    videoUrl: data.videoUrl ?? null,
    isFeatured: data.isFeatured,
    isPublished: data.isPublished,
    sortOrder: data.sortOrder ?? 0,
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
  };

  let savedId: number;
  try {
    if (existing) {
      await db.update(properties).set(values).where(eq(properties.id, existing.id));
      savedId = existing.id;
    } else {
      const [row] = await db.insert(properties).values(values).returning({ id: properties.id });
      savedId = row.id;
    }
  } catch (err) {
    console.error("[admin] saving property failed", err);
    return errorState("Could not save the property. Check the location and project still exist, then try again.");
  }

  // Listing pages, area/type hubs, project pages and the sitemap all show properties.
  refreshPublicContent(TAGS.properties, TAGS.locations, TAGS.projects);

  if (!existing) redirect(`/admin/properties/${savedId}?saved=1`);
  refresh();
  return { status: "success", message: "Saved. The public page is up to date.", data: { id: savedId, slug: values.slug } };
}

export async function deletePropertyAction(formData: FormData) {
  await requireAdmin();
  const id = toId(formData.get("id"));
  if (!id) return;

  // Keep booking/enquiry history; just detach it from the deleted listing.
  await db.batch([
    db.update(bookings).set({ propertyId: null }).where(eq(bookings.propertyId, id)),
    db.update(inquiries).set({ propertyId: null }).where(eq(inquiries.propertyId, id)),
    db.delete(properties).where(eq(properties.id, id)),
  ]);

  refreshPublicContent(TAGS.properties, TAGS.locations, TAGS.projects);
  redirect("/admin/properties?deleted=1");
}

"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { invalidImageMessage, resolveSlug, toId } from "@/app/admin/_lib/server";
import { db } from "@/db";
import { bookings, inquiries, locations, properties, type ImageItem } from "@/db/schema";
import { requireAdmin, requireOwner } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { publishBlockers } from "@/lib/property-readiness";
import { refreshPublicContent } from "@/lib/revalidate";
import { slugify } from "@/lib/utils";
import { bool, errorState, json, lines, optStr, propertyInputSchema, readAm, str, validationError, type FormState } from "@/lib/validation";

type Saved = { id: number; slug: string };

/** Value of the Location dropdown's "+ Add a new area…" option. */
const NEW_AREA = "__new__";

async function findOrCreateLocation(name: string) {
  const slug = slugify(name, 90) || "area";
  const [existing] = await db.select({ id: locations.id }).from(locations).where(eq(locations.slug, slug)).limit(1);
  if (existing) return existing.id;
  const [row] = await db.insert(locations).values({ name, slug }).returning({ id: locations.id });
  return row.id;
}

export async function savePropertyAction(_prev: FormState<Saved>, formData: FormData): Promise<FormState<Saved>> {
  return persistProperty(formData, "save");
}

/**
 * Background save while the form is being filled in. Always stores a hidden draft, never publishes, never touches
 * the public site, and refuses to overwrite a listing that is already live (those are saved with the button).
 */
export async function autosavePropertyDraftAction(formData: FormData): Promise<FormState<Saved>> {
  return persistProperty(formData, "draft");
}

async function persistProperty(formData: FormData, mode: "save" | "draft"): Promise<FormState<Saved>> {
  await requireAdmin();

  const id = toId(formData.get("id"));
  const [existing] = id
    ? await db
        .select({ id: properties.id, slug: properties.slug, isPublished: properties.isPublished })
        .from(properties)
        .where(eq(properties.id, id))
        .limit(1)
    : [];
  if (id && !existing) return errorState("This property no longer exists.");
  if (mode === "draft" && existing?.isPublished) return errorState("Live listings are saved with the Save button.");

  const parsed = propertyInputSchema.safeParse({
    title: str(formData, "title"),
    slug: optStr(formData, "slug"),
    type: str(formData, "type"),
    status: str(formData, "status"),
    projectId: optStr(formData, "projectId"),
    locationId: optStr(formData, "locationId") === NEW_AREA ? undefined : optStr(formData, "locationId"),
    price: optStr(formData, "price"),
    promo: optStr(formData, "promo"),
    discountPercent: optStr(formData, "discountPercent"),
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
  if (mode === "draft") data.isPublished = false;

  // "+ Add a new area": reuse the area if that name exists, otherwise create it so it is in the list from now on.
  let locationId: number | null = data.locationId ?? null;
  if (optStr(formData, "locationId") === NEW_AREA) {
    const areaName = str(formData, "newLocationName");
    if (areaName.length < 2) return errorState("Type the new area name.", { newLocationName: ["Type the new area name."] });
    locationId = await findOrCreateLocation(areaName);
  }

  // A listing may only go live when it is complete (drafts and already-live listings are not held to this).
  if (data.isPublished && !existing?.isPublished) {
    const missing = publishBlockers({
      title: data.title,
      locationId,
      areaSqm: data.areaSqm,
      summary: data.summary ?? "",
      description: data.description ?? "",
      imageCount: data.images.length,
    });
    if (missing.length) return errorState(`To publish, add: ${missing.join(", ")}. Untick “Published” to save it as a draft.`);
  }

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
    locationId,
    price: data.price ?? null,
    promo: data.promo ?? null,
    discountPercent: data.discountPercent ?? null,
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
    translations: readAm(formData, { text: ["title", "summary", "description", "paymentPlan", "promo", "completion"], lines: ["features"] }),
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

  if (mode === "draft") return { status: "success", message: "Draft saved.", data: { id: savedId, slug: values.slug } };

  // Listing pages, area/type hubs, project pages and the sitemap all show properties.
  refreshPublicContent(TAGS.properties, TAGS.locations, TAGS.projects);

  if (!existing) redirect(`/admin/properties/${savedId}?saved=1`);
  refresh();
  return { status: "success", message: "Saved. The public page is up to date.", data: { id: savedId, slug: values.slug } };
}

export async function deletePropertyAction(formData: FormData) {
  await requireOwner();
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

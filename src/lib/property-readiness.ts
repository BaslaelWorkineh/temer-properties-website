/**
 * What a listing needs before it may go live. Used by the admin form (to disable the publish button and say what is
 * missing) and by the Server Action (so the rule cannot be bypassed). Drafts have no requirements.
 */
export type PublishCheckInput = {
  title: string;
  locationId: string | number | null | undefined;
  areaSqm: string | number | null | undefined;
  summary: string;
  description: string;
  imageCount: number;
};

export const MIN_PUBLISH_PHOTOS = 3;

/** `field` is the form field name, so the admin form can jump straight to it. */
export type PublishBlocker = { field: "title" | "locationId" | "areaSqm" | "summary" | "description" | "images"; label: string };

export function publishBlockers(input: PublishCheckInput): PublishBlocker[] {
  const missing: PublishBlocker[] = [];
  // Labels name the fields as the form labels them ("Area" is the neighbourhood, "Size (m²)" the floor area).
  if (input.title.trim().length < 10) missing.push({ field: "title", label: "a title (at least 10 characters)" });
  if (!input.locationId) missing.push({ field: "locationId", label: "the area" });
  if (!Number(input.areaSqm)) missing.push({ field: "areaSqm", label: "the size (m²)" });
  if (input.summary.trim().length < 30) missing.push({ field: "summary", label: "a summary (at least 30 characters)" });
  if (input.description.trim().length < 100) missing.push({ field: "description", label: "a description (at least 100 characters)" });
  if (input.imageCount < MIN_PUBLISH_PHOTOS) missing.push({ field: "images", label: `at least ${MIN_PUBLISH_PHOTOS} photos` });
  return missing;
}

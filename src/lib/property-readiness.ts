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

export function publishBlockers(input: PublishCheckInput): string[] {
  const missing: string[] = [];
  if (input.title.trim().length < 10) missing.push("a title (at least 10 letters)");
  if (!input.locationId) missing.push("the location");
  if (!Number(input.areaSqm)) missing.push("the area (m²)");
  if (input.summary.trim().length < 30) missing.push("a summary (at least 30 letters)");
  if (input.description.trim().length < 100) missing.push("a full description (at least 100 letters)");
  if (input.imageCount < MIN_PUBLISH_PHOTOS) missing.push(`at least ${MIN_PUBLISH_PHOTOS} photos`);
  return missing;
}

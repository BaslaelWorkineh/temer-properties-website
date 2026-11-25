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
  price: string | number | null | undefined;
  /** Homes (apartment, villa, townhouse) must state bedrooms and bathrooms; shops and offices do not. */
  residential: boolean;
  bedrooms: string | number | null | undefined;
  bathrooms: string | number | null | undefined;
  completion: string | null | undefined;
  paymentPlan: string | null | undefined;
};

const blank = (v: string | number | null | undefined) => v === null || v === undefined || String(v).trim() === "";
const toNumber = (v: string | number | null | undefined) => Number(String(v ?? "").replace(/[, ]/g, ""));

export const MIN_PUBLISH_PHOTOS = 4;

/** Each blocker names the form step (0-based: Basics, Price, Details, Photos) it is filled in on. */
export type Blocker = { step: number; text: string; field: string; message: string };

export function listBlockers(input: PublishCheckInput): Blocker[] {
  const missing: Blocker[] = [];
  if (input.title.trim().length < 10) missing.push({ step: 0, text: "a title (at least 10 letters)", field: "title", message: "Enter a title of at least 10 letters." });
  if (!input.locationId) missing.push({ step: 0, text: "the location", field: "locationId", message: "Choose an area." });
  if (!(toNumber(input.price) > 0)) missing.push({ step: 1, text: "the price (ETB)", field: "price", message: "Enter the price in ETB." });
  if (input.residential && blank(input.bedrooms)) missing.push({ step: 2, text: "the bedrooms", field: "bedrooms", message: "Enter the number of bedrooms (0 for a studio)." });
  if (input.residential && blank(input.bathrooms)) missing.push({ step: 2, text: "the bathrooms", field: "bathrooms", message: "Enter the number of bathrooms." });
  if (blank(input.completion)) missing.push({ step: 2, text: "when they can move in", field: "completion", message: "Say when the buyer can move in." });
  if (blank(input.paymentPlan)) missing.push({ step: 1, text: "how the buyer can pay", field: "paymentPlan", message: "Explain how the buyer can pay." });
  if (!Number(input.areaSqm)) missing.push({ step: 2, text: "the area (m²)", field: "areaSqm", message: "Enter the size in m²." });
  if (input.summary.trim().length < 30) missing.push({ step: 2, text: "a summary (at least 30 letters)", field: "summary", message: "Write a summary of at least 30 letters." });
  if (input.description.trim().length < 100) missing.push({ step: 2, text: "a full description (at least 100 letters)", field: "description", message: "Write a description of at least 100 letters." });
  if (input.imageCount < MIN_PUBLISH_PHOTOS) missing.push({ step: 3, text: `at least ${MIN_PUBLISH_PHOTOS} photos`, field: "images", message: `Add at least ${MIN_PUBLISH_PHOTOS} photos.` });
  return missing;
}

export const publishBlockers = listBlockers;

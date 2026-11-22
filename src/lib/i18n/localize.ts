import type { Locale } from "@/lib/i18n/config";

type AmBag = Record<string, unknown> | null | undefined;

function hasValue(v: unknown): boolean {
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return v !== null && v !== undefined;
}

/**
 * Overlay the Amharic text on a row when the page is Amharic. Fields without an Amharic value keep the English
 * text, so a record can be translated field by field. English pages get the row back unchanged.
 */
export function localizeRow<T extends object>(row: T, translations: { am?: AmBag } | null | undefined, lang: Locale): T {
  if (lang !== "am") return row;
  const am = translations?.am;
  if (!am) return row;
  const out = { ...row } as Record<string, unknown>;
  for (const [key, value] of Object.entries(am)) {
    if (key in out && hasValue(value)) out[key] = value;
  }
  return out as T;
}

/** True when the record has enough Amharic text to stand as its own page (a title/name and a body). */
export function isTranslated(translations: { am?: AmBag } | null | undefined, required: readonly string[]): boolean {
  const am = translations?.am;
  if (!am) return false;
  return required.every((k) => hasValue(am[k]));
}

import "server-only";
import { updateTag } from "next/cache";
import type { CacheTag } from "@/lib/cache-tags";

/**
 * Call from admin Server Actions after a mutation. `updateTag` expires the
 * cache immediately (read-your-own-writes), so the public page — and the
 * sitemap — show the change on the very next request.
 */
export function refreshPublicContent(...tags: CacheTag[]) {
  for (const tag of new Set(tags)) updateTag(tag);
}

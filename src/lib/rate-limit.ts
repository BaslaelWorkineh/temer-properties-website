import "server-only";
import { headers } from "next/headers";

/**
 * Fixed-window, in-memory rate limiter. Good enough for a single server; use
 * Redis/Upstash if you run several instances. Request-time only.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  bucket.count += 1;
  return bucket.count > limit ? { ok: false, retryAfterMs: bucket.resetAt - now } : { ok: true, retryAfterMs: 0 };
}

/** Clears a bucket, e.g. after a successful login so only failed attempts accumulate. */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}

export async function getClientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

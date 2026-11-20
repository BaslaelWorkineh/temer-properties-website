import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "@/db";
import { adminUsers, sessions } from "@/db/schema";
import { siteUrl } from "@/lib/config/site";
import { SESSION_COOKIE } from "@/lib/auth/constants";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type CurrentAdmin = { id: number; email: string; name: string; role: "admin" | "editor" };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Database-backed session: revocable, and the raw token never touches the DB. */
export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: siteUrl.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * The signed-in admin, or null. Request-time only (reads cookies): render it
 * inside <Suspense> and never inside a `use cache` scope. Deduplicated per
 * request with React.cache.
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  // Authentication is strictly request-time. Without this, Partial Prefetching
  // pre-renders a per-session admin shell (cookies are available there), hits
  // the `new Date()` expiry check below, and the prefetch request never settles.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name, role: adminUsers.role })
    .from(sessions)
    .innerJoin(adminUsers, eq(adminUsers.id, sessions.userId))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
});

/**
 * Use at the top of EVERY admin page and Server Action. Layouts do not protect
 * Server Actions, and the proxy check is only an optimistic redirect.
 */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  store.delete(SESSION_COOKIE);
}

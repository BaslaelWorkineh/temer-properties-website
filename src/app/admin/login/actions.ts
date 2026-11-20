"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { safeAdminRedirect } from "@/lib/auth/constants";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { getClientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { errorState, loginSchema, str, validationError, type FormState } from "@/lib/validation";

// Verifying against a dummy hash when the email is unknown keeps response times
// equal, so the form can't be used to discover which emails have accounts.
let dummyHash: Promise<string> | null = null;
function getDummyHash() {
  dummyHash ??= hashPassword("not-a-real-password-used-for-timing-only");
  return dummyHash;
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const rawPassword = formData.get("password");
  const parsed = loginSchema.safeParse({
    email: str(formData, "email").toLowerCase(),
    password: typeof rawPassword === "string" ? rawPassword : "",
  });
  if (!parsed.success) return validationError(parsed.error);
  const { email, password } = parsed.data;

  const ip = await getClientIp();
  // Per account+IP (stops password guessing) and per IP (stops rotating through emails).
  const accountKey = `login:${ip}:${email}`;
  const perAccount = rateLimit(accountKey, 5, 15 * 60 * 1000);
  const perIp = rateLimit(`login-ip:${ip}`, 30, 15 * 60 * 1000);
  const limit = !perAccount.ok ? perAccount : perIp;
  if (!limit.ok) {
    return errorState(`Too many sign-in attempts. Try again in ${Math.ceil(limit.retryAfterMs / 60_000)} minutes.`);
  }

  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  const valid = user ? await verifyPassword(password, user.passwordHash) : (await verifyPassword(password, await getDummyHash()), false);
  if (!user || !valid) return errorState("Invalid email or password.");

  // Successful sign-ins don't count against the account (admins on several devices).
  resetRateLimit(accountKey);
  await createSession(user.id);
  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));

  redirect(safeAdminRedirect(str(formData, "next")));
}

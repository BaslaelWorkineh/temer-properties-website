"use server";

import { and, eq, ne } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { adminUsers, sessions } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, requireAdmin } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { errorState, str, type FormState } from "@/lib/validation";

const MIN_PASSWORD = 10;

/** Both changes ask for the current password, so an unattended signed-in browser can't take over the account. */
async function checkCurrentPassword(userId: number, formData: FormData) {
  const limit = rateLimit(`account-password:${userId}`, 5, 15 * 60 * 1000);
  if (!limit.ok) return errorState(`Too many attempts. Try again in ${Math.ceil(limit.retryAfterMs / 60_000)} minutes.`);

  const current = formData.get("currentPassword");
  const [user] = await db.select({ passwordHash: adminUsers.passwordHash }).from(adminUsers).where(eq(adminUsers.id, userId)).limit(1);
  if (!user || typeof current !== "string" || !current || !(await verifyPassword(current, user.passwordHash))) {
    return errorState("Your current password is not correct.", { currentPassword: ["Enter your current password."] });
  }
  return null;
}

export async function updateEmailAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const email = str(formData, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errorState("Please correct the highlighted fields.", { email: ["Enter a valid email address."] });
  if (email === me.email) return errorState("This is already your email.", { email: ["Enter a different email."] });

  const wrong = await checkCurrentPassword(me.id, formData);
  if (wrong) return wrong;

  const [taken] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(eq(adminUsers.email, email), ne(adminUsers.id, me.id)))
    .limit(1);
  if (taken) return errorState("Someone else already uses this email.", { email: ["This email is already in use."] });

  await db.update(adminUsers).set({ email }).where(eq(adminUsers.id, me.id));
  refresh();
  return { status: "success", message: `Your email is now ${email}. Use it the next time you log in.` };
}

export async function updatePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const next = formData.get("newPassword");
  const confirm = formData.get("confirmPassword");
  const fieldErrors: Record<string, string[]> = {};
  if (typeof next !== "string" || next.length < MIN_PASSWORD) fieldErrors.newPassword = [`Use at least ${MIN_PASSWORD} characters.`];
  else if (next.length > 200) fieldErrors.newPassword = ["Use at most 200 characters."];
  else if (next !== confirm) fieldErrors.confirmPassword = ["The two new passwords don't match."];
  if (Object.keys(fieldErrors).length) return errorState("Please correct the highlighted fields.", fieldErrors);

  const wrong = await checkCurrentPassword(me.id, formData);
  if (wrong) return wrong;

  await db.update(adminUsers).set({ passwordHash: await hashPassword(next as string) }).where(eq(adminUsers.id, me.id));
  // Sign out every other device that knew the old password, then start a fresh session here.
  await db.delete(sessions).where(eq(sessions.userId, me.id));
  await createSession(me.id);
  refresh();
  return { status: "success", message: "Your password was changed. Other devices were signed out." };
}

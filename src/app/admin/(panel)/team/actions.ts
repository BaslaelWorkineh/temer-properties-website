"use server";

import { randomBytes, randomInt } from "node:crypto";
import { count, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { toId } from "@/app/admin/_lib/server";
import { db } from "@/db";
import { adminUsers, sessions } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { requireOwner } from "@/lib/auth/session";
import { errorState, str, type FormState } from "@/lib/validation";

type Credentials = { email: string; name: string; password: string };

const WORDS = ["Lake", "Sun", "Stone", "River", "Hill", "Cedar", "Coffee", "Mountain", "Garden", "Falcon"];

/** Easy to read out or type from a phone, still strong. Shown once to the owner. */
function startingPassword() {
  const word = WORDS[randomInt(WORDS.length)];
  const other = WORDS[randomInt(WORDS.length)];
  return `Temer-${word}-${other}-${randomInt(1000, 10000)}-${randomBytes(2).toString("hex")}`;
}

export async function addTeamMemberAction(_prev: FormState<Credentials>, formData: FormData): Promise<FormState<Credentials>> {
  await requireOwner();

  const name = str(formData, "name");
  const email = str(formData, "email").toLowerCase();
  const role = str(formData, "role") === "admin" ? "admin" : "editor";

  const fieldErrors: Record<string, string[]> = {};
  if (name.length < 2) fieldErrors.name = ["Enter the person's name."];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = ["Enter a valid email address."];
  if (Object.keys(fieldErrors).length) return errorState("Please correct the highlighted fields.", fieldErrors);

  const [taken] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (taken) return errorState("Someone with this email already has an account.", { email: ["This email is already in use."] });

  const password = startingPassword();
  await db.insert(adminUsers).values({ name, email, role, passwordHash: await hashPassword(password) });
  refresh();
  return { status: "success", message: `${name} was added.`, data: { email, name, password } };
}

export async function resetTeamPasswordAction(_prev: FormState<Credentials>, formData: FormData): Promise<FormState<Credentials>> {
  await requireOwner();
  const id = toId(formData.get("id"));
  const [user] = id ? await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1) : [];
  if (!user) return errorState("This person no longer exists.");

  const password = startingPassword();
  await db.update(adminUsers).set({ passwordHash: await hashPassword(password) }).where(eq(adminUsers.id, user.id));
  // Anyone signed in with the old password is signed out.
  await db.delete(sessions).where(eq(sessions.userId, user.id));
  refresh();
  return { status: "success", message: `New password for ${user.name}.`, data: { email: user.email, name: user.name, password } };
}

export async function removeTeamMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireOwner();
  const id = toId(formData.get("id"));
  const [user] = id ? await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1) : [];
  if (!user) return errorState("This person no longer exists.");
  if (user.id === me.id) return errorState("You can't remove your own account.");
  if (user.role === "admin") {
    const [{ n }] = await db.select({ n: count() }).from(adminUsers).where(eq(adminUsers.role, "admin"));
    if (n < 2) return errorState("You can't remove the last admin.");
  }

  // Their sessions are deleted with them (cascade), so they are signed out immediately. Posted homes stay.
  await db.delete(adminUsers).where(eq(adminUsers.id, user.id));
  refresh();
  return { status: "success", message: `${user.name} was removed and can no longer log in. The homes they posted stay on the website.` };
}

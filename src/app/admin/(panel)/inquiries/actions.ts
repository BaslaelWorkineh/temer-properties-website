"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { toId } from "@/app/admin/_lib/server";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { errorState, inquiryUpdateSchema, optStr, str, validationError, type FormState } from "@/lib/validation";

export async function updateInquiryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = toId(formData.get("id"));
  if (!id) return errorState("Missing enquiry.");

  const parsed = inquiryUpdateSchema.safeParse({ status: str(formData, "status"), adminNotes: optStr(formData, "adminNotes") });
  if (!parsed.success) return validationError(parsed.error);

  const updated = await db
    .update(inquiries)
    .set({ status: parsed.data.status, adminNotes: parsed.data.adminNotes ?? null })
    .where(eq(inquiries.id, id))
    .returning({ id: inquiries.id });
  if (!updated.length) return errorState("This enquiry no longer exists.");

  refresh();
  return { status: "success", message: "Enquiry updated." };
}

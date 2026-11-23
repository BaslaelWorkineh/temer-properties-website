"use server";

import { destroySession, requireAdmin } from "@/lib/auth/session";

/**
 * Ends the session. The client then does a full page load to /admin/login (see LogoutButton), which throws away the
 * router's in-memory copies of admin pages so Back can't show them again.
 */
export async function logoutAction() {
  await requireAdmin();
  await destroySession();
}

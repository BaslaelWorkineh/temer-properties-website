/** Shared by the session module and src/proxy.ts (which cannot import DB code). */
export const SESSION_COOKIE = "tp_admin_session";

/** Only allow redirects back into the admin area after login (prevents open redirects). */
export function safeAdminRedirect(target: string | null | undefined) {
  if (!target || !target.startsWith("/admin") || target.startsWith("//") || target.startsWith("/admin/login")) return "/admin";
  return target;
}

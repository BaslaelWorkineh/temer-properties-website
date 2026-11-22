import { getCurrentAdmin } from "@/lib/auth/session";

/** Renders its children only for admins (owners). Editors do not see delete buttons and other owner-only controls. */
export async function OwnerOnly({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  return admin?.role === "admin" ? <>{children}</> : null;
}

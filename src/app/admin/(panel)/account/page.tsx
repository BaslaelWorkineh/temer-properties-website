import type { Metadata } from "next";
import { AccountForms } from "@/components/admin/account-forms";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";

// Admin pages are per-request and authenticated; they are allowed to block (see the panel layout).
export const instant = false;

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const me = await requireAdmin();
  return (
    <>
      <PageHeader title="My account" description="Change the email and password you log in with." />
      <AccountForms email={me.email} />
    </>
  );
}

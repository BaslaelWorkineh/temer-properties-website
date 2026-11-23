import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import { TeamManager } from "@/components/admin/team-manager";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { requireOwner } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";

// Admin pages are per-request and authenticated; they are allowed to block (see the panel layout).
export const instant = false;

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const me = await requireOwner();
  const rows = await db
    .select({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, role: adminUsers.role, lastLoginAt: adminUsers.lastLoginAt })
    .from(adminUsers)
    .orderBy(asc(adminUsers.createdAt));

  return (
    <>
      <PageHeader title="Team" description="People who can log in and post homes. Only admins see this page." />
      <TeamManager
        meId={me.id}
        members={rows.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          role: r.role,
          lastLogin: r.lastLoginAt ? formatDate(r.lastLoginAt, { dateStyle: "medium" }) : "Never",
        }))}
      />
    </>
  );
}

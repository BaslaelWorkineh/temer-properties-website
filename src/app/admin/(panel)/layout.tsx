import { count, eq } from "drizzle-orm";
import { Suspense } from "react";
import { AdminShell, AdminShellSkeleton } from "@/components/admin/admin-shell";
import { db } from "@/db";
import { bookings, inquiries } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";

// Admin pages are per-request and authenticated; they are allowed to block.
export const instant = false;

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // Cookie + database reads happen inside AuthGate, behind this boundary, so
  // the prerendered shell is just the skeleton (Cache Components rule).
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}

async function AuthGate({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [[pendingBookings], [newInquiries]] = await Promise.all([
    db.select({ n: count() }).from(bookings).where(eq(bookings.status, "pending")),
    db.select({ n: count() }).from(inquiries).where(eq(inquiries.status, "new")),
  ]);

  return (
    <AdminShell admin={admin} counts={{ bookings: pendingBookings?.n ?? 0, inquiries: newInquiries?.n ?? 0 }}>
      {children}
    </AdminShell>
  );
}

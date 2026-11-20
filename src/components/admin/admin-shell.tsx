import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/admin/(panel)/actions";
import { MobileNav, SidebarNav } from "@/components/admin/admin-nav";
import type { CurrentAdmin } from "@/lib/auth/session";

export function AdminWordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/admin" className={`inline-flex flex-col leading-none text-white ${className}`}>
      <span className="font-display text-xl font-bold tracking-[0.18em]">TEMER</span>
      <span className="font-display text-[0.7rem] font-semibold tracking-[0.42em] text-gold-400">PROPERTIES · ADMIN</span>
    </Link>
  );
}

function UserBlock({ admin }: { admin: CurrentAdmin }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-bold uppercase text-white">
        {admin.name.slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{admin.name}</p>
        <p className="truncate text-xs text-white/60">{admin.email}</p>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="inline-flex size-9 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
          title="Sign out"
        >
          <LogOut className="size-4.5" aria-hidden="true" />
          <span className="sr-only">Sign out</span>
        </button>
      </form>
    </div>
  );
}

export function AdminShell({
  admin,
  counts,
  children,
}: {
  admin: CurrentAdmin;
  counts: { bookings: number; inquiries: number };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-soft">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-brand-950 px-4 py-6 lg:flex">
        <AdminWordmark className="px-3" />
        <div className="mt-8 flex-1 overflow-y-auto">
          <SidebarNav counts={counts} />
        </div>
        <div className="border-t border-white/10 px-1 pt-4">
          <UserBlock admin={admin} />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-brand-950 px-4 lg:hidden">
        <AdminWordmark />
        <MobileNav counts={counts} footer={<UserBlock admin={admin} />} />
      </header>

      <div className="lg:pl-64">
        <main id="admin-main" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="min-h-dvh bg-soft" aria-busy="true" aria-label="Loading admin">
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-brand-950 lg:block" />
      <div className="h-16 bg-brand-950 lg:hidden" />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 sm:px-6 lg:px-10">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-line" />
          <div className="h-40 animate-pulse rounded-2xl bg-white" />
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}

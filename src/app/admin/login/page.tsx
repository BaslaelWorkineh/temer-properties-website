import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { firstParam } from "@/components/admin/helpers";
import { safeAdminRedirect } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

// Sign-in is per-request; it is never expected to be an instant navigation.
export const instant = false;

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="grid min-h-dvh flex-1 place-items-center bg-brand-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center text-white">
          <p className="font-display text-3xl font-bold tracking-[0.2em]">TEMER</p>
          <p className="font-display text-xs font-semibold tracking-[0.45em] text-gold-400">PROPERTIES</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <h1 className="font-display text-2xl font-bold text-ink">Sign in to admin</h1>
          <p className="mb-6 mt-1 text-sm text-muted">Manage listings, bookings and enquiries.</p>
          <Suspense fallback={<div className="h-56 animate-pulse rounded-xl bg-soft" />}>
            <LoginGate searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function LoginGate({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  if (await getCurrentAdmin()) redirect("/admin");
  const next = firstParam((await searchParams).next);
  return <LoginForm next={safeAdminRedirect(next)} />;
}

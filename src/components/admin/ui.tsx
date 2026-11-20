import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back ? (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand-700">
            <ChevronLeft className="size-4" aria-hidden="true" />
            {back.label}
          </Link>
        ) : null}
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        {description ? <div className="mt-1.5 text-sm text-muted">{description}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl bg-white p-5 shadow-xs ring-1 ring-line sm:p-6", className)}>{children}</div>;
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-line sm:p-6">
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, icon: Icon, href, tone = "green" }: { label: string; value: number | string; icon: LucideIcon; href?: string; tone?: "green" | "gold" }) {
  const body = (
    <>
      <span className={cn("grid size-11 place-items-center rounded-xl", tone === "gold" ? "bg-gold-100 text-[#6b5016]" : "bg-brand-50 text-brand-700")}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-3xl font-bold leading-none text-ink">{value}</span>
        <span className="mt-1 block text-sm text-muted">{label}</span>
      </span>
    </>
  );
  const className = "flex items-center gap-4 rounded-2xl bg-white p-5 shadow-xs ring-1 ring-line";
  return href ? (
    <Link href={href} className={cn(className, "transition hover:ring-brand-300")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-soft text-muted">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-xl font-bold text-ink">{title}</h2>
      {description ? <p className="mt-1 max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Wraps a table so it scrolls horizontally on small screens. */
export function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-line">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export const th = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted";
export const td = "px-4 py-3 align-middle text-sm text-ink";

export function Tabs({ tabs, active }: { tabs: Array<{ key: string; label: string; href: string; count?: number }>; active: string }) {
  return (
    <nav aria-label="Filter" className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-xs ring-1 ring-line">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
            tab.key === active ? "bg-brand-500 text-white" : "text-muted hover:bg-soft hover:text-ink",
          )}
        >
          {tab.label}
          {tab.count !== undefined ? (
            <span className={cn("rounded-none px-1.5 text-xs", tab.key === active ? "bg-white/20" : "bg-soft")}>{tab.count}</span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}

export function Pagination({ page, total, pageSize, hrefFor }: { page: number; total: number; pageSize: number; hrefFor: (page: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const linkClass = "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium ring-1 ring-line bg-white hover:ring-brand-300";
  return (
    <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-3 text-sm text-muted">
      <span>
        Page {page} of {pages} · {total} total
      </span>
      <span className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={linkClass}>
            <ChevronLeft className="size-4" aria-hidden="true" /> Previous
          </Link>
        ) : null}
        {page < pages ? (
          <Link href={hrefFor(page + 1)} className={linkClass}>
            Next <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </span>
    </nav>
  );
}

export function Notice({ tone = "green", children }: { tone?: "green" | "amber" | "red"; children: React.ReactNode }) {
  const tones = {
    green: "bg-brand-50 text-brand-800 ring-brand-200",
    amber: "bg-amber-50 text-amber-900 ring-amber-200",
    red: "bg-red-50 text-red-800 ring-red-200",
  };
  return (
    <div role="status" className={cn("mb-5 rounded-xl px-4 py-3 text-sm ring-1", tones[tone])}>
      {children}
    </div>
  );
}

export function Thumb({ src, alt }: { src?: string | null; alt?: string }) {
  if (!src) return <span className="block size-12 shrink-0 rounded-lg bg-soft ring-1 ring-line" aria-hidden="true" />;
  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails, not public pages
  return <img src={src} alt={alt ?? ""} className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-line" loading="lazy" />;
}

export function YesNo({ value, yes = "Yes", no = "No" }: { value: boolean; yes?: string; no?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", value ? "text-brand-700" : "text-muted")}>
      <span className={cn("size-1.5 rounded-full", value ? "bg-brand-500" : "bg-line")} aria-hidden="true" />
      {value ? yes : no}
    </span>
  );
}

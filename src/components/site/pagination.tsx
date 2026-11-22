import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "@/components/site/link";
import type { Locale } from "@/lib/i18n/config";
import { getFormsDict } from "@/lib/i18n/dict/forms";
import { cn } from "@/lib/utils";

/** Crawlable pagination: real <a href> links, not buttons. */
export function Pagination({
  page,
  pageCount,
  hrefFor,
  lang = "en",
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  lang?: Locale;
}) {
  if (pageCount <= 1) return null;
  const t = getFormsDict(lang).pagination;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );
  const item = "grid h-10 min-w-10 place-items-center rounded-none px-3 text-sm font-semibold";
  return (
    <nav aria-label={t.label} className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={cn(item, "text-ink hover:bg-soft")}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="sr-only">{t.previous}</span>
        </Link>
      ) : null}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1] > 1 ? <span className="px-1 text-muted">…</span> : null}
          <Link
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(item, p === page ? "bg-brand-500 text-white" : "text-ink hover:bg-soft")}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} rel="next" className={cn(item, "text-ink hover:bg-soft")}>
          <ChevronRight className="size-4" aria-hidden="true" />
          <span className="sr-only">{t.next}</span>
        </Link>
      ) : null}
    </nav>
  );
}

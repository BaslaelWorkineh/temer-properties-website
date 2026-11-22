import { ChevronRight } from "lucide-react";
import Link from "@/components/site/link";
import { JsonLd } from "@/components/site/json-ld";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getFormsDict } from "@/lib/i18n/dict/forms";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";

/**
 * Visible breadcrumb trail + matching BreadcrumbList structured data. Last crumb is the current page.
 * Pass English paths ("/properties") and the page language: names are shown as given, the "Home" crumb is translated
 * and every link (and structured-data URL) gets the language prefix.
 */
export function Breadcrumbs({
  items,
  className,
  inverted,
  lang = "en",
}: {
  items: Crumb[];
  className?: string;
  inverted?: boolean;
  lang?: Locale;
}) {
  const t = getFormsDict(lang).breadcrumb;
  const crumbs: Crumb[] = [{ name: t.home, path: "/" }, ...items].map((c) => ({ ...c, path: localePath(lang, c.path) }));
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <nav aria-label={t.label} className={cn("text-sm", className)}>
        <ol className={cn("flex flex-wrap items-center gap-1", inverted ? "text-white/75" : "text-muted")}>
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-1">
                {i > 0 ? <ChevronRight className="size-3.5 opacity-60" aria-hidden="true" /> : null}
                {last ? (
                  <span aria-current="page" className={cn("font-medium", inverted ? "text-white" : "text-ink")}>
                    {crumb.name}
                  </span>
                ) : (
                  <Link href={crumb.path} className={cn("hover:underline", inverted ? "hover:text-white" : "hover:text-brand-700")}>
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

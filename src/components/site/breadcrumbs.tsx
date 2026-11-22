import { ChevronRight } from "lucide-react";
import Link from "@/components/site/link";
import { JsonLd } from "@/components/site/json-ld";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";

/** Visible breadcrumb trail + matching BreadcrumbList structured data. Last crumb is the current page. */
export function Breadcrumbs({ items, className, inverted }: { items: Crumb[]; className?: string; inverted?: boolean }) {
  const crumbs: Crumb[] = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
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

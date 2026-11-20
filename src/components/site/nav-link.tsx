"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Header link. The current page gets a solid underline; other links get a faint one on hover. */
export function NavLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block rounded-none px-3.5 py-2 text-[0.95rem] font-semibold transition-colors",
        active
          ? "text-brand-800 shadow-[inset_0_-2px_0_var(--color-brand-600)]"
          : "text-ink/80 hover:text-brand-700 hover:shadow-[inset_0_-2px_0_var(--color-line)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

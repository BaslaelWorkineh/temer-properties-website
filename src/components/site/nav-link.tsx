"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-none px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-brand-50 text-brand-800" : "text-ink/80 hover:bg-soft hover:text-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

"use client";

import { Menu, Phone, X } from "lucide-react";
import Link from "@/components/site/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { stripLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string };

export function MobileMenu({
  items,
  phone,
  phoneDisplay,
  labels,
}: {
  items: readonly Item[];
  phone: string;
  phoneDisplay: string;
  labels: { open: string; close: string; bookSiteVisit: string; call: string };
}) {
  const [open, setOpen] = useState(false);
  const pathname = stripLocale(usePathname());
  const panelId = useId();

  // Close after navigating (the layout, and this component, persist across pages).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="grid size-10 place-items-center rounded-full text-ink hover:bg-soft"
      >
        {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        <span className="sr-only">{open ? labels.close : labels.open}</span>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto border-t border-line bg-white px-4 pb-10 pt-4"
      >
        <nav aria-label="Mobile">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-none px-4 py-3 text-lg font-medium",
                      active ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-soft",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-6 grid gap-3">
          <Link href="/book-a-visit" onClick={() => setOpen(false)} className={buttonStyles({ size: "lg" })}>
            {labels.bookSiteVisit}
          </Link>
          <a href={`tel:${phone}`} className={buttonStyles({ variant: "outline", size: "lg" })}>
            <Phone className="size-4" aria-hidden="true" /> {labels.call} {phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}

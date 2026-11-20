"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  CalendarCheck,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  Layers,
  MapPin,
  Menu,
  Newspaper,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Counts = { bookings: number; inquiries: number };

const items: Array<{ href: string; label: string; icon: LucideIcon; count?: keyof Counts }> = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, count: "bookings" },
  { href: "/admin/inquiries", label: "Enquiries", icon: Inbox, count: "inquiries" },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/projects", label: "Projects", icon: Layers },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/posts", label: "Guides", icon: Newspaper },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ counts, onNavigate }: { counts: Counts; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {items.map(({ href, label, icon: Icon, count }) => {
        const active = isActive(pathname, href);
        const value = count ? counts[count] : 0;
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon className="size-4.5 shrink-0" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {value > 0 ? (
                <span className="rounded-full bg-gold-500 px-2 py-0.5 text-xs font-bold text-brand-950" aria-label={`${value} need attention`}>
                  {value}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
      <li className="pt-2">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/8 hover:text-white"
        >
          <ExternalLink className="size-4.5 shrink-0" aria-hidden="true" />
          View website
        </a>
      </li>
    </ul>
  );
}

export function SidebarNav({ counts }: { counts: Counts }) {
  return (
    <nav aria-label="Admin">
      <NavLinks counts={counts} />
    </nav>
  );
}

export function MobileNav({ counts, footer }: { counts: Counts; footer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu after navigating.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing UI state to an external value (route)
    setOpen(false);
  }, [pathname]);

  const total = counts.bookings + counts.inquiries;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="admin-mobile-menu"
        className="relative inline-flex size-10 items-center justify-center rounded-xl text-white hover:bg-white/10"
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {!open && total > 0 ? <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-gold-500" aria-hidden="true" /> : null}
      </button>
      {open ? (
        <div id="admin-mobile-menu" className="absolute inset-x-0 top-full z-40 border-t border-white/10 bg-brand-950 px-4 pb-5 pt-3 shadow-xl">
          <nav aria-label="Admin">
            <NavLinks counts={counts} onNavigate={() => setOpen(false)} />
          </nav>
          <div className="mt-4 border-t border-white/10 pt-4">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}

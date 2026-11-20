import { Phone } from "lucide-react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { MobileMenu } from "@/components/site/mobile-menu";
import { NavLink } from "@/components/site/nav-link";
import { mainNav, site } from "@/lib/config/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-brand-950 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={`tel:${site.contact.phone}`}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50 xl:inline-flex"
          >
            <Phone className="size-4" aria-hidden="true" />
            {site.contact.phoneDisplay}
          </a>
          {/* Wrapper owns the breakpoint: `hidden` on the link itself would clash with the button's inline-flex. */}
          <span className="hidden sm:block">
            <Link href="/book-a-visit" className={buttonStyles({ size: "sm" })}>
              Book a visit
            </Link>
          </span>
          <MobileMenu items={mainNav} phone={site.contact.phone} phoneDisplay={site.contact.phoneDisplay} />
        </div>
      </div>
    </header>
  );
}

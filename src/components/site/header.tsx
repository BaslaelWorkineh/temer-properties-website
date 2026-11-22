import { Phone } from "lucide-react";
import Link from "@/components/site/link";
import { buttonStyles } from "@/components/ui/button";
import { HeaderScroll } from "@/components/site/header-scroll";
import { Logo } from "@/components/site/logo";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { MobileMenu } from "@/components/site/mobile-menu";
import { NavLink } from "@/components/site/nav-link";
import { mainNav, site } from "@/lib/config/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

/**
 * 3.5rem white sticky bar with a brand-green bottom line and a soft shadow, so it separates cleanly from any photo below it.
 * The logo sits on a white ribbon that hangs ~1.5rem below the bar (pages leave room for it; see the home hero).
 * Keep the mobile menu's `top-14` in sync with the bar height.
 */
export function Header({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const items = mainNav.map((item) => ({ href: item.href, label: dict.nav[item.key] }));
  return (
    <HeaderScroll className="group sticky top-0 z-40 border-b-2 border-brand-600 bg-white shadow-[0_2px_14px_rgb(2_12_7_/_0.08)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-none focus:bg-brand-950 focus:px-4 focus:py-1.5 focus:text-white"
      >
        {dict.common.skip}
      </a>
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Reserves the ribbon's width in the bar; the ribbon itself overflows downward. */}
        <div className="relative h-full w-[5.5rem] shrink-0">
          {/* Bookmark ribbon: clip-path cuts the V-notch; it would also clip a box-shadow, so the shadow is a
              drop-shadow filter on the unclipped wrapper (it follows the notch). On scroll the ribbon rolls up
              into the bar (scale-y from the top) and its shadow fades, while the logo shrinks to fit the bar. */}
          <div
            className="absolute inset-x-0 top-0 drop-shadow-[0_5px_8px_rgb(2_12_7_/_0.16)] transition-opacity duration-300 group-data-[scrolled]:opacity-0"
            aria-hidden="true"
          >
            <div className="h-[5rem] origin-top bg-white transition-transform duration-300 ease-out [clip-path:polygon(0_0,100%_0,100%_100%,50%_calc(100%-0.75rem),0_100%)] group-data-[scrolled]:scale-y-0" />
          </div>
          <div className="absolute left-0 top-0 w-full origin-top px-3 pt-1.5 transition-transform duration-300 ease-out group-data-[scrolled]:translate-y-1 group-data-[scrolled]:scale-[0.68]">
            <Logo height={58} />
          </div>
        </div>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          {/* Wrapper owns the breakpoint: `hidden` on the link itself would clash with the button's inline-flex. */}
          <a
            href={`tel:${site.contact.phone}`}
            className="hidden items-center gap-2 text-[0.95rem] font-bold text-brand-800 hover:text-brand-600 md:mr-4 md:inline-flex"
          >
            <Phone className="size-4" aria-hidden="true" />
            <span className="sr-only">{dict.common.callUs("")}</span>
            {site.contact.phoneDisplay}
          </a>
          <span className="hidden sm:block">
            <Link href="/book-a-visit" className={buttonStyles({ size: "md", className: "h-10 px-6 text-[0.95rem] font-bold" })}>
              {dict.common.bookVisit}
            </Link>
          </span>
          <LanguageSwitcher switchLabel={dict.common.switchTo} />
          <MobileMenu
            items={items}
            phone={site.contact.phone}
            phoneDisplay={site.contact.phoneDisplay}
            labels={{ open: dict.common.openMenu, close: dict.common.closeMenu, bookSiteVisit: dict.common.bookSiteVisit, call: dict.common.call }}
          />
        </div>
      </div>
    </HeaderScroll>
  );
}

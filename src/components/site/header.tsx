import { Phone } from "lucide-react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { HeaderScroll } from "@/components/site/header-scroll";
import { Logo } from "@/components/site/logo";
import { MobileMenu } from "@/components/site/mobile-menu";
import { NavLink } from "@/components/site/nav-link";
import { mainNav, site } from "@/lib/config/site";

/**
 * Thin (2.5rem) white sticky bar. The logo sits on a white tab that hangs ~4rem below the bar, so it
 * overlaps the top of whatever section follows (pages leave room for it; see the home hero).
 * Keep the mobile menu's `top-10` in sync with the bar height.
 */
export function Header() {
  return (
    <HeaderScroll className="group sticky top-0 z-40 border-b border-line bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-none focus:bg-brand-950 focus:px-4 focus:py-1.5 focus:text-white"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-10 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Reserves the tab's width in the bar; the tab itself overflows downward. */}
        <div className="relative h-full w-[5.5rem] shrink-0">
          {/* Bookmark ribbon: clip-path cuts the V-notch; it would also clip a box-shadow, so the
              shadow is a drop-shadow filter on the unclipped wrapper (it follows the notch).
              On scroll the ribbon rolls up into the bar (scale-y from the top) and its shadow fades,
              while the logo shrinks to fit inside the 2.5rem bar. */}
          <div
            className="absolute inset-x-0 top-0 drop-shadow-[0_6px_10px_rgb(2_12_7_/_0.18)] transition-opacity duration-300 group-data-[scrolled]:opacity-0"
            aria-hidden="true"
          >
            <div className="h-[6.375rem] origin-top bg-white transition-transform duration-300 ease-out [clip-path:polygon(0_0,100%_0,100%_100%,50%_calc(100%-0.875rem),0_100%)] group-data-[scrolled]:scale-y-0" />
          </div>
          <div className="absolute left-0 top-0 w-full origin-top px-3 pt-1.5 transition-transform duration-300 ease-out group-data-[scrolled]:translate-y-0.5 group-data-[scrolled]:scale-[0.44]">
            <Logo height={72} />
          </div>
        </div>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
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
            className="hidden items-center gap-2 rounded-none px-3 py-1.5 text-sm font-semibold text-brand-800 hover:bg-brand-50 xl:inline-flex"
          >
            <Phone className="size-4" aria-hidden="true" />
            {site.contact.phoneDisplay}
          </a>
          {/* Wrapper owns the breakpoint: `hidden` on the link itself would clash with the button's inline-flex. */}
          <span className="hidden sm:block">
            <Link href="/book-a-visit" className={buttonStyles({ size: "sm", className: "h-8" })}>
              Book a visit
            </Link>
          </span>
          <MobileMenu items={mainNav} phone={site.contact.phone} phoneDisplay={site.contact.phoneDisplay} />
        </div>
      </div>
    </HeaderScroll>
  );
}

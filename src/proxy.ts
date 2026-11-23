import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { defaultLocale } from "@/lib/i18n/config";

/**
 * 1. Admin: optimistic gate. No session cookie -> real HTTP redirect to the login page before any rendering.
 *    The session itself is verified against the database in the admin layout and in every Server Action.
 * 2. Public pages: English keeps its unprefixed URLs. They are rewritten (not redirected) to /en/..., so the
 *    `[lang]` route segment always has a value. An explicit /en/... URL is redirected to the clean one, so each
 *    English page has exactly one address. Amharic lives at /am/... and passes straight through.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login" || request.cookies.has(SESSION_COOKIE)) {
      // Never keep admin pages in the browser cache, so they can't be shown again after signing out.
      const response = NextResponse.next();
      response.headers.set("Cache-Control", "private, no-store, max-age=0");
      return response;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/am" || pathname.startsWith("/am/")) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except API routes, uploaded media, Next internals and files with an extension
  // (favicon.ico, robots.txt, sitemap.xml, images...).
  matcher: ["/admin", "/admin/:path*", "/((?!api|media|_next|admin|.*\\..*).*)"],
};

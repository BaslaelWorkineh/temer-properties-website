/**
 * 301 redirects from the URLs of the two legacy sites, so their existing
 * rankings and backlinks transfer to the new pages when this site is deployed
 * on those domains. (No path aliases here: imported by next.config.ts.)
 *
 * - temerpropertiesapartment.com: static site with /projects/{name}.html
 * - temerpropertiessales.com / temerproperties.com: Next.js site with keyword pages
 *
 * If the new site lives on a NEW domain, also add domain-level 301s from the
 * old domains at the DNS/host level (old-domain.com/* -> new-domain.com/*).
 */
type Redirect = { source: string; destination: string; permanent: true };

const r = (source: string, destination: string): Redirect => ({ source, destination, permanent: true });

export const legacyRedirects: Redirect[] = [
  // temerpropertiesapartment.com
  r("/index.html", "/"),
  r("/admin.html", "/admin"),
  r("/projects/megenagna.html", "/projects/megenagna-diaspora-site"),
  r("/projects/aware.html", "/projects/aware-megenagna"),
  r("/projects/sarbet-city-plus.html", "/projects/sarbet-city-plus"),
  r("/projects/gelan.html", "/projects/gelan-shops"),
  r("/projects/ajewa-bulgaria.html", "/projects/ajewa-bulgaria"),
  r("/projects/piassa-empire.html", "/projects/piassa-empire"),
  r("/projects/ayat-49.html", "/projects/ayat-49"),
  r("/projects/garment.html", "/projects/haile-garment-apartments"),
  // Any other old project page
  r("/projects/:slug.html", "/projects"),

  // temerpropertiessales.com / temerproperties.com
  r("/addis-ababa-real-estate", "/properties"),
  r("/ayat-real-estate", "/locations/ayat"),
  r("/bole-real-estate", "/locations"),
  r("/cmc-real-estate", "/locations"),
  r("/kazanchis-real-estate", "/locations"),
  r("/old-airport-real-estate", "/locations"),
  r("/summit-real-estate", "/locations"),
  r("/temer-properties", "/about"),
  r("/apartments-for-sale-addis-ababa", "/for-sale/apartments"),
  // To /properties while there are no villa listings: /for-sale/villas is noindex until it has listings, and a
  // 301 to a noindex page throws away the old page's ranking. Point these at /for-sale/villas once villas are listed.
  r("/villas-for-sale-addis-ababa", "/properties"),
  r("/homes-for-sale-addis-ababa", "/properties"),
  r("/luxury-homes-addis-ababa", "/properties"),
  r("/real-estate-investment-addis-ababa", "/blog"),
  r("/property-management", "/contact"),
  r("/real-estate-consultancy", "/contact"),
  r("/property-valuation", "/contact"),
  r("/terms-of-service", "/terms"),

  // temerpropertiessales.com as it is now (see its sitemap): /en and /am home pages, /{lang}/listings,
  // /{lang}/listings/{slug} and /{lang}/contact. It ranks for "temer properties" today, so none of these may
  // 404. Its listing slugs don't match ours, so every listing goes to the list. /en and /en/contact need no
  // entry: the proxy already redirects /en/... to the unprefixed English URL.
  r("/en/listings/:path*", "/properties"),
  r("/am/listings/:path*", "/am/properties"),
  r("/listings/:path*", "/properties"),
];

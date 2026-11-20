# Temer Properties website

Full-stack, SEO-first real estate website for Temer Properties (Addis Ababa). It replaces
temerpropertiesapartment.com and temerpropertiessales.com with one site:

- **Public site**: properties, projects, area guides, keyword landing pages, buyer guides, FAQ, contact.
- **Site-visit booking**: in-person or video-call visits, live slot availability, capacity limits.
- **Admin panel** (`/admin`): listings, projects, areas, guides, bookings and enquiries, with photo uploads.
- **Database**: SQLite through Drizzle ORM and libSQL. It is a local file in development and on a VPS, or Turso in serverless setups.

Stack: Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, Drizzle ORM, Zod.

## Quick start

Requires Node.js 22.12+.

```bash
npm install
cp .env.example .env.local        # then set ADMIN_EMAIL / ADMIN_PASSWORD
npm run setup                     # creates ./data/temer.db, applies migrations, seeds content + admin
npm run dev                       # http://localhost:3000, admin at /admin
```

Production check: `npm run build && npm start`.

| Script | What it does |
| --- | --- |
| `npm run db:generate` | Create a migration after editing `src/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations (run on every deploy) |
| `npm run db:seed` | Seed an empty database (`-- --reset` wipes content, bookings and enquiries first) |
| `npm run db:studio` | Browse the database in Drizzle Studio |
| `npm run admin:create -- --email a@b.com --name "Name" --password "…"` | Create an admin or reset an admin's password |
| `npm run typecheck` / `npm run lint` | Static checks |

> The seed's **unit listings, prices, offers and payment plans are DEMO data**, labelled "DEMO" and shown with
> "Sample image" placeholder photos. Projects and areas mirror the current website. Replace the demo data before launch.

## How SEO is built in

**1. Every public page is static HTML with its full content.** Cache Components prerender each page at build time.
Crawlers get the complete content, `<title>` and meta tags in the first response, and time to first byte (TTFB) is
about 5–10 ms. The old apartments site loaded its listings with client-side JavaScript, so crawlers saw an empty grid.
When an admin saves a change, `updateTag()` refreshes every affected page *and the sitemap* on the next request
(`src/lib/revalidate.ts`), with no rebuild needed.

**2. URL structure built around what buyers search for**

| URL | Page | Example query |
| --- | --- | --- |
| `/properties/{slug}` | Listing detail | "3 bedroom apartment Sarbet City Plus" |
| `/for-sale/{type}` | Type hub | "apartments for sale in Addis Ababa" |
| `/for-sale/{type}/{area}` | Type in area | "apartments for sale in Sarbet" |
| `/locations/{area}` | Area guide + listings | "property for sale Megenagna" |
| `/projects/{slug}` | Project page | "Ajewa Bulgaria apartments" |
| `/blog/{slug}` | Buyer guides | "how to buy an apartment in Addis Ababa" |

Type-in-area pages exist only when they have listings; otherwise the URL returns a real 404. Area and type hubs with no
listings get `noindex`. This keeps thin pages out of the index.

**3. Metadata on every page** (`src/lib/seo/metadata.ts`). Each page gets a unique title and description, generated
from the listing data when the admin leaves the SEO fields empty, plus a self-referencing canonical, Open Graph and
Twitter cards (the listing's own photo is the share image), and robots rules:
- **Sold units:** stay live for old links but are set to `noindex, follow` and removed from the sitemap.
- **Filtered `/properties?…` views:** canonicalised to `/properties`.
- **Admin:** `noindex` header and meta tag, plus `Disallow` in robots.txt.

**4. Structured data** (`src/lib/seo/jsonld.ts`), all linked by `@id` to a single `RealEstateAgent` entity:

| Page | Schema types |
| --- | --- |
| All public pages | `RealEstateAgent` (NAP, hours, sameAs), `WebSite` |
| Listing | `RealEstateListing` → `Apartment` / `SingleFamilyResidence` / … with `Offer` (ETB price, availability) |
| Project | `ApartmentComplex` |
| Guide | `BlogPosting` |
| FAQ and area FAQs | `FAQPage` |
| Collections | `ItemList` |
| All inner pages | `BreadcrumbList` |

**5. Crawl infrastructure.**
- `sitemap.xml` is built from the database. It includes image entries and real `lastmod` dates, and lists only indexable URLs.
- `robots.txt` allows `/_next/` and `/media/`. The old sales site blocked `/_next/static` and `/_next/image`, so Google couldn't render its pages.
- Legacy URLs from both old sites get 308 permanent redirects (`src/lib/config/legacy-redirects.ts`).

**6. Images and performance.**
- `next/image` serves AVIF/WebP at responsive sizes.
- Uploads are re-encoded as JPEG (EXIF/GPS stripped, max 2400px) so link previews work everywhere.
- The admin edits alt text per photo.
- Pages are about 22–37 KB gzipped, with 161 KB of JavaScript on the home page.
- Most UI is server components, and the mobile menu, gallery and forms are small client components.

**7. Staging safety.** Set `SITE_NOINDEX=true` on preview/staging deployments. Production builds fail if
`NEXT_PUBLIC_SITE_URL` is missing, because a wrong canonical domain silently wrecks rankings.

## Booking

Visitors book from any listing, any project page or `/book-a-visit`. Rules live in `src/lib/config/booking.ts`:
- Six slots a day, 3 bookings per slot.
- Monday–Saturday only.
- Bookable from tomorrow up to 60 days ahead, Addis Ababa time.

The form works without JavaScript. With JavaScript it shows live availability from `/api/availability`. The
capacity check and insert run in one write transaction, so a slot can't be overbooked. Customers get a reference such
as `TP-7K3Q9M`. Spam protection is a honeypot field plus per-IP rate limits.

New bookings and enquiries can alert the sales team in Telegram: set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.

## Admin

`/admin` covers:
- **Dashboard:** pending bookings, the next 7 days of visits, new enquiries.
- **Bookings:** confirm, cancel, mark visited or no-show, internal notes, one-click WhatsApp confirmation to the customer.
- **Enquiries:** status and notes.
- **Content:** full create/edit/delete for properties, projects, locations and guides, with:
  - photo upload, ordering and alt text
  - a Markdown description
  - SEO title/description with a Google snippet preview
  - publish and featured switches

Authentication uses database sessions: an httpOnly cookie, scrypt password hashes and login rate limiting. Every
admin page and Server Action re-checks the session; `src/proxy.ts` is only an early redirect.

## Project structure

```
src/
  app/(site)/          public pages (statically prerendered)
  app/admin/           admin panel (login + (panel) routes, Server Actions)
  app/api/             /api/availability, /api/admin/upload
  app/media/           serves uploaded images from UPLOAD_DIR
  app/sitemap.ts, robots.ts, manifest.ts
  actions/public.ts    booking + enquiry Server Actions
  components/site|admin|ui
  db/schema.ts         Drizzle schema (migrations in /drizzle)
  lib/config/          site/NAP, property types, booking rules, legacy redirects
  lib/data/            cached public queries ("use cache" + tags)
  lib/seo/             metadata, JSON-LD, default copy
scripts/               migrate, seed, create-admin, generate-brand-assets
```

## Deployment

**Option A: single VPS (recommended).** Node 22+, then:
`npm ci && npm run db:migrate && npm run build && npm start`.
- Put it behind Nginx or Caddy with HTTPS.
- Run it under a process manager (pm2 or systemd).
- `./data` (SQLite) and `./storage` (photos) must be on persistent disk and **backed up daily**.

**Option B: serverless (e.g. Vercel).**
- Set `DATABASE_URL=libsql://…` and `DATABASE_AUTH_TOKEN` (Turso).
- Swap `src/lib/storage.ts` and `src/app/media` for S3, Cloudflare R2 or Vercel Blob; serverless disks are ephemeral.
- Replace the in-memory rate limiter (`src/lib/rate-limit.ts`) with Redis/Upstash.

Environment variables are documented in `.env.example`.

## Before launch: decisions for the business

1. **One canonical domain.**
   - The sales site's canonical and sitemap point to temerproperties.com while it is served on temerpropertiessales.com.
   - Choose one domain for the new site and set `NEXT_PUBLIC_SITE_URL` to it.
   - 301-redirect the other domains to it, path for path.
2. **Consistent NAP.**
   - The old sites list different phones (0904 192 923 / 0913 455 624), emails, offices (Sarbet vs Bole Road) and founding years (2010 E.C. vs 2015).
   - Confirm the real details in `src/lib/config/site.ts` and use them identically on Google Business Profile.
3. **Real data.**
   - Replace the demo listings, prices, offers and payment plans.
   - Add the office and project map coordinates (left empty rather than guessed).
   - Review the area guides and the "10,000+ customers / 400+ units" claims.
4. **Photos and brand.**
   - Upload real photos with descriptive alt text.
   - The official logo lives in `brand/temer-properties-logo.jpg`. If it changes, replace that file and re-run `npx tsx scripts/generate-brand-assets.ts` (regenerates the header/footer cut-outs, favicons, `logo.png` and the default share image).
5. **Accounts.**
   - Change the admin password and remove `ADMIN_PASSWORD` from the server env after seeding.
   - Have the privacy policy and terms reviewed.
6. **Search engines.**
   - Verify the site in Google Search Console and Bing Webmaster Tools (`*_SITE_VERIFICATION` env vars) and submit `/sitemap.xml`.
   - Claim the Google Business Profile.

## Roadmap ideas

- **Amharic version** at `/am/…` with `hreflang`. Few competitors target Amharic searches. The old site's language toggle was client-side only, so it had no SEO value.
- **Automatic 301s when a published slug changes.** Today the admin shows a warning instead.
- Email notifications, analytics (GA4 or Plausible) and floor-plan uploads per unit.

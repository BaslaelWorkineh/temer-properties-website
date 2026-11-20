@AGENTS.md

# Project conventions (Temer Properties website)

SEO is the top priority of this project. Before changing public pages, keep these invariants:

- **Cache Components is on.** Every public DB read goes through `src/lib/data/*` functions that use `"use cache"` +
  `cacheLife("hours")` + `cacheTag(...)` for every table they read. Never query the DB directly in a public page.
- **Admin is request-time only.** No `use cache` in `src/app/admin`. Every admin page and Server Action calls
  `requireAdmin()` first (it calls `connection()`, which keeps auth out of prerenders/prefetches).
  After mutations call `refreshPublicContent(...tags)` from `src/lib/revalidate.ts`.
- **Metadata:** every public page uses `buildMetadata()` (canonical, OG, robots). Never set `alternates.canonical`
  or `openGraph.url` in a layout: children inherit them.
- **Dynamic public routes** export `ensureStatic = "navigation"` and a `generateStaticParams` that returns at least one
  param (placeholder `__none__` when the table is empty) so every response is complete HTML with a real 404 status.
- **Structured data** comes from `src/lib/seo/jsonld.ts`, rendered with `<JsonLd>`; entities link to `ORG_ID`.
- **Thin pages:** hubs without listings get `noindex`; type×area pages without listings 404; sold units are noindex
  and excluded from the sitemap. Keep `src/app/sitemap.ts` in sync with these rules.
- **Business data** (NAP, socials, hours) lives only in `src/lib/config/site.ts`.
- **Forms** submit via `onSubmit` + `startTransition` (React resets uncontrolled fields after `<form action>`).
- Verify with `npm run typecheck`, `npm run lint` and `npm run build` (all must be clean).

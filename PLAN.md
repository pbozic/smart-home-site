# Signapps smart-home site — build plan

A modern Slovenian marketing site for selling smart-home installations.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · **static export** (`output: "export"`) · **Sanity + Puck (integrated)** as the editing layer · host as static (Cloudflare Pages / Netlify / Vercel).

Reference (structure/feel only, not copy): dom-tech.si. Brand name lives in one place: `src/lib/brand.ts` (currently **Signapps**).

---

## Editing architecture: Sanity + Puck (integrated)

The two tools do **different jobs** and combine into one system:

- **Puck** (open-source, MIT) = the **drag-and-drop layout editor**. Editors visually arrange our pre-built premium sections (Hero, Pricing, FAQ, Comparison, …) on a canvas: reorder, add, remove, configure each block's props. A page's layout saves as **Puck JSON**.
- **Sanity** (hosted, free tier) = the **content store + media + collections**. Holds the Puck JSON per page, plus Blog/Aktualno posts, Reference/projekti, site settings, and all images (served via Sanity CDN).

**The bridge:** each Sanity `page` document has a `puckData` (JSON) field. Editors open the Puck editor → drag/configure our sections → save → JSON is written to that Sanity field. At build time the site reads `puckData` from Sanity and renders our **real React components**; collections (posts, projects) render from their own Sanity docs.

**Scope decisions (locked):**
- **All pages composable in Puck** (home + inner pages).
- **Sanity collections first:** Site settings, Reference/projekti, Blog/Aktualno.
- Static export keeps: publish in Sanity/Puck → **rebuild-on-publish** (webhook → deploy hook) → live.

**Honest constraints:**
- Editors drag/drop/reorder/configure **the blocks we build** — adding a brand-new section *design* is a dev task (register a new Puck component).
- Two editing surfaces: **layout = Puck canvas**, **posts/projects/settings = Sanity forms**.
- Puck editor route is dev/admin-only and **excluded from the static export** (editing happens against Sanity; the public build is pure static).

---

## Current status (done)

- ✅ Project scaffolded; builds & static-exports cleanly (8 pages, ~110 KB first load).
- ✅ Design system (dark, glassy, gradient "giga-modern") in `tailwind.config.ts` + `src/app/globals.css`.
- ✅ Brand/tech config: `src/lib/brand.ts` (Signapps swappable; ecosystem facts; Matter "coming soon").
- ✅ Header, Footer, Logo, icons, SVG graphics (hub diagram, phone mockup).
- ✅ Homepage sections: Hero, TrustBar, Why, Comparison, Ecosystem, Steps, Pricing, FAQ, FinalCta.
- ✅ Inner pages: `/kontakt`, `/cenik`, `/funkcionalnosti`, `/o-nas`, `/zasebnost`, `/piskotki`.
- ✅ Contact form (configurable external endpoint; honeypot; used sparingly).
- ✅ Content in local TS files with a **Sanity fallback** (`src/lib/sanity.ts`) — renders without CMS until wired.

---

## How to parallelize without colliding

- **One stream = one folder/area.** Don't edit files outside your stream's "Owns" list.
- **Shared/foundational files** (`brand.ts`, `nav.ts`, `globals.css`, `tailwind.config.ts`, `layout.tsx`, `package.json`, `next.config.mjs`, `src/lib/sanity.ts`, the Puck config registry) are owned **only by Stream A**. Other streams request changes from A.
- **The section components themselves are the contract.** Stream B owns their *implementation*; Stream A wraps them as Puck blocks. To avoid collisions, **Stream A imports B's components and defines Puck adapters in `src/puck/` — it does not edit files in `src/components/sections/`.**
- Each stream ends green: `pnpm typecheck && pnpm build`.

---

## Stream A — Foundation, Sanity + Puck integration  ⚠️ owns shared files + the editing layer

**Goal:** Stand up the whole editing system. Land first (or coordinate) — it owns shared files and everything CMS.

**Owns:**
- `src/lib/sanity.ts`, `src/lib/brand.ts`, `src/lib/nav.ts`
- `sanity/` — all schemas + studio config
- `src/app/studio/` — embedded Sanity Studio route
- `src/puck/` — **Puck config/registry** (`puck.config.tsx`), block adapters that wrap B's section components, field editors
- `src/app/edit/` — Puck editor route (admin-only, excluded from static export)
- `src/components/PuckRender.tsx` — renders Puck JSON → components on public pages
- `src/app/layout.tsx`, `next.config.mjs`, `package.json`, `.env.example`
- `src/app/globals.css`, `tailwind.config.ts`

**Tasks:**
1. **Deps:** add `@measured/puck`, `sanity`, `next-sanity`, `@sanity/vision`. Pin versions; commit lockfile.
2. **Sanity project:** create it; add `NEXT_PUBLIC_SANITY_PROJECT_ID` / `DATASET` / `API_VERSION` + a write token (server-only) to `.env.example`.
3. **Schemas:** `page` (slug + `puckData` JSON + SEO), `siteSettings` (brand/contact/SEO/social), `reference` (project: title, images, description, location), `post` (Aktualno: title, slug, cover, portable-text body, date). Embedded **Studio at `/studio`**.
4. **Puck config (`src/puck/puck.config.tsx`):** register every section (from Stream B) as a Puck component with editable fields (text, lists, links, image refs). Group: "Sekcije", "Vsebina".
5. **Editor route (`/edit`):** loads a page's `puckData`, renders Puck `<Puck>` canvas, **saves JSON back to Sanity** via a small write action (uses server token). Exclude `/edit` + `/studio` from static export (`export const dynamic`, or route-segment config / separate build).
6. **Render pipeline (`PuckRender.tsx`):** `<Render config={puckConfig} data={puckData} />` for public pages; **fallback to local content** when a page has no `puckData` yet.
7. **Rebuild-on-publish:** Sanity webhook → host deploy hook. Document in README.

**Done when:** Studio loads; `/edit?page=home` lets you drag/reorder sections and save to Sanity; a static build renders the saved layout; with no Sanity configured, the site still builds from local content.

**Depends on:** B's component prop shapes (coordinate field names). **Blocks:** B/C only where they want Puck-backed rendering.

---

## Stream B — Section components & graphics (the Puck blocks)

**Goal:** Own the *implementation* of every section and graphic. These become Puck's draggable blocks (A wraps them).

**Owns:**
- `src/components/sections/*` (Hero, TrustBar, Why, Comparison, Ecosystem, Steps, Pricing, Faq, FinalCta, + new)
- `src/components/graphics/*`
- `src/content/home.ts` (the canonical prop shape + fallback content)

**Tasks:**
1. **Make sections prop-driven, not import-driven.** Each section accepts its content via props (so Puck can pass edited values) with `home.ts` as default. Keep a stable, documented prop interface per section — **this is the contract Stream A wraps.**
2. Add new sections: **"Dan s pametnim domom"** timeline, **testimonials**, **works-with logo wall**.
3. New SVG graphics (room/scene illustration, logo wall).
4. Responsive + animation polish (390/768/1440).

**Coordination:** export a TypeScript `Props` type per section; A imports those types for the Puck field definitions. **B never edits `src/puck/`.**

**Done when:** sections render from props, look polished, build green; prop types exported.

**Depends on:** none. **Blocks:** A's Puck adapters (needs the prop contracts).

---

## Stream C — Inner pages, routes & navigation content

**Goal:** Flesh out non-home routes and collection-driven pages.

**Owns:**
- `src/app/funkcionalnosti/`, `src/app/cenik/`, `src/app/o-nas/`, `src/app/zasebnost/`, `src/app/piskotki/`
- New routes: `src/app/reference/` (projekti gallery), `src/app/blog/` (Aktualno index + `[slug]`), `src/app/funkcionalnosti/[slug]/` (feature detail)
- `src/content/features.ts` + new `src/content/*`
- `src/components/PageHeader.tsx`, `src/components/PortableText.tsx` (renders Sanity rich text)

**Tasks:**
1. **/reference** gallery from the Sanity `reference` collection (cards + lightbox); image placeholders until photos exist.
2. **/blog** (Aktualno) index + post template rendering Sanity `post` portable-text via `PortableText.tsx`.
3. Feature sub-pages (pametna ključavnica / video zvonec / vtičnice…), like dom-tech.
4. Request nav additions from A (`nav.ts` is A-owned).

**Done when:** collection pages render from Sanity (fallback to placeholder), all linked, on-brand, build green.

**Depends on:** A for `sanity.ts` query helpers, `nav.ts`, and the `reference`/`post` schemas. **Blocks:** none.

---

## Stream D — Contact, forms & integrations

**Goal:** Production-ready contact path (kept **sparing** per brief — kontakt page + one homepage CTA, not every section).

**Owns:**
- `src/components/ContactForm.tsx`, `src/app/kontakt/`, form/map docs

**Tasks:**
1. Real form endpoint (Formspree / Web3Forms / Getform) via `NEXT_PUBLIC_FORM_ENDPOINT`; success/error UX (done — verify live).
2. **Free spam protection:** honeypot (done) + optional **Cloudflare Turnstile** (free) or hCaptcha; document keys.
3. Embedded **map** (Google Maps / OpenStreetMap) on `/kontakt`.

**Done when:** test submission reaches endpoint, spam protection on, map renders, build green.

**Depends on:** A for env var docs. **Blocks:** none.

---

## Stream E — SEO, performance, deploy & QA

**Goal:** Ship-readiness. New files + isolated config (coordinate config edits with A).

**Owns:**
- `src/app/sitemap.ts`, `src/app/robots.ts`, `public/` (favicons, og image, manifest)
- `README.md`, deploy config (`netlify.toml` / Cloudflare Pages config / `vercel.json`)
- QA checklist doc

**Tasks:**
1. `sitemap.ts` + `robots.ts` (static-export compatible); per-page metadata; JSON-LD (LocalBusiness/Organization).
2. OG image, favicons, web manifest in `public/`.
3. Deploy config — **Cloudflare Pages recommended (free, commercial-OK)**; Netlify alt; Vercel Pro for commercial. Wire the **rebuild-on-publish** deploy hook to Sanity's webhook (with A).
4. README: setup, env vars, Sanity Studio, **Puck `/edit` workflow**, rebuild-on-publish, deploy steps.
5. QA: Lighthouse (perf/a11y/SEO ≥ 95), responsive pass, Slovenian proofread, broken-link check, verify `/edit` + `/studio` excluded from public export.

**Done when:** README complete, sitemap/robots/og present, Lighthouse ≥ 95, deploys to a preview URL.

**Depends on:** A for env var names + deploy-hook URL. **Blocks:** launch.

---

## Suggested sequencing

1. **B first or alongside A** — A's Puck adapters need B's section **prop contracts**. Practically: B converts sections to prop-driven and exports `Props` types; A consumes them.
2. **A** — Sanity + Puck integration (the heavy lift). Owns shared files; merge carefully.
3. **C, D in parallel** — disjoint folders; need A's schemas/helpers but can stub with fallbacks.
4. **E last-ish** — needs pages to exist; can start sitemap/README early.

## Cross-cutting conventions

- **Prop contract is king:** section content flows section → props; `home.ts` holds defaults; A maps Puck fields → those props. Keep field names identical across `content/*`, Sanity schema, and Puck config.
- New shared hooks/util → `src/lib/`; announce the filename so two streams don't create the same file.
- Every PR: `pnpm typecheck && pnpm build` green; screenshot for visual changes.
- All copy **Slovenian**; brand via `brand.name`, never hardcoded.
- `/edit` and `/studio` must never ship in the public static export.

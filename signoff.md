# Sign-off — Sanity + Puck editing layer & custom WP-style admin

**Date:** 2026-06-17 · **Status:** built, reviewed (R-1 + R-2 approved), all green, committed to `main`.

This documents what was shipped in this work block and **what has to come next**. Design lives in
[PLAN.md](PLAN.md) / [ADMIN_PLAN.md](ADMIN_PLAN.md); task graphs in [TASKS.md](TASKS.md) /
[ADMIN_TASKS.md](ADMIN_TASKS.md).

---

## What was built

### 1. Sanity + Puck editing layer
- **Prop-driven sections** (`src/components/sections/*`) — each takes content via props (defaults
  from `src/content/home.ts`) and exports a `*Props` type.
- **Sanity schemas** (`sanity/schemaTypes/`): `page` (slug + `puckData` + SEO), `siteSettings`,
  `project` (portfolio — note: **not** `reference`, which is a Sanity-reserved name), `post`.
  Studio config in `sanity.config.ts`.
- **Puck registry** (`src/puck/puck.config.tsx`) — all 9 sections registered, field names matched
  to `home.ts`. **`PuckRender`** (`src/components/PuckRender.tsx`) renders Puck JSON → real
  components, falling back to the local section stack when there's no data.
- **Data layer** (`src/lib/sanity.ts`, `sanity.write.ts`): `sanityFetch` (local fallback when no
  env), `getPagePuckData`, `savePuckData`. The homepage (`src/app/page.tsx`) reads its `puckData`
  at build and renders via a lazily-imported `PuckRender` (keeps the public bundle lean).

### 2. Custom WP-style protected admin (`/admin`)
- **Sanity-auth gate** + WP-style **sidebar**: Nadzorna plošča · Strani · Aktualno · Reference ·
  Nastavitve.
- **Strani** → list (New/Edit/Delete) → **full-screen Puck editor** (`/admin/pages/edit?slug=`)
  that loads a page's saved layout, saves it back, and has a **Revizije** panel (preview + restore
  via the Sanity History API).
- **Aktualno / Reference / Nastavitve** → lists that hand off to the **embedded Sanity Studio**
  (`/studio/structure/<type>;<id>`) for field editing (rich text, media).
- Libs: `src/lib/sanityAuth.ts` (client session auth), `src/lib/sanityAdmin.ts` (list/CRUD/history).
- The old standalone `/edit` route was **retired** (folded into `/admin/pages/edit`).

### Key architecture decisions (and why)
- **`output: "export"` forbids Server Actions / Route Handlers**, so **all auth + writes are
  client-side** via the Sanity **session** (`withCredentials: true`). The write token
  (`SANITY_API_WRITE_TOKEN`) is **server-only** (no `NEXT_PUBLIC_` prefix) and reserved for
  scripts/webhooks. **Sanity's API is the real security boundary** — the client gate is UX.
- **D1:** `/admin` + `/studio` **ship** in the static export, **client-gated** (like wp-admin on a
  live domain). Public marketing pages stay pure static.
- **D2:** non-page content is edited in the embedded Studio (don't rebuild rich-text/media).
- Libs import `@sanity/client` (not the `next-sanity` root) to avoid a `"use server"` chunk that
  would break static export.

### Verified
`pnpm build` exit 0 · `pnpm typecheck` exit 0 · **48 vitest tests** green · `out/admin` +
`out/studio` ship, `out/edit` absent, public pages + local-content fallback intact.

---

## Run it locally
```powershell
pnpm install
pnpm dev            # http://localhost:3000  (admin at /admin, Studio at /studio)
# static export preview:
pnpm build ; pnpm dlx serve out
```
> `dev` and `build` share `.next` and are incompatible — after a `build`, run
> `Remove-Item -Recurse -Force .next ; pnpm dev` before editing again.

`.env.local` (git-ignored) is wired to Sanity project **`z5nrf2iy`** / dataset `production`.

---

## WHAT HAS TO COME NEXT

### A. Make editing work end-to-end (do first)
1. **Sanity CORS** — at sanity.io/manage → API → CORS origins, add `http://localhost:3000` **and
   your production origin**, both with **Allow credentials** ✓. Without this, login + saves fail.
2. **Smoke-test live** — log into `/admin`, create a `page` with slug `home`, arrange sections,
   Publish, confirm it persists; verify the Revizije panel.
3. **Seed content in Studio** — `siteSettings` (brand/contact/SEO), a few `post`/`project` docs.

### B. Surface published content on the public site
4. **Wire `PuckRender` into inner pages** — only the **homepage** currently reads `puckData`.
   `/cenik`, `/funkcionalnosti`, `/o-nas`, etc. still render bespoke local content. Each needs its
   own page doc + fallback (the homepage pattern in `src/app/page.tsx` is the template).
5. **Rebuild-on-publish webhook** — a static site only updates on rebuild. Wire a Sanity webhook →
   host **deploy hook** so "Publish" triggers a redeploy. (Not implemented.)

### C. Deploy
6. **Host** — recommended **Cloudflare Pages** (free, commercial-OK): build `pnpm build`, output
   `out/`, set the `NEXT_PUBLIC_SANITY_*` env vars. Netlify alt; Vercel Pro for commercial.
7. Confirm the production origin is in Sanity CORS (A.1). Decide whether `/admin` + `/studio`
   should be on the public domain (current D1) or a separate admin deploy.

### D. Content / brand polish (from PLAN.md open items)
8. Real **phone number** in `src/lib/brand.ts` (placeholder `+386 41 000 000`).
9. **Contact form** endpoint (`NEXT_PUBLIC_FORM_ENDPOINT`) + optional Cloudflare Turnstile.
10. **SEO** (Stream E): `sitemap.ts`, `robots.ts`, OG image, favicons, JSON-LD; Lighthouse ≥ 95.
11. **Collection pages** (Stream C): `/reference` gallery + `/blog` (Aktualno) from Sanity.

### E. Optional hardening
12. **Private dataset** if reads should be gated too (currently public per `sanity init` → reads
    are open; only writes are auth-gated).
13. **Responsive preview** in the Puck editor (currently `iframe` disabled to avoid a Next-dev hang
    — re-enabling needs Tailwind style-injection into the iframe).
14. **Real phone/form/Turnstile keys**, README, and CI running `pnpm typecheck && pnpm test`.

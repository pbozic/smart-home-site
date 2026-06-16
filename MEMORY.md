# Handoff memory — Signapps smart-home site (and related WordPress work)

**Last updated:** 2026-06-16
**Author:** Claude (Opus 4.8) working with primoz.bozic@signapps.si
**Purpose:** so a later session can pick up exactly where we left off.

---

## TL;DR — where we are right now

The **active project** is `~/Documents/www/smart-home-site`: a giga-modern Slovenian
marketing site for selling smart-home installations (brand **Signapps**). It's a
**Next.js 15 static-export** site that **builds and looks great** (homepage + 7 inner pages).
Content currently comes from **local TS files** with a Sanity fallback already coded in.

**The next big task** is the editing layer: **Sanity + Puck integrated** (drag-and-drop page
building via Puck, JSON stored in Sanity; Sanity also for blog/projects/settings/media).
This is **planned in detail in `PLAN.md` but NOT yet built.** No build has started on it.

There are also **two finished WordPress themes** from earlier in the same conversation
(see "Other projects" below) — those are done; don't confuse them with the active work.

---

## Active project: `~/Documents/www/smart-home-site`

### What it is
- Selling smart homes. Reference site for **structure/feel only** (not copy): dom-tech.si.
- Tech we actually use (for messaging): **Home Assistant as hub**, **Shelly / Sonoff / Aqara /
  Philips Hue**, **Wi-Fi + BLE now**, **Matter + Thread "coming soon" (kmalu)** — labelled
  honestly as future.
- Language: **Slovenian**. Design: dark, glassy, gradient, "giga-modern".
- Brand is a **single swappable variable**: `src/lib/brand.ts` (`brand.name = "Signapps"`).

### Stack / decisions (all locked with the user)
- Next.js 15 App Router + TypeScript + Tailwind 3.
- **Static export** (`next.config.mjs` → `output: "export"`, `trailingSlash: true`, `images.unoptimized`).
- Host as static — recommended **Cloudflare Pages** (free, commercial-OK); Netlify alt; Vercel Pro for commercial.
  (User asked about Vercel cost: Hobby=free but non-commercial; Pro ~$20/seat/mo for commercial.)
- CMS: **Sanity + Puck integrated** (see "Next task"). Edits go live via **rebuild-on-publish** (webhook → deploy hook) because it's static.

### What's DONE and verified
- `pnpm install` done (pnpm 9, Node 22). Deps incl. next-sanity, @sanity/image-url, @portabletext/react (Puck NOT installed yet).
- `pnpm typecheck` clean, `pnpm build` green → exports **8 static pages** to `out/` (~110 KB first load).
- **Design system:** `tailwind.config.ts` (ink/brand/accent/mist palette, animations, shadows) + `src/app/globals.css` (.btn-primary/.btn-ghost/.card/.eyebrow/.text-gradient/.container-x/.section).
- **Layout/chrome:** `src/components/Header.tsx` (sticky, glassy, mobile menu, client), `Footer.tsx`, `Logo.tsx` (original SVG mark), `icons.tsx` (inline SVG set), `PageHeader.tsx`.
- **Graphics (original SVG, no photos):** `src/components/graphics/HubDiagram.tsx` (HA hub + orbiting brand nodes), `PhoneMockup.tsx` (app dashboard).
- **Homepage** (`src/app/page.tsx`) composes sections in `src/components/sections/`:
  Hero, TrustBar, Why, Comparison (wireless vs wired), Ecosystem (hub diagram + Matter "kmalu" badges), Steps, Pricing (2.000 €), Faq (client accordion), FinalCta.
- **Inner pages:** `/kontakt` (ContactForm), `/cenik`, `/funkcionalnosti`, `/o-nas`, `/zasebnost`, `/piskotki`.
- **Contact form** (`src/components/ContactForm.tsx`): posts to `NEXT_PUBLIC_FORM_ENDPOINT` (Formspree/Web3Forms style), honeypot spam guard, friendly fallback when unconfigured. **Used sparingly** per the brief (NOT on every section — user explicitly disliked dom-tech doing that).
- **Content (local, with Sanity fallback):** `src/content/home.ts`, `src/content/features.ts`, `src/lib/brand.ts`, `src/lib/nav.ts`.
- **Sanity fallback mechanism:** `src/lib/sanity.ts` → `sanityFetch()` returns local fallback when `NEXT_PUBLIC_SANITY_PROJECT_ID` is empty, so the site builds/renders with **no CMS connected**. This is intentional and must be preserved.
- **Screenshots reviewed** (desktop 1440 + mobile 390): looks polished and responsive. Saved at `/tmp/shs-home.png`, `/tmp/shs-full.png`, `/tmp/shs-mobile.png` (may be gone next session — just rebuild & re-screenshot).

### How to run / verify (next session)
```bash
cd ~/Documents/www/smart-home-site
pnpm install            # if needed
pnpm typecheck && pnpm build
# preview the static export:
cd out && python3 -m http.server 4477   # then open http://localhost:4477
# screenshot: use headless Chrome at /Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless --screenshot=...
```

---

## NEXT TASK (not started): Sanity + Puck integrated editing layer

Fully specified in **`PLAN.md`** (read it first). Summary of the agreed architecture:

- **Puck** (@measured/puck, MIT) = drag-and-drop layout editor. Editors arrange our pre-built
  sections on a canvas; layout saved as **Puck JSON**.
- **Sanity** (hosted, free tier) = stores the Puck JSON per page **+** collections + media.
- **Bridge:** each Sanity `page` doc has a `puckData` JSON field. Puck writes layouts there;
  the static build reads `puckData` and renders our real React components.
- **Locked scope:** ALL pages composable in Puck. Collections first = **site settings,
  reference/projekti, blog/Aktualno**.
- `/edit` (Puck) and `/studio` (Sanity) must be **excluded from the public static export**.

### Build order for this task (from PLAN.md streams)
1. **Stream B prep first:** make `src/components/sections/*` **prop-driven** (content via props,
   `home.ts` as defaults) and **export a `Props` type per section** — this is the contract Puck needs.
2. **Stream A (the heavy lift):** add deps (`@measured/puck`, `sanity`, `next-sanity`, `@sanity/vision`);
   create Sanity project + env (`NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET/API_VERSION` + server write token);
   schemas (`page` w/ `puckData`, `siteSettings`, `reference`, `post`); Studio at `/studio`;
   Puck registry `src/puck/puck.config.tsx` wrapping B's sections; editor route `/edit`;
   `src/components/PuckRender.tsx` to render JSON on public pages (fallback to local content);
   rebuild-on-publish webhook.
3. **C/D/E** in parallel after (inner/collection pages; contact+map+Turnstile; SEO/deploy/QA/README).

### Watch out for
- Keep the **local-content fallback working** at every step (site must build with no Sanity).
- Field names must stay identical across `content/*` ↔ Sanity schema ↔ Puck config.
- Static export + a dynamic `/edit` and `/studio`: those routes can't be statically exported —
  exclude them (route config) or build Studio separately. Decide & document.
- Sanity's visual-editing peer-dep warning seen during install is harmless (we're not using
  @sanity/client v7 visual editing).

---

## Open questions / pending user input
- None blocking. User confirmed: Sanity+Puck integrated, all pages composable, collections =
  settings + reference + blog. User was deciding whether I start with Stream A or Stream B —
  **recommended: Stream B prep (prop contracts) then Stream A.**
- Real phone number is a placeholder in `brand.ts` (`+386 41 000 000`) — needs the real one.
- Form endpoint + (optional) Cloudflare Turnstile keys not yet provided.

---

## Other projects in this workspace (DONE — context only, not active work)

These were built earlier in the SAME conversation. Both finished & verified live in Docker.

### `~/Documents/www/wordpress-test/` — two WordPress themes + Docker
- **`docker-compose.yml`** — local WP at http://localhost:8080 (MariaDB + wordpress:php8.3).
  Both themes live-mounted. Currently **running** (Elementor + CF7 installed, demo imported).
- **`tjasa-toman/`** — block theme (FSE) for a singer (tjasatoman.com clone), Slovenian.
  Events as `dogodek` custom post type. Done.
- **`skof-elektro/`** — Elementor-ready classic theme for an electrician (skof.si clone), Slovenian.
  Highlights: one-click demo importer (`inc/class-skof-demo-importer.php`) creates all pages,
  imports 10 images, seeds a `referenca` CPT, builds menu, creates a CF7 form.
  **Colors: Elementor Global Colors is the single source of truth** — theme reads them via
  `inc/class-skof-colors.php` and feeds CSS vars so header/footer/form match Elementor widgets.
  "Dejavnost" menu item is non-clickable (parent only). All verified live (HTTP 200, color
  cascade tested by changing Elementor primary → everything re-skinned).

### `~/Documents/www/home-assistant/` — the user's REAL platform (do not modify unasked)
- Monorepo "home-assistant-pack": HA OTA deployment platform (api, dashboard, edge-agent,
  web-admin; `@signapps/ui`). This is the product behind the marketing site. We only read it
  for brand context (Signapps). **Don't touch it** unless asked.

---

## Conventions established this conversation
- Always **verify against reality** (fetch the site, lint in Docker, build, screenshot) — don't
  claim things work without checking. User values honesty about what's verified vs assumed.
- Be upfront about **trade-offs and limitations** (e.g. static+CMS rebuild, Puck only drags
  pre-built blocks, Vercel commercial pricing) before building.
- Slovenian copy everywhere; brand via a variable, never hardcoded.
- `pnpm typecheck && pnpm build` must stay green.

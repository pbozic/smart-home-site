# ADMIN_PLAN — Custom WP-style protected admin (Sanity-auth)

> **What this is:** the design for a WordPress-admin-style **custom admin shell** for the
> Signapps site — sidebar of content types, document lists, a full-screen **Puck** visual
> editor for pages, and **revisions**, all gated by **Sanity authentication**. The standalone
> `/edit` route is **retired** and folded into this admin. Builds on the Sanity + Puck layer
> already shipped (see [TASKS.md](TASKS.md)). Task graph: [ADMIN_TASKS.md](ADMIN_TASKS.md).
>
> **Status:** Plan only — **no admin source written yet.** Awaiting approval to dispatch agents.

## Decisions (locked with the user)
- **Approach:** custom WP-style admin shell in Next (not Sanity Studio's own UI, not hybrid).
- **Auth:** Sanity authentication (the editor's logged-in Sanity session).
- **`/edit`:** retired — visual editing happens only inside the protected admin.

## Two hard realities this design is built around
1. **`output: "export"` = no server runtime.** No middleware, no Route Handlers, no Server
   Actions. So **auth must be client-side**: the browser checks the Sanity session and gates the
   UI. The *real* security boundary is **Sanity's API**, which enforces auth server-side — you
   cannot read private data or write without a valid session, no matter what the UI shows. The
   client gate is UX; Sanity's API is the lock.
2. **A static site has no per-user server.** "Protection" therefore means: (a) the admin UI is
   gated on a live Sanity session check, and (b) every read/write goes through Sanity's authed
   API. The write token stays server-only (scripts/webhooks); the browser uses the session.

## Security model
- Admin UI renders only after `getCurrentUser()` (a `withCredentials` call to Sanity) returns a
  user; otherwise it shows a login gate. Not-logged-in users see a login screen, not the tools.
- All content reads/writes go to Sanity's API with `withCredentials: true` (session cookie).
  Writes are impossible without a valid Sanity project membership → that's the enforcement.
- No secrets in the client bundle (no `NEXT_PUBLIC_` token; existing rule preserved).
- The editor's project must have the admin origin in **Sanity CORS** with *credentials allowed*.

## DECISIONS TO CONFIRM (before/at dispatch)
- **D1 — Does the admin ship on the live site, or stay local/separate?**
  Like `wp-admin`, the natural answer is **ship `/admin` in the build as a client-gated route**
  (available at `yoursite.com/admin`, protected by the Sanity session) — this reverses the
  earlier "strip admin from `out/`" choice for `/admin`/`/studio`. **Recommended: ship it,
  client-gated.** Alternative: keep stripping it from the public export and run the admin only
  via `pnpm dev` / a separate admin deployment. *(Public marketing pages stay pure static either
  way.)*
- **D2 — Editing non-page content (posts, projects, settings).** Pages get the full custom Puck
  editor. For field-heavy types (rich-text post body, image uploads, settings), **recommended:
  the admin lists them and opens the embedded Sanity Studio for field editing** (don't rebuild
  rich-text + media uploaders). Alternative: build custom forms for them too (much more work).

## Routes (all client-rendered; `/admin/**` is the protected app)
- `/admin` — dashboard landing (counts, quick links). Behind the auth gate + sidebar layout.
- `/admin/pages` — list of `page` docs (title, slug, updated, has-layout) → New / Edit / Delete.
- `/admin/pages/[slug]` — **full-screen Puck visual editor**: loads existing `puckData`, saves
  back to Sanity, plus a **Revisions** panel (list / preview / restore).
- `/admin/posts`, `/admin/projects`, `/admin/settings` — lists; field editing per **D2**.
- `/edit` — **removed** (301/redirect to `/admin/pages` if D1=ship; otherwise deleted).

## Sidebar (WP-style)
`Nadzorna plošča` (Dashboard) · `Strani` (Pages) · `Aktualno` (Posts) · `Reference` (Projects) ·
`Nastavitve` (Settings) · current user + `Odjava` (Logout).

## Team & file ownership (collision guard)
| Area | Owner | Notes |
|---|---|---|
| `src/lib/sanityAdmin.ts` (new) — list/CRUD/history data helpers | Backend | reads via session client; offline-safe fallbacks |
| `src/lib/sanityAuth.ts` (new) — `getCurrentUser`/login/logout | Backend | client session check |
| `src/lib/sanity.ts`, `sanity.write.ts` — minor extensions only | Backend | keep existing exports + fallback |
| `next.config.mjs`, `scripts/strip-admin-routes.mjs` — D1 wiring | Backend | ship-gated vs strip |
| `src/app/admin/**` — shell, layout, sidebar, lists, editor, revisions UI | Frontend | the whole admin app |
| `src/app/edit/**` — **delete** | Frontend | retire route |
| `src/puck/puck.config.tsx` — reused as-is | (shared, read-only) | no edits expected |
| `**/*.test.ts(x)`, vitest | Test | every impl task gets tests |
| diffs (read-only) | Review | **R-2 gate** before final summary |

## Phases (detail + task IDs in ADMIN_TASKS.md)
- **A — Data + auth foundation (Backend):** session check/login/logout; list/get/create/delete;
  D1 export wiring; retire `/edit`.
- **B — Shell + auth gate + sidebar (Frontend):** `/admin` layout, gate, WP-style nav, dashboard.
- **C — Pages + Puck editor (Frontend):** pages list; full-screen Puck editor with load+save.
- **D — Other content types (Frontend):** posts/projects/settings lists + field editing (D2).
- **E — Revisions (Backend+Frontend):** history helpers + revisions panel (list/preview/restore).
- **F — Tests + R-2 review gate:** matched tests per task; security/regression/architecture review.

## Definition of done
- Visiting `/admin` while logged out shows a login gate; logging in (Sanity) reveals the shell.
- Sidebar lists all content types; **Strani → list → open a page → arrange in Puck → save**,
  with **revisions** (view + restore). Posts/projects/settings manageable per D2.
- Public marketing pages still build **green and static** with the local-content fallback intact.
- `/edit` no longer exists. All `T-*` (admin) green. **R-2 approved.**

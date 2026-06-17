# ADMIN_TASKS — Custom WP-style protected admin (task graph)

> Task graph for [ADMIN_PLAN.md](ADMIN_PLAN.md). Same rules as [TASKS.md](TASKS.md): claim one
> task at a time; no two agents edit the same file at once (serialize on overlap); every impl
> task has a paired test; **R-2 must approve before the final summary**; stay green
> (`pnpm typecheck && pnpm test && pnpm build`) with the **public site + local fallback intact**.
>
> **Status:** dispatching. **D1 = ship `/admin`+`/studio` client-gated on the live site**
> (do NOT strip them; only retire `/edit`). **D2 = embed Sanity Studio for non-page field
> editing** (posts/projects/settings); pages use the custom Puck editor.
>
> ⚠️ **Agents must NOT run `pnpm build`** (the user is running `pnpm dev`; a build clobbers the
> shared `.next` cache). Verify with `pnpm typecheck` + `pnpm test` only; the Lead runs builds.

## Status legend
`todo · in_progress · blocked · done` · (review) `approved / changes_requested`

## File ownership map
| Path | Owner |
|---|---|
| `src/lib/sanityAuth.ts`, `src/lib/sanityAdmin.ts` (new), `src/lib/sanity*.ts` (extend) | Backend |
| `next.config.mjs`, `scripts/strip-admin-routes.mjs` | Backend |
| `src/app/admin/**` | Frontend |
| `src/app/edit/**` (delete) | Frontend |
| `**/*.test.ts(x)`, vitest config | Test |
| read-only diff review | Review |

---

## Phase A — Data + auth foundation (Backend)

- [x] **A-1 · Auth helpers** — `done` (`sanityAuth.ts`: `getCurrentUser`/`getLoginProviders`/`loginUrl`/`logout`; endpoints verified vs Studio source; offline-safe)
  - files: `src/lib/sanityAuth.ts`
  - do: client session helpers — `getCurrentUser(): Promise<SanityUser|null>` (via `withCredentials` request to Sanity `users/me`; catch→null), `startLogin()` (redirect to the embedded `/studio` login or Sanity hosted login, returns to `/admin`), `logout()`. No secrets; works in the browser. Offline/no-env → `null` (gate shows login).
  - tests: **TA-1** · dep: —
- [x] **A-2 · Admin data layer (read + CRUD)** — `done` (`sanityAdmin.ts`: `listDocs`/`getPage`/`createPage`/`deleteDoc` + reuses `getPagePuckData`/`savePuckData`; drafts filtered; offline-safe). Lead: typecheck 0.
  - files: `src/lib/sanityAdmin.ts` (+ tiny extensions to `src/lib/sanity.ts` / `sanity.write.ts`, exports preserved)
  - do: `listDocs(type)` (id/title/slug/updatedAt), `getPage(slug)`, `createPage(slug,title)`, `deleteDoc(id)`; session/`withCredentials` writes; reuse `getPagePuckData`/`savePuckData`. **Offline-safe fallbacks** (`[]`/`null`); never break the public build.
  - tests: **TA-2** · dep: —
- [x] **A-3 · Export strategy + retire `/edit`** — `done` (D1: build = plain `next build`; strip script deleted; `/admin`+`/studio` ship client-gated; T-0/T-2 updated to the new contract). Lead: typecheck 0, tests 28/28.
  - files: `next.config.mjs`, `scripts/strip-admin-routes.mjs`
  - do: per **D1** — either keep `/admin`+`/studio` shipped (client-gated; strip only nothing/old `/edit`) or strip `/admin` too. Update the strip script (drop `/edit`, add/remove `/admin`). Keep public pages static + green.
  - tests: **TA-3** · dep: D1

## Phase B — Shell + auth gate + sidebar (Frontend)

- [x] **B-1 · Admin layout + auth gate + sidebar** — `done` (`layout.tsx` force-static → `AdminShell` gate (loading/login/authed) + WP-style `Sidebar`; offline-safe). Lead: typecheck 0.
  - files: `src/app/admin/layout.tsx`, `src/app/admin/AdminShell.tsx`, `src/app/admin/Sidebar.tsx` (client; `force-static` shell)
  - do: client auth gate using A-1 (`getCurrentUser`) — logged out → login screen; logged in → WP-style sidebar shell (Strani/Aktualno/Reference/Nastavitve/Dashboard + user + Odjava). `useSearchParams`/nav patterns static-export-safe (Suspense; `dynamic ssr:false` for heavy bits).
  - tests: **TB-1** · dep: A-1
- [x] **B-2 · Dashboard landing** — `done` (`page.tsx`→`Dashboard`: stat cards from `listDocs` + quick links; graceful no-env). Lead: typecheck 0.
  - files: `src/app/admin/page.tsx` (+ dashboard components under `src/app/admin/`)
  - do: counts/quick links via A-2 `listDocs`. Graceful empty/no-env state.
  - tests: **TB-2** · dep: A-2, B-1

## Phase C — Pages + Puck editor (Frontend)

- [x] **C-1 · Pages list** — `done` (`/admin/pages` → `PagesList`: table + New/Edit/Delete + slugify; offline-safe)
  - files: `src/app/admin/pages/page.tsx` (+ list components)
  - do: table of `page` docs (title/slug/updated/has-layout) with New / Edit (→ `/admin/pages/[slug]`) / Delete (A-2). Empty state + "Nova stran".
  - tests: **TC-1** · dep: A-2, B-1
- [x] **C-2 · Full-screen Puck editor (round-trip)** — `done` (`/admin/pages/edit?slug=` — static route + `?slug=` in Suspense, NOT a `[slug]` segment; loads existing `puckData`, saves, iframe disabled)
  - files: `src/app/admin/pages/[slug]/page.tsx` (+ editor components)
  - do: load existing `puckData` for slug → seed Puck canvas (round-trip); `<Puck iframe={{enabled:false}}>`; save → `savePuckData`; success/error + no-Sanity banners; back to list. Reuse `src/puck/puck.config.tsx` (read-only).
  - tests: **TC-2** · dep: A-2, C-1
- [x] **C-3 · Delete `/edit`** — `done` (`src/app/edit/` removed; nothing imports it; T-6 test repointed to the new editor by Lead). Lead: typecheck 0, tests 28/28.
  - files: `src/app/edit/**` (remove)
  - do: delete the old route (folded into C-2). Ensure nothing imports it.
  - tests: covered by **TA-3** (route gone) · dep: C-2

## Phase D — Other content types (Frontend) *(needs D2)*

- [x] **D-1 · Posts / Projects / Settings** — `done` (shared `DocListView`; lists for post/project + settings panel; "Uredi v Studiu" deep-links `/studio/structure/<type>;<id>`, new tab; offline-safe)
  - files: `src/app/admin/posts/**`, `src/app/admin/projects/**`, `src/app/admin/settings/**`
  - do: lists per A-2; field editing per **D2** (recommended: embed Studio for field edit / deep-link, else custom forms). Graceful empty/no-env.
  - tests: **TD-1** · dep: A-2, B-1, D2

## Phase E — Revisions (Backend + Frontend)

- [x] **E-1 · History helpers** — `done` (`listRevisions`/`getRevision`/`restoreRevision` via Sanity History API; session-authed; offline-safe; plan-dependent retention)
  - files: `src/lib/sanityAdmin.ts` (history section)
  - do: `listRevisions(docId)` (timestamps/authors via Sanity History API), `getRevision(docId, rev)`, `restoreRevision(docId, rev)` (re-write older `puckData`/doc). Session-authed; offline-safe.
  - tests: **TE-1** · dep: A-2
- [x] **E-2 · Revisions panel** — `done` (header "Revizije" drawer in the page editor: list + non-destructive Predogled + Obnovi (restore); canvas reseed via key-remount; empty/no-Sanity graceful). Lead: typecheck 0, tests 28/28.
  - files: `src/app/admin/pages/[slug]/` (revisions UI)
  - do: panel in the page editor — list revisions, preview, **restore**. Confirm-before-restore.
  - tests: **TE-2** · dep: C-2, E-1

## Phase F — Tests + Review

- [x] **TA-1..TE-2** — paired tests (auth gate, data layer offline, lists, editor, revisions). vitest. — `done` (+20 tests → **48/48 green**; T-6 repointed to admin editor; T-0/T-2 updated for D1)
- [x] **R-2 · Diff review (gate)** — `approved` *(no blocking issues; stale comments fixed by Lead; non-blocking follow-ups noted)* — awaiting user sign-off before L-2
  - check: **security** (auth gate present; Sanity API is the real lock; no token/secret in client bundle; admin exposure matches D1), **regressions** (public build green + fallback intact; `/edit` gone cleanly), **architecture** (no server actions/handlers; collision-free; offline-safe data layer). exit: `approved`. dep: all impl + `T*` green
- [ ] **L-2 · Final summary** — `todo` · dep: R-2 approved

---

## Dispatch order (on approval)
1. **A-1 ∥ A-2** (Backend, disjoint new files). A-3 after D1.
2. **B-1** (needs A-1) → **B-2** (needs A-2, B-1).
3. **C-1** (needs A-2, B-1) → **C-2** → **C-3** (delete `/edit`).
4. **D-1** after D2 confirmed.
5. **E-1** → **E-2**.
6. Test wave (batched, like before) → **R-2** gate → **L-2**.

## Progress log
- `2026-06-16` — Planner: admin task graph created. No admin source written. Blocked on D1 + D2; awaiting approval to dispatch.
- `2026-06-16` — **D1 = ship client-gated; D2 = embed Studio.** Graph unblocked. Dispatching Wave A (Backend A-1 auth + A-2 data layer).
- `2026-06-16` — **All waves done; R-2 approved.** A (auth+data) · B (shell+gate+sidebar+dashboard) · C (pages list + Puck editor round-trip + retire /edit) · D (posts/projects/settings + Studio deep-links) · E (history helpers + revisions panel) · A-3 (ship-gated export, strip script retired). Tests **48/48 green**. Lead verified full `pnpm build` exit 0 — `out/admin` + `out/studio` ship, `out/edit` absent, public pages + fallback intact. Stale `/edit`/strip-script comments fixed. **L-2 paused for user sign-off.**

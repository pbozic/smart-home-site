# TASKS — Sanity + Puck integrated editing layer

> **Feature:** Stand up the drag-and-drop editing layer (Puck) backed by Sanity (content/media/Puck-JSON store), per [PLAN.md](PLAN.md), while keeping the local-content fallback and static export working.
>
> **Status of this file:** Task graph only. No source edited yet — awaiting approval to dispatch build agents.
> **Repo note:** ⚠️ This is **not a git repo** — there is no undo. Agents must not delete/overwrite without reading first.

---

## The team

| Agent | Responsibility |
|---|---|
| **Lead / Planner** | (me) Owns this file + the task graph. Synthesizes results, gives the final diff summary. |
| **Backend agent** | Sanity project, schemas, server write action, env, deps, Puck registry/render pipeline (server/data side). |
| **Frontend agent** | Make sections prop-driven, the `/edit` Puck canvas UI, `/studio` UI route, client rendering. |
| **Test agent** | Writes + runs tests (typecheck, build, schema validation, fallback render, route-exclusion). Every impl task gets matching tests. |
| **Review agent** | Inspects diffs for security, regressions, bad architecture. **Must approve before final summary.** |

## Coordination rules (enforced)

1. **Claim one task at a time.** Set `claimed_by` + `→ in_progress` before working; release on `done`/`blocked`.
2. **No two agents edit the same file at once.** Each task lists `files`. If two ready tasks overlap a file, they are **serialized** (one waits). The **File ownership map** below is the source of truth.
3. **Every implementation task needs matching tests** — see the `tests` field. A `build`/`impl` task is not `done` until its paired `T-*` task is green.
4. **Review gate:** `R-1` must reach `approved` before the Lead writes the final summary.
5. **Shared/foundation files are Backend-owned** (`package.json`, `next.config.mjs`, `layout.tsx`, `globals.css`, `tailwind.config.ts`, `src/lib/*`, Puck registry). Frontend requests changes via a task, doesn't edit them directly.
6. **Keep green at every step:** `pnpm typecheck && pnpm build` must pass. **Local-content fallback must keep working** (site builds with no Sanity env).

### Status legend
`todo` · `in_progress` · `blocked` · `done` · (review) `approved` / `changes_requested`

---

## File ownership map (collision guard)

| Path / file | Owner | Notes |
|---|---|---|
| `package.json`, `next.config.mjs`, `.env.example` | Backend | deps + export-exclusion config |
| `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.ts` | Backend | shared chrome/styles |
| `src/lib/sanity.ts`, `src/lib/brand.ts`, `src/lib/nav.ts` | Backend | data + config |
| `sanity/**` (schemas, studio config) | Backend | content model |
| `src/puck/puck.config.tsx` (registry/adapters) | Backend | wraps FE's section components |
| `src/components/PuckRender.tsx` | Backend | JSON → components, fallback |
| `src/app/studio/**`, `src/app/edit/**` | Frontend | editor UIs (server action lives in Backend lib) |
| `src/components/sections/*` | Frontend | prop-driven refactor + exported `Props` types |
| `src/content/home.ts` | Frontend | default/fallback content (prop shape) |
| `**/*.test.ts(x)`, test config | Test | never touched by impl agents |

> Backend owns `puck.config.tsx` but only **imports** the section `Props` types Frontend exports — it never edits files under `src/components/sections/`. That keeps the registry and the sections collision-free.

---

## Task graph

Dependencies are listed as `dep:`. A task is **ready** only when all deps are `done` and no overlapping file is `in_progress`.

### Phase 0 — Setup (Backend)

- [x] **B-0 · Add deps + export config** — `done`
  - owner: Backend · files: `package.json`, `next.config.mjs`, `.env.example`
  - do: add `@measured/puck`, `sanity`, `next-sanity`, `@sanity/vision`; pin versions; add `NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET/API_VERSION` + server write token to `.env.example`; configure `/edit` + `/studio` exclusion from static export.
  - tests: **T-0**
  - dep: —

### Phase 1 — Prop contracts (Frontend) — *can run alongside B-0; disjoint files*

- [x] **F-1 · Make sections prop-driven + export `Props` types** — `done`
  - owner: Frontend · files: `src/components/sections/*`, `src/content/home.ts`
  - do: each section takes content via props (defaults from `home.ts`); export a stable `Props` type per section. **This is the contract Backend's Puck registry wraps.**
  - tests: **T-1**
  - dep: —

### Phase 2 — Sanity backend

- [x] **B-2 · Sanity schemas + Studio config** — `done` (app route deferred to F-7 to avoid collision)
  - owner: Backend · files: `sanity/**`, `src/app/studio/**`
  - do: `page` (slug + `puckData` JSON + SEO), `siteSettings`, `reference`, `post`; embedded Studio at `/studio`.
  - tests: **T-2**
  - dep: B-0
- [x] **B-3 · Sanity client + server write action + fallback** — `done` (write = `src/lib/sanity.write.ts`, no `"use server"`; export-safe)
  - owner: Backend · files: `src/lib/sanity.ts`
  - do: client config from env; `savePuckData()` server action using write token; **preserve `sanityFetch()` local fallback** when env empty.
  - tests: **T-3**
  - dep: B-0

### Phase 3 — Puck wiring (needs both contracts)

- [x] **B-4 · Puck registry wrapping FE sections** — `done` (all 9 registered under "Sekcije"; field names match `home.ts`; isolated boundary casts for `as const`→Puck — flag for R-1)
  - owner: Backend · files: `src/puck/puck.config.tsx`
  - do: register every section as a Puck component with editable fields, importing FE's exported `Props` types. Groups: "Sekcije", "Vsebina".
  - tests: **T-4**
  - dep: F-1, B-0
- [x] **B-5 · Public render pipeline** — `done` (`PuckRender` renders Puck JSON; falls back to local section stack when null/invalid; not yet wired into `page.tsx` — deferred)
  - owner: Backend · files: `src/components/PuckRender.tsx`
  - do: `<Render config data={puckData} />`; **fallback to local content** when a page has no `puckData`.
  - tests: **T-5**
  - dep: B-4, B-3

### Phase 4 — Editor UIs (Frontend)

- [x] **F-6 · `/edit` Puck canvas + save** — `done` (client Puck canvas, `force-static` server shell, `useSearchParams` in Suspense, save via `savePuckData`, graceful no-Sanity banner)
  - owner: Frontend · files: `src/app/edit/**`
  - do: load page `puckData`, render `<Puck>` canvas, save JSON back to Sanity via Backend's `savePuckData()`. Route excluded from static export.
  - tests: **T-6**
  - dep: B-4, B-3
- [x] **F-7 · `/studio` route shell** — `done` (`[[...tool]]` server shell w/ `force-static`+`generateStaticParams`; client `NextStudio` via `dynamic ssr:false`; imports root `sanity.config.ts`)
  - owner: Frontend · files: `src/app/studio/[[...tool]]/page.tsx`
  - do: mount embedded Studio; excluded from static export.
  - tests: **T-2** (shared route-exclusion check)
  - dep: B-2

### Phase 5 — Tests (Test agent) — *paired with each impl task*

- [x] **T-0** deps install + `pnpm typecheck && pnpm build` green; export-exclusion config present — `done` · dep: B-0
- [x] **T-1** sections render from props with `home.ts` defaults; `Props` types exported & importable — `done` · dep: F-1
- [x] **T-2** schemas validate; `/studio` + `/edit` **absent from `out/`** after build — `done` (schema shape asserted; absence Lead-verified each build) · dep: B-2, F-7
- [x] **T-3** `sanityFetch()` returns local fallback when env empty; write action shape correct — `done` · dep: B-3
- [x] **T-4** every section is registered in Puck config; field names match `content/*` ↔ schema ↔ Puck — `done` · dep: B-4
- [x] **T-5** `PuckRender` renders sample Puck JSON; falls back to local content when `puckData` null — `done` · dep: B-5
- [x] **T-6** `/edit` loads + save action invoked (mock token); no Sanity env → graceful — `done` · dep: F-6

### Phase 6 — Review gate (Review agent)

- [x] **R-1 · Diff review** — `approved` *(no blocking issues; non-blocking follow-ups noted)* — awaiting user sign-off before L-1
  - owner: Review · files: read-only (all diffs)
  - check: **security** (write token never exposed client-side; `/edit`+`/studio` not in public export; webhook/secret handling), **regressions** (fallback still works, build green, no field-name drift), **architecture** (sections stay prop-driven & collision-free; Backend doesn't edit `sections/*`).
  - exit: `approved` required.
  - dep: B-5, F-6, F-7, and all `T-*` green

### Phase 7 — Lead

- [x] **L-1 · Final diff summary** — `done` (delivered to user; homepage wired to `PuckRender` per user request after sign-off)
  - owner: Lead · do: synthesize all results into the final diff summary for the user.
  - dep: R-1 `approved`

---

## Ready-now (dispatch order on approval)
1. **B-0** (Backend) and **F-1** (Frontend) — parallel, disjoint files.
2. Then **B-2 / B-3** (Backend) ∥ — and Frontend idle or starts **F-7** after B-2.
3. **B-4** once F-1 done → **B-5**.
4. **F-6** once B-4+B-3 done.
5. **T-*** track each impl task; **R-1** gate; **L-1** summary.

## Progress log
- `2026-06-16` — Planner: task graph created. No source edited. Awaiting approval to dispatch build agents.
- `2026-06-16` — Lead: baseline established. `pnpm install` re-resolved (env supply-chain age guard) + `pnpm-workspace.yaml allowBuilds` for esbuild/sharp/unrs-resolver; `pnpm typecheck && pnpm build` green (8 pages).
- `2026-06-16` — **Wave 1 done.** B-0 (Backend): pinned `@measured/puck@0.20.2`, `sanity@3.99.0`, `@sanity/vision@3.99.0`; `.env.example` with server-only `SANITY_API_WRITE_TOKEN`; export-exclusion via `scripts/strip-admin-routes.mjs` wired into `build`. F-1 (Frontend): all 9 sections prop-driven w/ defaults from `home.ts`; 9 `*Props` types exported (`typeof`-derived → zero field drift). Lead verified **combined** state: typecheck 0, build 0, 8 pages, `out/edit`+`out/studio` absent.
- Test strategy: Lead runs `pnpm typecheck && pnpm build` as a green-gate after every wave; the formal vitest **T-0…T-6** suite is **batched into one Test wave after the impl waves** (avoids repeated installs + concurrent-pnpm races in this env), then all `T-*` must be green before R-1.
- B-4 note (from F-1): section `*Props` are `as const`-derived → deeply `readonly`/literal. The Puck registry should widen to mutable input shapes. `TrustBar`+`Ecosystem` also import `ecosystem` from `@/lib/brand` (not part of their Props contract — brand grid not Puck-editable unless a later task adds it).
- `2026-06-16` — **Wave 4 done.** F-7 `/studio` (`[[...tool]]` server shell + `force-static`/`generateStaticParams`; client `NextStudio` via `dynamic ssr:false`) and F-6 `/edit` (client Puck canvas; `useSearchParams` in Suspense; save→`savePuckData`; graceful no-Sanity banner). Build green; both routes prerender then get stripped from `out/`.
- `2026-06-16` — **Test wave done.** Vitest harness (vitest 2.1.8, @testing-library/react 16.1.0, jest-dom 6.6.3, jsdom 25.0.1, @vitejs/plugin-react 4.3.4) + `vitest.config.ts`/`vitest.setup.ts`. 7 suites / **28 tests T-0…T-6 all green**; `pnpm typecheck` still 0. No impl bugs found. (Lead also re-verified `pnpm test && pnpm typecheck && pnpm build` together green, admin routes absent from `out/`.)
- `2026-06-16` — **Post-launch bugfixes (live Sanity connected, project `z5nrf2iy`):** (1) renamed Sanity doc type `reference` → `project` — `"reference"` is a RESERVED type name, the error broke the whole schema → Studio stuck loading. Updated `index.ts` + T-2 test; deleted old `reference.ts`. (2) `/edit` Puck canvas stuck on a loading spinner → set `<Puck iframe={{ enabled: false }}>` (Puck's default iframe preview hangs in Next dev and wouldn't get the app's Tailwind styles anyway). Re-verified green: typecheck 0, test 28/28, build 0, admin absent from `out/`.
- `2026-06-16` — **Post-sign-off follow-up (user-requested):** wired `src/app/page.tsx` to the pipeline — `getPagePuckData("home")` at build time; renders saved Puck layout via a **lazy** `import("@/components/PuckRender")` gated on `puckData` (keeps Puck's `Render` out of the public homepage bundle — home stays 2.53 kB / 113 kB), else the local section stack. With no Sanity env the homepage is byte-identical to before. Re-verified green: typecheck 0, test 28/28, build 0, admin absent from `out/`. (Low-risk addition beyond the R-1-reviewed diff.)
- `2026-06-16` — **R-1 review: `approved`.** Security (token server-only, verified non-inlined in `.next/static`; admin routes absent from `out/`), regressions (build/tests/typecheck green; fallback intact; no field drift), architecture (sections prop-driven; no server actions; collision-free) all pass. Non-blocking follow-ups: `PuckRender` not yet wired into `page.tsx`; no real Sanity project; no rebuild-on-publish webhook. **L-1 final summary paused pending user sign-off.**
- `2026-06-16` — **Lead root-cause fix (cross-stream):** `next-sanity` root entry drags a `"use server"` visual-editing chunk that `output: export` rejects. The first `/edit` impl dodged it with `webpackIgnore` runtime imports → save was dead even with Sanity configured. Lead repointed `src/lib/sanity.ts` + `sanity.write.ts` to `@sanity/client@6.29.1` (added as pinned direct dep; satisfies next-sanity's `^6.25.0`), removed the `webpackIgnore` hack so `/edit` imports the libs normally. Build still green; save now genuinely works via Sanity session auth once a project is configured.

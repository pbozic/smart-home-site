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

- [ ] **B-0 · Add deps + export config** — `todo`
  - owner: Backend · files: `package.json`, `next.config.mjs`, `.env.example`
  - do: add `@measured/puck`, `sanity`, `next-sanity`, `@sanity/vision`; pin versions; add `NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET/API_VERSION` + server write token to `.env.example`; configure `/edit` + `/studio` exclusion from static export.
  - tests: **T-0**
  - dep: —

### Phase 1 — Prop contracts (Frontend) — *can run alongside B-0; disjoint files*

- [ ] **F-1 · Make sections prop-driven + export `Props` types** — `todo`
  - owner: Frontend · files: `src/components/sections/*`, `src/content/home.ts`
  - do: each section takes content via props (defaults from `home.ts`); export a stable `Props` type per section. **This is the contract Backend's Puck registry wraps.**
  - tests: **T-1**
  - dep: —

### Phase 2 — Sanity backend

- [ ] **B-2 · Sanity schemas + Studio route** — `todo`
  - owner: Backend · files: `sanity/**`, `src/app/studio/**`
  - do: `page` (slug + `puckData` JSON + SEO), `siteSettings`, `reference`, `post`; embedded Studio at `/studio`.
  - tests: **T-2**
  - dep: B-0
- [ ] **B-3 · Sanity client + server write action + fallback** — `todo`
  - owner: Backend · files: `src/lib/sanity.ts`
  - do: client config from env; `savePuckData()` server action using write token; **preserve `sanityFetch()` local fallback** when env empty.
  - tests: **T-3**
  - dep: B-0

### Phase 3 — Puck wiring (needs both contracts)

- [ ] **B-4 · Puck registry wrapping FE sections** — `todo`
  - owner: Backend · files: `src/puck/puck.config.tsx`
  - do: register every section as a Puck component with editable fields, importing FE's exported `Props` types. Groups: "Sekcije", "Vsebina".
  - tests: **T-4**
  - dep: F-1, B-0
- [ ] **B-5 · Public render pipeline** — `todo`
  - owner: Backend · files: `src/components/PuckRender.tsx`
  - do: `<Render config data={puckData} />`; **fallback to local content** when a page has no `puckData`.
  - tests: **T-5**
  - dep: B-4, B-3

### Phase 4 — Editor UIs (Frontend)

- [ ] **F-6 · `/edit` Puck canvas + save** — `todo`
  - owner: Frontend · files: `src/app/edit/**`
  - do: load page `puckData`, render `<Puck>` canvas, save JSON back to Sanity via Backend's `savePuckData()`. Route excluded from static export.
  - tests: **T-6**
  - dep: B-4, B-3
- [ ] **F-7 · `/studio` route shell** — `todo`
  - owner: Frontend · files: `src/app/studio/[[...tool]]/page.tsx`
  - do: mount embedded Studio; excluded from static export.
  - tests: **T-2** (shared route-exclusion check)
  - dep: B-2

### Phase 5 — Tests (Test agent) — *paired with each impl task*

- [ ] **T-0** deps install + `pnpm typecheck && pnpm build` green; export-exclusion config present — `todo` · dep: B-0
- [ ] **T-1** sections render from props with `home.ts` defaults; `Props` types exported & importable — `todo` · dep: F-1
- [ ] **T-2** schemas validate; `/studio` + `/edit` **absent from `out/`** after build — `todo` · dep: B-2, F-7
- [ ] **T-3** `sanityFetch()` returns local fallback when env empty; write action shape correct — `todo` · dep: B-3
- [ ] **T-4** every section is registered in Puck config; field names match `content/*` ↔ schema ↔ Puck — `todo` · dep: B-4
- [ ] **T-5** `PuckRender` renders sample Puck JSON; falls back to local content when `puckData` null — `todo` · dep: B-5
- [ ] **T-6** `/edit` loads + save action invoked (mock token); no Sanity env → graceful — `todo` · dep: F-6

### Phase 6 — Review gate (Review agent)

- [ ] **R-1 · Diff review** — `todo` *(blocks final summary)*
  - owner: Review · files: read-only (all diffs)
  - check: **security** (write token never exposed client-side; `/edit`+`/studio` not in public export; webhook/secret handling), **regressions** (fallback still works, build green, no field-name drift), **architecture** (sections stay prop-driven & collision-free; Backend doesn't edit `sections/*`).
  - exit: `approved` required.
  - dep: B-5, F-6, F-7, and all `T-*` green

### Phase 7 — Lead

- [ ] **L-1 · Final diff summary** — `todo`
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

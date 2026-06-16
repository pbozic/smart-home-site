# TEAM_PLAN — Agent team to ship the Sanity + Puck editing layer

> **What this is:** the operating playbook for an agent team that implements the Sanity + Puck
> editing layer **safely**. The detailed design lives in [PLAN.md](PLAN.md); the live task graph
> + checkboxes live in [TASKS.md](TASKS.md); context/handoff in [MEMORY.md](MEMORY.md).
>
> **Status:** Team **not yet started.** This doc + `TASKS.md` are the only things written so far —
> no source files touched. Start it later by following "How to start" below.

---

## Goal

Implement the editing layer **safely**: drag-and-drop layout via **Puck**, content/media/Puck-JSON
stored in **Sanity**, while **keeping the local-content fallback and static export working** at every step.

## Operating model (chosen)

- **Lean team.** The Lead agent (whoever runs this) also acts as **Planner**: owns `TASKS.md`,
  dispatches build agents, synthesizes the final diff summary.
- **Build agents dispatched on demand:** Backend, Frontend, Test, Review.
- **No source is edited until you explicitly approve the build** (this repo is **not** under git — no undo).

## The team & roles

| Role | Who | Owns | Does not touch |
|---|---|---|---|
| **Lead / Planner** | the driving agent (you) | `TASKS.md`, dispatch, final summary | — |
| **Backend** | spawned agent | deps, env, `next.config.mjs`, `src/lib/*`, `sanity/**`, `src/puck/puck.config.tsx`, `PuckRender.tsx`, shared chrome | `src/components/sections/*` |
| **Frontend** | spawned agent | `src/components/sections/*`, `src/content/home.ts`, `src/app/edit/**`, `src/app/studio/**` | shared/foundation files (request via task) |
| **Test** | spawned agent | `**/*.test.*`, test config; runs `pnpm typecheck && pnpm build` | impl source |
| **Review** | spawned agent | read-only diff review; **approval gate** | everything (read-only) |

## The rules (non-negotiable)

1. Start from the shared task list in `TASKS.md`.
2. **One task claimed at a time** per agent (`claimed_by` + flip to `in_progress`).
3. **No two agents edit the same file simultaneously** — enforced by the File ownership map + per-task `files`. Overlapping tasks are serialized.
4. **Every implementation task has matching tests** (the paired `T-*`). Impl isn't `done` until its test is green.
5. **Review must approve (`R-1 → approved`) before the final summary.**
6. **Lead synthesizes** results → final diff summary to the user.
7. Stay green: `pnpm typecheck && pnpm build`; **fallback must keep working** (site builds with no Sanity env).

## Safety preconditions (do these first, later)

- [ ] **Recommended:** `git init && git add -A && git commit -m "snapshot before editing layer"` so there's a rollback point. (Repo is currently not git — agents have no undo without this.)
- [ ] Confirm `pnpm install` / `pnpm typecheck && pnpm build` are green on a clean tree (baseline).
- [ ] Decide Sanity project: real project id + dataset, or keep env empty and rely on the local fallback during dev (tests cover the empty-env path either way).

---

## How to start (later) — copy/paste plan

When you're ready to build, tell the Lead agent:

> "Dispatch the team in TEAM_PLAN.md. Work the TASKS.md graph; keep it updated; stop at the R-1 review gate for my sign-off before the final summary."

The Lead then runs this sequence (it spawns one agent per `Agent` call, with these briefs):

### Wave 1 — parallel, disjoint files
- **Backend → B-0:** add `@measured/puck`, `sanity`, `next-sanity`, `@sanity/vision` (pinned); add Sanity env + write token to `.env.example`; exclude `/edit` + `/studio` from static export. Keep build green.
- **Frontend → F-1:** make `src/components/sections/*` prop-driven (defaults from `home.ts`); export a `Props` type per section. **Do not edit shared files.**
- **Test → T-0, T-1:** verify build green + export config; sections render from props; `Props` exported.

### Wave 2 — Sanity backend (after B-0)
- **Backend → B-2:** schemas (`page` w/ `puckData`, `siteSettings`, `reference`, `post`) + Studio at `/studio`.
- **Backend → B-3:** Sanity client + `savePuckData()` server write action; **preserve `sanityFetch()` fallback**.
- **Frontend → F-7:** `/studio` route shell (after B-2).
- **Test → T-2, T-3.**

### Wave 3 — Puck wiring (after F-1 + B-0)
- **Backend → B-4:** Puck registry wrapping FE sections (imports FE `Props` types). **Never edits `sections/*`.**
- **Backend → B-5:** `PuckRender.tsx` (JSON → components; fallback to local content). (after B-4 + B-3)
- **Test → T-4, T-5.**

### Wave 4 — editor UI (after B-4 + B-3)
- **Frontend → F-6:** `/edit` Puck canvas + save via `savePuckData()`; excluded from export.
- **Test → T-6.**

### Wave 5 — gate + summary
- **Review → R-1:** security / regressions / architecture. Must return `approved`.
- **Lead → L-1:** final diff summary to the user.

## Collision protocol (what the Lead enforces)
- Before dispatching a task, check `TASKS.md`: all `dep:` are `done`, and **no `in_progress` task shares a file** with it. If they overlap, wait/serialize.
- Backend and Frontend never hold a `sections/*` lock at the same time: only Frontend writes there (F-1); Backend only imports the resulting types.
- After each agent returns: Lead updates `TASKS.md` (check the box, set status, append to the progress log), then dispatches the next ready task.

## Watch-outs (from MEMORY.md)
- Keep **field names identical** across `content/*` ↔ Sanity schema ↔ Puck config.
- `/edit` + `/studio` are **dynamic** — they must be excluded from the public static export; verify they're **absent from `out/`** after build (T-2).
- The Sanity write **token is server-only** — never ship it to the client (Review checks this).
- Sanity visual-editing peer-dep warning on install is harmless.

## Definition of done (whole feature)
- Studio loads at `/studio`; `/edit?page=home` drags/reorders sections and saves to Sanity.
- A static build renders the saved layout; with **no Sanity configured, the site still builds** from local content.
- `/edit` + `/studio` **not** in `out/`. All `T-*` green. **R-1 approved.** Lead delivered the final diff summary.

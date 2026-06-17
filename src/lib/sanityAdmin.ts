/**
 * Admin data layer for the custom WP-style admin (A-2).
 *
 * FOR THE FRONTEND: these helpers power the admin UI —
 *   - `/admin` dashboard counts & quick links  → `listDocs(type)`
 *   - `/admin/pages` list (title/slug/updated/has-layout) → `listDocs("page")`
 *   - page editor load → `getPage(slug)` + re-exported `getPagePuckData`
 *   - page editor save → re-exported `savePuckData`
 *   - "Nova stran" / delete → `createPage(slug, title)` / `deleteDoc(id)`
 *
 * ARCHITECTURE / SECURITY:
 * - Static export (`output: "export"`): no Server Actions / Route Handlers /
 *   `"use server"` / `next/headers`. Everything here is browser-callable code.
 * - Reads AND writes use the shared SESSION client (`withCredentials: true`,
 *   `useCdn: false`) from `./sanity`, so they run with the logged-in editor's
 *   Sanity session cookie — no token/secret in the client bundle. Sanity's API
 *   enforces auth/permissions server-side (the real boundary); an
 *   unauthenticated browser simply gets empty reads / failed writes.
 * - OFFLINE-SAFE: with no Sanity env (`sanityConfigured === false`) every
 *   function returns a graceful empty/`null`/`{ ok: false }` and NEVER throws,
 *   so the public static build keeps working with local fallback content.
 *
 * DRAFTS: `listDocs` excludes draft documents via `!(_id in path("drafts.**"))`
 * so the lists show one row per published document (no `drafts.` duplicates).
 * Editing/publishing nuances live in the editor + revisions layers (E-1/E-2).
 */
import { sessionClient, sanityConfigured, dataset } from "./sanity";

// Re-export the canonical Puck read/write helpers so the admin imports them
// from one place. These are NOT duplicated here.
export { getPagePuckData } from "./sanity";
export { savePuckData } from "./sanity.write";

/** A document row as the admin lists need it. */
export type AdminDoc = {
  _id: string;
  type: string;
  title: string;
  slug: string | null;
  updatedAt: string;
  hasLayout: boolean;
};

/** Content types the admin can list. */
export type AdminDocType = "page" | "post" | "project" | "siteSettings";

/**
 * List published documents of a given type for the admin lists, newest first.
 *
 * Excludes drafts (`!(_id in path("drafts.**"))`) so each published doc appears
 * once. `title` falls back through `title → name → slug → _id`; `hasLayout`
 * reflects whether a Puck layout (`puckData`) is stored.
 * Returns `[]` on error or when Sanity isn't configured.
 */
export async function listDocs(type: AdminDocType): Promise<AdminDoc[]> {
  if (!sanityConfigured) return [];
  try {
    const docs = await sessionClient.fetch<AdminDoc[]>(
      `*[_type == $type && !(_id in path("drafts.**"))] | order(_updatedAt desc){
        _id,
        "type": _type,
        "title": coalesce(title, name, slug.current, _id),
        "slug": slug.current,
        "updatedAt": _updatedAt,
        "hasLayout": defined(puckData)
      }`,
      { type },
    );
    return Array.isArray(docs) ? docs : [];
  } catch (err) {
    console.warn("[sanityAdmin] listDocs failed:", err);
    return [];
  }
}

/** A page document loaded for editing. */
export type AdminPage = {
  _id: string;
  title: string;
  slug: string;
  puckData: string | null;
};

/**
 * Load a single published `page` document by slug (id/title/slug + raw
 * `puckData` JSON). Returns `null` when the page doesn't exist, on error, or
 * when Sanity isn't configured.
 */
export async function getPage(slug: string): Promise<AdminPage | null> {
  if (!sanityConfigured) return null;
  try {
    const page = await sessionClient.fetch<AdminPage | null>(
      `*[_type == "page" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
        _id,
        "title": coalesce(title, slug.current, _id),
        "slug": slug.current,
        puckData
      }`,
      { slug },
    );
    return page ?? null;
  } catch (err) {
    console.warn("[sanityAdmin] getPage failed:", err);
    return null;
  }
}

/**
 * Create a new `page` document with the given slug and title (session-authed).
 * Returns `{ ok, id }` on success or `{ ok: false, error }` on failure / no env.
 */
export async function createPage(
  slug: string,
  title: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!sanityConfigured) {
    return { ok: false, error: "Sanity not configured" };
  }
  try {
    const created = await sessionClient.create({
      _type: "page",
      title,
      slug: { _type: "slug", current: slug },
    });
    return { ok: true, id: created._id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[sanityAdmin] createPage failed:", message);
    return { ok: false, error: message };
  }
}

/**
 * Delete a document by id (session-authed). Returns `{ ok }` on success or
 * `{ ok: false, error }` on failure / no env.
 */
export async function deleteDoc(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!sanityConfigured) {
    return { ok: false, error: "Sanity not configured" };
  }
  try {
    await sessionClient.delete(id);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[sanityAdmin] deleteDoc failed:", message);
    return { ok: false, error: message };
  }
}

/* -------------------------------------------------------------------------- */
/* Revision history (E-1)                                                      */
/* -------------------------------------------------------------------------- */
/**
 * Revision-history helpers backed by Sanity's HTTP **History API**.
 *
 * - Use the same SESSION client (`withCredentials: true`, `useCdn: false`) as
 *   the rest of this module, so calls run with the logged-in editor's Sanity
 *   session — no token/secret in the bundle. Sanity's API enforces that the
 *   caller has read access to the document's history (the real auth boundary).
 * - We hit the raw History endpoints via `sessionClient.request()` because the
 *   typed query API doesn't cover `/data/history/...`. The `uri` is relative to
 *   the project API host (`https://<projectId>.api.sanity.io/v<apiVersion>`),
 *   so the standard `/data/history/<dataset>/...` data path resolves correctly.
 * - OFFLINE-SAFE: with no Sanity env (`!sanityConfigured`) or on any
 *   error/unavailable history, list helpers return `[]`, single-doc reads
 *   return `null`, and writes return `{ ok: false, error }`. They NEVER throw,
 *   so the public static build is unaffected.
 * - PLAN-DEPENDENT RETENTION: how far back transactions are kept depends on the
 *   Sanity plan (the free tier retains only limited history), so an EMPTY
 *   revision list is normal/expected — not an error.
 */

/** A single edit transaction in a document's history (newest-first in lists). */
export type Revision = { rev: string; timestamp: string; author?: string };

/** Shape of one NDJSON transaction line from the History transactions endpoint. */
type HistoryTransaction = {
  id?: string;
  timestamp?: string;
  author?: string;
};

/**
 * List a document's edit transactions via the Sanity **History API**, newest
 * first.
 *
 * Endpoint: `GET /data/history/<dataset>/transactions/<docId>` with
 * `excludeContent=true` (currently required by the API — we only need metadata),
 * `reverse=true` (newest-first), and `limit=100`. The response is NDJSON: one
 * JSON transaction per line, each with `id`, `timestamp`, and `author`. We map
 * those to `{ rev: id, timestamp, author }`.
 *
 * Returns `[]` on error, empty history, or when Sanity isn't configured. NOTE:
 * history retention is plan-dependent (the free tier keeps limited history), so
 * an empty list here is normal/expected rather than a failure.
 */
export async function listRevisions(docId: string): Promise<Revision[]> {
  if (!sanityConfigured) return [];
  try {
    // `json: false` → raw NDJSON body (string); the default JSON middleware
    // would choke on newline-delimited JSON, so we parse it line-by-line.
    const raw = await sessionClient.request<string>({
      uri: `/data/history/${dataset}/transactions/${encodeURIComponent(docId)}`,
      query: { excludeContent: "true", reverse: "true", limit: "100" },
      json: false,
      withCredentials: true,
    });
    const body = typeof raw === "string" ? raw : "";
    const revisions: Revision[] = [];
    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let tx: HistoryTransaction;
      try {
        tx = JSON.parse(trimmed) as HistoryTransaction;
      } catch {
        continue;
      }
      if (!tx.id || !tx.timestamp) continue;
      revisions.push({
        rev: tx.id,
        timestamp: tx.timestamp,
        ...(tx.author ? { author: tx.author } : {}),
      });
    }
    return revisions;
  } catch (err) {
    console.warn("[sanityAdmin] listRevisions failed:", err);
    return [];
  }
}

/**
 * Fetch a document **as of** a specific revision via the History API.
 *
 * Endpoint: `GET /data/history/<dataset>/documents/<docId>?revision=<rev>`. The
 * response is a JSON object with a `documents` array; we return the first
 * snapshot (id/`_rev`/`_type`/timestamps + custom fields) as a plain object.
 *
 * Returns `null` on error, when the snapshot is missing, or when Sanity isn't
 * configured.
 */
export async function getRevision(
  docId: string,
  rev: string,
): Promise<Record<string, unknown> | null> {
  if (!sanityConfigured) return null;
  try {
    const res = await sessionClient.request<{
      documents?: Record<string, unknown>[];
    }>({
      uri: `/data/history/${dataset}/documents/${encodeURIComponent(docId)}`,
      query: { revision: rev },
      withCredentials: true,
    });
    const doc = res?.documents?.[0];
    return doc ?? null;
  } catch (err) {
    console.warn("[sanityAdmin] getRevision failed:", err);
    return null;
  }
}

/**
 * Restore a document to an earlier revision: read the snapshot via
 * `getRevision`, then write it back as the current document with
 * `createOrReplace`.
 *
 * Reconstruction: we keep the document's own content fields but strip
 * Sanity-managed system fields (`_rev`, `_createdAt`, `_updatedAt`) — those are
 * assigned by the API on write; a stale `_rev` would otherwise be rejected as a
 * conflict. We force `_id` to the live `docId` and preserve `_type` so the
 * replace targets the right document/schema.
 *
 * Guards `!sanityConfigured` → `{ ok: false, error: "Sanity not configured" }`;
 * a missing snapshot → `{ ok: false, error }`; catches any write error →
 * `{ ok: false, error }`. Offline-safe; never throws.
 */
export async function restoreRevision(
  docId: string,
  rev: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!sanityConfigured) {
    return { ok: false, error: "Sanity not configured" };
  }
  try {
    const snapshot = await getRevision(docId, rev);
    if (!snapshot) {
      return { ok: false, error: "Revision not found" };
    }
    // Drop API-managed system fields so the replace is accepted, then pin the
    // identity (`_id`) to the live document and keep its `_type`.
    const {
      _rev: _droppedRev,
      _createdAt: _droppedCreatedAt,
      _updatedAt: _droppedUpdatedAt,
      ...content
    } = snapshot;
    void _droppedRev;
    void _droppedCreatedAt;
    void _droppedUpdatedAt;
    if (typeof content._type !== "string") {
      return { ok: false, error: "Revision missing _type" };
    }
    await sessionClient.createOrReplace({
      ...(content as { _type: string }),
      _id: docId,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[sanityAdmin] restoreRevision failed:", message);
    return { ok: false, error: message };
  }
}

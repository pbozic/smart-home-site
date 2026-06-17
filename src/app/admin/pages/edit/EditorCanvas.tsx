"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { config } from "@/puck/puck.config";
import { sanityConfigured } from "@/lib/sanity";
import { getPage, getPagePuckData, savePuckData } from "@/lib/sanityAdmin";
import { RevisionsPanel } from "./RevisionsPanel";

/**
 * Full-screen Puck page editor (C-2) — the browser-only canvas.
 *
 * ROUND-TRIP: on mount / slug change it loads the page's stored `puckData` via
 * `getPagePuckData(slug)` and seeds the Puck canvas with the parsed document
 * (or an empty `{ content: [], root: {} }` for a fresh page). Saving serializes
 * the current canvas back with `savePuckData(slug, JSON.stringify(data))`.
 *
 * STATIC-EXPORT SAFE: `useSearchParams()` (the `?slug=` reader) is rendered
 * inside a `<Suspense>` boundary — required under `output: "export"`. The whole
 * canvas is loaded client-only by `./PageEditor` via
 * `next/dynamic({ ssr: false })`. The Sanity libs import `@sanity/client`
 * (not the `next-sanity` root), so no `"use server"` chunk is pulled in.
 */

/** Empty Puck document — a brand-new page starts blank. */
const emptyData: Data = { content: [], root: {} };

/** Parse a stored `puckData` JSON string into Puck `Data`, empty on bad input. */
function parsePuckData(raw: string | null): Data {
  if (!raw) return emptyData;
  try {
    return JSON.parse(raw) as Data;
  } catch {
    // Corrupt/legacy JSON → fall back to an empty canvas rather than crash.
    return emptyData;
  }
}

type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "ok" }
  | { status: "error"; message: string };

/** Load state for the round-trip fetch of the page's stored layout. */
type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: Data };

/**
 * Inner editor. Reads the target slug from the query string (`?slug=home`,
 * default `"home"`), loads its stored layout, and renders the Puck canvas seeded
 * with that data. Must be rendered inside a `<Suspense>` (see `EditorCanvas`).
 */
function EditorInner() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "home";

  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [save, setSave] = useState<SaveState>({ status: "idle" });

  // The live document id for this slug (revisions are keyed by doc id, not
  // slug). `null` once resolved means the page doesn't exist yet → the Revizije
  // button is disabled. `undefined` = still resolving.
  const [docId, setDocId] = useState<string | null | undefined>(undefined);

  // Revisions panel open/closed.
  const [panelOpen, setPanelOpen] = useState(false);

  // Non-destructive revision preview: when set, the canvas is seeded with this
  // historical layout instead of the live one. The user can return to current.
  const [preview, setPreview] = useState<Data | null>(null);

  // Bumped on every reseed (round-trip load, preview, return-to-current,
  // post-restore reload) to force Puck to remount with fresh `data` — Puck
  // seeds its internal state from `data` only on mount.
  const [seedKey, setSeedKey] = useState(0);

  // Round-trip load: fetch the stored puckData + doc id for this slug and seed
  // the canvas. Reusable so a post-restore reload re-runs the exact same path.
  const loadPage = useCallback(() => {
    let cancelled = false;
    setLoad({ status: "loading" });
    setSave({ status: "idle" });
    setPreview(null);

    // Resolve the document id for the revisions panel (independent of the
    // puckData round-trip; either may resolve first).
    getPage(slug)
      .then((page) => {
        if (!cancelled) setDocId(page?._id ?? null);
      })
      .catch(() => {
        if (!cancelled) setDocId(null);
      });

    getPagePuckData(slug)
      .then((raw) => {
        if (cancelled) return;
        setLoad({ status: "ready", data: parsePuckData(raw) });
        setSeedKey((k) => k + 1);
      })
      .catch(() => {
        // getPagePuckData never throws, but stay defensive.
        if (cancelled) return;
        setLoad({ status: "ready", data: emptyData });
        setSeedKey((k) => k + 1);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => loadPage(), [loadPage]);

  /** Seed the canvas with a previewed revision's layout (non-destructive). */
  const handlePreview = useCallback((puckData: string) => {
    setPreview(parsePuckData(puckData));
    setSeedKey((k) => k + 1);
  }, []);

  /** Leave preview mode and reseed with the live (already-loaded) layout. */
  const exitPreview = useCallback(() => {
    setPreview(null);
    setSeedKey((k) => k + 1);
  }, []);

  /** After a successful restore: close the panel and re-run the round-trip. */
  const handleRestored = useCallback(() => {
    setPanelOpen(false);
    loadPage();
  }, [loadPage]);

  async function handlePublish(data: Data) {
    setSave({ status: "saving" });
    try {
      const res = await savePuckData(slug, JSON.stringify(data));
      if (res.ok) {
        setSave({ status: "ok" });
      } else {
        setSave({
          status: "error",
          message: res.error ?? "Shranjevanje ni uspelo.",
        });
      }
    } catch (err) {
      setSave({
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <div className="flex h-full min-h-screen flex-col">
      {/* Header: which page + back link + revisions toggle. */}
      <header className="flex items-center justify-between gap-4 border-b border-mist-200 bg-white px-5 py-3">
        <div className="min-w-0">
          <a
            href="/admin/pages"
            className="text-xs font-medium text-brand-600 hover:text-brand-500"
          >
            ← Strani
          </a>
          <h1 className="truncate text-sm font-semibold text-ink-900">
            Urejanje strani{" "}
            <code className="rounded bg-mist-100 px-1.5 py-0.5 text-xs text-ink-700">
              {slug}
            </code>
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setPanelOpen((open) => !open)}
          disabled={!docId}
          aria-pressed={panelOpen}
          title={
            docId
              ? "Prikaži revizije strani"
              : "Stran še ni shranjena"
          }
          className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            panelOpen
              ? "border-brand-300 bg-brand-50 text-brand-700"
              : "border-mist-200 text-ink-700 hover:bg-mist-100"
          }`}
        >
          Revizije
        </button>
      </header>

      {/* Banners */}
      {!sanityConfigured && (
        <div
          role="status"
          className="border-b border-amber-200 bg-amber-100 px-5 py-2.5 text-sm text-amber-800"
        >
          Sanity ni konfiguriran — sprememb ni mogoče shraniti.
        </div>
      )}

      {save.status === "saving" && (
        <div
          role="status"
          className="border-b border-blue-200 bg-blue-50 px-5 py-2.5 text-sm text-blue-800"
        >
          Shranjevanje…
        </div>
      )}

      {save.status === "ok" && (
        <div
          role="status"
          className="border-b border-green-200 bg-green-100 px-5 py-2.5 text-sm text-green-800"
        >
          Postavitev strani »{slug}« je shranjena.
        </div>
      )}

      {save.status === "error" && (
        <div
          role="alert"
          className="border-b border-red-200 bg-red-100 px-5 py-2.5 text-sm text-red-800"
        >
          Napaka pri shranjevanju: {save.message}
        </div>
      )}

      {/* Non-destructive revision preview indicator + exit. */}
      {preview && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 border-b border-violet-200 bg-violet-100 px-5 py-2.5 text-sm text-violet-800"
        >
          <span>
            Predogled revizije — spremembe niso shranjene.
          </span>
          <button
            type="button"
            onClick={exitPreview}
            className="shrink-0 rounded border border-violet-300 bg-white px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-50"
          >
            Nazaj na trenutno
          </button>
        </div>
      )}

      {/* Canvas + optional revisions drawer side by side. */}
      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 min-w-0 flex-1">
          {load.status === "loading" ? (
            <div className="p-6 text-sm text-mist-400">
              Nalaganje postavitve…
            </div>
          ) : (
            /*
             * `key` ties the canvas to the slug + a monotonically increasing
             * `seedKey` so Puck remounts with fresh `data` on every reseed —
             * round-trip load, revision preview, return-to-current, and the
             * post-restore reload all bump `seedKey` (Puck seeds its internal
             * state from `data` only on mount). When `preview` is set the
             * historical layout is shown; otherwise the live loaded layout.
             *
             * iframe disabled: Puck renders its preview in an iframe by default
             * and blocks on it becoming "ready" (perpetual loading spinner in
             * Next dev), and the app's Tailwind styles wouldn't reach the iframe
             * anyway.
             */
            <Puck
              key={`${slug}:${seedKey}`}
              config={config}
              data={preview ?? load.data}
              onPublish={handlePublish}
              iframe={{ enabled: false }}
            />
          )}
        </div>

        {panelOpen && docId && (
          <RevisionsPanel
            docId={docId}
            onPreview={handlePreview}
            onRestored={handleRestored}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

/**
 * The page editor canvas. Wraps `EditorInner` in `<Suspense>` so the
 * `useSearchParams()` call is static-export-safe. Loaded client-only by
 * `./PageEditor` via `next/dynamic({ ssr: false })`.
 */
export function EditorCanvas() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-mist-400">Nalaganje urejevalnika…</div>
      }
    >
      <EditorInner />
    </Suspense>
  );
}

export default EditorCanvas;

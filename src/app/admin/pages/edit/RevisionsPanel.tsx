"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listRevisions,
  getRevision,
  restoreRevision,
  type Revision,
} from "@/lib/sanityAdmin";

/**
 * Revisions side panel for the page editor (E-2).
 *
 * Opened from the "Revizije" toggle in the editor header. On open it loads the
 * current document's edit transactions via `listRevisions(docId)` and renders
 * one row per revision with two actions:
 *
 *  - **Predogled** (preview) — loads the snapshot via `getRevision(docId, rev)`,
 *    reads its `puckData` string and hands it to `onPreview(puckData)` so the
 *    editor reseeds the Puck canvas with that historical layout WITHOUT writing
 *    anything. The editor shows a "predogled revizije" indicator + a way back.
 *  - **Obnovi** (restore) — confirms, then `restoreRevision(docId, rev)`. On
 *    success it calls `onRestored()` (the editor re-fetches the live `puckData`
 *    and reseeds) and shows a success note; on failure it surfaces the error.
 *
 * OFFLINE-SAFE: `listRevisions` returns `[]` with no Sanity env, so the panel
 * simply shows the empty state (the editor's own no-Sanity banner covers the
 * cause). An empty list is also normal even online — Sanity history retention is
 * plan-dependent (the free tier keeps only limited history).
 */

type RevisionsPanelProps = {
  /** Live document id whose history is shown (revisions are keyed by doc id). */
  docId: string;
  /** Reseed the canvas with a revision's `puckData` (string) — non-destructive. */
  onPreview: (puckData: string) => void;
  /** Notify the editor that a restore succeeded → re-fetch + reseed the canvas. */
  onRestored: () => void;
  /** Close the panel. */
  onClose: () => void;
};

/** Load state for the revisions list fetch. */
type ListState =
  | { status: "loading" }
  | { status: "ready"; revisions: Revision[] }
  | { status: "error"; message: string };

/** Per-row async action feedback (restore failures / busy state). */
type RowState =
  | { status: "idle" }
  | { status: "busy" }
  | { status: "error"; message: string };

/** Format an ISO timestamp in Slovenian locale; fall back to the raw string. */
function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat("sl-SI", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return date.toLocaleString("sl-SI");
  }
}

export function RevisionsPanel({
  docId,
  onPreview,
  onRestored,
  onClose,
}: RevisionsPanelProps) {
  const [list, setList] = useState<ListState>({ status: "loading" });
  // Keyed by revision id so each row tracks its own busy/error state.
  const [rows, setRows] = useState<Record<string, RowState>>({});
  // A short-lived success note after a restore (cleared on next interaction).
  const [restoredNote, setRestoredNote] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setList({ status: "loading" });
    listRevisions(docId)
      .then((revisions) => {
        if (!cancelled) setList({ status: "ready", revisions });
      })
      .catch((err) => {
        // listRevisions never throws, but stay defensive.
        if (!cancelled)
          setList({
            status: "error",
            message: err instanceof Error ? err.message : String(err),
          });
      });
    return () => {
      cancelled = true;
    };
  }, [docId]);

  // (Re)load whenever the panel targets a different document.
  useEffect(() => load(), [load]);

  function setRow(rev: string, state: RowState) {
    setRows((prev) => ({ ...prev, [rev]: state }));
  }

  /** Read a snapshot's `puckData` string and hand it to the editor (preview). */
  async function handlePreview(rev: string) {
    setRestoredNote(null);
    setRow(rev, { status: "busy" });
    try {
      const snapshot = await getRevision(docId, rev);
      if (!snapshot) {
        setRow(rev, { status: "error", message: "Revizije ni mogoče naložiti." });
        return;
      }
      const puckData = snapshot.puckData;
      if (typeof puckData !== "string") {
        setRow(rev, {
          status: "error",
          message: "Ta revizija nima shranjene postavitve.",
        });
        return;
      }
      onPreview(puckData);
      setRow(rev, { status: "idle" });
    } catch (err) {
      setRow(rev, {
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /** Confirm, then restore the document to a revision (destructive write). */
  async function handleRestore(rev: string) {
    setRestoredNote(null);
    const ok = window.confirm(
      "Obnoviti to revizijo? Trenutna postavitev strani bo zamenjana s to različico.",
    );
    if (!ok) return;
    setRow(rev, { status: "busy" });
    try {
      const res = await restoreRevision(docId, rev);
      if (res.ok) {
        setRow(rev, { status: "idle" });
        setRestoredNote("Revizija je bila obnovljena.");
        onRestored();
      } else {
        setRow(rev, {
          status: "error",
          message: res.error ?? "Obnovitev ni uspela.",
        });
      }
    } catch (err) {
      setRow(rev, {
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <aside
      role="dialog"
      aria-label="Revizije strani"
      className="flex h-full w-full max-w-sm flex-col border-l border-mist-200 bg-white shadow-xl"
    >
      <header className="flex items-center justify-between gap-3 border-b border-mist-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-ink-900">Revizije</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-1 text-xs font-medium text-mist-500 hover:bg-mist-100 hover:text-ink-900"
        >
          Zapri ✕
        </button>
      </header>

      {restoredNote && (
        <div
          role="status"
          className="border-b border-green-200 bg-green-100 px-4 py-2.5 text-xs text-green-800"
        >
          {restoredNote}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {list.status === "loading" && (
          <p className="p-4 text-sm text-mist-400">Nalaganje revizij…</p>
        )}

        {list.status === "error" && (
          <p
            role="alert"
            className="m-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            Napaka pri nalaganju revizij: {list.message}
          </p>
        )}

        {list.status === "ready" && list.revisions.length === 0 && (
          <div className="p-4 text-sm text-mist-500">
            <p className="font-medium text-ink-700">Ni razpoložljivih revizij.</p>
            <p className="mt-2 text-xs leading-relaxed text-mist-400">
              Obseg zgodovine je odvisen od naročniškega paketa Sanity —
              brezplačni paket hrani le omejeno zgodovino, zato je prazen seznam
              običajen.
            </p>
          </div>
        )}

        {list.status === "ready" && list.revisions.length > 0 && (
          <ul className="divide-y divide-mist-100">
            {list.revisions.map((revision) => {
              const row = rows[revision.rev] ?? { status: "idle" };
              const busy = row.status === "busy";
              return (
                <li key={revision.rev} className="px-4 py-3">
                  <div className="text-sm font-medium text-ink-900">
                    {formatTimestamp(revision.timestamp)}
                  </div>
                  {revision.author && (
                    <div className="mt-0.5 text-xs text-mist-400">
                      Avtor: {revision.author}
                    </div>
                  )}
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handlePreview(revision.rev)}
                      className="rounded border border-mist-200 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-mist-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Predogled
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleRestore(revision.rev)}
                      className="rounded border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Obnovi
                    </button>
                  </div>
                  {row.status === "error" && (
                    <p
                      role="alert"
                      className="mt-2 text-xs text-red-700"
                    >
                      {row.message}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default RevisionsPanel;

"use client";

import { useEffect, useState } from "react";
import { listDocs, type AdminDoc, type AdminDocType } from "@/lib/sanityAdmin";
import { sanityConfigured } from "@/lib/sanity";

/**
 * Shared list view (D-1) for field-heavy content types — CLIENT component.
 *
 * Per decision D2, posts / projects / settings are NOT edited with custom forms:
 * their rich-text + media field editing happens in the embedded **Sanity Studio**
 * (`/studio`). This admin only provides the WP-style LIST; "Uredi v Studiu" and
 * "Nova … (v Studiu)" hand off to Studio via deep-links opened in a new tab so
 * the admin list stays put.
 *
 * On mount it loads the published documents via `listDocs(type)` and renders a
 * table (Naslov / Slug / Posodobljeno). Every Sanity call is offline-safe
 * (`[]` with no env), so this never crashes; a clear note is shown when Sanity
 * isn't configured. Renders inside the authed admin shell (the `/admin` layout
 * gate guarantees a logged-in user before this mounts).
 *
 * STUDIO DEEP-LINKS — default `structureTool` URL scheme (basePath `/studio`):
 *   - edit a doc:        /studio/structure/<type>;<id>
 *   - list / create:     /studio/structure/<type>
 */

/** Base path of the embedded Studio + its default structure tool. */
const STUDIO_STRUCTURE = "/studio/structure";

/** Deep-link to edit a specific document in Studio. */
export function studioEditHref(type: string, id: string): string {
  return `${STUDIO_STRUCTURE}/${encodeURIComponent(type)};${encodeURIComponent(id)}`;
}

/** Deep-link to a type's list (where "create" lives) in Studio. */
export function studioListHref(type: string): string {
  return `${STUDIO_STRUCTURE}/${encodeURIComponent(type)}`;
}

/** Format an ISO timestamp for the "Posodobljeno" column (sl-SI). */
function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("sl-SI", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ListState = AdminDoc[] | "loading";

export type DocListViewProps = {
  /** Sanity document type to list (e.g. "post", "project"). */
  type: AdminDocType;
  /** Page heading (Slovenian), e.g. "Aktualno". */
  title: string;
  /** Label for the "create in Studio" button, e.g. "Nova objava". */
  newLabel: string;
};

export function DocListView({ type, title, newLabel }: DocListViewProps) {
  const [docs, setDocs] = useState<ListState>("loading");

  useEffect(() => {
    let cancelled = false;
    listDocs(type)
      .then((rows) => {
        if (!cancelled) setDocs(rows);
      })
      .catch(() => {
        // listDocs never throws, but stay defensive.
        if (!cancelled) setDocs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">{title}</h1>
          <p className="mt-1 text-sm text-mist-400">
            Vsebino urejate v urejevalniku Sanity Studio. Spodnji seznam je le
            pregled.
          </p>
        </div>
        <a
          href={studioListHref(type)}
          target="_blank"
          rel="noopener"
          className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-400"
        >
          {newLabel} (v Studiu)
        </a>
      </div>

      {!sanityConfigured && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Sanity ni konfiguriran</p>
          <p className="mt-1">
            Seznam je prazen, urejanje v Studiu pa ni mogoče. Nastavite okoljske
            spremenljivke projekta Sanity in znova naložite stran.
          </p>
        </div>
      )}

      {/* Seznam */}
      <section className="overflow-hidden rounded-xl border border-mist-200 bg-white shadow-sm">
        {docs === "loading" ? (
          <div className="p-8 text-center text-sm text-mist-400">
            Nalaganje…
          </div>
        ) : docs.length === 0 ? (
          <div className="p-8 text-center text-sm text-mist-400">
            Ni še nobenega vnosa — ustvarite prvega v Studiu.
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-mist-200 text-xs uppercase tracking-wide text-mist-400">
                <th className="px-5 py-3 font-medium">Naslov</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Posodobljeno</th>
                <th className="px-5 py-3 text-right font-medium">Dejanja</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => {
                const slug = doc.slug ?? "";
                const editHref = studioEditHref(type, doc._id);
                return (
                  <tr
                    key={doc._id}
                    className="border-b border-mist-100 last:border-b-0 hover:bg-mist-50"
                  >
                    <td className="px-5 py-3 font-medium text-ink-900">
                      <a
                        href={editHref}
                        target="_blank"
                        rel="noopener"
                        className="text-ink-900 hover:text-brand-600"
                      >
                        {doc.title || "(brez naslova)"}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-mist-400">
                      {slug ? (
                        <code className="rounded bg-mist-100 px-1.5 py-0.5 text-xs text-ink-700">
                          {slug}
                        </code>
                      ) : (
                        <span className="text-mist-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-mist-400">
                      {formatDate(doc.updatedAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={editHref}
                          target="_blank"
                          rel="noopener"
                          className="font-medium text-brand-600 hover:text-brand-500"
                        >
                          Uredi v Studiu
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

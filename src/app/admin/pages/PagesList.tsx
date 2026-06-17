"use client";

import { useEffect, useState } from "react";
import {
  listDocs,
  createPage,
  deleteDoc,
  type AdminDoc,
} from "@/lib/sanityAdmin";
import { sanityConfigured } from "@/lib/sanity";

/**
 * Pages list (C-1) — CLIENT component.
 *
 * On mount it loads the published `page` documents via `listDocs("page")` and
 * renders a WP-style table (Naslov / Slug / Posodobljeno / Postavitev) with
 * per-row Uredi (→ the Puck editor) and Izbriši actions, plus a "Nova stran"
 * form. Every Sanity call is offline-safe (`[]` / `{ ok:false }` with no env),
 * so this never crashes; a clear note is shown when Sanity isn't configured.
 *
 * Renders inside the authed admin shell (the `/admin` layout gate guarantees a
 * logged-in user before this mounts).
 *
 * EDITOR LINK: pages are edited at the STATIC route `/admin/pages/edit?slug=…`
 * (a query param, not a `[slug]` segment) so the editor prerenders once under
 * `output: "export"` for any future page.
 */

/** Turn a free-text title into a URL slug: lowercased, dashed, ASCII-ish. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    // Slovenian / accented letters → ASCII so the slug stays URL-safe
    // (decompose, then strip the combining diacritical marks U+0300–U+036F).
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

export function PagesList() {
  const [pages, setPages] = useState<ListState>("loading");
  const [error, setError] = useState<string | null>(null);

  // "Nova stran" form state.
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  // Whether the user has hand-edited the slug; until then we auto-derive it.
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);

  // Per-row delete in flight (by _id) so we can disable just that row.
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setError(null);
    const docs = await listDocs("page");
    setPages(docs);
  }

  useEffect(() => {
    let cancelled = false;
    listDocs("page")
      .then((docs) => {
        if (!cancelled) setPages(docs);
      })
      .catch(() => {
        // listDocs never throws, but stay defensive.
        if (!cancelled) setPages([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleTitleChange(value: string) {
    setNewTitle(value);
    // Mirror the title into the slug until the user takes over the slug field.
    if (!slugTouched) setNewSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setNewSlug(slugify(value));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const title = newTitle.trim();
    const slug = slugify(newSlug || newTitle);
    if (!title || !slug) {
      setError("Vnesite naslov in veljaven slug.");
      return;
    }

    setCreating(true);
    try {
      const res = await createPage(slug, title);
      if (res.ok) {
        // Jump straight into the editor for the new page.
        window.location.href = `/admin/pages/edit?slug=${encodeURIComponent(slug)}`;
      } else {
        setError(res.error ?? "Strani ni bilo mogoče ustvariti.");
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(doc: AdminDoc) {
    const label = doc.title || doc.slug || doc._id;
    const ok = window.confirm(
      `Ali res želite izbrisati stran »${label}«? Tega dejanja ni mogoče razveljaviti.`,
    );
    if (!ok) return;

    setError(null);
    setDeletingId(doc._id);
    try {
      const res = await deleteDoc(doc._id);
      if (res.ok) {
        await load();
      } else {
        setError(res.error ?? "Strani ni bilo mogoče izbrisati.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Strani</h1>
          <p className="mt-1 text-sm text-mist-400">
            Upravljajte strani in jih urejajte v vizualnem urejevalniku.
          </p>
        </div>
      </div>

      {!sanityConfigured && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Sanity ni konfiguriran</p>
          <p className="mt-1">
            Seznam je prazen, ustvarjanje in brisanje strani pa nista mogoča.
            Nastavite okoljske spremenljivke projekta Sanity in znova naložite
            stran.
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {/* Nova stran */}
      <section className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-ink-900">Nova stran</h2>
        <form
          onSubmit={handleCreate}
          className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-mist-400">Naslov</span>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="npr. O nas"
              disabled={!sanityConfigured || creating}
              className="rounded-lg border border-mist-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-mist-100 disabled:opacity-60"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-mist-400">Slug</span>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="npr. o-nas"
              disabled={!sanityConfigured || creating}
              className="rounded-lg border border-mist-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-mist-100 disabled:opacity-60"
            />
          </label>
          <button
            type="submit"
            disabled={!sanityConfigured || creating}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-400 disabled:opacity-60"
          >
            {creating ? "Ustvarjanje…" : "Ustvari stran"}
          </button>
        </form>
      </section>

      {/* Seznam strani */}
      <section className="overflow-hidden rounded-xl border border-mist-200 bg-white shadow-sm">
        {pages === "loading" ? (
          <div className="p-8 text-center text-sm text-mist-400">
            Nalaganje strani…
          </div>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center text-sm text-mist-400">
            Ni še nobene strani — ustvarite prvo.
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-mist-200 text-xs uppercase tracking-wide text-mist-400">
                <th className="px-5 py-3 font-medium">Naslov</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Posodobljeno</th>
                <th className="px-5 py-3 font-medium">Postavitev</th>
                <th className="px-5 py-3 text-right font-medium">Dejanja</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((doc) => {
                const slug = doc.slug ?? "";
                const editHref = `/admin/pages/edit?slug=${encodeURIComponent(slug)}`;
                const deleting = deletingId === doc._id;
                return (
                  <tr
                    key={doc._id}
                    className="border-b border-mist-100 last:border-b-0 hover:bg-mist-50"
                  >
                    <td className="px-5 py-3 font-medium text-ink-900">
                      {slug ? (
                        <a
                          href={editHref}
                          className="text-ink-900 hover:text-brand-600"
                        >
                          {doc.title || "(brez naslova)"}
                        </a>
                      ) : (
                        doc.title || "(brez naslova)"
                      )}
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
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          doc.hasLayout
                            ? "bg-green-100 text-green-700"
                            : "bg-mist-100 text-mist-400",
                        ].join(" ")}
                      >
                        {doc.hasLayout ? "Da" : "Ne"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3">
                        {slug && (
                          <a
                            href={editHref}
                            className="font-medium text-brand-600 hover:text-brand-500"
                          >
                            Uredi
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(doc)}
                          disabled={deleting}
                          className="font-medium text-red-600 hover:text-red-500 disabled:opacity-60"
                        >
                          {deleting ? "Brisanje…" : "Izbriši"}
                        </button>
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

"use client";

import { useEffect, useState } from "react";
import { listDocs, type AdminDoc } from "@/lib/sanityAdmin";
import { sanityConfigured } from "@/lib/sanity";
import { studioListHref } from "../DocListView";

/**
 * Site settings panel (D-1) — CLIENT component.
 *
 * Per decision D2, the `siteSettings` singleton is edited in the embedded Sanity
 * Studio (rich fields / media). This panel just explains that and deep-links to
 * the singleton in Studio (`/studio/structure/siteSettings`, opened in a new
 * tab). It also shows a small read-only summary of the current settings doc when
 * available. Every Sanity call is offline-safe (`[]` on no-env / error), so this
 * never crashes; a clear note is shown when Sanity isn't configured. Renders
 * inside the authed admin shell (the layout gate guarantees a logged-in user).
 */

/** Deep-link to the `siteSettings` singleton in Studio. */
const SETTINGS_HREF = studioListHref("siteSettings");

/** Format an ISO timestamp (sl-SI). */
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

type SummaryState = AdminDoc | null | "loading";

export function SettingsPanel() {
  const [summary, setSummary] = useState<SummaryState>("loading");

  useEffect(() => {
    let cancelled = false;
    listDocs("siteSettings")
      .then((rows) => {
        if (!cancelled) setSummary(rows[0] ?? null);
      })
      .catch(() => {
        // listDocs never throws, but stay defensive.
        if (!cancelled) setSummary(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Nastavitve</h1>
        <p className="mt-1 text-sm text-mist-400">
          Nastavitve spletnega mesta se urejajo v Sanity Studiu.
        </p>
      </div>

      {!sanityConfigured && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Sanity ni konfiguriran</p>
          <p className="mt-1">
            Urejanje nastavitev v Studiu ni mogoče. Nastavite okoljske
            spremenljivke projekta Sanity in znova naložite stran.
          </p>
        </div>
      )}

      <section className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-ink-900">
          Nastavitve spletnega mesta
        </h2>
        <p className="mt-1 text-sm text-mist-400">
          Splošne nastavitve (naslov mesta, logotip, stiki, SEO …) urejate v
          Studiu.
        </p>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-mist-400">
              Stanje
            </dt>
            <dd className="mt-1 text-ink-900">
              {summary === "loading" ? (
                <span className="inline-block h-4 w-24 animate-pulse rounded bg-mist-200" />
              ) : summary ? (
                "Nastavitve obstajajo"
              ) : (
                "Nastavitve še niso ustvarjene"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-mist-400">
              Posodobljeno
            </dt>
            <dd className="mt-1 text-ink-900">
              {summary === "loading" ? (
                <span className="inline-block h-4 w-32 animate-pulse rounded bg-mist-200" />
              ) : summary ? (
                formatDate(summary.updatedAt)
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <a
            href={SETTINGS_HREF}
            target="_blank"
            rel="noopener"
            className="inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-400"
          >
            Uredi nastavitve v Studiu
          </a>
        </div>
      </section>
    </div>
  );
}

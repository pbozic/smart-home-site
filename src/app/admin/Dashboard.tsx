"use client";

import { useEffect, useState } from "react";
import { listDocs, type AdminDocType } from "@/lib/sanityAdmin";
import { sanityConfigured } from "@/lib/sanity";

/**
 * Admin dashboard (B-2) — CLIENT component.
 *
 * On mount it loads counts for each content type via `listDocs(...)` and shows
 * stat cards + quick links. Every list is offline-safe (`[]` on no-env / error),
 * so this never crashes: with no Sanity env the counts read 0 and a hint to
 * configure Sanity is shown. Renders inside the authed shell (the layout gate
 * guarantees a logged-in user before this mounts).
 */

type Stat = {
  type: AdminDocType;
  label: string;
  href: string;
  /** Label for the quick "create / open" action under each card. */
  action: string;
};

const STATS: Stat[] = [
  { type: "page", label: "Strani", href: "/admin/pages", action: "Nova stran" },
  {
    type: "post",
    label: "Aktualno",
    href: "/admin/posts",
    action: "Nova objava",
  },
  {
    type: "project",
    label: "Reference",
    href: "/admin/projects",
    action: "Nova referenca",
  },
];

type Counts = Record<AdminDocType, number>;
type CountsState = Counts | "loading";

export function Dashboard() {
  const [counts, setCounts] = useState<CountsState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Each call is independently offline-safe; run them in parallel.
      const [pages, posts, projects] = await Promise.all([
        listDocs("page"),
        listDocs("post"),
        listDocs("project"),
      ]);
      if (cancelled) return;
      setCounts({
        page: pages.length,
        post: posts.length,
        project: projects.length,
        // siteSettings isn't surfaced as a stat card, but keep the record total.
        siteSettings: 0,
      });
    }

    load().catch(() => {
      // listDocs never throws, but stay defensive: fall back to zeroed counts.
      if (!cancelled) {
        setCounts({ page: 0, post: 0, project: 0, siteSettings: 0 });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Nadzorna plošča</h1>
        <p className="mt-1 text-sm text-mist-400">
          Pregled vsebine in hitre povezave za urejanje.
        </p>
      </div>

      {!sanityConfigured && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Sanity ni konfiguriran</p>
          <p className="mt-1">
            Števci prikazujejo 0. Nastavite okoljske spremenljivke projekta
            Sanity in dodajte vsebino, da se tu prikažejo podatki.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((stat) => (
          <div
            key={stat.type}
            className="flex flex-col justify-between rounded-xl border border-mist-200 bg-white p-5 shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-mist-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-ink-900">
                {counts === "loading" ? (
                  <span className="inline-block h-8 w-12 animate-pulse rounded bg-mist-200" />
                ) : (
                  counts[stat.type]
                )}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm">
              <a
                href={stat.href}
                className="font-medium text-brand-600 hover:text-brand-500"
              >
                Odpri
              </a>
              <span aria-hidden className="text-mist-300">
                ·
              </span>
              <a
                href={stat.href}
                className="font-medium text-brand-600 hover:text-brand-500"
              >
                {stat.action}
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-ink-900">Hitre povezave</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/admin/pages"
            className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-brand-400"
          >
            Nova stran
          </a>
          <a
            href="/admin/settings"
            className="rounded-lg border border-mist-200 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-mist-100"
          >
            Nastavitve
          </a>
          <a
            href="/studio"
            className="rounded-lg border border-mist-200 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-mist-100"
          >
            Sanity Studio
          </a>
          <a
            href="/"
            className="rounded-lg border border-mist-200 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-mist-100"
          >
            Ogled strani
          </a>
        </div>
      </div>
    </div>
  );
}

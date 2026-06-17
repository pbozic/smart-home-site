"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  getCurrentUser,
  getLoginProviders,
  loginUrl,
  logout,
  type SanityUser,
  type LoginProvider,
} from "@/lib/sanityAuth";
import { sanityConfigured } from "@/lib/sanity";
import { Sidebar } from "./Sidebar";

/**
 * Admin gate + chrome (B-1) — CLIENT component.
 *
 * Wraps every `/admin/**` route. On mount it asks Sanity "who am I?" via the
 * session cookie (`getCurrentUser`) and renders one of three states:
 *
 *   "loading" → a centered spinner while the session check is in flight.
 *   null      → the login gate (no `children` are rendered while logged out).
 *   user      → the WP-style shell: fixed sidebar + top bar + content area.
 *
 * STATIC-EXPORT SAFE: this is the only interactive piece; the parent
 * `layout.tsx` is a server component that prerenders a static shell. No Server
 * Actions / Route Handlers / `next/headers` — all auth runs in the browser
 * against Sanity's API. The client gate is UX; Sanity's API is the real lock.
 */

type UserState = SanityUser | null | "loading";

export function AdminShell({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>("loading");

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        // getCurrentUser never throws, but be defensive: any failure → logged out.
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (user === "loading") {
    return <LoadingScreen />;
  }

  if (user === null) {
    return <LoginGate />;
  }

  return <Shell user={user}>{children}</Shell>;
}

/** Full-screen "checking your session" state. */
function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-900 text-mist-200">
      <div className="flex flex-col items-center gap-3">
        <span
          aria-hidden
          className="h-8 w-8 animate-spin rounded-full border-2 border-ink-600 border-t-brand-400"
        />
        <p className="text-sm text-mist-300">Nalaganje…</p>
      </div>
    </div>
  );
}

/**
 * Logged-out login gate. Fetches the project's Sanity login providers and
 * renders one button per provider; each link starts Sanity's OAuth flow and
 * returns the browser to the current admin URL after login. Clear fallbacks when
 * Sanity isn't configured or no providers are available.
 */
function LoginGate() {
  const [providers, setProviders] = useState<LoginProvider[] | "loading">(
    "loading",
  );
  const [returnTo, setReturnTo] = useState<string>("");

  useEffect(() => {
    // window.location is only available in the browser; capture the current
    // admin URL so Sanity returns here after a successful login.
    setReturnTo(window.location.href);

    if (!sanityConfigured) {
      setProviders([]);
      return;
    }
    let cancelled = false;
    getLoginProviders()
      .then((list) => {
        if (!cancelled) setProviders(list);
      })
      .catch(() => {
        if (!cancelled) setProviders([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid min-h-screen place-items-center bg-ink-900 px-4 text-mist-100">
      <div className="w-full max-w-sm rounded-2xl border border-ink-700 bg-ink-800 p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500 text-lg font-bold text-ink-950">
            S
          </span>
          <h1 className="text-lg font-semibold text-white">
            Prijava v nadzorno ploščo
          </h1>
          <p className="text-sm text-mist-300">
            Za urejanje vsebine se prijavite s svojim Sanity računom.
          </p>
        </div>

        {!sanityConfigured ? (
          <div className="rounded-lg border border-ink-600 bg-ink-900 p-4 text-sm text-mist-300">
            <p className="font-medium text-mist-100">Sanity ni konfiguriran</p>
            <p className="mt-1">
              Nastavite okoljske spremenljivke{" "}
              <code className="rounded bg-ink-700 px-1 py-0.5 text-xs text-brand-200">
                NEXT_PUBLIC_SANITY_PROJECT_ID
              </code>{" "}
              in{" "}
              <code className="rounded bg-ink-700 px-1 py-0.5 text-xs text-brand-200">
                NEXT_PUBLIC_SANITY_DATASET
              </code>
              , nato znova naložite stran.
            </p>
          </div>
        ) : providers === "loading" ? (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-mist-300">
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-ink-600 border-t-brand-400"
            />
            Nalaganje načinov prijave…
          </div>
        ) : providers.length === 0 ? (
          <div className="rounded-lg border border-ink-600 bg-ink-900 p-4 text-sm text-mist-300">
            <p className="font-medium text-mist-100">
              Ni razpoložljivih načinov prijave
            </p>
            <p className="mt-1">
              Preverite nastavitve prijave projekta v Sanity ali poskusite
              znova.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {providers.map((provider) => (
              <a
                key={provider.name}
                href={loginUrl(provider.url, returnTo)}
                className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-400"
              >
                Prijava z {provider.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Authenticated WP-style shell: fixed sidebar + top bar + content area. */
function Shell({ user, children }: { user: SanityUser; children: ReactNode }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      // Re-check the session by reloading — the gate then shows the login screen.
      window.location.reload();
    }
  }

  const displayName = user.name || user.email || "Uporabnik";

  return (
    <div className="flex min-h-screen bg-mist-100 text-ink-900">
      <aside className="sticky top-0 h-screen shrink-0">
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-mist-200 bg-white px-6">
          <div className="text-sm font-medium text-ink-700">Skrbništvo</div>
          <div className="flex items-center gap-3">
            {user.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImage}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="hidden text-sm text-ink-700 sm:inline">
              {displayName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-md border border-mist-200 px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-mist-100 disabled:opacity-60"
            >
              {loggingOut ? "Odjava…" : "Odjava"}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

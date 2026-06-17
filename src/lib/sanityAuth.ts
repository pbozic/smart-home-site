/**
 * Client-side Sanity authentication for the custom admin (A-1).
 *
 * AUTH MODEL — read this before changing anything:
 * - This site is a Next.js STATIC EXPORT (`output: "export"`): no server
 *   runtime, so NO Server Actions, Route Handlers, `"use server"`, or
 *   `next/headers`. Every function here is plain isomorphic code that runs in
 *   the browser.
 * - The admin gate is therefore CLIENT-SIDE only: `getCurrentUser()` asks
 *   Sanity "who am I?" using the editor's session cookie and the UI shows the
 *   admin shell or a login screen accordingly. The client gate is UX.
 * - The REAL auth boundary is SANITY'S API. It enforces auth server-side: you
 *   cannot read private data or write without a valid Sanity project session,
 *   no matter what this client UI renders. No token/secret is shipped to the
 *   browser — auth rides on the Sanity session COOKIE (`withCredentials: true`).
 * - Offline / no Sanity env (`sanityConfigured === false`): every function
 *   degrades gracefully (`null` / `[]` / no-op) and NEVER throws, so the public
 *   static build keeps working with local fallback content.
 *
 * Endpoints used here are verified against Sanity's own Studio implementation
 * (`node_modules/sanity` v3.99.0) and `@sanity/client` v6.29.1:
 *   - current user : `client.request({ uri: "/users/me" })`            (401 → null)
 *   - providers    : `client.request({ uri: "/auth/providers" })`      → { providers }
 *   - login href   : `${provider.url}?origin=<returnTo>&projectId=<id>&type=dual`
 *   - logout       : `client.request({ uri: "/auth/logout", method: "POST" })`
 * All run against the project hostname with the session client's
 * `withCredentials: true`, which is exactly how Sanity Studio authenticates.
 */
import { sessionClient, sanityConfigured, projectId } from "./sanity";

/** A logged-in Sanity user, as the admin UI needs it. */
export type SanityUser = {
  id: string;
  name?: string;
  email?: string;
  profileImage?: string;
};

/** A login provider offered by Sanity for this project. */
export type LoginProvider = { name: string; title: string; url: string };

/** Shape returned by Sanity's `/users/me` endpoint (fields we care about). */
type SanityMeResponse = {
  id?: string;
  name?: string;
  email?: string;
  profileImage?: string | null;
};

/** Shape returned by Sanity's `/auth/providers` endpoint. */
type AuthProvidersResponse = { providers?: LoginProvider[] };

/**
 * Resolve the currently logged-in Sanity user from the browser session.
 *
 * THE WHOLE ADMIN GATE DEPENDS ON THIS — it must never throw. Hits Sanity's
 * `/users/me` with the session cookie; a valid session returns a user object,
 * otherwise Sanity answers 401. Any error (401, network, CORS, no env) → null,
 * which the UI treats as "not logged in → show login".
 */
export async function getCurrentUser(): Promise<SanityUser | null> {
  if (!sanityConfigured) return null;
  try {
    const user = await sessionClient.request<SanityMeResponse>({
      uri: "/users/me",
      tag: "users.get-current",
    });
    // Sanity returns a user object (with a string `id`) when authed, or 401.
    if (!user || typeof user.id !== "string") return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage ?? undefined,
    };
  } catch {
    // 401 (not logged in), network/CORS error, or misconfig → treat as no user.
    return null;
  }
}

/**
 * List the login providers Sanity offers for this project (Google, GitHub, …).
 * Returns `[]` on any error or when Sanity isn't configured.
 */
export async function getLoginProviders(): Promise<LoginProvider[]> {
  if (!sanityConfigured) return [];
  try {
    const res = await sessionClient.request<AuthProvidersResponse>({
      uri: "/auth/providers",
      tag: "auth.providers",
    });
    return Array.isArray(res?.providers) ? res.providers : [];
  } catch {
    return [];
  }
}

/**
 * Build the URL that sends the browser to a Sanity login provider and brings it
 * back to `returnTo` after a successful login.
 *
 * Mirrors Sanity Studio's `createHrefForProvider`:
 *   `<provider.url>?origin=<returnTo>&projectId=<id>&type=dual`
 * - `origin`  — where Sanity redirects back to (the admin URL to return to).
 * - `type=dual` — cookie/session login (no SID token in the URL); the session
 *   cookie is what our `withCredentials` requests then ride on.
 *
 * `providerUrl` is the `url` from `getLoginProviders()`.
 */
export function loginUrl(providerUrl: string, returnTo: string): string {
  const params = new URLSearchParams();
  params.set("origin", returnTo);
  if (projectId) params.set("projectId", projectId);
  params.set("type", "dual");
  return `${providerUrl}?${params.toString()}`;
}

/**
 * Log the editor out of their Sanity session. POSTs to Sanity's logout endpoint
 * with the session cookie so the cookie is invalidated server-side. Errors and
 * no-env are ignored — the caller just re-checks `getCurrentUser()` afterwards.
 */
export async function logout(): Promise<void> {
  if (!sanityConfigured) return;
  try {
    await sessionClient.request({
      uri: "/auth/logout",
      method: "POST",
      tag: "auth.logout",
    });
  } catch {
    // Best-effort: ignore. The UI re-checks getCurrentUser() after logout.
  }
}

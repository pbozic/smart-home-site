/**
 * Sanity write path — persist Puck layout JSON back to the `page` document.
 *
 * SECURITY / ARCHITECTURE NOTES:
 * - The write token (`SANITY_API_WRITE_TOKEN`) is SERVER-ONLY: it has no
 *   `NEXT_PUBLIC_` prefix, so Next.js strips it from client bundles. In the
 *   browser `process.env.SANITY_API_WRITE_TOKEN` is `undefined` — only
 *   server-side scripts/webhooks ever see a real token.
 * - Browser writes from the admin page editor (`/admin/pages/edit`) rely instead
 *   on the logged-in Sanity SESSION: `withCredentials: true` sends the user's
 *   Sanity auth cookies, so no secret is shipped to the client.
 * - This module deliberately does NOT use `"use server"` / Next Server Actions
 *   or Route Handlers, because `next.config.mjs` sets `output: "export"` and
 *   static export forbids them. It's a plain async function callable from the
 *   client editor (session auth) or from server scripts (token auth).
 */
import { createClient } from "@sanity/client";
import {
  projectId,
  dataset,
  apiVersion,
  sanityConfigured,
} from "./sanity";

/**
 * Write-capable Sanity client.
 *
 * - `token` is populated only server-side (env is non-`NEXT_PUBLIC_`).
 * - `withCredentials: true` lets browser callers write using the logged-in
 *   Sanity session instead of a token.
 * - `useCdn: false` because the CDN is read-only and may serve stale data.
 */
const writeClient = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  withCredentials: true,
});

/**
 * Save the stringified Puck layout JSON for a page identified by `slug`.
 *
 * Find-or-create: patches an existing `page` document with this slug, or
 * creates one if none exists. Degrades gracefully (no throw) when Sanity isn't
 * configured so callers work with no env.
 */
export async function savePuckData(
  slug: string,
  puckData: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!sanityConfigured) {
    return { ok: false, error: "Sanity not configured" };
  }

  try {
    const existingId = await writeClient.fetch<string | null>(
      `*[_type == "page" && slug.current == $slug][0]._id`,
      { slug },
    );

    if (existingId) {
      await writeClient.patch(existingId).set({ puckData }).commit();
    } else {
      await writeClient.create({
        _type: "page",
        title: slug,
        slug: { _type: "slug", current: slug },
        puckData,
      });
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[sanity] savePuckData failed:", message);
    return { ok: false, error: message };
  }
}

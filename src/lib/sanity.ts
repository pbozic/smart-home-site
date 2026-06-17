import { createClient, type QueryParams } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

/**
 * Sanity client (read-only, for the static build).
 *
 * Project values come from env so the repo carries no secrets. For a static
 * export, content is fetched at build time; a CMS publish triggers a rebuild
 * (deploy hook) to go live — see README.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01";

/** True once a real Sanity project is configured. Lets the site render with
 * local fallback content before Sanity is wired up. */
export const sanityConfigured = projectId.length > 0;

export const client = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  useCdn: true,
});

/**
 * Shared browser SESSION client (read + auth).
 *
 * - `withCredentials: true` sends the logged-in editor's Sanity session cookies,
 *   so authed reads/requests work from the browser with NO token in the bundle.
 * - `useCdn: false` because the CDN is read-only/anonymous and may serve stale
 *   data — authed/admin reads must hit the live API.
 *
 * Used by the admin auth + data layers (`sanityAuth.ts`, `sanityAdmin.ts`).
 * Carries no secret: anonymous when logged out, the editor's own session when
 * logged in. Sanity's API remains the real auth boundary.
 */
export const sessionClient = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  useCdn: false,
  withCredentials: true,
});

const builder = imageUrlBuilder(client);

export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Typed GROQ fetch helper. Returns `fallback` when Sanity isn't configured yet,
 * so pages still build and render with local content during development.
 */
export async function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
  fallback: T,
): Promise<T> {
  if (!sanityConfigured) return fallback;
  try {
    return await client.fetch<T>(query, params);
  } catch (err) {
    console.warn("[sanity] fetch failed, using fallback:", err);
    return fallback;
  }
}

/**
 * Read the stringified Puck layout JSON for a page by slug.
 *
 * Returns `null` when Sanity isn't configured (or the page has no `puckData`),
 * so the public render pipeline (PuckRender) and the admin page editor
 * (`/admin/pages/edit`) can fall back to local content.
 */
export async function getPagePuckData(slug: string): Promise<string | null> {
  return sanityFetch<string | null>(
    `*[_type == "page" && slug.current == $slug][0].puckData`,
    { slug },
    null,
  );
}

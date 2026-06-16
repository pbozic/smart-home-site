import { createClient, type QueryParams } from "next-sanity";
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

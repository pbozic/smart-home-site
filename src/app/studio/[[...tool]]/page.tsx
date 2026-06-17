import { Studio } from "./Studio";

/**
 * `/studio` — embedded Sanity Studio (F-7).
 *
 * SERVER component: holds the static-export route config. Under
 * `output: "export"` an optional catch-all segment still needs
 * `generateStaticParams`, which cannot live in a `"use client"` file — so the
 * actual Studio UI lives in the client child `./Studio`.
 *
 * This route SHIPS in the static export (D1), client-gated by the user's Sanity
 * login — Studio itself requires authentication, and the dataset's API enforces
 * all writes. It prerenders a static shell here that hydrates client-side.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ tool: [] as string[] }];
}

export default function StudioPage() {
  return <Studio />;
}

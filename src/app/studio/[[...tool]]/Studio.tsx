"use client";

import dynamic from "next/dynamic";
// `sanity.config.ts` lives at the repo ROOT (outside `src/`), so the `@/` alias
// (→ `src/`) cannot reach it. From this file
// (`src/app/studio/[[...tool]]/Studio.tsx`) the relative path up to the repo
// root is four levels: [[...tool]] → studio → app → src → root.
import config from "../../../../sanity.config";

/**
 * Client child for `/studio`. `NextStudio` is a browser-only component (it
 * mounts the Studio app and touches `window`), so it is loaded via
 * `next/dynamic` with `ssr: false`. This keeps the route client-rendered while
 * the parent server page still prerenders a static shell during
 * `output: "export"`, so the build stays green.
 */
const NextStudio = dynamic(
  () => import("next-sanity/studio").then((m) => m.NextStudio),
  { ssr: false },
);

export function Studio() {
  return <NextStudio config={config} />;
}

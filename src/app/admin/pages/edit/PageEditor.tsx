"use client";

import dynamic from "next/dynamic";

/**
 * Client boundary for the page editor (`/admin/pages/edit`).
 *
 * The Puck canvas (`./EditorCanvas`) is a browser-only editor (drag/drop,
 * `window`), so it must not be server-rendered. Loading it via
 * `next/dynamic({ ssr: false })` keeps it out of the server prerender: the route
 * still prerenders a static shell at build time (the parent server `page.tsx`)
 * and the editor mounts only in the browser. `ssr: false` requires a client
 * component, which is why this thin wrapper sits between the server `page.tsx`
 * and the canvas.
 */
const EditorCanvas = dynamic(
  () => import("./EditorCanvas").then((m) => m.EditorCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 text-sm text-mist-400">Nalaganje urejevalnika…</div>
    ),
  },
);

export function PageEditor() {
  return <EditorCanvas />;
}

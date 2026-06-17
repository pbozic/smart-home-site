import { DocListView } from "../DocListView";

/**
 * `/admin/posts` — list of `post` documents (D-1). SERVER shell.
 *
 * Holds the static-export route config; the interactive list (which fetches the
 * posts from Sanity on mount and deep-links into Sanity Studio for field
 * editing per decision D2) lives in the shared client component `DocListView`.
 * The auth gate + WP-style chrome come from the `/admin` layout.
 *
 * `force-static` → this route prerenders a static shell at build time; the list
 * then hydrates in the browser, where the session-authed Sanity reads run.
 */
export const dynamic = "force-static";

export default function AdminPostsPage() {
  return (
    <DocListView type="post" title="Aktualno" newLabel="Nova objava" />
  );
}

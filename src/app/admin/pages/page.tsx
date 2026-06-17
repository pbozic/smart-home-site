import { PagesList } from "./PagesList";

/**
 * `/admin/pages` — list of `page` documents (C-1). SERVER shell.
 *
 * Holds the static-export route config; the interactive list (which fetches the
 * pages from Sanity on mount, creates/deletes docs, and links into the Puck
 * editor) lives in the client child `./PagesList`. The auth gate + WP-style
 * chrome come from the `/admin` layout, so this only renders the inner content.
 *
 * `force-static` → this route prerenders a static shell at build time; the list
 * then hydrates in the browser, where the session-authed Sanity reads run.
 */
export const dynamic = "force-static";

export default function AdminPagesPage() {
  return <PagesList />;
}

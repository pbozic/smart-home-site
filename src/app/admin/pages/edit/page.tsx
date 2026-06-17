import { PageEditor } from "./PageEditor";

/**
 * `/admin/pages/edit?slug=…` — full-screen Puck visual editor (C-2). SERVER shell.
 *
 * STATIC ROUTE BY DESIGN: under `output: "export"` a `[slug]` dynamic segment
 * can't be statically enumerated for arbitrary future pages, so the editor is a
 * single static route that reads the target page from the `?slug=` query param
 * (default `"home"`). This server shell carries `force-static`; the interactive
 * Puck canvas lives in the client child `./PageEditor` and reads the slug from
 * `useSearchParams()` inside a `<Suspense>` boundary.
 *
 * The auth gate + WP-style chrome come from the `/admin` layout, so the editor
 * renders inside the protected shell and only needs the inner content.
 */
export const dynamic = "force-static";

export default function AdminPageEditorPage() {
  return <PageEditor />;
}

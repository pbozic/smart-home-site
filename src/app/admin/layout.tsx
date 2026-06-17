import type { ReactNode } from "react";
import { AdminShell } from "./AdminShell";

/**
 * `/admin/**` layout (B-1) — SERVER component.
 *
 * Holds the static-export route config and wraps every admin route in the
 * client `<AdminShell>` (the auth gate + WP-style chrome). Under
 * `output: "export"` a layout/page can be a server component that carries
 * `export const dynamic`; the interactive parts live in client children.
 *
 * `force-static` → this route prerenders a static shell at build time; the
 * shell then hydrates in the browser, where the Sanity session check runs.
 */
export const dynamic = "force-static";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

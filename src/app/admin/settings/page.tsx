import { SettingsPanel } from "./SettingsPanel";

/**
 * `/admin/settings` — site settings (D-1). SERVER shell.
 *
 * Holds the static-export route config; the interactive panel (which reads the
 * `siteSettings` summary on mount and deep-links into Sanity Studio for editing
 * per decision D2) lives in the client child `./SettingsPanel`. The auth gate +
 * WP-style chrome come from the `/admin` layout.
 *
 * `force-static` → this route prerenders a static shell at build time; the panel
 * then hydrates in the browser, where the session-authed Sanity reads run.
 */
export const dynamic = "force-static";

export default function AdminSettingsPage() {
  return <SettingsPanel />;
}

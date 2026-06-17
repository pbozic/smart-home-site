import { Dashboard } from "./Dashboard";

/**
 * `/admin` — dashboard landing (B-2). SERVER shell.
 *
 * Holds the static-export route config; the interactive dashboard (which fetches
 * live counts from Sanity on mount) lives in the client child `./Dashboard`.
 * The auth gate + chrome come from the `/admin` layout, so this only renders the
 * inner content.
 */
export const dynamic = "force-static";

export default function AdminDashboardPage() {
  return <Dashboard />;
}

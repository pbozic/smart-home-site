"use client";

import { usePathname } from "next/navigation";

/**
 * WP-style admin sidebar (B-1) — CLIENT component.
 *
 * Dark, fixed navigation rail (the signature admin chrome) with a clear active
 * state derived from `usePathname()`. Plain `<a href>` links are used on purpose
 * for robustness in the static export — every admin route is a real prerendered
 * page, so a full navigation is fine and avoids any client-router edge cases.
 *
 * Two external links sit apart from the in-app nav: the embedded Sanity Studio
 * (`/studio`) for field-heavy editing, and "Ogled strani" back to the public
 * site (`/`).
 */

type NavItem = { href: string; label: string };

/** Primary in-app navigation (matches the locked sidebar in ADMIN_PLAN). */
const NAV: NavItem[] = [
  { href: "/admin", label: "Nadzorna plošča" },
  { href: "/admin/pages", label: "Strani" },
  { href: "/admin/posts", label: "Aktualno" },
  { href: "/admin/projects", label: "Reference" },
  { href: "/admin/settings", label: "Nastavitve" },
];

/** External / out-of-app links shown below the primary nav. */
const EXTERNAL: NavItem[] = [
  { href: "/studio", label: "Sanity Studio" },
  { href: "/", label: "Ogled strani" },
];

/**
 * Whether `href` is the active route. `/admin` matches only the exact dashboard
 * path; the others match their path and any nested route (e.g. an open page
 * editor under `/admin/pages/...` keeps "Strani" highlighted).
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname() ?? "/admin";

  return (
    <nav
      aria-label="Skrbniška navigacija"
      className="flex h-full w-60 flex-col bg-ink-950 text-mist-200"
    >
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-500 text-sm font-bold text-ink-950">
          S
        </span>
        <span className="text-sm font-semibold tracking-wide text-white">
          Nadzorna plošča
        </span>
      </div>

      <ul className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-500 text-ink-950 shadow-sm"
                    : "text-mist-300 hover:bg-ink-800 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto border-t border-ink-700 px-3 py-4">
        <ul className="space-y-1">
          {EXTERNAL.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-mist-400 transition-colors hover:bg-ink-800 hover:text-white"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

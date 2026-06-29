/** Primary navigation (Slovenian). Shared by header + footer. */
export const navLinks = [
  { label: "Rešitev", href: "/#zakaj" },
  { label: "Funkcionalnosti", href: "/funkcionalnosti/" },
  { label: "Tehnologije", href: "/tehnologije/" },
  { label: "Cenik", href: "/cenik/" },
  { label: "O nas", href: "/o-nas/" },
  { label: "Kontakt", href: "/kontakt/" },
] as const;

function normalizePath(path: string): string {
  const withoutHash = path.split("#")[0];
  const trimmed = withoutHash.replace(/\/$/, "");
  return trimmed || "/";
}

/** True when the current route matches a nav link (hash links match the page path only). */
export function isNavLinkActive(pathname: string, href: string): boolean {
  const target = normalizePath(href.includes("#") ? href.split("#")[0]! : href);
  return normalizePath(pathname) === target;
}

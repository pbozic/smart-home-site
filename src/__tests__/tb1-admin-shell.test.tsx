import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

/**
 * TB-1 — admin auth gate (AdminShell).
 *
 * The gate calls `getCurrentUser()` (from `@/lib/sanityAuth`) on mount and shows
 * one of three states; we mock that module so the test controls auth without a
 * network. The authed shell renders the `Sidebar`, which uses `usePathname()`
 * from `next/navigation` — mocked here so it renders in jsdom.
 *
 *  (a) user → null   → login gate ("Prijava v nadzorno ploščo"); no child.
 *  (b) user → object → child sentinel + sidebar nav ("Strani").
 *
 * The gate resolves asynchronously (the session check is a promise), so we use
 * `findBy*` to await the resolved state.
 */

// Controlled per-test via the `currentUser` holder below.
const currentUser: { value: unknown } = { value: null };

vi.mock("@/lib/sanityAuth", () => ({
  getCurrentUser: () => Promise.resolve(currentUser.value),
  getLoginProviders: () => Promise.resolve([]),
  loginUrl: (url: string, returnTo: string) =>
    `${url}?origin=${encodeURIComponent(returnTo)}`,
  logout: () => Promise.resolve(),
}));

// Sidebar (rendered in the authed state) calls usePathname().
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

beforeEach(() => {
  currentUser.value = null;
});

afterEach(cleanup);

describe("TB-1: AdminShell auth gate", () => {
  it("logged out (getCurrentUser → null) shows the login gate and no child", async () => {
    currentUser.value = null;
    const { AdminShell } = await import("@/app/admin/AdminShell");

    render(
      <AdminShell>
        <div data-testid="secret">SECRET</div>
      </AdminShell>,
    );

    // Login gate copy resolves after the async session check.
    expect(
      await screen.findByText("Prijava v nadzorno ploščo"),
    ).toBeInTheDocument();
    // The protected child must NOT render while logged out.
    expect(screen.queryByTestId("secret")).not.toBeInTheDocument();
  });

  it("logged in (getCurrentUser → user) shows the child + sidebar nav", async () => {
    currentUser.value = {
      id: "u-1",
      name: "Ana Test",
      email: "ana@example.com",
    };
    const { AdminShell } = await import("@/app/admin/AdminShell");

    render(
      <AdminShell>
        <div data-testid="secret">SECRET</div>
      </AdminShell>,
    );

    // The protected child renders once authed.
    expect(await screen.findByTestId("secret")).toBeInTheDocument();
    // The WP-style sidebar nav is present (e.g. "Strani").
    expect(screen.getByText("Strani")).toBeInTheDocument();
    // The login gate copy must NOT be shown.
    expect(
      screen.queryByText("Prijava v nadzorno ploščo"),
    ).not.toBeInTheDocument();
  });
});

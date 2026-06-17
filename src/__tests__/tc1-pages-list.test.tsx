import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

/**
 * TC-1 — pages list (PagesList).
 *
 * The list loads `page` docs via `listDocs("page")` from `@/lib/sanityAdmin`,
 * which we mock so the test controls the rows without a network. We assert the
 * empty state, and that rows render an "Uredi" link pointing at the static
 * editor route `/admin/pages/edit?slug=<slug>`.
 */

// Controlled per-test; PagesList awaits listDocs() on mount.
const docs: { value: unknown[] } = { value: [] };

vi.mock("@/lib/sanityAdmin", () => ({
  listDocs: () => Promise.resolve(docs.value),
  createPage: () => Promise.resolve({ ok: false }),
  deleteDoc: () => Promise.resolve({ ok: false }),
}));

beforeEach(() => {
  docs.value = [];
});

afterEach(cleanup);

describe("TC-1: PagesList", () => {
  it("shows the empty state when there are no pages", async () => {
    docs.value = [];
    const { PagesList } = await import("@/app/admin/pages/PagesList");

    render(<PagesList />);

    expect(
      await screen.findByText(/Ni še nobene strani/),
    ).toBeInTheDocument();
  });

  it("renders rows with an Uredi link to the editor for each page", async () => {
    docs.value = [
      {
        _id: "page-1",
        type: "page",
        title: "O nas",
        slug: "o-nas",
        updatedAt: "2026-06-01T10:00:00Z",
        hasLayout: true,
      },
      {
        _id: "page-2",
        type: "page",
        title: "Kontakt",
        slug: "kontakt",
        updatedAt: "2026-06-02T10:00:00Z",
        hasLayout: false,
      },
    ];
    const { PagesList } = await import("@/app/admin/pages/PagesList");

    render(<PagesList />);

    // Titles render once loaded.
    expect(await screen.findByText("O nas")).toBeInTheDocument();
    expect(screen.getByText("Kontakt")).toBeInTheDocument();

    // Each row exposes an "Uredi" link to the static editor route with the slug.
    const editLinks = screen.getAllByRole("link", { name: "Uredi" });
    expect(editLinks).toHaveLength(2);
    const hrefs = editLinks.map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/admin/pages/edit?slug=o-nas");
    expect(hrefs).toContain("/admin/pages/edit?slug=kontakt");
  });
});

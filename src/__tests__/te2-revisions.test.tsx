import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

/**
 * TE-2 — revisions panel (RevisionsPanel).
 *
 * The panel loads `listRevisions(docId)` from `@/lib/sanityAdmin` on mount; we
 * mock that module so the test controls the rows without a network. We assert:
 *  - empty list → the "Ni razpoložljivih revizij." empty state.
 *  - one revision → a row with Predogled + Obnovi actions.
 *
 * `@measured/puck` is mocked defensively in case the panel pulls it in
 * transitively (it shouldn't — the panel only imports `@/lib/sanityAdmin`).
 */

vi.mock("@measured/puck", () => ({
  Puck: () => null,
  Render: () => null,
}));
vi.mock("@measured/puck/puck.css", () => ({}));

// Controlled per-test; the panel awaits listRevisions() on mount.
const revisions: { value: unknown[] } = { value: [] };

vi.mock("@/lib/sanityAdmin", () => ({
  listRevisions: () => Promise.resolve(revisions.value),
  getRevision: () => Promise.resolve(null),
  restoreRevision: () => Promise.resolve({ ok: false }),
}));

beforeEach(() => {
  revisions.value = [];
});

afterEach(cleanup);

const noop = () => {};

describe("TE-2: RevisionsPanel", () => {
  it("shows the empty state when there are no revisions", async () => {
    revisions.value = [];
    const { RevisionsPanel } = await import(
      "@/app/admin/pages/edit/RevisionsPanel"
    );

    render(
      <RevisionsPanel
        docId="page-1"
        onPreview={noop}
        onRestored={noop}
        onClose={noop}
      />,
    );

    expect(
      await screen.findByText("Ni razpoložljivih revizij."),
    ).toBeInTheDocument();
  });

  it("renders a row with Predogled + Obnovi actions for a revision", async () => {
    revisions.value = [
      { rev: "rev-abc", timestamp: "2026-06-10T12:00:00Z" },
    ];
    const { RevisionsPanel } = await import(
      "@/app/admin/pages/edit/RevisionsPanel"
    );

    render(
      <RevisionsPanel
        docId="page-1"
        onPreview={noop}
        onRestored={noop}
        onClose={noop}
      />,
    );

    // Both per-row actions render once the list resolves.
    expect(
      await screen.findByRole("button", { name: "Predogled" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Obnovi" }),
    ).toBeInTheDocument();
    // The empty state must NOT be shown when a revision exists.
    expect(
      screen.queryByText("Ni razpoložljivih revizij."),
    ).not.toBeInTheDocument();
  });
});

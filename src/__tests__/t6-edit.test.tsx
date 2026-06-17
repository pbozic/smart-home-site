import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

/**
 * T-6 — page editor graceful (admin).
 *
 * The visual editor now lives at `/admin/pages/edit?slug=` (the old standalone
 * `/edit` route was retired). The real Puck editor is too heavy for jsdom, so
 * `@measured/puck` is mocked with a trivial stub, and `next/navigation`'s
 * `useSearchParams` is mocked to return `?slug=home`. With no Sanity env the
 * editor must render and show the "Sanity ni konfiguriran" banner, and (after the
 * round-trip load resolves) the Puck canvas.
 */

vi.mock("@measured/puck", () => ({
  Puck: () => <div data-testid="puck" />,
  Render: () => null,
}));

vi.mock("@measured/puck/puck.css", () => ({}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("slug=home"),
}));

afterEach(cleanup);

describe("T-6: page editor graceful (mocked Puck + navigation)", () => {
  it("renders the editor and shows the no-Sanity banner", async () => {
    const { EditorCanvas } = await import(
      "@/app/admin/pages/edit/EditorCanvas"
    );
    render(<EditorCanvas />);

    // Banner renders immediately (not gated by the async layout load).
    expect(
      await screen.findByText(/Sanity ni konfiguriran/),
    ).toBeInTheDocument();
    // Puck canvas appears once the round-trip load resolves (empty, no env).
    expect(await screen.findByTestId("puck")).toBeInTheDocument();
  });
});

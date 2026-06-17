import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { PuckRender } from "@/components/PuckRender";

/**
 * T-5 — PuckRender fallback + render.
 *
 * - `data={null}` → local fallback stack (default Hero title appears).
 * - `data="not valid json"` → graceful fallback, no throw (default text appears).
 * - `data=JSON.stringify({ content: [], root: {} })` → renders without throwing.
 */

afterEach(cleanup);

const DEFAULT_HERO_TITLE = /Tehnološko napreden pametni dom/;

describe("T-5: PuckRender", () => {
  it("renders the local fallback when data is null", () => {
    render(<PuckRender data={null} />);
    expect(screen.getByText(DEFAULT_HERO_TITLE)).toBeInTheDocument();
  });

  it("falls back gracefully on invalid JSON (no throw)", () => {
    expect(() =>
      render(<PuckRender data={"not valid json"} />),
    ).not.toThrow();
    expect(screen.getByText(DEFAULT_HERO_TITLE)).toBeInTheDocument();
  });

  it("renders an empty valid Puck document without throwing", () => {
    expect(() =>
      render(
        <PuckRender data={JSON.stringify({ content: [], root: {} })} />,
      ),
    ).not.toThrow();
  });
});

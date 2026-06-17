import { describe, it, expect } from "vitest";

import {
  sanityFetch,
  getPagePuckData,
  sanityConfigured,
} from "@/lib/sanity";
import { savePuckData } from "@/lib/sanity.write";

/**
 * T-3 — fallback + write shape.
 *
 * No Sanity env is configured in the test environment, so `sanityConfigured`
 * is false. We assert the read helpers return their local fallbacks and the
 * write helper degrades gracefully (no throw) with a `{ ok: false, error }`.
 */

describe("T-3: Sanity fallback + write shape (no env)", () => {
  it("sanityConfigured is false with no env", () => {
    expect(sanityConfigured).toBe(false);
  });

  it("sanityFetch resolves to the fallback value when Sanity isn't configured", async () => {
    const fallback = { hello: "world" };
    const result = await sanityFetch("*[_type == 'page']", {}, fallback);
    expect(result).toBe(fallback);
  });

  it("getPagePuckData('home') resolves to null when Sanity isn't configured", async () => {
    const result = await getPagePuckData("home");
    expect(result).toBeNull();
  });

  it("savePuckData resolves gracefully (no throw) with { ok: false, error }", async () => {
    const result = await savePuckData("home", "{}");
    expect(result.ok).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(result.error!.length).toBeGreaterThan(0);
  });
});

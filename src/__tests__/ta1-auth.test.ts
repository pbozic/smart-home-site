import { describe, it, expect } from "vitest";

import {
  getCurrentUser,
  getLoginProviders,
  loginUrl,
} from "@/lib/sanityAuth";

/**
 * TA-1 — auth helpers (offline + pure-function).
 *
 * No Sanity env is configured in the test environment (`sanityConfigured` is
 * false), so the session-backed helpers degrade gracefully and NEVER hit the
 * network: `getCurrentUser()` → null, `getLoginProviders()` → []. `loginUrl()`
 * is a pure function, so we assert its URL shape directly (provider URL +
 * encoded `origin`).
 */

describe("TA-1: auth helpers (no Sanity env)", () => {
  it("getCurrentUser() resolves to null (no session, no throw)", async () => {
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("getLoginProviders() resolves to [] (no env, no throw)", async () => {
    await expect(getLoginProviders()).resolves.toEqual([]);
  });

  it("loginUrl() builds the provider URL with an encoded origin", () => {
    const providerUrl =
      "https://x.api.sanity.io/v1/auth/login/google";
    const returnTo = "http://localhost:3000/admin";

    const href = loginUrl(providerUrl, returnTo);

    expect(typeof href).toBe("string");
    // Starts with the provider URL + query string.
    expect(href.startsWith(`${providerUrl}?`)).toBe(true);
    // Carries the URL-encoded returnTo as the `origin` param.
    expect(href).toContain(
      `origin=${encodeURIComponent(returnTo)}`,
    );
    // Cookie/session login flow.
    expect(href).toContain("type=dual");
    // The encoded origin parses back to the original returnTo.
    const parsed = new URL(href);
    expect(parsed.searchParams.get("origin")).toBe(returnTo);
  });
});

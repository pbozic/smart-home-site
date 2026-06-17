import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * T-0 — build/export config present.
 *
 * Asserts the app ships the expected editing-layer deps, the build is a plain
 * static export (the admin + studio now SHIP, client-gated — D1, no strip step),
 * and `.env.example` documents the write token WITHOUT a `NEXT_PUBLIC_` prefix
 * (server-only secret — never exposed to the client). The green build is Lead-verified.
 */

const ROOT = process.cwd();

const pkg = JSON.parse(
  readFileSync(join(ROOT, "package.json"), "utf8"),
) as {
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
};

describe("T-0: app deps + build config", () => {
  it("declares the expected app dependencies", () => {
    for (const dep of [
      "@measured/puck",
      "sanity",
      "@sanity/vision",
      "next-sanity",
    ]) {
      expect(pkg.dependencies[dep], `missing dependency "${dep}"`).toBeDefined();
    }
  });

  it("build is a plain static export (no admin-strip step — admin ships gated, D1)", () => {
    expect(pkg.scripts.build).toContain("next build");
    expect(pkg.scripts.build).not.toContain("strip-admin-routes");
  });
});

describe("T-0: .env.example server-only write token", () => {
  it(".env.example exists and documents SANITY_API_WRITE_TOKEN without NEXT_PUBLIC_ prefix", () => {
    const env = readFileSync(join(ROOT, ".env.example"), "utf8");
    expect(env).toContain("SANITY_API_WRITE_TOKEN");
    // The write token must be server-only: no public-prefixed token variant.
    expect(env).not.toContain("NEXT_PUBLIC_SANITY_API_WRITE_TOKEN");
  });
});

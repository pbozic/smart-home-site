import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { schemaTypes } from "@/sanity/schemaTypes";

/**
 * T-2 — schemas + export config.
 *
 * Asserts the Sanity schema array contains the expected document types and that
 * `page` declares `slug`, `puckData`, `seo`. Then asserts the static export is
 * configured (`output: "export"`) and that the admin + studio routes SHIP in the
 * build (client-gated — D1), i.e. there is no post-build admin-strip step.
 */

const ROOT = process.cwd();

describe("T-2: schemas", () => {
  it("schemaTypes contains page, siteSettings, project, post documents", () => {
    const byName = Object.fromEntries(
      schemaTypes.map((t) => [t.name, t]),
    );
    // NOTE: the project doc is named "project" not "reference" — "reference" is
    // a Sanity-reserved type name.
    for (const name of ["page", "siteSettings", "project", "post"]) {
      expect(byName[name], `missing schema "${name}"`).toBeDefined();
      expect(byName[name].type).toBe("document");
    }
  });

  it("page schema has slug, puckData and seo fields", () => {
    const page = schemaTypes.find((t) => t.name === "page");
    expect(page).toBeDefined();
    const fieldNames = (page!.fields as Array<{ name: string }>).map(
      (f) => f.name,
    );
    expect(fieldNames).toContain("slug");
    expect(fieldNames).toContain("puckData");
    expect(fieldNames).toContain("seo");
  });
});

describe("T-2: export config (admin ships gated — D1)", () => {
  it("next.config.mjs sets output: 'export'", () => {
    const src = readFileSync(join(ROOT, "next.config.mjs"), "utf8");
    expect(src).toMatch(/output:\s*["']export["']/);
  });

  it("build is a plain static export with no admin-strip step", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    expect(pkg.scripts.build).toContain("next build");
    expect(pkg.scripts.build).not.toContain("strip-admin-routes");
  });

  it("the admin app and studio route ship in the build (source present)", () => {
    // D1: /admin + /studio are client-gated, not stripped — their source exists.
    expect(existsSync(join(ROOT, "src", "app", "admin", "layout.tsx"))).toBe(true);
    expect(
      existsSync(join(ROOT, "src", "app", "studio", "[[...tool]]", "page.tsx")),
    ).toBe(true);
    // The retired standalone /edit route is gone.
    expect(existsSync(join(ROOT, "src", "app", "edit"))).toBe(false);
  });
});

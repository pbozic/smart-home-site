import { describe, it, expect } from "vitest";

import { config } from "@/puck/puck.config";
import { homeContent } from "@/content/home";

/**
 * T-4 — every section is registered + the field-name contract is locked.
 *
 * Asserts the Puck config registers exactly the 9 sections, that each
 * component's `fields` keys are a superset of the matching `home.ts` slice's
 * top-level keys (content ↔ Puck field-name contract), and that all 9 appear
 * in the "Sekcije" category.
 */

const EXPECTED_COMPONENTS = [
  "Hero",
  "TrustBar",
  "Why",
  "Comparison",
  "Ecosystem",
  "Steps",
  "Pricing",
  "Faq",
  "FinalCta",
] as const;

/** Puck component name → `home.ts` slice key. */
const COMPONENT_TO_SLICE = {
  Hero: "hero",
  TrustBar: "trust",
  Why: "why",
  Comparison: "comparison",
  Ecosystem: "ecosystem",
  Steps: "steps",
  Pricing: "pricing",
  Faq: "faq",
  FinalCta: "finalCta",
} as const satisfies Record<(typeof EXPECTED_COMPONENTS)[number], keyof typeof homeContent>;

describe("T-4: every section registered + field-name contract", () => {
  it("config.components has exactly the 9 expected keys", () => {
    const keys = Object.keys(config.components).sort();
    expect(keys).toEqual([...EXPECTED_COMPONENTS].sort());
  });

  it("each component's fields are a superset of the matching home.ts slice keys", () => {
    for (const component of EXPECTED_COMPONENTS) {
      const sliceKey = COMPONENT_TO_SLICE[component];
      const sliceKeys = Object.keys(homeContent[sliceKey]);
      const fieldKeys = Object.keys(config.components[component].fields ?? {});

      for (const key of sliceKeys) {
        expect(
          fieldKeys,
          `${component}.fields is missing "${key}" (from home.${sliceKey})`,
        ).toContain(key);
      }
    }
  });

  it("all 9 sections appear in the 'Sekcije' category", () => {
    const sekcije = config.categories?.Sekcije;
    expect(sekcije).toBeDefined();
    const components = [...(sekcije?.components ?? [])].sort();
    expect(components).toEqual([...EXPECTED_COMPONENTS].sort());
  });
});

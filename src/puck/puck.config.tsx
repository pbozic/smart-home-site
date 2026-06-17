import type { Config, Field } from "@measured/puck";

import { homeContent } from "@/content/home";

import { Hero, type HeroProps } from "@/components/sections/Hero";
import { TrustBar, type TrustBarProps } from "@/components/sections/TrustBar";
import { Why, type WhyProps } from "@/components/sections/Why";
import { Comparison, type ComparisonProps } from "@/components/sections/Comparison";
import { Ecosystem, type EcosystemProps } from "@/components/sections/Ecosystem";
import { Steps, type StepsProps } from "@/components/sections/Steps";
import { Pricing, type PricingProps } from "@/components/sections/Pricing";
import { Faq, type FaqProps } from "@/components/sections/Faq";
import { FinalCta, type FinalCtaProps } from "@/components/sections/FinalCta";

/** Widen a string/number/boolean literal to its base primitive. */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T;

/**
 * Deep-writable helper.
 *
 * The section `*Props` types are derived from `homeContent` (declared `as const`),
 * so they are deeply `readonly`, literal-typed, and (for arrays) fixed-length
 * tuples. Puck's editor mutates props in place and adds/removes array items, so
 * the registry must work with mutable, widened shapes: `readonly` is stripped,
 * tuples become general arrays, and string/number/boolean literals widen to their
 * base primitives. Passing these widened props back into the section components is
 * safe — they accept the `readonly` (`Partial<…>`) shape, and the widened values
 * are assignable to it.
 */
type Writable<T> = T extends readonly (infer U)[]
  ? Writable<U>[]
  : T extends object
    ? { -readonly [K in keyof T]: Writable<T[K]> }
    : Widen<T>;

/**
 * Puck component prop map. Keys are the registered component names; each value is
 * the mutable, widened version of the matching section's `*Props` type.
 */
export type Props = {
  Hero: Writable<HeroProps>;
  TrustBar: Writable<TrustBarProps>;
  Why: Writable<WhyProps>;
  Comparison: Writable<ComparisonProps>;
  Ecosystem: Writable<EcosystemProps>;
  Steps: Writable<StepsProps>;
  Pricing: Writable<PricingProps>;
  Faq: Writable<FaqProps>;
  FinalCta: Writable<FinalCtaProps>;
};

/** Clone a `home.ts` slice into a mutable default-props object for Puck. */
function defaults<K extends keyof typeof homeContent>(key: K) {
  return structuredClone(homeContent[key]) as Writable<(typeof homeContent)[K]>;
}

/**
 * Puck array field for a list of plain strings (e.g. `hero.badges`).
 *
 * Puck's `ArrayField` types `arrayFields` against an array-of-objects item shape,
 * so a `string[]` prop needs a small, localised cast. Editing happens through a
 * single text input per row; the rendered value stays a plain `string[]`.
 */
function stringArrayField(label: string): Field<string[]> {
  return {
    type: "array",
    label,
    arrayFields: {
      // Puck renders each primitive row through this single text field.
      _: { type: "text" },
    },
    getItemSummary: (item: unknown) => String(item ?? ""),
  } as unknown as Field<string[]>;
}

/** CTA `{ label, href }` object field (shared shape across several sections). */
const ctaField: Field<{ label: string; href: string }> = {
  type: "object",
  label: "Gumb (CTA)",
  objectFields: {
    label: { type: "text", label: "Besedilo" },
    href: { type: "text", label: "Povezava" },
  },
};

/**
 * Bridge a Puck `render` callback to a section component.
 *
 * Puck passes mutable, widened props (plus its own `id`/`puck`/`editMode` keys).
 * The section components were authored against the literal, fixed-length-tuple
 * `*Props` derived from `home.ts as const`, so feeding edited props in requires a
 * boundary cast through `unknown`. The runtime shapes match; only the literal vs.
 * widened static types differ. Centralising it here keeps the cast in one place.
 */
function renderWith<P>(
  Section: (props: Partial<P>) => React.JSX.Element,
): (props: object) => React.JSX.Element {
  return (props) => <Section {...(props as unknown as Partial<P>)} />;
}

export const config: Config<Props> = {
  categories: {
    Sekcije: {
      title: "Sekcije",
      components: [
        "Hero",
        "TrustBar",
        "Why",
        "Comparison",
        "Ecosystem",
        "Steps",
        "Pricing",
        "Faq",
        "FinalCta",
      ],
    },
  },
  components: {
    Hero: {
      label: "Hero",
      fields: {
        eyebrow: { type: "text", label: "Nadnaslov" },
        title: { type: "textarea", label: "Naslov" },
        subtitle: { type: "textarea", label: "Podnaslov" },
        priceLabel: { type: "text", label: "Oznaka cene" },
        price: { type: "text", label: "Cena" },
        primaryCta: ctaField,
        secondaryCta: ctaField,
        badges: stringArrayField("Značke"),
      },
      defaultProps: defaults("hero"),
      render: renderWith<HeroProps>(Hero),
    },

    TrustBar: {
      label: "Zaupanje",
      fields: {
        title: { type: "text", label: "Naslov" },
        note: { type: "text", label: "Opomba" },
      },
      defaultProps: defaults("trust"),
      render: renderWith<TrustBarProps>(TrustBar),
    },

    Why: {
      label: "Zakaj",
      fields: {
        eyebrow: { type: "text", label: "Nadnaslov" },
        title: { type: "text", label: "Naslov" },
        items: {
          type: "array",
          label: "Prednosti",
          getItemSummary: (item) => item.title || "Prednost",
          arrayFields: {
            icon: { type: "text", label: "Ikona" },
            title: { type: "text", label: "Naslov" },
            text: { type: "textarea", label: "Besedilo" },
          },
        },
      },
      defaultProps: defaults("why"),
      render: renderWith<WhyProps>(Why),
    },

    Comparison: {
      label: "Primerjava",
      fields: {
        eyebrow: { type: "text", label: "Nadnaslov" },
        title: { type: "text", label: "Naslov" },
        wireless: {
          type: "object",
          label: "Brezžično",
          objectFields: {
            label: { type: "text", label: "Naslov stolpca" },
            points: stringArrayField("Točke"),
          },
        },
        wired: {
          type: "object",
          label: "Žično",
          objectFields: {
            label: { type: "text", label: "Naslov stolpca" },
            points: stringArrayField("Točke"),
          },
        },
      },
      defaultProps: defaults("comparison"),
      render: renderWith<ComparisonProps>(Comparison),
    },

    Ecosystem: {
      label: "Ekosistem",
      fields: {
        eyebrow: { type: "text", label: "Nadnaslov" },
        title: { type: "text", label: "Naslov" },
        subtitle: { type: "textarea", label: "Podnaslov" },
      },
      defaultProps: defaults("ecosystem"),
      render: renderWith<EcosystemProps>(Ecosystem),
    },

    Steps: {
      label: "Koraki",
      fields: {
        eyebrow: { type: "text", label: "Nadnaslov" },
        title: { type: "text", label: "Naslov" },
        items: {
          type: "array",
          label: "Koraki",
          getItemSummary: (item) => item.title || "Korak",
          arrayFields: {
            n: { type: "text", label: "Številka" },
            title: { type: "text", label: "Naslov" },
            text: { type: "textarea", label: "Besedilo" },
          },
        },
      },
      defaultProps: defaults("steps"),
      render: renderWith<StepsProps>(Steps),
    },

    Pricing: {
      label: "Cenik",
      fields: {
        eyebrow: { type: "text", label: "Nadnaslov" },
        title: { type: "text", label: "Naslov" },
        price: { type: "text", label: "Cena" },
        priceNote: { type: "text", label: "Opomba cene" },
        features: stringArrayField("Lastnosti"),
        cta: ctaField,
      },
      defaultProps: defaults("pricing"),
      render: renderWith<PricingProps>(Pricing),
    },

    Faq: {
      label: "Vprašanja (FAQ)",
      fields: {
        eyebrow: { type: "text", label: "Nadnaslov" },
        title: { type: "text", label: "Naslov" },
        items: {
          type: "array",
          label: "Vprašanja",
          getItemSummary: (item) => item.q || "Vprašanje",
          arrayFields: {
            q: { type: "text", label: "Vprašanje" },
            a: { type: "textarea", label: "Odgovor" },
          },
        },
      },
      defaultProps: defaults("faq"),
      render: renderWith<FaqProps>(Faq),
    },

    FinalCta: {
      label: "Zaključni poziv",
      fields: {
        title: { type: "text", label: "Naslov" },
        subtitle: { type: "textarea", label: "Podnaslov" },
        cta: ctaField,
      },
      defaultProps: defaults("finalCta"),
      render: renderWith<FinalCtaProps>(FinalCta),
    },
  },
};

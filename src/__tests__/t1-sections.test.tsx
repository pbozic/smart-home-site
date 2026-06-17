import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { Hero, type HeroProps } from "@/components/sections/Hero";
import { TrustBar, type TrustBarProps } from "@/components/sections/TrustBar";
import { Why, type WhyProps } from "@/components/sections/Why";
import { Comparison, type ComparisonProps } from "@/components/sections/Comparison";
import { Ecosystem, type EcosystemProps } from "@/components/sections/Ecosystem";
import { Steps, type StepsProps } from "@/components/sections/Steps";
import { Pricing, type PricingProps } from "@/components/sections/Pricing";
import { Faq, type FaqProps } from "@/components/sections/Faq";
import { FinalCta, type FinalCtaProps } from "@/components/sections/FinalCta";

/**
 * T-1 — sections render from props.
 *
 * Each of the 9 sections is rendered prop-less (defaults pulled from `home.ts`)
 * and we assert a known default string appears. Then we render with an override
 * prop and assert the override wins (proving the prop-merge `{...default, ...props}`).
 *
 * Note: the `*Props` types are derived from `home.ts as const`, so `title` is a
 * narrow string LITERAL type. Overriding it with arbitrary text is a valid
 * runtime use (the section widens to `string` internally), so we provide the
 * override through a typed `Partial<…>` cast — this is purely a static-type
 * accommodation, the runtime value flows through unchanged.
 */

afterEach(cleanup);

/** Override the `title` prop with arbitrary text, satisfying the literal type. */
const titleOverride = <P,>(title: string) =>
  ({ title }) as unknown as Partial<P>;

describe("T-1: sections render from props", () => {
  it("Hero: default + override", () => {
    const { rerender } = render(<Hero />);
    expect(
      screen.getByText(/Tehnološko napreden pametni dom/),
    ).toBeInTheDocument();

    rerender(<Hero {...titleOverride<HeroProps>("POVOZI")} />);
    expect(screen.getByText("POVOZI")).toBeInTheDocument();
  });

  it("TrustBar: default + override (client component, imports brand)", () => {
    render(<TrustBar />);
    expect(
      screen.getByText("Delujemo z napravami, ki jim zaupate"),
    ).toBeInTheDocument();
    // brand ecosystem wordmark renders too
    expect(screen.getByText("Home Assistant")).toBeInTheDocument();
    cleanup();

    render(<TrustBar {...titleOverride<TrustBarProps>("POVOZI")} />);
    expect(screen.getByText("POVOZI")).toBeInTheDocument();
  });

  it("Why: default + override", () => {
    render(<Why />);
    expect(
      screen.getByText("Udobje, varnost in prihranek — vsak dan"),
    ).toBeInTheDocument();
    cleanup();

    render(<Why {...titleOverride<WhyProps>("POVOZI")} />);
    expect(screen.getByText("POVOZI")).toBeInTheDocument();
  });

  it("Comparison: default + override", () => {
    render(<Comparison />);
    expect(screen.getByText("Zakaj brezžični pametni dom")).toBeInTheDocument();
    cleanup();

    render(<Comparison {...titleOverride<ComparisonProps>("POVOZI")} />);
    expect(screen.getByText("POVOZI")).toBeInTheDocument();
  });

  it("Ecosystem: default + override (client component, imports brand)", () => {
    render(<Ecosystem />);
    expect(
      screen.getByText("Odprt sistem, zgrajen na Home Assistant"),
    ).toBeInTheDocument();
    cleanup();

    render(<Ecosystem {...titleOverride<EcosystemProps>("POVOZI")} />);
    expect(screen.getByText("POVOZI")).toBeInTheDocument();
  });

  it("Steps: default + override", () => {
    render(<Steps />);
    expect(
      screen.getByText("V 3 korakih do pametnega doma"),
    ).toBeInTheDocument();
    cleanup();

    render(<Steps {...titleOverride<StepsProps>("POVOZI")} />);
    expect(screen.getByText("POVOZI")).toBeInTheDocument();
  });

  it("Pricing: default + override", () => {
    render(<Pricing />);
    expect(
      screen.getByText("Dostopna cena za celovito rešitev"),
    ).toBeInTheDocument();
    cleanup();

    render(<Pricing {...titleOverride<PricingProps>("POVOZI")} />);
    expect(screen.getByText("POVOZI")).toBeInTheDocument();
  });

  it("Faq: default + override (client component, useState)", () => {
    render(<Faq />);
    expect(screen.getByText("Imate vprašanja?")).toBeInTheDocument();
    cleanup();

    render(<Faq {...titleOverride<FaqProps>("POVOZI")} />);
    expect(screen.getByText("POVOZI")).toBeInTheDocument();
  });

  it("FinalCta: default + override", () => {
    render(<FinalCta />);
    expect(
      screen.getByText("Pametni dom za vsak dom — že danes"),
    ).toBeInTheDocument();
    cleanup();

    render(<FinalCta {...titleOverride<FinalCtaProps>("POVOZI")} />);
    expect(screen.getByText("POVOZI")).toBeInTheDocument();
  });
});

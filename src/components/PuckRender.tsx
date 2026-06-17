import { Render, type Data } from "@measured/puck";

import { config } from "@/puck/puck.config";

import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Why } from "@/components/sections/Why";
import { Comparison } from "@/components/sections/Comparison";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { Steps } from "@/components/sections/Steps";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

/**
 * Local default section stack — mirrors the current homepage composition
 * (`src/app/page.tsx`). Rendered prop-less, so each section falls back to its
 * `home.ts` defaults. Used whenever there's no Puck layout to render.
 */
function LocalFallback() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Why />
      <Comparison />
      <Ecosystem />
      <Steps />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}

/**
 * Public render pipeline.
 *
 * Renders a saved Puck layout (stringified JSON) through `<Render>`. When no
 * layout exists, or the JSON can't be parsed, it falls back to the local default
 * section stack — so the site always renders from local content, even with no
 * Sanity data. Server-compatible (no client-only hooks).
 */
export function PuckRender({ data }: { data: string | null }) {
  if (data) {
    try {
      const parsed = JSON.parse(data) as Data;
      return <Render config={config} data={parsed} />;
    } catch (err) {
      console.warn("[PuckRender] invalid Puck JSON, using local fallback:", err);
    }
  }

  return <LocalFallback />;
}

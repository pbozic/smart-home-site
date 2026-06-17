import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Why } from "@/components/sections/Why";
import { Comparison } from "@/components/sections/Comparison";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { Steps } from "@/components/sections/Steps";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { getPagePuckData } from "@/lib/sanity";

export default async function HomePage() {
  // At build time, pull this page's saved Puck layout from Sanity. With no
  // Sanity configured this is `null`, so we render the local section stack below
  // (byte-identical to before). `PuckRender` — and Puck's `<Render>` runtime — is
  // imported lazily ONLY when there's a layout to render, so the public homepage
  // bundle stays lean for the common (no-data / local-content) case.
  const puckData = await getPagePuckData("home");

  if (puckData) {
    const { PuckRender } = await import("@/components/PuckRender");
    return <PuckRender data={puckData} />;
  }

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

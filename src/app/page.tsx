import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Why } from "@/components/sections/Why";
import { Comparison } from "@/components/sections/Comparison";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { Steps } from "@/components/sections/Steps";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

export default function HomePage() {
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

import Link from "next/link";
import { homeContent } from "@/content/home";
import { PhoneMockup } from "@/components/graphics/PhoneMockup";
import { ArrowRight } from "@/components/icons";

export type HeroProps = typeof homeContent.hero;

export function Hero(props: Partial<HeroProps> = {}) {
  const h = { ...homeContent.hero, ...props };
  return (
    <section className="bg-hero relative overflow-hidden">
      {/* faint grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid-faint opacity-[0.5]"
        style={{ backgroundSize: "44px 44px", maskImage: "radial-gradient(70% 60% at 50% 0%, black, transparent)" }}
        aria-hidden
      />
      <div className="container-x relative grid items-center gap-12 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="animate-fade-up">
          <span className="eyebrow">{h.eyebrow}</span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            {h.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-mist-300">
            {h.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={h.primaryCta.href} className="btn-primary">
              {h.primaryCta.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={h.secondaryCta.href} className="btn-ghost">
              {h.secondaryCta.label}
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            {h.badges.map((b) => (
              <span key={b} className="text-sm text-mist-400">
                ✓ {b}
              </span>
            ))}
          </div>

          <p className="mt-6 text-sm text-mist-400">
            {h.priceLabel}{" "}
            <span className="text-2xl font-bold text-gradient align-middle">
              {h.price}
            </span>
          </p>
        </div>

        {/* phone mockup */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-0 -z-10 bg-radial-brand blur-2xl" aria-hidden />
          <div className="animate-floaty">
            <PhoneMockup className="mx-auto h-auto w-[260px] drop-shadow-2xl sm:w-[300px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

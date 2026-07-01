import { homeContent } from "@/content/home";
import { ecosystem } from "@/lib/brand";

/** "Works with" brand strip — text wordmarks (no third-party logos shipped). */
export type TrustBarProps = typeof homeContent.trust;

export function TrustBar(props: Partial<TrustBarProps> = {}) {
  const t = { ...homeContent.trust, ...props };
  const brands = ecosystem.brands.map((b) => b.name);

  return (
    <section className="relative overflow-hidden border-y border-white/5">
      <div
        className="pointer-events-none absolute inset-0 bg-radial-brand opacity-30"
        aria-hidden
      />
      <div className="container-x relative py-12 sm:py-14">
        <p className="text-center text-sm font-medium tracking-wide text-mist-300">
          {t.title}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {/* hub — featured pill */}
          <span className="inline-flex items-center rounded-full border border-brand-400/35 bg-gradient-to-r from-brand-400/15 to-accent-500/10 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-4px_rgba(61,214,245,0.25)]">
            {ecosystem.hub.name}
          </span>

          {brands.map((name) => (
            <span
              key={name}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-mist-200 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
            >
              {name}
            </span>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-mist-400">{t.note}</p>
      </div>
    </section>
  );
}

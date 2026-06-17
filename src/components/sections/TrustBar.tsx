import { homeContent } from "@/content/home";
import { ecosystem } from "@/lib/brand";

/** "Works with" brand strip — text wordmarks (no third-party logos shipped). */
export type TrustBarProps = typeof homeContent.trust;

export function TrustBar(props: Partial<TrustBarProps> = {}) {
  const t = { ...homeContent.trust, ...props };
  return (
    <section className="border-y border-white/5 bg-ink-900/60">
      <div className="container-x py-10">
        <p className="text-center text-sm text-mist-400">{t.title}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {[ecosystem.hub.name, ...ecosystem.brands.map((b) => b.name)].map((name) => (
            <span
              key={name}
              className="text-lg font-semibold tracking-tight text-mist-300/70 transition-colors hover:text-white"
            >
              {name}
            </span>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-mist-400">{t.note}</p>
      </div>
    </section>
  );
}

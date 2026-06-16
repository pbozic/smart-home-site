import { homeContent } from "@/content/home";
import { ecosystem } from "@/lib/brand";
import { HubDiagram } from "@/components/graphics/HubDiagram";

export function Ecosystem() {
  const e = homeContent.ecosystem;
  return (
    <section className="section">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <div className="relative mx-auto max-w-md">
            <div className="absolute inset-0 -z-10 bg-radial-brand blur-2xl" aria-hidden />
            <HubDiagram className="h-auto w-full" />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <span className="eyebrow">{e.eyebrow}</span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{e.title}</h2>
          <p className="mt-4 max-w-lg text-mist-300">{e.subtitle}</p>

          {/* supported brands */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {ecosystem.brands.map((b) => (
              <div
                key={b.name}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <p className="font-semibold text-white">{b.name}</p>
                <p className="text-xs text-mist-400">{b.note}</p>
              </div>
            ))}
          </div>

          {/* connectivity / roadmap */}
          <div className="mt-6 flex flex-wrap gap-2">
            {ecosystem.connectivity.map((c) => (
              <span
                key={c.name}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  c.available
                    ? "border border-brand-400/30 bg-brand-400/10 text-brand-200"
                    : "border border-accent-400/30 bg-accent-500/10 text-accent-400"
                }`}
              >
                {c.name}
                {!c.available && "label" in c && (
                  <span className="rounded-full bg-accent-500/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

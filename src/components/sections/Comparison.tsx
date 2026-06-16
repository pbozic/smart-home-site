import { homeContent } from "@/content/home";
import { Check, Cross } from "@/components/icons";

export function Comparison() {
  const c = homeContent.comparison;
  return (
    <section className="section bg-ink-900/40">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{c.eyebrow}</span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{c.title}</h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Wireless — highlighted */}
          <div className="relative rounded-3xl border border-brand-400/30 bg-gradient-to-b from-brand-400/[0.08] to-transparent p-8 shadow-glow">
            <div className="absolute right-6 top-6 rounded-full bg-brand-400/15 px-3 py-1 text-xs font-semibold text-brand-200">
              Priporočeno
            </div>
            <h3 className="text-xl font-semibold text-white">{c.wireless.label}</h3>
            <ul className="mt-6 space-y-3">
              {c.wireless.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-mist-200">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Wired */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
            <h3 className="text-xl font-semibold text-mist-200">{c.wired.label}</h3>
            <ul className="mt-6 space-y-3">
              {c.wired.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-mist-400">
                  <Cross className="mt-0.5 h-5 w-5 shrink-0 text-mist-400/70" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

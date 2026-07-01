import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FinalCta } from "@/components/sections/FinalCta";
import { Comparison } from "@/components/sections/Comparison";
import { HubDiagram } from "@/components/graphics/HubDiagram";
import { FeatureIcon, Check } from "@/components/icons";
import { technologyContent } from "@/content/technology";
import { ecosystem } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Tehnologije",
  description:
    "Na čem gradimo: odprt in lokalen Home Assistant, naprave Shelly, Sonoff, Aqara in Philips Hue, povezljivost Wi-Fi, Zigbee in Bluetooth (Matter in Thread kmalu). Sistem ostane vaš.",
};

export default function TehnologijePage() {
  const t = technologyContent;
  return (
    <>
      <PageHeader
        eyebrow="Tehnologije"
        title="Na čem gradimo vaš pametni dom"
        subtitle={t.intro}
      />

      {/* Hub — Home Assistant, open + local */}
      <section className="section pt-0">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-0 -z-10 bg-radial-brand blur-2xl" aria-hidden />
              <HubDiagram className="h-auto w-full" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="eyebrow">{t.hub.eyebrow}</span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t.hub.title}</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-mist-300">{t.hub.text}</p>
          </div>
        </div>
      </section>
      <div>
        <img src="/assets/home-assistant-use-logos.svg" alt="Home Assistant ekosistem z logotipi blagovnih znamk" />
      </div>

      {/* Open / local / yours — the three trust pillars */}
      <section className="section bg-ink-900/40">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">{t.pillars.eyebrow}</span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t.pillars.title}</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {t.pillars.items.map((p) => (
              <div key={p.title} className="card">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-400/10 text-brand-300 ring-1 ring-brand-400/20">
                  <FeatureIcon name={p.icon} />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-300">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported brands + connectivity */}
      <section className="section">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">{t.brands.eyebrow}</span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t.brands.title}</h2>
            <p className="mt-4 text-mist-300">{t.brands.text}</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
            {ecosystem.brands.map((b) => (
              <div
                key={b.name}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
              >
                <p className="font-semibold text-white">{b.name}</p>
                <p className="mt-0.5 text-xs text-mist-400">{b.note}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-2xl text-center">
            <span className="eyebrow">{t.connectivity.eyebrow}</span>
            <h3 className="mt-4 text-2xl font-bold sm:text-3xl">{t.connectivity.title}</h3>
            <p className="mt-4 text-mist-300">{t.connectivity.text}</p>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
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
      </section>

      {/* Custom dashboard over the open system */}
      <section className="section bg-ink-900/40">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">{t.dashboard.eyebrow}</span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t.dashboard.title}</h2>
            <p className="mt-4 leading-relaxed text-mist-300">{t.dashboard.text}</p>
          </div>
        </div>
      </section>

      {/* Honest scope — what this means in practice */}
      <section className="section">
        <div className="container-x">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-4xl border border-brand-400/20 bg-gradient-to-b from-brand-400/[0.06] to-transparent p-8 shadow-glow sm:p-10">
            <span className="eyebrow">{t.honest.eyebrow}</span>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">{t.honest.title}</h2>
            <ul className="mt-6 grid gap-3">
              {t.honest.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-mist-200">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Full wireless-vs-wired comparison (teaser of this lives on the homepage) */}
      <Comparison />

      <FinalCta />
    </>
  );
}

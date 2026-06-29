import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { featuresContent } from "@/content/features";
import { FeatureIcon, Check } from "@/components/icons";
import { FinalCta } from "@/components/sections/FinalCta";

export const metadata: Metadata = {
  title: "Funkcionalnosti",
  description: "Razsvetljava, varnost, ogrevanje in poraba energije — vse v enem pametnem domu.",
};

export default function FunkcionalnostiPage() {
  const f = featuresContent;
  return (
    <>
      <PageHeader
        eyebrow="Funkcionalnosti"
        title="Kaj zna vaš pametni dom"
        subtitle={f.intro}
      />

      {/* Custom dashboard highlight — our designed UI vs. a raw HA panel */}
      <section className="section pt-0">
        <div className="container-x">
          <div className="overflow-hidden rounded-4xl border border-brand-400/20 bg-gradient-to-b from-brand-400/[0.07] to-transparent p-8 shadow-glow sm:p-10">
            <span className="eyebrow">{f.dashboard.eyebrow}</span>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">{f.dashboard.title}</h2>
            <p className="mt-4  leading-relaxed text-mist-300">{f.dashboard.text}</p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {f.dashboard.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-mist-200">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-x grid gap-6 lg:grid-cols-2">
          {f.groups.map((g) => (
            <div key={g.title} className="card hover:border-brand-400/30">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-400/10 text-brand-300 ring-1 ring-brand-400/20">
                <FeatureIcon name={g.icon} />
              </div>
              <h2 className="mt-5 text-xl font-semibold">{g.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-mist-300">{g.text}</p>
              <ul className="mt-5 space-y-2">
                {g.points.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-mist-200">
                    <Check className="h-4 w-4 shrink-0 text-brand-300" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <FinalCta />
    </>
  );
}

import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { PageHeader } from "@/components/PageHeader";
import { FinalCta } from "@/components/sections/FinalCta";

export const metadata: Metadata = {
  title: "O nas",
  description: `Spoznajte ${brand.name} — ekipo za sodoben, brezžični pametni dom.`,
};

const values = [
  {
    title: "Odprt sistem, brez lock-ina",
    text: "Gradimo na Home Assistant — odprti platformi, ki ni vezana na enega proizvajalca. Vaš dom ostane v vaših rokah.",
  },
  {
    title: "Brez nepotrebnih posegov",
    text: "Brezžične rešitve pomenijo hitro namestitev brez razbijanja sten in dragih gradbenih del.",
  },
  {
    title: "Podpora tudi po namestitvi",
    text: "Ne izginemo po predaji. Sistem nadgradimo, prilagodimo in vam pomagamo, ko nas potrebujete.",
  },
];

export default function ONasPage() {
  return (
    <>
      <PageHeader
        eyebrow="O nas"
        title={`Pametni dom, ki ga razumete`}
        subtitle={`Pri ${brand.name} verjamemo, da mora biti pametni dom preprost, odprt in dostopen — ne zapleten projekt za izbrane.`}
      />

      <section className="section">
        <div className="container-x grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="card">
              <h2 className="text-lg font-semibold">{v.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-mist-300">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="container-x mt-10">
          <div className="card mx-auto max-w-3xl text-center">
            <p className="text-lg leading-relaxed text-mist-200">
              Združujemo vodilne znamke pametnih naprav — Shelly, Sonoff, Aqara
              in Philips Hue — pod eno aplikacijo. Naša naloga je, da tehnologijo
              naredimo nevidno, uporabo pa preprosto.
            </p>
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}

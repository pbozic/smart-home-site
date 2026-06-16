import Link from "next/link";
import { homeContent } from "@/content/home";
import { Check, ArrowRight } from "@/components/icons";

export function Pricing() {
  const p = homeContent.pricing;
  return (
    <section id="cenik" className="section">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{p.eyebrow}</span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{p.title}</h2>
        </div>

        <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-4xl border border-brand-400/20 bg-gradient-to-b from-brand-400/[0.07] to-transparent p-8 shadow-glow sm:p-10">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm text-mist-300">{p.priceNote}</p>
            <p className="mt-2 text-5xl font-bold text-gradient sm:text-6xl">
              {p.price}
            </p>

            <ul className="mt-8 grid w-full gap-3 text-left sm:grid-cols-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-mist-200">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
                  {f}
                </li>
              ))}
            </ul>

            <Link href={p.cta.href} className="btn-primary mt-9">
              {p.cta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

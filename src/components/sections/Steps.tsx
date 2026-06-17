import { homeContent } from "@/content/home";

export type StepsProps = typeof homeContent.steps;

export function Steps(props: Partial<StepsProps> = {}) {
  const s = { ...homeContent.steps, ...props };
  return (
    <section id="kako" className="section bg-ink-900/40">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{s.eyebrow}</span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{s.title}</h2>
        </div>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {/* connecting line on desktop */}
          <div
            className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent md:block"
            aria-hidden
          />
          {s.items.map((step) => (
            <div key={step.n} className="relative card">
              <span className="text-4xl font-bold text-gradient">{step.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-300">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

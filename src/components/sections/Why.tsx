import { homeContent } from "@/content/home";
import { FeatureIcon } from "@/components/icons";

export function Why() {
  const w = homeContent.why;
  return (
    <section id="zakaj" className="section">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{w.eyebrow}</span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{w.title}</h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {w.items.map((item) => (
            <div key={item.title} className="card group hover:border-brand-400/30">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-400/10 text-brand-300 ring-1 ring-brand-400/20 transition-transform group-hover:scale-110">
                <FeatureIcon name={item.icon} />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-300">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { homeContent } from "@/content/home";
import { ArrowRight } from "@/components/icons";

export function FinalCta() {
  const c = homeContent.finalCta;
  return (
    <section className="section">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-5xl border border-white/10 bg-gradient-to-br from-brand-500/15 via-accent-600/10 to-transparent p-10 text-center sm:p-16">
          <div className="absolute inset-0 -z-10 bg-grid-faint opacity-30" style={{ backgroundSize: "40px 40px" }} aria-hidden />
          <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">
            {c.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-mist-300">{c.subtitle}</p>
          <Link href={c.cta.href} className="btn-primary mt-8">
            {c.cta.label} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

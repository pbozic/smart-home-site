"use client";

import { useState } from "react";
import { homeContent } from "@/content/home";

export type FaqProps = typeof homeContent.faq;

export function Faq(props: Partial<FaqProps> = {}) {
  const f = { ...homeContent.faq, ...props };
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section bg-ink-900/40">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{f.eyebrow}</span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{f.title}</h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
          {f.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="font-medium text-white">{item.q}</span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/15 text-brand-300 transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid overflow-hidden px-6 transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
                  }`}
                >
                  <p className="min-h-0 text-sm leading-relaxed text-mist-300">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

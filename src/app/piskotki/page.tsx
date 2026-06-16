import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Piškotki",
  description: "Uporaba piškotkov na spletni strani.",
};

export default function PiskotkiPage() {
  return (
    <>
      <PageHeader eyebrow="Pravno" title="Piškotki" />
      <section className="section">
        <div className="container-x mx-auto max-w-3xl space-y-5 text-mist-300">
          <p>
            Spletna stran uporablja nujne piškotke za delovanje in lahko
            uporablja analitične piškotke za izboljšanje uporabniške izkušnje.
          </p>
          <p>
            Nastavitve piškotkov lahko kadar koli spremenite v svojem brskalniku.
            Z nadaljnjo uporabo strani soglašate z uporabo piškotkov.
          </p>
          <p>
            Za vprašanja smo na voljo na{" "}
            <a className="text-brand-300 hover:underline" href={`mailto:${brand.email}`}>
              {brand.email}
            </a>
            .
          </p>
          <p className="text-sm text-mist-400">
            Vzorčno besedilo — prilagodite ga dejanski uporabi piškotkov in
            morebitnemu orodju za privolitev.
          </p>
        </div>
      </section>
    </>
  );
}

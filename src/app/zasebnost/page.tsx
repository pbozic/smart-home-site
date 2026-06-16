import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Politika zasebnosti",
  description: "Kako ravnamo z vašimi osebnimi podatki.",
};

export default function ZasebnostPage() {
  return (
    <>
      <PageHeader eyebrow="Pravno" title="Politika zasebnosti" />
      <section className="section">
        <div className="container-x mx-auto max-w-3xl space-y-5 text-mist-300">
          <p>
            {brand.name} spoštuje vašo zasebnost. Osebne podatke, ki nam jih
            posredujete prek kontaktnega obrazca (ime, e-pošta, telefon,
            sporočilo), uporabljamo izključno za odgovor na vaše povpraševanje.
          </p>
          <p>
            Podatkov ne posredujemo tretjim osebam in jih hranimo le toliko časa,
            kolikor je potrebno za obravnavo vašega povpraševanja oziroma skladno
            z zakonskimi obveznostmi.
          </p>
          <p>
            Kadar koli lahko zahtevate vpogled, popravek ali izbris svojih
            podatkov na{" "}
            <a className="text-brand-300 hover:underline" href={`mailto:${brand.email}`}>
              {brand.email}
            </a>
            .
          </p>
          <p className="text-sm text-mist-400">
            To je vzorčno besedilo — pred objavo ga prilagodite svojim dejanskim
            postopkom in pravnim zahtevam (GDPR/ZVOP-2).
          </p>
        </div>
      </section>
    </>
  );
}

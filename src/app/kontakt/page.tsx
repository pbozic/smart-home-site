import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/ContactForm";
import { Phone, Mail } from "@/components/icons";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Stopite v stik za brezplačen posvet o pametnem domu.",
};

export default function KontaktPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kontakt"
        title="Stopite v stik z nami"
        subtitle="Brezplačen posvet in ponudba po meri vašega doma — brez obveznosti."
      />

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* contact details */}
          <div className="space-y-6">
            <div className="card">
              <a href={`tel:${brand.phone}`} className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-400/10 text-brand-300 ring-1 ring-brand-400/20">
                  <Phone />
                </span>
                <span>
                  <span className="block text-sm text-mist-400">Pokličite</span>
                  <span className="block text-lg font-semibold text-white">{brand.phoneDisplay}</span>
                </span>
              </a>
            </div>
            <div className="card">
              <a href={`mailto:${brand.email}`} className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-400/10 text-brand-300 ring-1 ring-brand-400/20">
                  <Mail />
                </span>
                <span>
                  <span className="block text-sm text-mist-400">Pišite</span>
                  <span className="block text-lg font-semibold text-white">{brand.email}</span>
                </span>
              </a>
            </div>
            <p className="px-1 text-sm leading-relaxed text-mist-400">
              Odgovorimo praviloma v enem delovnem dnevu. Za hitrejši odziv nas
              pokličite.
            </p>
          </div>

          {/* form */}
          <div className="card">
            <h2 className="text-xl font-semibold">Pošljite povpraševanje</h2>
            <p className="mt-1 text-sm text-mist-400">
              Izpolnite obrazec in oglasimo se vam.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

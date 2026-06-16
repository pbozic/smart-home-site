import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";

export const metadata: Metadata = {
  title: "Cenik",
  description: "Celovita rešitev pametnega doma že od 2.000 € — brez skritih stroškov.",
};

export default function CenikPage() {
  return (
    <>
      <PageHeader
        eyebrow="Cenik"
        title="Dostopna cena za celovito rešitev"
        subtitle="Brez skritih stroškov in brez dragih nadgradenj. Plačate to, kar potrebujete."
      />
      <Pricing />
      <Faq />
    </>
  );
}

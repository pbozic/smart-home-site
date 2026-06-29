import type { Metadata } from "next";
import Image from "next/image";
import { brand } from "@/lib/brand";
import { Shield, Bolt, Sparkles } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { FinalCta } from "@/components/sections/FinalCta";

export const metadata: Metadata = {
  title: "O nas",
  description: `Spoznajte ${brand.name} — ekipo za sodoben, brezžični pametni dom.`,
};

const values = [
  {
    icon: Shield,
    title: "Odprt sistem, brez lock-ina",
    text: "Gradimo na Home Assistant — odprti platformi, ki ni vezana na enega proizvajalca. Vaš dom ostane v vaših rokah.",
  },
  {
    icon: Bolt,
    title: "Brez nepotrebnih posegov",
    text: "Brezžične rešitve pomenijo hitro namestitev brez razbijanja sten in dragih gradbenih del.",
  },
  {
    icon: Sparkles,
    title: "Podpora tudi po namestitvi",
    text: "Ne izginemo po predaji. Sistem nadgradimo, prilagodimo in vam pomagamo, ko nas potrebujete.",
  },
];

const team = [
  {
    name: "Primož Božič",
    role: "Direktor, Signapps d. o. o.",
    bio: "Verjamem v dolgoročna partnerstva, zanesljive rešitve in odprto komunikacijo. Moje delo je povezovati tehnologijo s poslovnimi cilji ter poskrbeti, da projekti prinesejo resnično vrednost.",
    image: "/assets/Team/primoz.jpg",
    linkedin: "https://www.linkedin.com/in/primo%C5%BE-bo%C5%BEi%C4%8D-93203291/",
    github: "https://github.com/pbozic",
  },
  {
    name: "Miha Kogoj",
    role: "Inž. računalništva in informatike",
    bio: "Zanima me razvoj aplikacij, reševanje izzivov in raziskovanje novih tehnologij. Rad razvijam nove, zanimive in uporabne rešitve, ki so sodobne ter zasnovane za boljšo uporabniško izkušnjo.",
    image: "/assets/Team/miha-php2.png",
    linkedin: "https://www.linkedin.com/in/miha-kogoj-9957861b6/",
    github: "https://github.com/NemesisMiko",
  },
  {
    name: "Marcel Martinšek",
    role: "Razvijalec programske opreme",
    bio: "Navdušujejo me pametni sistemi, umetna inteligenca in avtomatizacija. Svoje znanje usmerjam v rešitve, ki dom naredijo intuitivnega in energetsko učinkovitega.",
    image: "/assets/Team/Marcel.jpg",
    linkedin: "https://www.linkedin.com/in/fransemartinsek/",
    github: "https://github.com/MarcelMartinsek",
  },
  {
    name: "Tim Vrečič",
    role: "Razvijalec programske opreme",
    bio: "Uživam v razumevanju kompleksnih problemov in iskanju preprostih načinov za njihovo reševanje. Pri vsakem projektu stremim k temu, da je končni rezultat učinkovit, intuitiven in kakovostno izveden.",
    image: "/assets/Team/Tim.jpg",
    linkedin: "https://www.linkedin.com/in/tim-vre%C4%8Di%C4%8D-661831320/",
    github: "https://github.com/vreca123",
  },
];

function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z" />
    </svg>
  );
}

export default function ONasPage() {
  return (
    <>
      <PageHeader
        eyebrow="O nas"
        title={`Zakaj ${brand.name}`}
        subtitle={`Pametni dom mora biti preprost, odprt in dostopen — ne zapleten projekt za izbrane.`}
      >
        <div className="mt-10 grid gap-5 text-left sm:mt-12 sm:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card group hover:border-brand-400/30">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-400/10 text-brand-300 ring-1 ring-brand-400/20 transition-transform group-hover:scale-110">
                <Icon />
              </div>
              <h2 className="mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-mist-300">{text}</p>
            </div>
          ))}
        </div>
      </PageHeader>

      {/* Company intro */}
      <section className="section border-t border-white/5 bg-ink-900">
        <div className="container-x">
          <span className="eyebrow">Kdo smo</span>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">
            Ekipa, ki ji lahko zaupate
          </h2>

          <div className="mt-10 grid gap-8 text-mist-200 md:grid-cols-2 md:gap-12">
            <div className="space-y-5 leading-relaxed">
              <p>
                <strong className="font-semibold text-white">
                  Smo mlada, a izkušena ekipa inženirjev in sistemskih
                  integratorjev.
                </strong>{" "}
                Specializirani smo za brezžično avtomatizacijo doma na osnovi
                Home Assistant — odprti platformi, ki združuje naprave različnih
                proizvajalcev brez vezanosti na enega ponudnika.
              </p>
              <p>
                S ponosom stojimo za svojim delom in veliko pozornost namenjamo
                podrobnostim. Ne glede na obseg projekta poskrbimo, da sistem
                deluje zanesljivo — danes in čez leta.
              </p>
            </div>
            <div className="space-y-5 leading-relaxed">
              <p>
                Pokrivamo celoten spekter pametnega doma: upravljanje
                razsvetljave, ogrevanja in hlajenja, varnostnih sistemov,
                senčil, vtičnic in energetske porabe — vse v eni aplikaciji,
                dostopni od kjerkoli.
              </p>
              <p>
                Integriramo vodilne znamke — Shelly, Sonoff, Aqara in Philips
                Hue — ter sistem natančno prilagodimo vašim navadam in
                prostoru. Brez razbijanja sten, brez dolgotrajnih gradbenih del.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section border-t border-white/5">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Ekipa</span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Spoznaj našo ekipo
            </h2>
            <p className="mt-4 text-mist-300 leading-relaxed">
              Združujemo znanja s področja sistemske integracije, vgrajenih
              sistemov in avtomatizacije. Vsak projekt obravnavamo celostno —
              od načrtovanja do vzpostavitve živega sistema in podpore
              po namestitvi.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="card flex flex-col items-center text-center">
                <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full ring-2 ring-brand-400/30">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                <h3 className="text-base font-semibold">{member.name}</h3>
                <p className="mt-1 text-xs text-brand-300 font-medium tracking-wide">
                  {member.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-mist-300 flex-1">
                  {member.bio}
                </p>

                <div className="mt-5 flex items-center gap-3 text-mist-400">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} na LinkedIn`}
                    className="transition-colors hover:text-brand-300"
                  >
                    <LinkedInIcon />
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} na GitHub`}
                    className="transition-colors hover:text-brand-300"
                  >
                    <GitHubIcon />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}

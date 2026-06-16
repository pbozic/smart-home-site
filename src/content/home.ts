/**
 * Local fallback content for the homepage (Slovenian).
 *
 * This is the default copy the site ships with. The same shape is mirrored in
 * the Sanity schemas, so once Sanity is connected the client edits override
 * this. Until then, the site renders fully from here.
 */

export const homeContent = {
  hero: {
    eyebrow: "Pametni dom · Home Assistant",
    title: "Tehnološko napreden pametni dom — brez razbijanja sten",
    subtitle:
      "Celovita brezžična rešitev pametnega doma na osnovi Home Assistant. Shelly, Sonoff, Aqara in Philips Hue — vse v eni aplikaciji. Namestitev v 1–2 dneh.",
    priceLabel: "Že od",
    price: "2.000 €",
    primaryCta: { label: "Brezplačni posvet", href: "/kontakt/" },
    secondaryCta: { label: "Oglejte si rešitev", href: "#zakaj" },
    badges: ["Brez gradbenih del", "Ena aplikacija", "24-mesečna garancija"],
  },

  trust: {
    title: "Delujemo z napravami, ki jim zaupate",
    note: "Odprt ekosistem — brez vezanosti na enega proizvajalca.",
  },

  why: {
    eyebrow: "Zakaj pametni dom",
    title: "Udobje, varnost in prihranek — vsak dan",
    items: [
      {
        icon: "shield",
        title: "Več varnosti",
        text: "Pametne ključavnice, video zvonci in senzorji vas obvestijo, kaj se dogaja doma — kjer koli ste.",
      },
      {
        icon: "bolt",
        title: "Nižja poraba",
        text: "Spremljanje porabe in samodejno krmiljenje luči, ogrevanja in vtičnic znižata stroške.",
      },
      {
        icon: "sliders",
        title: "Vse v eni aplikaciji",
        text: "Home Assistant poveže vse naprave pod eno streho — brez preklapljanja med petimi aplikacijami.",
      },
      {
        icon: "sparkles",
        title: "Udobje brez truda",
        text: "Scene in avtomatizacije poskrbijo, da se dom prilagodi vam — zjutraj, zvečer, ob odhodu.",
      },
    ],
  },

  comparison: {
    eyebrow: "Brezžično vs. žično",
    title: "Zakaj brezžični pametni dom",
    wireless: {
      label: "Brezžični pametni dom",
      points: [
        "Brez posegov v električne inštalacije",
        "Brez gradbenih del in razbijanja sten",
        "Namestitev v 1–2 dneh",
        "Nizki začetni stroški",
        "Ena aplikacija za vse naprave",
        "Neomejena nadgradnja",
      ],
    },
    wired: {
      label: "Klasični žični sistem",
      points: [
        "Poseg v električne inštalacije",
        "Gradbena dela z razbijanjem sten",
        "Draga in dolgotrajna namestitev",
        "Visoki začetni stroški",
        "Pogosto več različnih aplikacij",
        "Omejena prilagodljivost",
      ],
    },
  },

  ecosystem: {
    eyebrow: "Tehnologija",
    title: "Odprt sistem, zgrajen na Home Assistant",
    subtitle:
      "Home Assistant je odprt nadzorni center vašega doma. Povezuje vodilne znamke naprav prek Wi-Fi in Bluetooth — Matter in Thread sta v pripravi.",
  },

  steps: {
    eyebrow: "Kako poteka",
    title: "V 3 korakih do pametnega doma",
    items: [
      {
        n: "01",
        title: "Brezplačni posvet",
        text: "Skupaj pregledamo vaše želje in prostor ter pripravimo predlog rešitve in ponudbo.",
      },
      {
        n: "02",
        title: "Namestitev v 1–2 dneh",
        text: "Brezžično namestimo in nastavimo naprave — brez prahu, brez gradbenih del.",
      },
      {
        n: "03",
        title: "Predaja in podpora",
        text: "Pokažemo vam uporabo, nastavimo scene po meri in ostanemo na voljo za podporo.",
      },
    ],
  },

  pricing: {
    eyebrow: "Cenik",
    title: "Dostopna cena za celovito rešitev",
    price: "2.000 €",
    priceNote: "Celovita rešitev pametnega doma že od",
    features: [
      "Brez skritih stroškov",
      "Brez dragih nadgradenj",
      "Brezplačen ogled in svetovanje",
      "24-mesečna garancija na vse naprave",
    ],
    cta: { label: "Povprašajte za ponudbo", href: "/kontakt/" },
  },

  faq: {
    eyebrow: "Pogosta vprašanja",
    title: "Imate vprašanja?",
    items: [
      {
        q: "Ali morate razbijati stene ali posegati v inštalacije?",
        a: "Ne. Rešitev je brezžična (Wi-Fi in Bluetooth), zato ni potrebnih gradbenih del ali posegov v električne inštalacije.",
      },
      {
        q: "Katere naprave podpirate?",
        a: "Gradimo na Home Assistant in podpiramo Shelly, Sonoff, Aqara in Philips Hue. Matter in Thread dodajamo kmalu.",
      },
      {
        q: "Koliko časa traja namestitev?",
        a: "Večino domov namestimo v 1–2 dneh, odvisno od obsega rešitve.",
      },
      {
        q: "Ali je vse v eni aplikaciji?",
        a: "Da. Home Assistant poveže vse naprave pod eno aplikacijo — brez preklapljanja med različnimi aplikacijami proizvajalcev.",
      },
      {
        q: "Kaj če bom želel sistem pozneje nadgraditi?",
        a: "Sistem je odprt in modularen. Naprave lahko kadar koli dodate ali zamenjate brez prenove celotnega sistema.",
      },
    ],
  },

  finalCta: {
    title: "Pametni dom za vsak dom — že danes",
    subtitle:
      "Rezervirajte brezplačen posvet in pripravimo rešitev po meri vašega doma.",
    cta: { label: "Brezplačni posvet", href: "/kontakt/" },
  },
} as const;

export type HomeContent = typeof homeContent;

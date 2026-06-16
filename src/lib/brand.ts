/**
 * Single source of truth for brand + business facts.
 *
 * Change the brand here and it updates across the whole site (header, footer,
 * metadata, copy that interpolates `brand.name`, etc.). Swapping "Signapps" for
 * another name is a one-line edit.
 *
 * Marketing copy that the client edits often should live in Sanity; this file
 * holds the stable, structural brand/business constants.
 */
export const brand = {
  name: "Signapps",
  // Shown after the name in some lockups, e.g. "Signapps — pametni dom".
  tagline: "pametni dom",
  domain: "signapps.si",
  url: "https://signapps.si",
  email: "info@signapps.si",
  phone: "+386 41 000 000", // TODO: real number
  phoneDisplay: "041 000 000",
  // Locale + language for <html lang> and metadata.
  locale: "sl_SI",
  lang: "sl",
  // Default OpenGraph / SEO copy (Slovenian).
  seo: {
    title: "Signapps — pametni dom brez posegov v inštalacije",
    description:
      "Pametni dom na osnovi Home Assistant: Shelly, Sonoff, Aqara in Philips Hue v eni aplikaciji. Brezžična namestitev v 1–2 dneh, brez razbijanja sten. Matter kmalu.",
  },
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/",
  },
} as const;

/**
 * The smart-home tech stack we actually use — referenced by the
 * "works with" / ecosystem sections. `comingSoon` flags roadmap items
 * (Matter) so the UI can label them honestly.
 */
export const ecosystem = {
  hub: {
    name: "Home Assistant",
    role: "Odprt nadzorni center vašega doma — ena aplikacija za vse naprave, brez vezanosti na enega proizvajalca.",
  },
  brands: [
    { name: "Shelly", note: "Releji, meritve porabe, senzorji" },
    { name: "Sonoff", note: "Stikala in moduli" },
    { name: "Aqara", note: "Senzorji, ključavnice, zvonci" },
    { name: "Philips Hue", note: "Pametna razsvetljava" },
  ],
  connectivity: [
    { name: "Wi-Fi", available: true },
    { name: "Bluetooth LE", available: true },
    { name: "Matter", available: false, label: "kmalu" },
    { name: "Thread", available: false, label: "kmalu" },
  ],
} as const;

export type Brand = typeof brand;

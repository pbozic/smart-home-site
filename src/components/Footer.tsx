import Link from "next/link";
import { brand, ecosystem } from "@/lib/brand";
import { navLinks } from "@/lib/nav";
import { Logo } from "@/components/Logo";
import { Phone, Mail } from "@/components/icons";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-ink-900">
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand + pitch */}
          <div>
            <Logo className="h-8" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist-300">
              Brezžični pametni dom na osnovi Home Assistant — brez posegov v
              inštalacije, v eni aplikaciji.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {ecosystem.brands.map((b) => (
                <span
                  key={b.name}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-mist-300"
                >
                  {b.name}
                </span>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-mist-400">
              Povezave
            </h4>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-mist-300 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-mist-400">
              Kontakt
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`tel:${brand.phone}`}
                  className="inline-flex items-center gap-2 text-sm text-mist-300 hover:text-white"
                >
                  <Phone className="h-4 w-4 text-brand-300" /> {brand.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  className="inline-flex items-center gap-2 text-sm text-mist-300 hover:text-white"
                >
                  <Mail className="h-4 w-4 text-brand-300" /> {brand.email}
                </a>
              </li>
            </ul>
            <Link href="/kontakt/" className="btn-ghost mt-6">
              Stopite v stik
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-mist-400 sm:flex-row">
          <p>
            © {year} {brand.name}. Vse pravice pridržane.
          </p>
          <div className="flex gap-5">
            <Link href="/zasebnost/" className="hover:text-mist-200">
              Zasebnost
            </Link>
            <Link href="/piskotki/" className="hover:text-mist-200">
              Piškotki
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

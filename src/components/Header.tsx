"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/lib/brand";
import { isNavLinkActive, navLinks } from "@/lib/nav";
import { Logo } from "@/components/Logo";
import { Menu, Cross } from "@/components/icons";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-ink-950/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link href="/" aria-label={brand.name} onClick={() => setOpen(false)}>
          <Logo className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((l) => {
            const active = isNavLinkActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "text-brand-200"
                    : "text-mist-300 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={`tel:${brand.phone}`} className="text-sm font-medium text-mist-300 hover:text-white">
            {brand.phoneDisplay}
          </a>
          <Link href="/kontakt/" className="btn-primary">
            Brezplačni posvet
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
          aria-label={open ? "Zapri meni" : "Odpri meni"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Cross /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden">
          <nav className="container-x flex flex-col gap-1 border-t border-white/10 bg-ink-950/95 pb-6 pt-2 backdrop-blur-xl">
            {navLinks.map((l) => {
              const active = isNavLinkActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-3 py-3 text-base font-medium transition-colors ${
                    active
                      ? "bg-brand-400/10 text-brand-200"
                      : "text-mist-200 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href="/kontakt/"
              onClick={() => setOpen(false)}
              className="btn-primary mt-3 w-full"
            >
              Brezplačni posvet
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

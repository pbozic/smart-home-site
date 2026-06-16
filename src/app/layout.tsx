import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/brand";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin", "latin-ext"], // latin-ext covers Slovenian č/š/ž
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: {
    default: brand.seo.title,
    template: `%s · ${brand.name}`,
  },
  description: brand.seo.description,
  openGraph: {
    type: "website",
    locale: brand.locale,
    siteName: brand.name,
    title: brand.seo.title,
    description: brand.seo.description,
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={brand.lang} className={inter.variable}>
      <body className="min-h-screen bg-ink-950">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

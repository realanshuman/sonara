import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/**
 * The three brand faces, loaded exactly as the brand kit specifies.
 *
 * Bricolage Grotesque carries an optical-size axis, and the kit requests
 * `opsz,wght@12..96` so display sizes get the display cut. next/font only
 * ships the `wght` axis unless the others are named, so `opsz` is
 * requested explicitly and left on `font-optical-sizing: auto`.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sonara: the consultation already contains the note",
  description:
    "Sonara listens to the visit, tells the voices apart, and writes the case sheet. You review and sign before the patient stands up. Built for Indian OPD practice.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /**
   * The font variables must sit on <html>, not <body>. The design tokens in
   * globals.css are declared at :root and reference them, and a custom
   * property is substituted on the element it is declared on. Defined only
   * on <body>, `--font-display` and friends resolve to the guaranteed-invalid
   * value at :root, and every utility built on them falls back to system sans.
   */
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${interTight.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

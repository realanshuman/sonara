import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Sonara — the consultation already contains the note",
  description:
    "Sonara listens to the visit, tells the voices apart, and writes the case sheet — you review and sign before the patient stands up. Built for Indian OPD practice.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${bricolage.variable} ${interTight.variable} ${plexMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}

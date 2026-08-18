"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lockup } from "@/components/brand/logo";
import { cx } from "@/lib/cx";

const LINKS = [
  { href: "#how", label: "How a visit runs" },
  { href: "#languages", label: "Languages" },
  { href: "#line", label: "Who signs" },
  { href: "#scope", label: "What it doesn't do" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cx(
        "fixed top-0 inset-x-0 z-50 transition-colors duration-300",
        scrolled
          ? "bg-paper/88 backdrop-blur-md border-b border-line"
          : "border-b border-transparent",
      )}
    >
      <div className="max-w-[1180px] mx-auto px-6 h-[62px] flex items-center gap-6">
        <Link href="/" aria-label="Sonara home">
          <Lockup
            markSize={24}
            textSize={19}
            markClass={scrolled ? "text-petrol" : "text-sea"}
            textClass={scrolled ? "text-ink" : "text-chalk"}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-7 ml-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cx(
                "text-[14.5px] transition-colors",
                scrolled
                  ? "text-muted hover:text-ink"
                  : "text-ink-muted hover:text-chalk",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <Link
            href="/today"
            className={cx(
              "hidden sm:inline-flex text-[14.5px] font-semibold px-3.5 py-2 rounded-field transition-colors",
              scrolled
                ? "text-ink hover:bg-tint-mist"
                : "text-chalk hover:bg-ink-2",
            )}
          >
            Open the demo
          </Link>
          <a
            href="#pilot"
            className={cx(
              "inline-flex items-center text-[14.5px] font-semibold px-4 py-2 rounded-field transition-colors",
              scrolled
                ? "bg-petrol text-chalk hover:bg-petrol-deep"
                : "bg-chalk text-ink hover:bg-mist",
            )}
          >
            Book a clinic day
          </a>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={cx(
              "md:hidden p-2 -mr-2",
              scrolled ? "text-ink" : "text-chalk",
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d={open ? "M5 5l14 14M19 5L5 19" : "M4 7h16M4 12h16M4 17h16"} />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-paper border-b border-line px-6 py-3 space-y-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-[15px] text-ink"
            >
              {l.label}
            </a>
          ))}
          <Link href="/today" className="block py-2 text-[15px] text-petrol font-semibold">
            Open the demo
          </Link>
        </div>
      )}
    </header>
  );
}

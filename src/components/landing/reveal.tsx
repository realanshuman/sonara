"use client";

import { useEffect } from "react";

/** Adds .is-in to every [data-reveal] as it scrolls into view. */
export function RevealOnScroll() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const delay = Number(
              (e.target as HTMLElement).dataset.revealDelay ?? 0,
            );
            setTimeout(() => e.target.classList.add("is-in"), delay);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return null;
}

"use client";

import { useEffect, useRef } from "react";

/**
 * The live level meter. Reflects real input when an analyser callback is
 * provided; otherwise renders a synthetic speech-shaped animation
 * (mode="demo") or a frozen/flat trace.
 *
 * FR-REC-4: if the input is silent the bars sit visibly flat — the
 * silence itself is the warning, surfaced by the parent component.
 */
export function Waveform({
  mode,
  height = 44,
  bars = 64,
  getLevel,
  className,
}: {
  mode: "idle" | "live" | "demo" | "frozen" | "flat";
  height?: number;
  bars?: number;
  /** returns instantaneous input level 0..1 when wired to a real mic */
  getLevel?: () => number;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const rectsRef = useRef<SVGRectElement[]>([]);
  const raf = useRef<number>(0);
  const levels = useRef<number[]>([]);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    svg.innerHTML = "";
    const rects: SVGRectElement[] = [];
    const W = 500;
    for (let i = 0; i < bars; i++) {
      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("x", String(i * (W / bars) + 1));
      r.setAttribute("width", String(W / bars - 2.4));
      r.setAttribute("rx", "1.2");
      r.setAttribute("fill", "#DDE6E2");
      svg.appendChild(r);
      rects.push(r);
    }
    rectsRef.current = rects;
    levels.current = new Array(bars).fill(0);
    const set = (r: SVGRectElement, h: number) => {
      h = Math.max(2, h);
      r.setAttribute("y", String((height - h) / 2));
      r.setAttribute("height", String(h));
    };
    rects.forEach((r) => set(r, 2));

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (mode === "frozen") {
      rects.forEach((r, k) => {
        set(r, 3 + Math.abs(Math.sin(k * 0.7) * Math.cos(k * 0.3)) * (height * 0.6));
        r.setAttribute("fill", "#DDE6E2");
      });
      return;
    }
    if (mode === "idle" || mode === "flat") return;

    if (reduce) {
      // a static but "speech-shaped" render instead of animation
      rects.forEach((r, k) => {
        set(r, 3 + Math.abs(Math.sin(k * 0.55) * Math.sin(k * 0.13)) * (height * 0.7));
        r.setAttribute("fill", k % 8 === 0 ? "#2F8C7F" : "#C9DBD5");
      });
      return;
    }

    let t0 = 0;
    const loop = (ts: number) => {
      if (!t0) t0 = ts;
      const el = (ts - t0) / 1000;
      if (mode === "live" && getLevel) {
        // scroll a real level history across the bars
        const lv = getLevel();
        levels.current.push(lv);
        if (levels.current.length > bars) levels.current.shift();
        for (let k = 0; k < bars; k++) {
          const v = levels.current[levels.current.length - bars + k] ?? 0;
          set(rects[k], 2 + v * (height - 6));
          rects[k].setAttribute("fill", k % 8 === 0 ? "#2F8C7F" : "#C9DBD5");
        }
      } else {
        // synthetic speech envelope
        for (let k = 0; k < bars; k++) {
          const s =
            Math.sin(el * 7 + k * 0.5) *
            Math.sin(el * 2.1 + k * 0.12) *
            Math.sin(k * 0.85 + el);
          const env = 0.55 + 0.45 * Math.sin(el * 1.5 + k * 0.05);
          set(rects[k], 3 + Math.abs(s) * env * (height - 8));
          rects[k].setAttribute("fill", k % 8 === 0 ? "#2F8C7F" : "#C9DBD5");
        }
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [mode, bars, height, getLevel]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 500 ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ width: "100%", height }}
      aria-hidden
    />
  );
}

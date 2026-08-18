"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cx } from "@/lib/cx";

/* ═══════════════════════════════════════════════════════════════
   Inline graphic components for the landing page. All stroke-based,
   theme-token coloured, drawn on the same geometry as the mark.
   ═══════════════════════════════════════════════════════════════ */

/** Two-language sentence, tinted by language, resolving to one English line. */
export function CodeMixDiagram() {
  const parts: Array<{ t: string; lang: "hi" | "en" }> = [
    { t: "Do din se bukhar hai,", lang: "hi" },
    { t: "and throat is paining a lot", lang: "en" },
  ];
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-3">
        <span className="t-label">What she says</span>
        <span className="h-px flex-1 bg-line" />
        <span className="t-mono-sm text-muted">one sentence · two languages</span>
      </div>

      <p className="text-[19px] sm:text-[21px] leading-[1.6] font-medium m-0">
        {parts.map((p) => (
          <span
            key={p.t}
            className={cx(
              "rounded-[5px] px-1.5 py-1 mr-1 inline-block",
              p.lang === "hi"
                ? "bg-tint-amber text-amber-text"
                : "bg-tint-sea text-petrol",
            )}
          >
            {p.t}
          </span>
        ))}
      </p>

      <div className="flex items-center gap-4 mt-3">
        <span className="t-mono-sm text-muted">
          <span className="inline-block size-2 rounded-[2px] bg-tint-amber mr-1.5 align-middle" />
          Hindi
        </span>
        <span className="t-mono-sm text-muted">
          <span className="inline-block size-2 rounded-[2px] bg-tint-sea mr-1.5 align-middle" />
          English
        </span>
      </div>

      {/* the join: both halves resolve into one English line */}
      <div className="flex flex-col items-center py-1" aria-hidden>
        <span className="w-px h-4 bg-line" />
        <svg width="11" height="7" viewBox="0 0 11 7" className="text-line -mt-px">
          <path
            d="M1 1 L5.5 6 L10 1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="border border-line rounded-field bg-soft px-4 py-3">
        <div className="t-label mb-1">What lands in the note</div>
        <p className="text-[15px] m-0">Fever ×2 days with sore throat.</p>
      </div>
    </div>
  );
}

/** Two speaker lanes over a shared time axis: what diarization does. */
export function DiarizationGraphic() {
  const dr: [number, number][] = [
    [2, 9],
    [26, 12],
    [52, 20],
    [88, 10],
  ];
  const pt: [number, number][] = [
    [13, 11],
    [40, 10],
    [74, 12],
  ];
  const Lane2 = ({
    blocks,
    label,
    tone,
  }: {
    blocks: [number, number][];
    label: string;
    tone: "dr" | "pt";
  }) => (
    <div className="flex items-center gap-2.5">
      <span className="t-mono-sm text-muted w-6 shrink-0">{label}</span>
      <div className="relative h-4 flex-1">
        {blocks.map(([x, w]) => (
          <span
            key={x}
            className={cx(
              "absolute inset-y-0 rounded-[3px]",
              tone === "dr" ? "bg-petrol" : "bg-sand-text/55",
            )}
            style={{ left: `${x}%`, width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
  return (
    <div className="space-y-1.5">
      <Lane2 blocks={dr} label="DR" tone="dr" />
      <div className="h-px bg-line ml-[34px]" />
      <Lane2 blocks={pt} label="PT" tone="pt" />
    </div>
  );
}

/** A note line tied back to the transcript lines that produced it. */
export function ProvenanceGraphic() {
  return (
    <svg viewBox="0 0 100 50" className="w-full" aria-hidden>
      {/* transcript ticks */}
      {[
        [4, 20],
        [30, 14],
        [50, 22],
      ].map(([x, w], i) => (
        <rect
          key={i}
          x={x}
          y={4}
          width={w}
          height={6}
          rx={1.6}
          fill="var(--color-mist)"
        />
      ))}
      {/* connectors */}
      <path
        d="M14 11 C14 22 34 22 34 36 M37 11 C37 24 40 26 44 36 M61 11 C61 24 54 26 50 36"
        fill="none"
        stroke="var(--color-sea)"
        strokeWidth="0.5"
        strokeDasharray="1.6 1.4"
      />
      {/* note line */}
      <rect
        x="24"
        y="36"
        width="52"
        height="8"
        rx="2"
        fill="none"
        stroke="var(--color-sea)"
        strokeWidth="0.7"
      />
      <rect x="27" y="39" width="34" height="2" rx="1" fill="var(--color-sea)" opacity="0.5" />
    </svg>
  );
}

/** Local buffer filling while the link is down, then flushing. */
export function OfflineGraphic() {
  return (
    <div>
      <svg viewBox="0 0 100 34" className="w-full" aria-hidden>
        {/* the browser, buffering */}
        <rect x="2" y="6" width="26" height="22" rx="3" fill="none" stroke="var(--color-line)" strokeWidth="0.8" />
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={5}
            y={9 + i * 4.6}
            width={20}
            height={3}
            rx={1.2}
            fill={i < 3 ? "var(--color-amber)" : "var(--color-mist)"}
            opacity={i < 3 ? 0.85 : 1}
          />
        ))}
        {/* the broken link */}
        <path d="M32 17 h11" stroke="var(--color-line)" strokeWidth="0.8" strokeDasharray="2 2" />
        <path
          d="M46 12 l8 10 M54 12 l-8 10"
          stroke="var(--color-amber-text)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path d="M57 17 h11" stroke="var(--color-line)" strokeWidth="0.8" strokeDasharray="2 2" />
        {/* the server it will reach later */}
        <path
          d="M76 22 a5.5 5.5 0 0 1 1 -11 a7.5 7.5 0 0 1 14 1.8 a4.6 4.6 0 0 1 -1 9.2 z"
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="0.8"
        />
      </svg>
      <div className="flex justify-between t-mono-sm text-muted mt-2">
        <span>buffered locally</span>
        <span className="text-amber-text">link down</span>
        <span>uploads on reconnect</span>
      </div>
    </div>
  );
}

/** The signing gate: nothing passes without a verified signature. */
export function SigningGate() {
  const Arrow = () => (
    <svg
      viewBox="0 0 40 12"
      className="w-8 sm:w-12 h-3 text-sea shrink-0 rotate-90 sm:rotate-0"
      aria-hidden
    >
      <path
        d="M0 6 H32 M27 1.5 L32 6 L27 10.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
      <div className="flex-1 border border-line rounded-card px-5 py-4 text-center bg-chalk">
        <div className="text-[15px] font-semibold">Draft prescription</div>
        <div className="t-mono-sm text-amber-text mt-1">unsigned · undeliverable</div>
      </div>

      <div className="self-center">
        <Arrow />
      </div>

      <div className="flex-[1.5] border-[1.5px] border-petrol bg-tint-petrol rounded-card px-5 py-5 text-center">
        <div className="t-label text-petrol">The only way through</div>
        <div className="t-h3 text-[19px] mt-1.5 mb-1.5">
          A verified doctor reads it and signs
        </div>
        <div className="t-mono-sm text-muted leading-relaxed">
          registration checked by a person · full content shown at signing
          <br />
          content hash · timestamp · IP, written once and never edited
        </div>
      </div>

      <div className="self-center">
        <Arrow />
      </div>

      <div className="flex-1 border border-line rounded-card px-5 py-4 text-center bg-chalk">
        <div className="text-[15px] font-semibold">The patient</div>
        <div className="t-mono-sm text-petrol mt-1">print · whatsapp · email</div>
      </div>
    </div>
  );
}

/**
 * Two-lane swimlane over the visit: what the doctor does, what Sonara
 * does. The division of labour is the safety story.
 *
 * Laid out in HTML rather than SVG so the type stays at real sizes
 * instead of scaling with a viewBox.
 */
export function SwimlaneGraphic() {
  const doctor = [
    { at: 0, w: 13, label: "Ask consent" },
    { at: 15, w: 44, label: "Consult, normally" },
    { at: 62, w: 19, label: "Read & correct" },
    { at: 83, w: 17, label: "Sign" },
  ];
  const sonara = [
    { at: 15, w: 44, label: "Listen, separate the voices" },
    { at: 60, w: 21, label: "Draft the case sheet" },
    { at: 83, w: 17, label: "Print · WhatsApp" },
  ];

  return (
    <div className="w-full">
      <div className="relative">
        {/* time gridlines */}
        <div className="absolute inset-0 flex justify-between pointer-events-none" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="w-px h-full border-l border-dashed border-line" />
          ))}
        </div>

        <Lane blocks={doctor} tone="solid" />
        <div className="h-px bg-line my-2.5" />
        <Lane blocks={sonara} tone="outline" />
      </div>

      <div className="relative h-5 mt-3">
        {[
          { at: 0, t: "00:00 · they sit down" },
          { at: 38, t: "the consultation" },
          { at: 62, t: "06:12 · you end it" },
          { at: 83, t: "+8s · draft ready" },
          { at: 100, t: "signed" },
        ].map((m) => (
          <span
            key={m.t}
            className="absolute t-mono-sm text-muted whitespace-nowrap top-0"
            style={{
              left: `${m.at}%`,
              transform:
                m.at === 0
                  ? "none"
                  : m.at === 100
                    ? "translateX(-100%)"
                    : "translateX(-50%)",
            }}
          >
            {m.t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Lane({
  blocks,
  tone,
}: {
  blocks: { at: number; w: number; label: string }[];
  tone: "solid" | "outline";
}) {
  return (
    <div className="relative h-[52px]">
      {blocks.map((b) => (
        <div
          key={b.label}
          className={cx(
            "absolute top-0 h-full rounded-[9px] flex items-center justify-center px-2.5 text-center",
            "text-[12.5px] sm:text-[13px] font-semibold leading-tight",
            tone === "solid"
              ? "bg-petrol text-chalk"
              : "bg-tint-sea text-petrol border border-sea",
          )}
          style={{ left: `${b.at}%`, width: `${b.w}%` }}
        >
          <span className="truncate sm:whitespace-normal">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Animated hairline trace used behind the hero. Draws itself once. */
export function HeroTrace({ className }: { className?: string }) {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setSeen(true),
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // a long speech-shaped trace: flat, then speech, then flat again
  const d =
    "M0 60 H120 l18-34 22 68 26-56 16 32 14-11 20 20 18-40 22 52 20-30 18 14 24-24 20 26 16-12 H620";

  return (
    <svg
      ref={ref}
      viewBox="0 0 620 120"
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-ink-3)" />
          <stop offset="30%" stopColor="var(--color-sea)" />
          <stop offset="75%" stopColor="var(--color-mist)" />
          <stop offset="100%" stopColor="var(--color-ink-3)" />
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={`url(#${id}-g)`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{
          strokeDasharray: 1400,
          strokeDashoffset: seen ? 0 : 1400,
          transition: "stroke-dashoffset 2.6s cubic-bezier(0.25,0.6,0.2,1)",
        }}
      />
    </svg>
  );
}

/** Small stat block used in the proof strip. */
export function StatBlock({
  value,
  unit,
  label,
}: {
  value: string;
  unit?: string;
  label: string;
}) {
  return (
    <div className="min-w-0">
      <div className="font-display font-extrabold text-[36px] leading-none tracking-[-0.035em] text-chalk">
        {value}
        {unit && (
          <span className="text-[18px] font-semibold text-sea ml-1">{unit}</span>
        )}
      </div>
      <div className="t-mono-sm text-ink-muted mt-2 leading-snug">{label}</div>
    </div>
  );
}

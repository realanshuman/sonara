"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { IconCheck, IconLock, IconSign } from "@/components/ui/icons";
import { cx } from "@/lib/cx";

/**
 * The landing page's one moving part: a single container in which the
 * transcript becomes the note. Not two panels side by side — the same
 * space, transformed, because that is the actual claim ("the consultation
 * already contains the note").
 */

type Phase = "idle" | "recording" | "processing" | "note" | "signed";

const LINES = [
  { s: "DR", t: "00:04", text: "Haan Priya, batao — kya taqleef ho rahi hai?" },
  { s: "PT", t: "00:07", text: "Do din se bukhar hai, and throat is paining a lot." },
  { s: "DR", t: "00:14", text: "Cough? Sardi?" },
  { s: "PT", t: "00:17", text: "Dry cough hai. Raat ko zyada hota hai." },
  { s: "DR", t: "00:26", text: "Throat dekhte hain… erythema present, tonsils mildly enlarged, no exudate. Temp 100.8." },
  { s: "DR", t: "00:41", text: "Pichhli baar azithromycin diya tha na, wo suit hua tha?" },
  { s: "PT", t: "00:45", text: "Haan, theek tha." },
] as const;

const STAGES = ["Audio saved", "Transcript complete", "2 speakers found", "Case sheet drafted"];

const FIELDS = [
  {
    k: "Presenting complaint",
    v: "Fever ×2 days with sore throat and dry cough, worse at night.",
    from: [1, 3],
    tags: ["fever", "sore throat", "dry cough"],
  },
  {
    k: "History",
    v: "Mild odynophagia, reduced oral intake. Tolerated azithromycin at the March visit.",
    from: [5, 6],
    tags: [],
  },
  {
    k: "On examination",
    v: "Pharyngeal erythema, tonsils mildly enlarged, no exudate. Temp 100.8°F. Chest clear.",
    from: [4],
    tags: [],
  },
  {
    k: "Assessment — draft",
    v: "Acute pharyngitis, likely viral.",
    from: [4],
    tags: [],
  },
] as const;

export function ConsultDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [visibleLines, setVisibleLines] = useState(0);
  const [stage, setStage] = useState(0);
  const [visibleFields, setVisibleFields] = useState(0);
  const [clock, setClock] = useState("00:00");
  const [hovered, setHovered] = useState<number | null>(null);
  const [, force] = useReducer((x: number) => x + 1, 0);

  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const started = useRef(false);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const run = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const fast = reduce.current;
    const beat = fast ? 90 : 900;

    setPhase("recording");
    setVisibleLines(0);
    setStage(0);
    setVisibleFields(0);
    setHovered(null);
    setClock("00:00");

    LINES.forEach((l, i) => {
      later(() => {
        setVisibleLines(i + 1);
        setClock(l.t);
      }, 500 + i * beat);
    });

    const endAt = 500 + LINES.length * beat + 500;
    later(() => {
      setPhase("processing");
      setClock("06:12");
    }, endAt);

    STAGES.forEach((_, i) => {
      later(() => setStage(i + 1), endAt + 300 + i * (fast ? 60 : 420));
    });

    const noteAt = endAt + 400 + STAGES.length * (fast ? 60 : 420);
    later(() => setPhase("note"), noteAt);
    FIELDS.forEach((_, i) => {
      later(() => setVisibleFields(i + 1), noteAt + 120 + i * (fast ? 50 : 260));
    });

    const signAt = noteAt + 300 + FIELDS.length * (fast ? 50 : 260) + (fast ? 200 : 1600);
    later(() => setPhase("signed"), signAt);
    later(run, signAt + (fast ? 900 : 4200));
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          run();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recording = phase === "recording";
  const showNote = phase === "note" || phase === "signed";

  return (
    <div
      ref={rootRef}
      className="bg-chalk border border-line rounded-[18px] overflow-hidden shadow-(--shadow-lift)"
    >
      {/* ── header ── */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-line bg-soft flex-wrap">
        <span
          className={cx(
            "inline-flex items-center gap-2 t-mono-sm uppercase tracking-[0.1em]",
            recording ? "text-signal" : "text-muted",
          )}
        >
          <span
            className={cx(
              "size-2.5 rounded-full",
              recording
                ? "bg-signal animate-[rec-pulse_1.1s_infinite]"
                : "bg-line",
            )}
          />
          {recording
            ? "Recording"
            : phase === "processing"
              ? "Ended"
              : phase === "signed"
                ? "Signed"
                : phase === "note"
                  ? "Draft ready"
                  : "Ready"}
        </span>
        <span className="text-[14px] font-semibold">Priya Nair · 34F</span>
        <span className="t-mono-sm text-muted hidden sm:inline">
          token 07 · follow-up
        </span>
        <span className="ml-auto font-mono text-[13px] text-muted tabular-nums">
          {clock}
        </span>
      </div>

      {/* ── the time axis: shared by both states ── */}
      <TimeAxis
        active={recording}
        progress={visibleLines / LINES.length}
        marks={LINES.map((l) => l.t)}
        highlight={
          hovered !== null ? (FIELDS[hovered].from as unknown as number[]) : null
        }
        onRipple={force}
      />

      {/* ── the body: transcript → note, in the same box ── */}
      <div className="px-5 py-4 min-h-[318px] sm:min-h-[292px]">
        {!showNote ? (
          <div>
            {LINES.slice(0, visibleLines).map((l, i) => (
              <div
                key={i}
                className="flex gap-2.5 py-[7px] anim-rise"
                style={{ animationDelay: "0ms" }}
              >
                <span
                  className={cx(
                    "font-mono text-[10px] font-medium tracking-[0.06em] px-[6px] py-[2px] rounded-[5px] h-fit shrink-0 mt-[2px]",
                    l.s === "DR"
                      ? "bg-tint-petrol text-petrol"
                      : "bg-tint-sand text-sand-text",
                  )}
                >
                  {l.s}
                </span>
                <span className="t-mono-sm text-faint shrink-0 mt-[3px] tabular-nums">
                  {l.t}
                </span>
                <span className="text-[14.5px] leading-snug">{l.text}</span>
              </div>
            ))}

            {phase === "processing" && (
              <div className="mt-3 pt-3 border-t border-dashed border-line grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STAGES.map((s, i) => (
                  <div
                    key={s}
                    className={cx(
                      "flex items-center gap-2 t-mono-sm transition-colors",
                      i < stage ? "text-petrol" : "text-faint",
                    )}
                  >
                    <span
                      className={cx(
                        "size-[7px] rounded-full shrink-0",
                        i < stage
                          ? "bg-sea"
                          : i === stage
                            ? "bg-amber animate-[tick-blink_1s_infinite]"
                            : "bg-line",
                      )}
                    />
                    {s}
                  </div>
                ))}
              </div>
            )}

            {phase === "idle" && (
              <p className="text-[14.5px] text-muted m-0">
                The note builds itself while you talk.
              </p>
            )}
          </div>
        ) : (
          <div>
            {FIELDS.slice(0, visibleFields).map((f, i) => (
              <div
                key={f.k}
                className="py-2.5 border-b border-dashed border-line last:border-0 anim-rise rounded-[7px] px-2 -mx-2 transition-colors hover:bg-soft"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="t-label">{f.k}</span>
                  <span
                    className={cx(
                      "t-mono-sm transition-colors ml-auto tabular-nums",
                      hovered === i ? "text-sea" : "text-faint",
                    )}
                  >
                    ↑ {f.from.map((n) => LINES[n].t).join(" · ")}
                  </span>
                </div>
                <p className="text-[14.5px] leading-snug m-0">{f.v}</p>
                {f.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {f.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[11px] bg-tint-mist text-petrol px-[7px] py-[2px] rounded-[5px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── footer: the sign bar ── */}
      <div className="px-5 py-3 border-t border-line bg-soft flex items-center gap-3 flex-wrap">
        {phase === "signed" ? (
          <>
            <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-petrol">
              <IconCheck size={15} /> Signed by Dr. A. Menon
            </span>
            <span className="t-mono-sm text-muted inline-flex items-center gap-1.5">
              <IconLock size={12} /> note locked · prescription sent to WhatsApp
            </span>
          </>
        ) : (
          <>
            <span
              className={cx(
                "inline-flex items-center gap-2 text-[13.5px] font-semibold px-3.5 py-1.5 rounded-[8px] transition-colors",
                showNote
                  ? "bg-petrol text-chalk"
                  : "bg-tint-mist text-faint",
              )}
            >
              <IconSign size={14} /> Review &amp; sign
            </span>
            <span className="t-mono-sm text-muted">
              {showNote
                ? "you read it, change what's wrong, and sign"
                : "nothing is signed, sent or saved to the patient yet"}
            </span>
          </>
        )}
        <span className="ml-auto t-mono-sm text-faint hidden md:inline">
          {showNote ? "hover a line to see where it came from" : " "}
        </span>
      </div>
    </div>
  );
}

/** The shared time axis — waveform while live, source marks while reviewing. */
function TimeAxis({
  active,
  progress,
  marks,
  highlight,
  onRipple,
}: {
  active: boolean;
  progress: number;
  marks: readonly string[];
  highlight: number[] | null;
  onRipple: () => void;
}) {
  const BARS = 78;
  const ref = useRef<SVGSVGElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rects = Array.from(svg.querySelectorAll("rect"));
    if (!active || reduce) {
      rects.forEach((r, i) => {
        const h = 3 + Math.abs(Math.sin(i * 0.71) * Math.cos(i * 0.29)) * 22;
        r.setAttribute("y", String((34 - h) / 2));
        r.setAttribute("height", String(h));
      });
      return;
    }
    let t0 = 0;
    const loop = (ts: number) => {
      if (!t0) t0 = ts;
      const el = (ts - t0) / 1000;
      rects.forEach((r, i) => {
        const s =
          Math.sin(el * 7 + i * 0.5) *
          Math.sin(el * 2.1 + i * 0.12) *
          Math.sin(i * 0.85 + el);
        const env = 0.55 + 0.45 * Math.sin(el * 1.5 + i * 0.05);
        const h = Math.max(2, 3 + Math.abs(s) * env * 26);
        r.setAttribute("y", String((34 - h) / 2));
        r.setAttribute("height", String(h));
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [active, onRipple]);

  return (
    <div className="relative px-5 pt-3.5 pb-2 border-b border-line">
      <svg
        ref={ref}
        viewBox="0 0 600 34"
        preserveAspectRatio="none"
        className="w-full h-[34px] block"
        aria-hidden
      >
        {Array.from({ length: BARS }, (_, i) => {
          const lit = active && i / BARS <= progress;
          return (
            <rect
              key={i}
              x={i * (600 / BARS) + 1}
              width={600 / BARS - 2.4}
              y={16}
              height={2}
              rx={1.2}
              fill={
                active
                  ? lit
                    ? i % 8 === 0
                      ? "var(--color-sea)"
                      : "var(--color-mist)"
                    : "#E4EBE8"
                  : "#DDE6E2"
              }
            />
          );
        })}
      </svg>

      {/* source marks — light up when a note line is hovered */}
      <div className="relative h-4 mt-0.5">
        {marks.map((m, i) => {
          const on = highlight?.includes(i);
          const pct = 6 + (i / (marks.length - 1)) * 88;
          return (
            <span
              key={m}
              className={cx(
                "absolute -translate-x-1/2 t-mono-sm transition-all duration-200 tabular-nums",
                on ? "text-sea font-medium" : "text-faint",
              )}
              style={{ left: `${pct}%`, top: 0 }}
            >
              <span
                className={cx(
                  "block mx-auto mb-0.5 w-px transition-all",
                  on ? "h-2 bg-sea" : "h-1 bg-line",
                )}
              />
              <span className="text-[9.5px]">{m}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

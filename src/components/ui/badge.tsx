import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export type PillTone =
  | "neutral"
  | "ok"
  | "wait"
  | "live"
  | "warn"
  | "sea"
  | "dark";

const pillTones: Record<PillTone, string> = {
  neutral: "bg-tint-mist text-muted",
  ok: "bg-tint-petrol text-petrol",
  wait: "bg-tint-sand text-sand-text",
  /* live = something is being recorded, and nothing else. The brand
     reserves signal red for this one job — if it starts meaning
     "unsigned" or "error" too, it stops meaning "live". */
  live: "bg-tint-signal text-signal",
  warn: "bg-tint-amber text-amber-text",
  sea: "bg-tint-sea text-sea",
  dark: "bg-ink-2 text-ink-text",
};

/** Small mono status pill — queue states, visit states, delivery states. */
export function Pill({
  tone = "neutral",
  className,
  children,
}: {
  tone?: PillTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] px-[7px] py-[2.5px] rounded-[5px] whitespace-nowrap",
        pillTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Symptom / finding tag extracted from a note. Coded tags show their code. */
export function Tag({
  label,
  code,
  className,
}: {
  label: string;
  code?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-baseline gap-1.5 font-mono text-[11px] px-[7px] py-[2.5px] rounded-[5px]",
        code ? "bg-tint-mist text-petrol" : "bg-tint-amber text-amber-text",
        className,
      )}
      title={code ? `Coded · ${code}` : "Uncoded — free text"}
    >
      {label}
      {code ? <span className="text-[9.5px] text-sea">{code}</span> : null}
    </span>
  );
}

/** Clinical flag chip on the patient header — allergy, chronic, medication. */
export function FlagChip({
  kind,
  children,
  className,
}: {
  kind: "allergy" | "chronic" | "medication" | "ok";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    allergy: "bg-tint-amber text-amber-text border border-tint-amber-line",
    chronic: "bg-tint-sand text-sand-text border border-transparent",
    medication: "bg-tint-mist text-petrol border border-transparent",
    ok: "bg-tint-petrol text-petrol border border-transparent",
  } as const;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-[3.5px] rounded-chip whitespace-nowrap",
        tones[kind],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Speaker label in a transcript line. */
export function SpeakerTag({
  speaker,
  onClick,
  title,
}: {
  speaker: "DR" | "PT" | "ATT" | "UNKNOWN";
  onClick?: () => void;
  title?: string;
}) {
  const tones = {
    DR: "bg-tint-petrol text-petrol",
    PT: "bg-tint-sand text-sand-text",
    ATT: "bg-tint-sea text-sea",
    UNKNOWN: "bg-tint-mist text-muted",
  } as const;
  const cls = cx(
    "font-mono text-[10px] font-medium tracking-[0.06em] px-[6px] py-[2px] rounded-[5px] h-fit shrink-0",
    tones[speaker],
    onClick && "hover:ring-1 hover:ring-sea cursor-pointer",
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} title={title}>
        {speaker}
      </button>
    );
  }
  return <span className={cls}>{speaker}</span>;
}

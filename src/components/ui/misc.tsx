import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Avatar({
  name,
  size = 34,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const HONORIFICS = /^(dr|mr|mrs|ms|prof|shri|smt)\.?$/i;
  const words = name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !HONORIFICS.test(w));
  const initials = (words.length ? words : [name])
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={cx(
        "inline-grid place-items-center rounded-[9px] bg-mist text-petrol font-semibold shrink-0 select-none",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center text-center py-14 px-6",
        className,
      )}
    >
      {icon && <div className="text-faint mb-4">{icon}</div>}
      <h3 className="t-h3 mb-1.5">{title}</h3>
      {children && (
        <p className="text-[14.5px] text-muted max-w-[42ch] leading-relaxed">
          {children}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Definition row: patient demographics, signature blocks, settings. */
export function KV({
  k,
  children,
  className,
}: {
  k: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex gap-4 py-2 border-b border-dashed border-line last:border-0", className)}>
      <span className="t-label w-[130px] shrink-0 pt-[3px]">{k}</span>
      <span className="text-[14px] min-w-0">{children}</span>
    </div>
  );
}

/** Blinking dot used in pipeline stages. */
export function Tick({
  state,
}: {
  state: "idle" | "running" | "done" | "failed";
}) {
  return (
    <span
      className={cx(
        "inline-block size-[7px] rounded-full shrink-0",
        state === "idle" && "bg-line",
        state === "running" && "bg-amber animate-[tick-blink_1s_infinite]",
        state === "done" && "bg-sea",
        state === "failed" && "bg-amber-text",
      )}
    />
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cx("border-line", className)} />;
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="font-mono text-[11px] bg-tint-mist text-muted border border-line rounded-[5px] px-1.5 py-[1px]">
      {children}
    </kbd>
  );
}

/** Inline banner: the honest, plain-language state the PRD asks for. */
export function Banner({
  tone = "warn",
  icon,
  children,
  action,
  className,
}: {
  tone?: "warn" | "info" | "live" | "ok";
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const tones = {
    warn: "bg-tint-amber border-tint-amber-line text-ink",
    info: "bg-tint-sea border-mist text-ink",
    live: "bg-tint-signal border-[#F3CCC4] text-ink",
    ok: "bg-tint-petrol border-mist text-ink",
  } as const;
  return (
    <div
      className={cx(
        "flex items-start gap-2.5 border rounded-field px-3.5 py-2.5 text-[13.5px] leading-snug",
        tones[tone],
        className,
      )}
    >
      {icon && <span className="shrink-0 mt-[1px] text-muted">{icon}</span>}
      <div className="min-w-0 flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

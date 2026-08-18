"use client";

import { useId, type CSSProperties } from "react";
import { cx } from "@/lib/cx";

/**
 * The Sonara mark: an aperture with a trace running through it.
 *
 * The line enters flat, breaks into speech, and exits the circle to the
 * right, the consultation leaving the room as a record. The ring is
 * knocked out where the trace crosses it (via mask) so the mark stays
 * legible down to its 16px minimum.
 *
 * Geometry is taken verbatim from the brand kit: 48-unit viewBox, ring
 * r=18 at 3.6 stroke, trace masked at 9.5.
 */
export function Mark({
  size = 24,
  className,
  style,
  title,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
}) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <mask id={id}>
          <rect width="48" height="48" fill="#fff" />
          <path
            d="M8 24H17l3-7 4 14 4-11.5 3 6.5 2.5-2H45"
            stroke="#000"
            strokeWidth="9.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <circle
        cx="24"
        cy="24"
        r="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.6"
        mask={`url(#${id})`}
      />
      <path
        d="M8 24H17l3-7 4 14 4-11.5 3 6.5 2.5-2H45"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Ratios lifted from the brand kit so every lockup scales as drawn. */
const HORIZONTAL_GAP = 11 / 26; // 26px mark, 11px gap
const STACKED_MARK = 46 / 32; // 32px wordmark, 46px mark
const STACKED_GAP = 14 / 32; // 32px wordmark, 14px gap
const EXPRESSIVE_MARK = 34 / 44; // 44px wordmark, 34px mark
const EXPRESSIVE_GAP = 2 / 44;
const EXPRESSIVE_KERN = -1 / 44;

/**
 * Horizontal lockup: the default for app headers and signatures.
 * Minimum 96px wide.
 */
export function Lockup({
  markSize = 26,
  textSize = 20,
  markClass = "text-petrol",
  textClass = "text-ink",
  className,
}: {
  markSize?: number;
  textSize?: number;
  markClass?: string;
  textClass?: string;
  className?: string;
}) {
  return (
    <span
      className={cx("inline-flex items-center", className)}
      style={{ gap: markSize * HORIZONTAL_GAP }}
    >
      <Mark size={markSize} className={markClass} />
      <span className={cx("wordmark", textClass)} style={{ fontSize: textSize }}>
        Sonara
      </span>
    </span>
  );
}

/**
 * Stacked lockup: for splash, print and the clinic standee.
 * Minimum 72px wide.
 */
export function StackedLockup({
  textSize = 32,
  markClass = "text-mist",
  textClass = "text-chalk",
  className,
}: {
  textSize?: number;
  markClass?: string;
  textClass?: string;
  className?: string;
}) {
  return (
    <span
      className={cx("inline-flex flex-col items-center", className)}
      style={{ gap: textSize * STACKED_GAP }}
    >
      <Mark size={textSize * STACKED_MARK} className={markClass} />
      <span className={cx("wordmark", textClass)} style={{ fontSize: textSize }}>
        Sonara
      </span>
    </span>
  );
}

/**
 * Expressive lockup: the mark replaces the "o", in signal red.
 *
 * Campaign use only, never inside the product. This is the one place the
 * kit puts signal red outside a recording state, and it works because a
 * campaign surface has no recording indicator to be confused with.
 */
export function ExpressiveLockup({
  size = 44,
  markClass = "text-signal",
  textClass = "text-ink",
  className,
}: {
  size?: number;
  markClass?: string;
  textClass?: string;
  className?: string;
}) {
  const word = (t: string) => (
    <span className={cx("wordmark", textClass)} style={{ fontSize: size }}>
      {t}
    </span>
  );
  return (
    <span
      className={cx("inline-flex items-center", className)}
      style={{ gap: size * EXPRESSIVE_GAP }}
      role="img"
      aria-label="Sonara"
    >
      {word("S")}
      <Mark
        size={size * EXPRESSIVE_MARK}
        className={markClass}
        style={{ margin: `0 ${size * EXPRESSIVE_KERN}px` }}
      />
      {word("nara")}
    </span>
  );
}

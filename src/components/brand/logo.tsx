"use client";

import { useId } from "react";

/**
 * The Sonara mark: an aperture with a trace running through it.
 * The line enters flat, breaks into speech, and exits the circle to the
 * right, the consultation leaving the room as a record. The ring is
 * knocked out where the trace crosses it (via mask) so the mark stays
 * legible down to 16px.
 */
export function Mark({
  size = 24,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
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

/** Horizontal lockup: the default for app headers and signatures. */
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
    <span className={`inline-flex items-center gap-[0.42em] ${className ?? ""}`}>
      <Mark size={markSize} className={markClass} />
      <span className={`wordmark ${textClass}`} style={{ fontSize: textSize }}>
        Sonara
      </span>
    </span>
  );
}

/**
 * Expressive lockup: the mark replaces the "o". Campaign use only,
 * never inside the product. Used once, on the landing-page close.
 */
export function ExpressiveLockup({
  size = 44,
  markClass = "text-sea",
  textClass = "text-chalk",
  className,
}: {
  size?: number;
  markClass?: string;
  textClass?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-baseline ${className ?? ""}`}
      aria-label="Sonara"
    >
      <span className={`wordmark ${textClass}`} style={{ fontSize: size }}>
        S
      </span>
      <Mark
        size={size * 0.76}
        className={`${markClass} self-center mx-[-0.02em]`}
      />
      <span className={`wordmark ${textClass}`} style={{ fontSize: size }}>
        nara
      </span>
    </span>
  );
}

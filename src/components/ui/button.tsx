import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "ghost" | "quiet" | "dark" | "rec" | "outline-dark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-petrol text-chalk hover:bg-petrol-deep border border-transparent",
  ghost:
    "bg-chalk text-ink border border-line hover:border-sea",
  quiet:
    "bg-transparent text-muted border border-transparent hover:text-ink hover:bg-tint-mist",
  dark: "bg-chalk text-petrol border border-transparent hover:bg-mist",
  /* Signal red is reserved for recording. This variant exists for the
     record button and nothing else. */
  rec: "bg-signal text-chalk border border-transparent hover:bg-signal-deep",
  "outline-dark":
    "bg-transparent text-chalk border border-ink-3 hover:border-sea",
};

const sizes: Record<Size, string> = {
  sm: "text-[13px] px-3 py-[7px] gap-1.5 rounded-[7px]",
  md: "text-[14px] px-4 py-[9px] gap-2 rounded-field",
  lg: "text-[15px] px-[18px] py-[11px] gap-2 rounded-field",
};

export function Button({
  variant = "ghost",
  size = "md",
  href,
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = cx(
    "inline-flex items-center justify-center font-semibold transition-colors duration-150 select-none",
    "disabled:opacity-45 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

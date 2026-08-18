"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cx } from "@/lib/cx";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      {label && (
        <span className="block text-[13px] font-semibold mb-1.5">{label}</span>
      )}
      {children}
      {hint && (
        <span className="block t-mono-sm text-muted mt-1.5 leading-relaxed">
          {hint}
        </span>
      )}
    </label>
  );
}

const inputCls =
  "w-full px-[13px] py-[10px] border border-line rounded-field bg-chalk text-[15px] text-ink placeholder:text-faint focus:outline-none focus:border-sea focus:ring-[3px] focus:ring-sea/15 disabled:opacity-50 disabled:bg-paper transition-colors";

export function Input({
  className,
  ref,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} className={cx(inputCls, className)} {...rest} />;
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(inputCls, "appearance-none pr-8", className)} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(inputCls, "resize-y min-h-[84px] leading-relaxed", className)}
      {...rest}
    />
  );
}

export function Checkbox({
  label,
  className,
  ...rest
}: { label: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label
      className={cx(
        "flex items-start gap-2.5 cursor-pointer text-[14px] leading-snug",
        rest.disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-[3px] size-4 accent-petrol shrink-0"
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
}

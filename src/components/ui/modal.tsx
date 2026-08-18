"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/cx";
import { IconClose } from "./icons";

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  wide,
  closable = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  eyebrow?: string;
  children: ReactNode;
  wide?: boolean;
  closable?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closable) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // move focus into the dialog
    const t = setTimeout(() => {
      ref.current
        ?.querySelector<HTMLElement>(
          "input, textarea, select, button:not([data-modal-close])",
        )
        ?.focus();
    }, 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open, onClose, closable]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="absolute inset-0 bg-ink/45 anim-fade cursor-default"
        onClick={closable ? onClose : undefined}
      />
      <div
        ref={ref}
        className={cx(
          "relative bg-chalk border border-line rounded-t-card sm:rounded-card shadow-(--shadow-pop) w-full anim-rise",
          "max-h-[92vh] overflow-y-auto",
          wide ? "sm:max-w-[720px]" : "sm:max-w-[480px]",
        )}
        data-scroll
      >
        {(title || closable) && (
          <div className="flex items-start gap-3 px-6 pt-5 pb-0">
            <div className="min-w-0">
              {eyebrow && <div className="t-eyebrow mb-1">{eyebrow}</div>}
              {title && <h2 className="t-h3">{title}</h2>}
            </div>
            {closable && (
              <button
                type="button"
                data-modal-close
                onClick={onClose}
                aria-label="Close dialog"
                className="ml-auto -mr-2 -mt-1 p-2 text-muted hover:text-ink hover:bg-tint-mist rounded-[7px] transition-colors"
              >
                <IconClose size={16} />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

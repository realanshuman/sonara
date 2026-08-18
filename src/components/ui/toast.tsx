"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cx } from "@/lib/cx";
import { IconCheck, IconInfo, IconWarn } from "./icons";

type ToastKind = "ok" | "info" | "warn";
type ToastItem = { id: number; kind: ToastKind; text: string };

const ToastCtx = createContext<(text: string, kind?: ToastKind) => void>(
  () => {},
);

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const push = useCallback((text: string, kind: ToastKind = "ok") => {
    const id = nextId.current++;
    setItems((prev) => [...prev.slice(-3), { id, kind, text }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4 w-full max-w-md"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cx(
              "anim-rise pointer-events-auto flex items-center gap-2.5 bg-ink text-ink-text text-[13.5px] font-medium pl-3.5 pr-4 py-2.5 rounded-[10px] shadow-(--shadow-pop) max-w-full",
            )}
          >
            <span
              className={cx(
                "shrink-0",
                t.kind === "ok" && "text-sea",
                t.kind === "warn" && "text-amber",
                t.kind === "info" && "text-mist",
              )}
            >
              {t.kind === "ok" ? (
                <IconCheck size={15} />
              ) : t.kind === "warn" ? (
                <IconWarn size={15} />
              ) : (
                <IconInfo size={15} />
              )}
            </span>
            <span className="truncate">{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

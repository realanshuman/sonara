import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** The workhorse surface of the app: a chalk card with a quiet header. */
export function Panel({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cx(
        "bg-chalk border border-line rounded-panel overflow-hidden",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  meta,
  children,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cx(
        "flex items-center gap-3 px-[18px] py-[12px] border-b border-line bg-soft",
        className,
      )}
    >
      <h3 className="t-panel">{title}</h3>
      {children}
      {meta !== undefined && (
        <div className="ml-auto flex items-center gap-2 t-label normal-case tracking-[0.06em]">
          {meta}
        </div>
      )}
    </header>
  );
}

export function PanelBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cx("p-[18px]", className)}>{children}</div>;
}

/** Plain card used on marketing and settings surfaces. */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "bg-chalk border border-line rounded-card p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

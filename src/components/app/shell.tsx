"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Mark } from "@/components/brand/logo";
import {
  IconAudit,
  IconLogout,
  IconPatients,
  IconRx,
  IconSettings,
  IconToday,
  IconWave,
  IconWifi,
  IconWifiOff,
} from "@/components/ui/icons";
import { Avatar } from "@/components/ui/misc";
import { useActions, useAppState, useMe } from "@/lib/store";
import { cx } from "@/lib/cx";

const NAV = [
  { href: "/today", label: "Today", icon: IconToday, roles: ["owner", "doctor", "front_desk"] },
  { href: "/patients", label: "Patients", icon: IconPatients, roles: ["owner", "doctor", "front_desk"] },
  { href: "/prescriptions", label: "Prescriptions", icon: IconRx, roles: ["owner", "doctor"] },
  { href: "/audit", label: "Audit log", icon: IconAudit, roles: ["owner", "doctor"] },
  { href: "/settings", label: "Settings", icon: IconSettings, roles: ["owner"] },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const state = useAppState();
  const { me } = useMe();
  const actions = useActions();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  if (!state.hydrated) {
    return (
      <div className="h-dvh grid place-items-center bg-paper">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Mark size={34} className="text-petrol" />
          <span className="t-mono-sm">loading the clinic day…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex bg-paper overflow-hidden">
      {/* ── rail ── */}
      <nav
        aria-label="Primary"
        className="w-16 shrink-0 bg-ink flex flex-col items-center py-4 gap-1.5 no-print"
      >
        <Link
          href="/today"
          className="mb-3 text-mist hover:text-chalk transition-colors"
          title="Sonara"
        >
          <Mark size={28} />
        </Link>
        {NAV.filter((n) => (n.roles as readonly string[]).includes(me.role)).map(
          (n) => {
            const active = pathname.startsWith(n.href);
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                title={n.label}
                aria-label={n.label}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "size-10 rounded-[10px] grid place-items-center transition-colors",
                  active
                    ? "bg-petrol text-chalk"
                    : "text-ink-faint hover:bg-ink-2 hover:text-chalk",
                )}
              >
                <Icon size={19} />
              </Link>
            );
          },
        )}
        <div className="flex-1" />

        {/* connection state — honest, visible (PRD §11.3) */}
        <button
          type="button"
          onClick={() => actions.setConnection(state.connection === "offline")}
          title={
            state.connection === "online"
              ? "Connection healthy — click to simulate a drop"
              : "Offline — click to restore"
          }
          className={cx(
            "size-10 rounded-[10px] grid place-items-center transition-colors",
            state.connection === "online"
              ? "text-ink-faint hover:bg-ink-2 hover:text-chalk"
              : "bg-tint-amber text-amber-text",
          )}
        >
          {state.connection === "online" ? (
            <IconWifi size={18} />
          ) : (
            <IconWifiOff size={18} />
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="mt-1 rounded-[9px] focus-visible:outline-sea"
            title={`${me.fullName} — switch user`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Avatar name={me.fullName} size={36} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute left-14 bottom-0 z-50 w-64 bg-chalk border border-line rounded-card shadow-(--shadow-pop) py-2 anim-rise"
            >
              <div className="px-4 py-2 border-b border-line mb-1">
                <div className="text-[14px] font-semibold">{me.fullName}</div>
                <div className="t-mono-sm text-muted">
                  {me.role === "front_desk" ? "front desk" : me.role} ·{" "}
                  {state.clinic.name}
                </div>
              </div>
              <div className="px-4 pt-1 pb-1.5 t-label">Switch user (demo)</div>
              {state.users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    actions.signIn(u.id);
                    setMenuOpen(false);
                    router.push("/today");
                  }}
                  className={cx(
                    "w-full flex items-center gap-2.5 px-4 py-2 text-left text-[13.5px] hover:bg-soft",
                    u.id === me.id && "text-petrol font-semibold",
                  )}
                >
                  <Avatar name={u.fullName} size={24} />
                  <span className="flex-1 truncate">{u.fullName}</span>
                  <span className="t-mono-sm text-muted">
                    {u.role === "front_desk"
                      ? "desk"
                      : state.doctorProfiles[u.id]?.verificationStatus ===
                          "pending"
                        ? "pending"
                        : u.role}
                  </span>
                </button>
              ))}
              <div className="border-t border-line mt-1 pt-1">
                <Link
                  href="/design"
                  role="menuitem"
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-[13.5px] hover:bg-soft text-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  <IconWave size={16} /> Design system
                </Link>
                <Link
                  href="/sign-in"
                  role="menuitem"
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-[13.5px] hover:bg-soft text-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  <IconLogout size={16} /> Sign out
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── content ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {state.connection === "offline" && (
          <div className="no-print bg-tint-amber border-b border-tint-amber-line px-5 py-2 flex items-center gap-2.5 text-[13px]">
            <IconWifiOff size={15} className="text-amber-text shrink-0" />
            <span>
              <b className="font-semibold">Working offline.</b> Recordings and
              edits are saving locally and will sync when the connection
              returns. Keep consulting — nothing is lost.
            </span>
            <button
              type="button"
              onClick={() => actions.setConnection(true)}
              className="ml-auto t-mono-sm underline underline-offset-2 text-amber-text hover:text-ink shrink-0"
            >
              restore connection
            </button>
          </div>
        )}
        <main className="flex-1 min-h-0 overflow-y-auto" data-scroll>
          {children}
        </main>
      </div>
    </div>
  );
}

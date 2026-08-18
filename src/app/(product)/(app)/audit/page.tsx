"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pill, type PillTone } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/misc";
import { IconAudit, IconLock, IconSearch } from "@/components/ui/icons";
import { useAppState, useMe } from "@/lib/store";
import { dateTimeStamp } from "@/lib/format";

const ACTION_TONE: Record<string, PillTone> = {
  "consent.captured": "ok",
  "consent.withdrawn": "warn",
  "recording.started": "live",
  "recording.stopped": "neutral",
  "recording.paused": "neutral",
  "recording.resumed": "neutral",
  "recording.deletion_scheduled": "warn",
  "note.generated": "sea",
  "note.edited": "neutral",
  "note.signed": "ok",
  "note.draft_discarded": "warn",
  "note.addendum_added": "warn",
  "note.manual_started": "neutral",
  "rx.signed": "ok",
  "rx.delivered": "ok",
  "rx.delivery_attempted": "neutral",
  "override.allergy_block": "warn",
  "data.exported": "warn",
  "data.deleted": "warn",
  "patient.record_viewed": "neutral",
  "patient.checked_in": "neutral",
  "patient.created": "neutral",
  "session.sign_in": "neutral",
};

const GROUPS = [
  { value: "", label: "Everything" },
  { value: "consent", label: "Consent" },
  { value: "recording", label: "Recording" },
  { value: "note", label: "Notes" },
  { value: "rx", label: "Prescriptions" },
  { value: "override", label: "Safety overrides" },
  { value: "data", label: "Export & erasure" },
  { value: "patient", label: "Record access" },
];

const PAGE = 40;

export default function AuditPage() {
  const state = useAppState();
  const { isClinical } = useMe();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");
  const [shown, setShown] = useState(PAGE);

  const rows = useMemo(() => {
    const list = [...state.audit].reverse();
    return list.filter((e) => {
      if (group && !e.action.startsWith(group)) return false;
      if (!q.trim()) return true;
      const patient = state.patients.find((p) => p.id === e.patientId);
      const actor = state.users.find((u) => u.id === e.actorId);
      const hay = [e.action, e.entityType, patient?.fullName, actor?.fullName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
  }, [state.audit, state.patients, state.users, q, group]);

  if (!isClinical) {
    return (
      <EmptyState title="Not available to the front desk">
        The audit log records clinical activity, including record access. It's
        visible to the clinic owner and treating doctors.
      </EmptyState>
    );
  }

  return (
    <div className="max-w-[1060px] mx-auto px-6 py-7">
      <div className="flex flex-wrap items-end gap-4 mb-5">
        <div>
          <div className="t-eyebrow mb-1">Append-only · no edit, no delete</div>
          <h1 className="t-h2">Audit log</h1>
          <div className="t-mono text-muted mt-1">
            {state.audit.length} entries · {rows.length} shown
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <Select
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
              setShown(PAGE);
            }}
            className="py-[8px] text-[14px] max-w-[190px]"
            aria-label="Filter by activity"
          >
            {GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
          <div className="relative">
            <IconSearch
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Patient, doctor or action"
              className="pl-9 w-[240px] py-[8px] text-[14px]"
              aria-label="Search the audit log"
            />
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<IconAudit size={34} />} title="Nothing matches">
          Try a different filter. Entries are never removed — if it happened,
          it's here.
        </EmptyState>
      ) : (
        <div className="bg-chalk border border-line rounded-panel overflow-hidden">
          {rows.slice(0, shown).map((e, i) => {
            const actor = state.users.find((u) => u.id === e.actorId);
            const patient = state.patients.find((p) => p.id === e.patientId);
            return (
              <div
                key={e.id}
                className={`flex items-start gap-3.5 px-5 py-2.5 text-[13.5px] ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <span className="t-mono-sm text-muted w-[130px] shrink-0 pt-[3px]">
                  {dateTimeStamp(e.at)}
                </span>
                <span className="w-[190px] shrink-0">
                  <Pill tone={ACTION_TONE[e.action] ?? "neutral"}>
                    {e.action.replace(/[._]/g, " ")}
                  </Pill>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium">
                    {actor?.fullName ?? e.actorId}
                  </span>
                  {patient && (
                    <>
                      <span className="text-muted"> · </span>
                      <Link
                        href={`/patients/${patient.id}`}
                        className="hover:text-petrol underline-offset-2 hover:underline"
                      >
                        {patient.fullName}
                      </Link>
                    </>
                  )}
                  {e.metadata && (
                    <span className="block t-mono-sm text-muted truncate">
                      {Object.entries(e.metadata)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </span>
                  )}
                </span>
                <span className="t-mono-sm text-faint shrink-0 hidden lg:block pt-[3px]">
                  {e.ip}
                </span>
                {e.visitId && (
                  <Link
                    href={`/consult/${e.visitId}`}
                    className="t-mono-sm text-sea hover:text-petrol shrink-0 pt-[3px]"
                  >
                    visit
                  </Link>
                )}
              </div>
            );
          })}
          {rows.length > shown && (
            <button
              type="button"
              onClick={() => setShown((s) => s + PAGE)}
              className="w-full py-3 t-mono-sm text-muted hover:text-ink hover:bg-soft border-t border-line"
            >
              show {Math.min(PAGE, rows.length - shown)} more
            </button>
          )}
        </div>
      )}

      <p className="t-mono-sm text-muted mt-4 flex items-start gap-2 leading-relaxed max-w-[70ch]">
        <IconLock size={13} className="mt-[2px] shrink-0" />
        <span>
          This log is written by a database role with INSERT permission only —
          there is no update or delete path, in the API or the UI. Record
          access is logged as well as changes, so a front-desk account probing
          clinical data shows up here.
        </span>
      </p>
    </div>
  );
}

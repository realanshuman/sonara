"use client";

import { useMemo, useState } from "react";
import { FlagChip } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/field";
import { IconSwap, IconWarn } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { patientFlags, useActions, useAppState, visitsOfPatient } from "@/lib/store";
import { fuzzyScore } from "@/lib/fuzzy";
import { patientCode, shortDate } from "@/lib/format";
import type { Patient, Visit } from "@/lib/types";

/**
 * FR-PAT-4: chronic-condition and allergy flags surface on the visit
 * header before recording starts, and cannot be collapsed or hidden.
 */
export function PatientHeader({
  patient,
  visit,
}: {
  patient: Patient;
  visit: Visit;
}) {
  const state = useAppState();
  const actions = useActions();
  const toast = useToast();
  const [moveOpen, setMoveOpen] = useState(false);
  const [q, setQ] = useState("");

  const flags = patientFlags(state, patient.id);
  const lastVisit = visitsOfPatient(state, patient.id).filter(
    (v) => v.id !== visit.id,
  )[0];

  const candidates = useMemo(
    () =>
      q.trim()
        ? state.patients
            .filter((p) => p.id !== patient.id)
            .map((p) => ({ p, s: fuzzyScore(q, p.fullName, p.phone) }))
            .filter((x) => x.s > 0)
            .sort((a, b) => b.s - a.s)
            .slice(0, 6)
        : [],
    [q, state.patients, patient.id],
  );

  return (
    <header className="sticky top-0 z-10 bg-chalk border-b border-line px-6 py-3 flex items-center gap-3.5 flex-wrap no-print">
      <Avatar name={patient.fullName} size={36} />
      <div className="min-w-0">
        <div className="font-semibold text-[15px] leading-tight">
          {patient.fullName} · {patient.ageYears}
          {patient.sex}
        </div>
        <div className="t-mono-sm text-muted">
          {patientCode(patient.id)} ·{" "}
          {lastVisit ? `last visit ${shortDate(lastVisit.date)}` : "first visit"}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap ml-2 flex-1 min-w-0">
        {flags.allergies.length === 0 ? (
          <FlagChip kind="ok">No known allergies</FlagChip>
        ) : (
          flags.allergies.map((f) => (
            <FlagChip key={f.id} kind="allergy">
              <IconWarn size={11} /> Allergy · {f.label}
              {f.severity ? ` (${f.severity})` : ""}
            </FlagChip>
          ))
        )}
        {flags.chronic.map((f) => (
          <FlagChip key={f.id} kind="chronic">
            {f.label}
          </FlagChip>
        ))}
        {flags.meds.length === 0 ? (
          <FlagChip kind="medication">No regular medication</FlagChip>
        ) : (
          flags.meds.map((f) => (
            <FlagChip key={f.id} kind="medication">
              {f.label}
            </FlagChip>
          ))
        )}
      </div>

      {visit.state !== "signed" && (
        <Button
          size="sm"
          variant="quiet"
          onClick={() => setMoveOpen(true)}
          title="Wrong patient? Move this visit"
        >
          <IconSwap size={14} /> Move visit
        </Button>
      )}

      <Modal
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
        eyebrow="Wrong patient selected"
        title="Move this visit to another patient"
      >
        <p className="text-[13.5px] text-muted mb-3.5 leading-relaxed">
          Everything captured so far (consent, transcript and draft) moves
          with the visit. After signing, a note can no longer be moved;
          corrections become addenda.
        </p>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the right patient"
          autoFocus
        />
        <div className="mt-2 divide-y divide-line border border-line rounded-field overflow-hidden empty:hidden">
          {candidates.map(({ p }) => (
            <button
              key={p.id}
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-soft"
              onClick={() => {
                actions.moveVisit(visit.id, p.id);
                setMoveOpen(false);
                setQ("");
                toast(`Visit moved to ${p.fullName}`);
              }}
            >
              <Avatar name={p.fullName} size={26} />
              <span className="text-[14px] font-medium flex-1">
                {p.fullName}
              </span>
              <span className="t-mono-sm text-muted">
                {p.ageYears}
                {p.sex} · {p.phone.slice(-4)}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </header>
  );
}

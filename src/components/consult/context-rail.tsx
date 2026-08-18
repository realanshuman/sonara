"use client";

import Link from "next/link";
import { Pill } from "@/components/ui/badge";
import { IconChevronRight, IconWarn } from "@/components/ui/icons";
import { drugById } from "@/lib/drugs";
import {
  patientFlags,
  useAppState,
  visitsOfPatient,
} from "@/lib/store";
import { dayMonth, shortDate } from "@/lib/format";
import type { Patient, Visit } from "@/lib/types";

/**
 * Patient context beside the consult: record first, prior visits second.
 * Deliberately not a suggestion panel: V1.0 makes no clinical proposals
 * (PRD §3.1). Everything here is the doctor's own prior record.
 */
export function ContextRail({
  patient,
  visit,
}: {
  patient: Patient;
  visit: Visit;
}) {
  const state = useAppState();
  const flags = patientFlags(state, patient.id);
  const history = visitsOfPatient(state, patient.id).filter(
    (v) => v.id !== visit.id,
  );

  return (
    <aside className="w-[320px] shrink-0 hidden xl:block no-print">
      <div className="bg-chalk border border-line rounded-panel overflow-hidden sticky top-[76px]">
        <div className="px-[18px] py-3 border-b border-line bg-soft">
          <div className="t-label">On file</div>
          <h3 className="t-panel mt-0.5">Her record</h3>
        </div>

        <div className="px-[18px] py-3.5 border-b border-line space-y-3">
          <RailGroup title="Allergies">
            {flags.allergies.length === 0 ? (
              <span className="text-muted">None recorded</span>
            ) : (
              flags.allergies.map((f) => (
                <div key={f.id} className="flex items-start gap-2">
                  <IconWarn size={13} className="text-amber-text mt-[3px] shrink-0" />
                  <span>
                    <b className="font-semibold">{f.label}</b>
                    {f.severity && (
                      <span className="text-muted"> · {f.severity}</span>
                    )}
                    {f.detail && (
                      <span className="block t-mono-sm text-muted">
                        {f.detail}
                      </span>
                    )}
                  </span>
                </div>
              ))
            )}
          </RailGroup>

          <RailGroup title="Chronic conditions">
            {flags.chronic.length === 0 ? (
              <span className="text-muted">None recorded</span>
            ) : (
              flags.chronic.map((f) => (
                <div key={f.id}>
                  <b className="font-semibold">{f.label}</b>
                  {f.detail && (
                    <span className="block t-mono-sm text-muted">{f.detail}</span>
                  )}
                </div>
              ))
            )}
          </RailGroup>

          <RailGroup title="Running medication">
            {flags.meds.length === 0 ? (
              <span className="text-muted">None recorded</span>
            ) : (
              flags.meds.map((f) => (
                <div key={f.id}>
                  <b className="font-semibold">{f.label}</b>
                  {f.detail && (
                    <span className="block t-mono-sm text-muted">{f.detail}</span>
                  )}
                </div>
              ))
            )}
          </RailGroup>
        </div>

        <div className="px-[18px] py-3.5">
          <div className="t-label mb-2">Previous visits</div>
          {history.length === 0 ? (
            <p className="text-[13.5px] text-muted m-0">
              First recorded visit at this clinic.
            </p>
          ) : (
            <div className="max-h-[280px] overflow-y-auto" data-scroll>
              {history.slice(0, 6).map((v) => {
                const n = state.notes[v.id];
                const rx = state.prescriptions[v.id];
                return (
                  <Link
                    key={v.id}
                    href={`/consult/${v.id}`}
                    className="flex gap-2.5 py-2.5 border-b border-dashed border-line last:border-0 group"
                  >
                    <span className="t-mono-sm text-muted w-[46px] shrink-0 pt-[2px]">
                      {dayMonth(v.date)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold truncate">
                        {shortAssessment(n?.sections.assessment)}
                      </span>
                      <span className="block t-mono-sm text-muted truncate">
                        {rx && rx.items.length > 0
                          ? rx.items
                              .map(
                                (i) =>
                                  drugById(i.drugId)?.brand ?? i.freeTextName,
                              )
                              .join(", ")
                          : "no medication"}
                      </span>
                    </span>
                    <IconChevronRight
                      size={13}
                      className="text-faint self-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    />
                  </Link>
                );
              })}
            </div>
          )}
          <Link
            href={`/patients/${patient.id}`}
            className="inline-flex items-center gap-1 t-mono-sm text-sea hover:text-petrol mt-3"
          >
            full patient record <IconChevronRight size={12} />
          </Link>
        </div>

        <div className="px-[18px] py-3 border-t border-line bg-soft">
          <div className="flex items-center gap-2 flex-wrap">
            <Pill tone="neutral">
              audio kept {state.clinic.audioRetentionDays}d
            </Pill>
            <Pill tone="neutral">patient since {shortDate(patient.createdAt)}</Pill>
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * The rail shows a short label for a past visit: take the first sentence
 * of the assessment and drop the "(draft)" qualifier. Trailing punctuation
 * is stripped first so the qualifier is actually at the end when matched.
 */
function shortAssessment(assessment?: string) {
  const label = (assessment ?? "")
    .split(". ")[0]
    .replace(/[.\s]+$/, "")
    .replace(/\s*\(draft[^)]*\)$/i, "")
    .replace(/[.,\s]+$/, "")
    .trim();
  return label || "Visit";
}

function RailGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="t-label mb-1">{title}</div>
      <div className="text-[13.5px] space-y-1.5 leading-snug">{children}</div>
    </div>
  );
}

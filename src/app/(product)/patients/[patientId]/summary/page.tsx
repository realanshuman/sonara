"use client";

import { use, useEffect } from "react";
import { Mark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { IconPrint } from "@/components/ui/icons";
import { patientFlags, useAppState, visitsOfPatient } from "@/lib/store";
import { drugById } from "@/lib/drugs";
import { NOTE_SECTIONS } from "@/lib/types";
import { dateTimeStamp, patientCode, shortDate } from "@/lib/format";

/** FR-PAT-6: the PDF half of data portability — a printable record. */
export default function PatientSummaryPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const state = useAppState();
  const patient = state.patients.find((p) => p.id === patientId);

  useEffect(() => {
    if (patient) document.title = `Record · ${patient.fullName}`;
  }, [patient]);

  if (!state.hydrated) return null;
  if (!patient) {
    return (
      <div className="min-h-dvh grid place-items-center bg-paper">
        <EmptyState title="No such record" />
      </div>
    );
  }

  const flags = patientFlags(state, patient.id);
  const visits = visitsOfPatient(state, patient.id);

  return (
    <div className="min-h-dvh bg-paper py-8 px-4">
      <div className="max-w-[820px] mx-auto mb-4 flex justify-end gap-2.5 no-print">
        <Button variant="primary" onClick={() => window.print()}>
          <IconPrint size={15} /> Print / save as PDF
        </Button>
        <Button onClick={() => window.close()}>Close</Button>
      </div>

      <article className="print-sheet max-w-[820px] mx-auto bg-chalk border border-line rounded-card shadow-(--shadow-lift) px-12 py-10">
        <header className="flex items-start justify-between gap-6 pb-5 border-b-2 border-petrol">
          <div>
            <div className="t-label mb-1">Patient record export</div>
            <h1 className="t-h2">{patient.fullName}</h1>
            <p className="t-mono text-muted m-0 mt-1">
              {patient.ageYears} ·{" "}
              {patient.sex === "F" ? "Female" : patient.sex === "M" ? "Male" : "Other"} ·{" "}
              {patientCode(patient.id)} · {patient.phone}
            </p>
          </div>
          <div className="text-right t-mono-sm text-muted leading-relaxed">
            {state.clinic.name}
            <br />
            {state.clinic.city}
            <br />
            generated {dateTimeStamp(new Date().toISOString())}
          </div>
        </header>

        <section className="py-5 border-b border-line grid grid-cols-3 gap-6">
          <SummaryList
            title="Allergies"
            items={flags.allergies.map(
              (f) =>
                `${f.label}${f.detail ? ` — ${f.detail}` : ""}${f.severity ? ` (${f.severity})` : ""}`,
            )}
          />
          <SummaryList
            title="Chronic conditions"
            items={flags.chronic.map(
              (f) => `${f.label}${f.detail ? ` — ${f.detail}` : ""}`,
            )}
          />
          <SummaryList
            title="Running medication"
            items={flags.meds.map(
              (f) => `${f.label}${f.detail ? ` — ${f.detail}` : ""}`,
            )}
          />
        </section>

        <section className="py-4">
          <h2 className="t-h3 mb-3">
            Visit history{" "}
            <span className="t-mono text-muted font-normal">
              {visits.length} signed
            </span>
          </h2>
          {visits.length === 0 && (
            <p className="text-[14px] text-muted">No signed visits on record.</p>
          )}
          {visits.map((v) => {
            const note = state.notes[v.id];
            const rx = state.prescriptions[v.id];
            const addenda = state.addenda[v.id] ?? [];
            return (
              <div
                key={v.id}
                className="py-4 border-b border-line last:border-0 break-inside-avoid"
              >
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-semibold text-[14px]">
                    {shortDate(v.date)}
                  </span>
                  <span className="t-mono-sm text-muted">
                    {v.durationSeconds
                      ? `${Math.round(v.durationSeconds / 60)} min consult`
                      : ""}
                    {note?.contentHash ? ` · hash ${note.contentHash}` : ""}
                  </span>
                </div>
                {note &&
                  NOTE_SECTIONS.filter(({ key }) => note.sections[key]?.trim()).map(
                    ({ key, label }) => (
                      <div key={key} className="mb-1.5">
                        <span className="t-label mr-2">{label}</span>
                        <span className="text-[13.5px]">{note.sections[key]}</span>
                      </div>
                    ),
                  )}
                {rx && rx.items.length > 0 && (
                  <div className="mt-2">
                    <span className="t-label mr-2">Prescribed</span>
                    <span className="text-[13.5px]">
                      {rx.items
                        .map(
                          (i) =>
                            `${drugById(i.drugId)?.brand ?? i.freeTextName} ${i.frequency}${i.durationDays ? ` ×${i.durationDays}d` : ""}`,
                        )
                        .join(" · ")}
                    </span>
                  </div>
                )}
                {addenda.map((a) => (
                  <p key={a.id} className="text-[13px] mt-2 mb-0 pl-3 border-l-2 border-mist">
                    <b className="font-semibold">Addendum</b> ({dateTimeStamp(a.createdAt)}): {a.body} — {a.reason}
                  </p>
                ))}
              </div>
            );
          })}
        </section>

        <footer className="pt-4 border-t border-line t-mono-sm text-muted leading-relaxed">
          <span className="inline-flex items-center gap-1.5">
            <Mark size={13} className="text-petrol" /> Exported from Sonara ·{" "}
            {state.clinic.name}
          </span>
          <br />
          Audio recordings are not part of this export — they are purged after{" "}
          {state.clinic.audioRetentionDays} days. The signed note is the medical
          record.
        </footer>
      </article>
    </div>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="t-label mb-1.5">{title}</div>
      {items.length === 0 ? (
        <p className="text-[13px] text-muted m-0">None recorded</p>
      ) : (
        <ul className="text-[13.5px] m-0 pl-4 list-disc space-y-1">
          {items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

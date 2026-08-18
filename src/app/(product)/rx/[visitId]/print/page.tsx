"use client";

import { use, useEffect } from "react";
import { Mark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { IconPrint } from "@/components/ui/icons";
import { useAppState } from "@/lib/store";
import { drugById } from "@/lib/drugs";
import { dateTimeStamp, patientCode, shortDate } from "@/lib/format";

/**
 * FR-RX-6: the signed prescription as it reaches the pharmacy counter —
 * doctor name, qualifications, registration number, clinic address, date,
 * patient details. Rendered as a page a browser prints to PDF.
 */
export default function RxPrintPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = use(params);
  const state = useAppState();

  const visit = state.visits.find((v) => v.id === visitId);
  const patient = state.patients.find((p) => p.id === visit?.patientId);
  const rx = state.prescriptions[visitId];
  const note = state.notes[visitId];

  useEffect(() => {
    document.title = patient
      ? `Rx · ${patient.fullName} · ${state.clinic.name}`
      : "Prescription";
  }, [patient, state.clinic.name]);

  if (!state.hydrated) return null;

  if (!visit || !patient || !rx || rx.state !== "signed") {
    return (
      <div className="min-h-dvh grid place-items-center bg-paper">
        <EmptyState title="No signed prescription here">
          A prescription is only printable once a verified doctor has signed
          it. Nothing unsigned ever leaves the system.
        </EmptyState>
      </div>
    );
  }

  const sig = rx.signatureSnapshot!;

  return (
    <div className="min-h-dvh bg-paper py-8 px-4">
      <div className="max-w-[820px] mx-auto mb-4 flex gap-2.5 justify-end no-print">
        <Button onClick={() => window.print()} variant="primary">
          <IconPrint size={15} /> Print / save as PDF
        </Button>
        <Button onClick={() => window.close()}>Close</Button>
      </div>

      <article className="print-sheet max-w-[820px] mx-auto bg-chalk border border-line rounded-card shadow-(--shadow-lift) px-12 py-10">
        {/* letterhead */}
        <header className="flex items-start gap-4 pb-5 border-b-2 border-petrol">
          <div className="flex-1">
            <h1 className="t-h2 mb-0.5">{state.clinic.name}</h1>
            <p className="t-mono text-muted m-0 leading-relaxed">
              {state.clinic.address}, {state.clinic.city} {state.clinic.pincode}
              <br />
              {state.clinic.phone}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[15px] font-semibold m-0">{sig.name}</p>
            <p className="t-mono text-muted m-0 leading-relaxed">
              {sig.qualifications}
              <br />
              Reg. {sig.registration}
            </p>
          </div>
        </header>

        {/* patient block */}
        <section className="grid grid-cols-2 gap-x-8 gap-y-1.5 py-4 border-b border-line text-[14px]">
          <div>
            <span className="t-label mr-2">Patient</span>
            <b className="font-semibold">{patient.fullName}</b>
          </div>
          <div className="text-right">
            <span className="t-label mr-2">Date</span>
            {rx.signedAt ? dateTimeStamp(rx.signedAt) : shortDate(visit.date)}
          </div>
          <div>
            <span className="t-label mr-2">Age / sex</span>
            {patient.ageYears} · {patient.sex === "F" ? "Female" : patient.sex === "M" ? "Male" : "Other"}
          </div>
          <div className="text-right">
            <span className="t-label mr-2">Record</span>
            <span className="font-mono text-[13px]">{patientCode(patient.id)}</span>
          </div>
        </section>

        {/* diagnosis line, no drug content from the note itself */}
        {note?.sections.assessment && (
          <section className="py-3.5 border-b border-line">
            <span className="t-label mr-2">Assessment</span>
            <span className="text-[14px]">{note.sections.assessment}</span>
          </section>
        )}

        {/* the Rx */}
        <section className="py-5">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-display text-[34px] leading-none text-petrol font-bold">
              ℞
            </span>
            <span className="t-label">Prescription</span>
          </div>
          <table className="w-full text-[14px] border-collapse">
            <thead>
              <tr className="border-b border-line">
                <th className="t-label text-left pb-1.5 w-8">#</th>
                <th className="t-label text-left pb-1.5">Medicine</th>
                <th className="t-label text-left pb-1.5 w-[92px]">Dose</th>
                <th className="t-label text-left pb-1.5 w-[70px]">Duration</th>
                <th className="t-label text-left pb-1.5 w-[150px]">Instructions</th>
              </tr>
            </thead>
            <tbody>
              {rx.items.map((it, i) => {
                const d = drugById(it.drugId);
                return (
                  <tr key={it.id} className="border-b border-dashed border-line">
                    <td className="py-2.5 align-top font-mono text-[13px] text-muted">
                      {i + 1}
                    </td>
                    <td className="py-2.5 align-top">
                      <b className="font-semibold">
                        {d?.brand ?? it.freeTextName}
                      </b>
                      {d && (
                        <span className="block t-mono-sm text-muted">
                          {d.salt} · {d.form}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 align-top font-mono text-[13px]">
                      {it.frequency}
                    </td>
                    <td className="py-2.5 align-top font-mono text-[13px]">
                      {it.durationDays ? `${it.durationDays} days` : "—"}
                    </td>
                    <td className="py-2.5 align-top text-[13.5px]">
                      {it.instructions || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {note?.sections.plan && (
            <p className="text-[13.5px] mt-4 leading-relaxed">
              <span className="t-label mr-2">Advice</span>
              {note.sections.plan}
            </p>
          )}
        </section>

        {/* signature */}
        <footer className="pt-5 border-t border-line flex items-end justify-between gap-6">
          <div className="t-mono-sm text-muted leading-relaxed max-w-[46ch]">
            Signed electronically by a registered medical practitioner ·{" "}
            {rx.signedAt ? dateTimeStamp(rx.signedAt) : ""}
            <br />
            Document hash {rx.contentHash} · verify at {state.clinic.name}
            <br />
            <span className="inline-flex items-center gap-1.5 mt-2">
              <Mark size={13} className="text-petrol" />
              Case sheet written with Sonara · reviewed and signed by the
              doctor
            </span>
          </div>
          <div className="text-right shrink-0">
            <div className="font-display text-[22px] text-petrol italic pb-1">
              {sig.name.replace(/^Dr\.\s*/, "")}
            </div>
            <div className="border-t border-ink pt-1.5 text-[13px] font-semibold">
              {sig.name}
            </div>
            <div className="t-mono-sm text-muted">{sig.registration}</div>
          </div>
        </footer>
      </article>
    </div>
  );
}

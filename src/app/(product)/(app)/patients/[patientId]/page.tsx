"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { FlagChip, Pill, Tag } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Avatar, EmptyState, KV } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import {
  IconChevronLeft,
  IconChevronRight,
  IconExport,
  IconMic,
  IconPlus,
  IconTrash,
  IconWarn,
} from "@/components/ui/icons";
import {
  patientFlags,
  useActions,
  useAppState,
  useMe,
  visitsOfPatient,
} from "@/lib/store";
import { drugById } from "@/lib/drugs";
import { patientCode, shortDate } from "@/lib/format";
import type { FlagKind } from "@/lib/types";

const PAGE = 20;

export default function PatientPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const state = useAppState();
  const actions = useActions();
  const { isClinical } = useMe();
  const toast = useToast();
  const router = useRouter();
  const [shown, setShown] = useState(PAGE);
  const [flagOpen, setFlagOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const patient = state.patients.find((p) => p.id === patientId);

  // FR-AUD-5: reads are logged too
  useEffect(() => {
    if (patient) actions.logView(patient.id, "patient profile");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, !!patient]);

  if (!state.hydrated) return null;
  if (!patient) {
    return (
      <EmptyState
        title="No such patient"
        action={<Button href="/patients">Back to patients</Button>}
      >
        This record isn't in your clinic. Nothing further is disclosed.
      </EmptyState>
    );
  }

  const flags = patientFlags(state, patient.id);
  const visits = visitsOfPatient(state, patient.id);

  const exportJson = () => {
    actions.exportPatient(patient.id);
    const payload = {
      exportedAt: new Date().toISOString(),
      clinic: state.clinic.name,
      patient,
      flags: state.flags.filter((f) => f.patientId === patient.id),
      visits: visits.map((v) => ({
        visit: v,
        note: state.notes[v.id],
        tags: state.tags[v.id] ?? [],
        prescription: state.prescriptions[v.id],
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${patientCode(patient.id)}-record.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Record exported. The export is logged");
  };

  return (
    <div className="max-w-[1060px] mx-auto px-6 py-7">
      <Link
        href="/patients"
        className="inline-flex items-center gap-1 t-mono-sm text-muted hover:text-ink mb-4"
      >
        <IconChevronLeft size={13} /> patients
      </Link>

      <div className="flex items-start gap-4 flex-wrap mb-5">
        <Avatar name={patient.fullName} size={52} />
        <div>
          <h1 className="t-h2">{patient.fullName}</h1>
          <div className="t-mono text-muted mt-0.5">
            {patient.ageYears}
            {patient.sex} · {patientCode(patient.id)} · {patient.phone} ·{" "}
            {visits.length} recorded visit{visits.length === 1 ? "" : "s"}
          </div>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          {isClinical && (
            <Button
              variant="primary"
              onClick={() => {
                const apptId = actions.startVisitForPatient(patient.id);
                const visitId = actions.openRoom(apptId);
                if (visitId) router.push(`/consult/${visitId}`);
              }}
            >
              <IconMic size={15} /> Start a visit
            </Button>
          )}
          <Button onClick={exportJson}>
            <IconExport size={14} /> Export
          </Button>
          {isClinical && (
            <Button variant="quiet" onClick={() => setDeleteOpen(true)}>
              <IconTrash size={14} /> Erase
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_330px] gap-4 items-start">
        {/* ── visit timeline ── */}
        <Panel>
          <PanelHeader
            title="Visit timeline"
            meta={`${visits.length} signed`}
          />
          {visits.length === 0 ? (
            <EmptyState title="No signed visits yet" className="py-10">
              Recorded visits appear here once the note is signed.
            </EmptyState>
          ) : (
            <div>
              {visits.slice(0, shown).map((v) => {
                const note = state.notes[v.id];
                const rx = state.prescriptions[v.id];
                const tags = state.tags[v.id] ?? [];
                return (
                  <Link
                    key={v.id}
                    href={isClinical ? `/consult/${v.id}` : "#"}
                    className="flex gap-4 px-[18px] py-3.5 border-b border-line last:border-0 hover:bg-soft group"
                  >
                    <div className="t-mono-sm text-muted w-[74px] shrink-0 pt-0.5">
                      {shortDate(v.date)}
                    </div>
                    <div className="min-w-0 flex-1">
                      {isClinical ? (
                        <>
                          <div className="font-semibold text-[14px]">
                            {note?.sections.assessment || "Visit"}
                          </div>
                          <div className="text-[13.5px] text-muted mt-0.5 line-clamp-2">
                            {note?.sections.presentingComplaint}
                          </div>
                          {rx && rx.items.length > 0 && (
                            <div className="t-mono-sm text-muted mt-1">
                              ℞{" "}
                              {rx.items
                                .map(
                                  (i) =>
                                    `${drugById(i.drugId)?.brand ?? i.freeTextName} ${i.frequency}`,
                                )
                                .join(" · ")}
                            </div>
                          )}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {tags.slice(0, 5).map((t) => (
                                <Tag key={t.id} label={t.label} code={t.code} />
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-[13.5px] text-muted">
                          Clinical detail is not available to the front desk.
                        </div>
                      )}
                    </div>
                    {isClinical && (
                      <IconChevronRight
                        size={14}
                        className="text-faint self-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      />
                    )}
                  </Link>
                );
              })}
              {visits.length > shown && (
                <button
                  type="button"
                  onClick={() => setShown((s) => s + PAGE)}
                  className="w-full py-3 t-mono-sm text-muted hover:text-ink hover:bg-soft border-t border-line"
                >
                  show {Math.min(PAGE, visits.length - shown)} more
                </button>
              )}
            </div>
          )}
        </Panel>

        {/* ── record side ── */}
        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Details" />
            <PanelBody className="py-2">
              <KV k="Sex / age">
                {patient.sex === "F" ? "Female" : patient.sex === "M" ? "Male" : "Other"} ·{" "}
                {patient.ageYears}
              </KV>
              <KV k="Phone">{patient.phone}</KV>
              <KV k="Speaks">
                {patient.preferredLanguage === "hi"
                  ? "Hindi"
                  : patient.preferredLanguage === "mr"
                    ? "Marathi"
                    : "English"}
              </KV>
              <KV k="Patient since">{shortDate(patient.createdAt)}</KV>
              <KV k="Record ID">
                <span className="font-mono text-[13px]">
                  {patientCode(patient.id)}
                </span>
              </KV>
            </PanelBody>
          </Panel>

          {isClinical && (
            <Panel>
              <PanelHeader
                title="Flags"
                meta={
                  <button
                    type="button"
                    onClick={() => setFlagOpen(true)}
                    className="inline-flex items-center gap-1 hover:text-ink"
                  >
                    <IconPlus size={12} /> add
                  </button>
                }
              />
              <PanelBody className="space-y-3.5">
                <FlagGroup
                  title="Allergies"
                  empty="None recorded. Checks still run on every prescription."
                  items={flags.allergies.map((f) => (
                    <FlagRow
                      key={f.id}
                      label={f.label}
                      detail={[f.detail, f.severity].filter(Boolean).join(" · ")}
                      icon={<IconWarn size={13} className="text-amber-text" />}
                      onRemove={() => actions.deactivateFlag(f.id)}
                    />
                  ))}
                />
                <FlagGroup
                  title="Chronic conditions"
                  empty="None recorded."
                  items={flags.chronic.map((f) => (
                    <FlagRow
                      key={f.id}
                      label={f.label}
                      detail={f.detail}
                      onRemove={() => actions.deactivateFlag(f.id)}
                    />
                  ))}
                />
                <FlagGroup
                  title="Running medication"
                  empty="None recorded."
                  items={flags.meds.map((f) => (
                    <FlagRow
                      key={f.id}
                      label={f.label}
                      detail={f.detail}
                      onRemove={() => actions.deactivateFlag(f.id)}
                    />
                  ))}
                />
              </PanelBody>
            </Panel>
          )}

          <Panel>
            <PanelHeader title="Data rights" />
            <PanelBody className="space-y-2.5">
              <p className="text-[13.5px] text-muted leading-relaxed m-0">
                Under the DPDP Act this patient can ask for their record, or
                for it to be erased. Both are one action here, and both are
                logged.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={exportJson}>
                  <IconExport size={13} /> Export JSON
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.open(`/patients/${patient.id}/summary`, "_blank")}
                >
                  Printable summary
                </Button>
              </div>
              <p className="t-mono-sm text-muted m-0 leading-relaxed">
                Audio is purged after {state.clinic.audioRetentionDays} days.
                Signed notes and prescriptions are medical records and are kept
                regardless.
              </p>
            </PanelBody>
          </Panel>
        </div>
      </div>

      <AddFlagModal
        open={flagOpen}
        onClose={() => setFlagOpen(false)}
        onAdd={(f) => {
          actions.addFlag({ patientId: patient.id, ...f });
          setFlagOpen(false);
          toast(`${f.label} added to the record`);
        }}
      />

      {/* FR-PAT-7: erasure with retention */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        eyebrow="Right to erasure"
        title={`Erase ${patient.fullName}'s record`}
      >
        <div className="space-y-3.5">
          <div className="border border-line rounded-field divide-y divide-line text-[13.5px]">
            <div className="px-3.5 py-2.5">
              <Pill tone="warn">deleted</Pill>
              <span className="ml-2">
                Identity, contact details, flags, audio and transcripts
              </span>
            </div>
            <div className="px-3.5 py-2.5">
              <Pill tone="ok">retained</Pill>
              <span className="ml-2">
                Signed notes and prescriptions, required by medical-records
                law, held for the statutory period
              </span>
            </div>
          </div>
          <Field label={`Type "${patient.fullName}" to confirm`}>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={patient.fullName}
            />
          </Field>
          <div className="flex justify-end gap-2.5">
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={confirmName.trim() !== patient.fullName}
              onClick={() => {
                actions.deletePatient(patient.id);
                setDeleteOpen(false);
                toast("Record erased. Retention rules applied and logged", "warn");
                router.push("/patients");
              }}
            >
              Erase record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FlagGroup({
  title,
  items,
  empty,
}: {
  title: string;
  items: React.ReactNode[];
  empty: string;
}) {
  return (
    <div>
      <div className="t-label mb-1.5">{title}</div>
      {items.length === 0 ? (
        <p className="text-[13px] text-muted m-0">{empty}</p>
      ) : (
        <div className="space-y-1">{items}</div>
      )}
    </div>
  );
}

function FlagRow({
  label,
  detail,
  icon,
  onRemove,
}: {
  label: string;
  detail?: string;
  icon?: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-2 group">
      {icon && <span className="mt-[3px] shrink-0">{icon}</span>}
      <span className="text-[13.5px] flex-1 min-w-0">
        <b className="font-semibold">{label}</b>
        {detail && <span className="block t-mono-sm text-muted">{detail}</span>}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-muted hover:text-ink p-1 rounded-[5px] hover:bg-tint-mist shrink-0"
        aria-label={`Remove ${label}`}
      >
        <IconTrash size={12} />
      </button>
    </div>
  );
}

/* FR-PAT-2: allergies are structured: substance + reaction + severity. */
function AddFlagModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (f: {
    kind: FlagKind;
    label: string;
    detail?: string;
    severity?: "mild" | "moderate" | "severe";
  }) => void;
}) {
  const [kind, setKind] = useState<FlagKind>("allergy");
  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("moderate");

  const valid =
    label.trim().length > 1 && (kind !== "allergy" || detail.trim().length > 1);

  return (
    <Modal open={open} onClose={onClose} eyebrow="Patient record" title="Add a flag">
      <form
        className="space-y-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onAdd({
            kind,
            label: label.trim(),
            detail: detail.trim() || undefined,
            severity: kind === "allergy" ? severity : undefined,
          });
          setLabel("");
          setDetail("");
        }}
      >
        <Field label="Kind">
          <Select value={kind} onChange={(e) => setKind(e.target.value as FlagKind)}>
            <option value="allergy">Allergy</option>
            <option value="chronic">Chronic condition</option>
            <option value="running_medication">Running medication</option>
          </Select>
        </Field>
        <Field
          label={kind === "allergy" ? "Drug or substance" : "Label"}
          hint={
            kind === "allergy"
              ? "Named substances are matched against every prescription, including by drug family."
              : undefined
          }
        >
          <Input value={label} onChange={(e) => setLabel(e.target.value)} autoFocus />
        </Field>
        <Field label={kind === "allergy" ? "Reaction" : "Detail"}>
          <Input
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder={
              kind === "allergy" ? "e.g. urticaria after amoxicillin, 2019" : "optional"
            }
          />
        </Field>
        {kind === "allergy" && (
          <Field label="Severity">
            <Select
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value as "mild" | "moderate" | "severe")
              }
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </Select>
          </Field>
        )}
        <div className="flex justify-end gap-2.5">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={!valid}>
            Add flag
          </Button>
        </div>
      </form>
    </Modal>
  );
}

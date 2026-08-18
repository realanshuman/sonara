"use client";

import { useMemo, useRef, useState } from "react";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/badge";
import { Banner } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  IconClose,
  IconLock,
  IconMail,
  IconPlus,
  IconPrint,
  IconSign,
  IconWarn,
  IconWhatsApp,
} from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { patientFlags, useActions, useAppState, useMe } from "@/lib/store";
import { allergyConflict, drugById, FREQUENCIES, searchDrugs } from "@/lib/drugs";
import { dateTimeStamp } from "@/lib/format";
import { NOTE_SECTIONS, type Patient, type RxItem, type Visit } from "@/lib/types";
import { cx } from "@/lib/cx";

export function RxPanel({ visit, patient }: { visit: Visit; patient: Patient }) {
  const state = useAppState();
  const actions = useActions();
  const toast = useToast();
  const { me, profile, verified, isClinical } = useMe();

  const note = state.notes[visit.id];
  const rx = state.prescriptions[visit.id];
  const items = rx?.items ?? [];
  const signed = rx?.state === "signed" || visit.state === "signed";
  const flags = patientFlags(state, patient.id);
  const allergyLabels = flags.allergies.map((f) => f.label);
  const deliveries = state.deliveries.filter((d) => d.visitId === visit.id);

  const [adding, setAdding] = useState(false);
  const [block, setBlock] = useState<{
    drugName: string;
    allergy: string;
    pending: Omit<RxItem, "id" | "seq" | "source">;
  } | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [signOpen, setSignOpen] = useState(false);

  if (!note && !rx && visit.state !== "drafted" && visit.state !== "signed") {
    return null;
  }
  if (!isClinical) return null;

  const itemName = (it: RxItem) =>
    drugById(it.drugId)?.brand ?? it.freeTextName ?? "-";

  const tryAdd = (item: Omit<RxItem, "id" | "seq" | "source">) => {
    const conflict = allergyConflict(
      { drugId: item.drugId, freeTextName: item.freeTextName },
      allergyLabels,
    );
    if (conflict) {
      // FR-RX-3: hard stop. Only a typed reason gets past this.
      setBlock({ drugName: conflict.drugName, allergy: conflict.allergy, pending: item });
      return;
    }
    actions.addRxItem(visit.id, item);
    setAdding(false);
  };

  const canSign =
    !!note &&
    note.sections.assessment.trim().length > 0 &&
    verified &&
    !signed;

  return (
    <Panel id="rx">
      <PanelHeader
        title="Prescription"
        meta={
          signed ? (
            <span className="inline-flex items-center gap-1.5 text-petrol">
              <IconLock size={12} /> signed
            </span>
          ) : (
            /* amber, not signal: signal red means "recording", nothing else */
            <span className="text-amber-text">unsigned</span>
          )
        }
      />
      <PanelBody>
        {items.length === 0 && (
          <p className="text-[14px] text-muted mt-0 mb-3">
            {signed
              ? "No medication was prescribed at this visit."
              : "You compose the prescription. Sonara formats it, checks it against recorded allergies, and delivers it after you sign. It never suggests a drug."}
          </p>
        )}

        {items.length > 0 && (
          <div className="mb-1">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-start gap-3 py-2.5 border-b border-dashed border-line last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[14px] flex items-center gap-2 flex-wrap">
                    {itemName(it)}
                    {!it.drugId && (
                      <Pill tone="warn">free text · unverified entry</Pill>
                    )}
                  </div>
                  <div className="t-mono text-muted mt-0.5">
                    {[
                      it.strength !== "-" ? it.strength : null,
                      it.form,
                      it.frequency,
                      it.durationDays ? `${it.durationDays}d` : null,
                      it.instructions || null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                {!signed && (
                  <button
                    type="button"
                    onClick={() => actions.removeRxItem(visit.id, it.id)}
                    className="p-1.5 text-muted hover:text-ink hover:bg-tint-mist rounded-[6px]"
                    aria-label={`Remove ${itemName(it)}`}
                  >
                    <IconClose size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {!signed && (
          <>
            {adding ? (
              <AddDrugForm
                onCancel={() => setAdding(false)}
                onAdd={tryAdd}
                allergyLabels={allergyLabels}
              />
            ) : (
              <Button size="sm" onClick={() => setAdding(true)}>
                <IconPlus size={14} /> Add medicine
              </Button>
            )}

            {/* sign bar */}
            <div className="flex items-center gap-3 flex-wrap mt-4 pt-4 border-t border-line">
              <Button
                variant="primary"
                disabled={!canSign}
                onClick={() => setSignOpen(true)}
              >
                <IconSign size={15} /> Review &amp; sign
              </Button>
              <span className="t-mono-sm text-muted leading-relaxed">
                {verified
                  ? `${me.fullName} · ${profile?.registrationNumber} · signature applied only on your approval`
                  : me.role === "front_desk"
                    ? "Signing is a doctor's action."
                    : "Signing unlocks once your registration is verified. Drafting works meanwhile."}
              </span>
            </div>
            {!note && (
              <p className="t-mono-sm text-muted mt-2 mb-0">
                A case sheet is needed before signing. Record the visit or
                write one manually above.
              </p>
            )}
          </>
        )}

        {signed && rx && (
          <>
            <div className="t-mono-sm text-muted leading-relaxed mt-1">
              Signed by {rx.signatureSnapshot?.name} ·{" "}
              {rx.signedAt ? dateTimeStamp(rx.signedAt) : ""} ·{" "}
              {rx.signatureSnapshot?.registration} · hash {rx.contentHash}
            </div>

            {/* delivery: FR-RX-7 */}
            <div className="mt-4 pt-4 border-t border-line">
              <div className="t-label mb-2.5">Deliver to the patient</div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => {
                    actions.deliverRx(visit.id, "print");
                    window.open(`/rx/${visit.id}/print`, "_blank");
                  }}
                >
                  <IconPrint size={14} /> Print
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    actions.deliverRx(visit.id, "whatsapp");
                    toast(`Sending to WhatsApp ${patient.phone}`, "info");
                  }}
                >
                  <IconWhatsApp size={14} /> WhatsApp
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    actions.deliverRx(visit.id, "email");
                    toast("Sending by email", "info");
                  }}
                >
                  <IconMail size={14} /> Email
                </Button>
              </div>
              {deliveries.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {deliveries.map((d) => (
                    <div key={d.id} className="flex items-center gap-2.5 t-mono-sm">
                      <span className="text-muted w-[74px]">{d.channel}</span>
                      <span className="text-muted flex-1 truncate">
                        {d.destination}
                      </span>
                      <Pill
                        tone={
                          d.state === "delivered"
                            ? "ok"
                            : d.state === "failed"
                              ? "warn"
                              : "wait"
                        }
                      >
                        {d.state}
                      </Pill>
                      {d.state === "failed" && (
                        <button
                          type="button"
                          className="underline underline-offset-2 text-muted hover:text-ink"
                          onClick={() => actions.retryDelivery(d.id)}
                        >
                          retry
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </PanelBody>

      {/* ── allergy hard stop (FR-RX-3) ── */}
      <Modal
        open={!!block}
        onClose={() => {
          setBlock(null);
          setOverrideReason("");
        }}
        closable={false}
        eyebrow="Allergy on record"
        title="Stopped before it reached the prescription"
      >
        {block && (
          <>
            <Banner tone="warn" icon={<IconWarn size={16} />} className="mb-4">
              <b className="font-semibold">{block.drugName}</b> conflicts with a
              recorded allergy: <b className="font-semibold">{block.allergy}</b>
              {(() => {
                const f = flags.allergies.find((x) => x.label === block.allergy);
                return f?.detail ? `, ${f.detail}` : "";
              })()}
              .
            </Banner>
            <p className="text-[13.5px] text-muted leading-relaxed mb-3">
              If you still intend to prescribe it, type the clinical reason.
              The override is recorded in the audit log with your name.
            </p>
            <Field label="Clinical reason for overriding">
              <Textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. previous reaction reviewed with patient; benefit outweighs risk because…"
                rows={2}
                autoFocus
              />
            </Field>
            <div className="flex justify-end gap-2.5 mt-4">
              <Button
                variant="primary"
                onClick={() => {
                  setBlock(null);
                  setOverrideReason("");
                }}
              >
                Remove it, good catch
              </Button>
              <Button
                disabled={overrideReason.trim().length < 10}
                title={
                  overrideReason.trim().length < 10
                    ? "A typed reason of at least 10 characters is required"
                    : undefined
                }
                onClick={() => {
                  actions.overrideAllergy(
                    visit.id,
                    block.drugName,
                    block.allergy,
                    overrideReason.trim(),
                  );
                  actions.addRxItem(visit.id, block.pending);
                  setBlock(null);
                  setOverrideReason("");
                  setAdding(false);
                  toast("Override logged with your reason", "warn");
                }}
              >
                Override &amp; add
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* ── the signing sheet (FR-RX-4/5, §10.1) ── */}
      <SignSheet
        open={signOpen}
        onClose={() => setSignOpen(false)}
        visit={visit}
        patient={patient}
        onSign={() => {
          actions.signVisit(visit.id);
          setSignOpen(false);
          toast("Signed. The note is locked and the prescription is ready to deliver");
          document.getElementById("rx")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </Panel>
  );
}

/* ── add-medicine form with drug-database autocomplete (FR-RX-1/2) ── */

function AddDrugForm({
  onAdd,
  onCancel,
  allergyLabels,
}: {
  onAdd: (item: Omit<RxItem, "id" | "seq" | "source">) => void;
  onCancel: () => void;
  allergyLabels: string[];
}) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<ReturnType<typeof drugById>>(undefined);
  const [freeText, setFreeText] = useState(false);
  const [frequency, setFrequency] = useState("1-0-1");
  const [duration, setDuration] = useState("5");
  const [instructions, setInstructions] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => (picked || freeText ? [] : searchDrugs(q)), [q, picked, freeText]);
  const chosenName = picked?.brand ?? (freeText ? q.trim() : "");
  const ready = chosenName.length > 1 && frequency;

  const wouldConflict = useMemo(() => {
    if (!chosenName) return null;
    return allergyConflict(
      { drugId: picked?.id, freeTextName: freeText ? q.trim() : undefined },
      allergyLabels,
    );
  }, [chosenName, picked, freeText, q, allergyLabels]);

  return (
    <form
      className="border border-line rounded-field p-4 bg-soft space-y-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        onAdd({
          drugId: picked?.id,
          freeTextName: picked ? undefined : q.trim(),
          strength: picked?.strength ?? "-",
          form: picked?.form ?? "as written",
          frequency,
          durationDays: duration ? Number(duration) : null,
          instructions: instructions.trim(),
        });
      }}
    >
      <Field label="Medicine">
        <div className="relative">
          <Input
            value={picked ? `${picked.brand} · ${picked.generic}` : q}
            onChange={(e) => {
              setPicked(undefined);
              setFreeText(false);
              setQ(e.target.value);
            }}
            placeholder="Start typing a brand or generic, e.g. dolo, augmentin"
            autoFocus
            aria-autocomplete="list"
          />
          {results.length > 0 && (
            <div
              ref={listRef}
              className="absolute z-20 left-0 right-0 top-full mt-1 bg-chalk border border-line rounded-field shadow-(--shadow-pop) overflow-hidden"
            >
              {results.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setPicked(d)}
                  className="w-full flex items-baseline gap-2.5 px-3.5 py-2 text-left hover:bg-soft"
                >
                  <span className="font-semibold text-[13.5px]">{d.brand}</span>
                  <span className="t-mono-sm text-muted flex-1 truncate">
                    {d.salt} · {d.form}
                  </span>
                  {d.schedule && d.schedule !== "OTC" && (
                    <span className="t-mono-sm text-amber-text">Sch {d.schedule}</span>
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFreeText(true)}
                className="w-full px-3.5 py-2 text-left t-mono-sm text-muted hover:bg-soft border-t border-line"
              >
                Use “{q}” as written, as free text flagged unverified
              </button>
            </div>
          )}
          {q.length > 1 && results.length === 0 && !picked && !freeText && (
            <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-chalk border border-line rounded-field shadow-(--shadow-pop) overflow-hidden">
              <button
                type="button"
                onClick={() => setFreeText(true)}
                className="w-full px-3.5 py-2 text-left text-[13.5px] hover:bg-soft"
              >
                Not in the drug database. Use{" "}
                <b className="font-semibold">“{q}”</b> as free text.{" "}
                <span className="t-mono-sm text-amber-text">
                  it prints exactly as typed, marked unverified
                </span>
              </button>
            </div>
          )}
        </div>
      </Field>

      {wouldConflict && (
        <Banner tone="warn" icon={<IconWarn size={14} />}>
          Heads up: this matches the recorded allergy “{wouldConflict.allergy}
          ”. Adding it will require a typed override.
        </Banner>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Frequency">
          <Select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Days">
          <Input
            value={duration}
            onChange={(e) => setDuration(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="5"
          />
        </Field>
        <Field label="Instructions">
          <Input
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="After food"
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2.5">
        <Button size="sm" variant="quiet" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" variant="primary" type="submit" disabled={!ready}>
          Add to prescription
        </Button>
      </div>
    </form>
  );
}

/* ── the confirmation sheet: exactly what will be sent, nothing less ── */

function SignSheet({
  open,
  onClose,
  visit,
  patient,
  onSign,
}: {
  open: boolean;
  onClose: () => void;
  visit: Visit;
  patient: Patient;
  onSign: () => void;
}) {
  const state = useAppState();
  const { me, profile } = useMe();
  const note = state.notes[visit.id];
  const rx = state.prescriptions[visit.id];
  const overrides = state.overrides.filter((o) => o.visitId === visit.id);
  if (!note) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      eyebrow="Review before signing"
      title="This is exactly what enters the record"
    >
      <div className="border border-line rounded-field divide-y divide-line mb-4">
        <div className="px-4 py-2.5 flex items-baseline gap-3 bg-soft">
          <span className="font-semibold text-[14px]">
            {patient.fullName} · {patient.ageYears}
            {patient.sex}
          </span>
          <span className="t-mono-sm text-muted">
            {state.clinic.name} · {dateTimeStamp(new Date().toISOString())}
          </span>
        </div>
        <div className="px-4 py-3 space-y-2.5">
          {NOTE_SECTIONS.map(({ key, label }) => (
            <div key={key}>
              <div className="t-label">{label}</div>
              <p className="text-[13.5px] leading-relaxed m-0 whitespace-pre-wrap">
                {note.sections[key]?.trim() || (
                  <span className="text-muted">left empty</span>
                )}
              </p>
            </div>
          ))}
        </div>
        <div className="px-4 py-3">
          <div className="t-label mb-1.5">Prescription</div>
          {rx && rx.items.length > 0 ? (
            rx.items.map((it) => {
              const d = drugById(it.drugId);
              return (
                <div key={it.id} className="flex items-baseline gap-2.5 py-1">
                  <span className="text-[13.5px] font-semibold">
                    {d?.brand ?? it.freeTextName}
                  </span>
                  <span className="t-mono-sm text-muted">
                    {[
                      d?.salt,
                      it.frequency,
                      it.durationDays ? `${it.durationDays}d` : null,
                      it.instructions || null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  {!it.drugId && (
                    <span className="t-mono-sm text-amber-text">free text</span>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-[13.5px] text-muted m-0">
              No medication. The case sheet is signed on its own.
            </p>
          )}
          {overrides.length > 0 && (
            <p className="t-mono-sm text-amber-text mt-2 mb-0">
              Includes {overrides.length} allergy override
              {overrides.length > 1 ? "s" : ""}, reason on record.
            </p>
          )}
        </div>
        <div className="px-4 py-3 bg-soft">
          <div className="t-label mb-1">Signature to be applied</div>
          <p className="text-[13.5px] m-0 leading-relaxed">
            {me.fullName} · {profile?.qualifications}
            <br />
            <span className="t-mono-sm text-muted">
              {profile?.registrationNumber} · {profile?.registrationCouncil} ·{" "}
              {state.clinic.name}, {state.clinic.city}
            </span>
          </p>
        </div>
      </div>

      <p className="t-mono-sm text-muted leading-relaxed mb-4">
        Signing locks the note and the prescription. Corrections after this
        point are addenda or a fresh prescription. The signed record itself
        never changes.
      </p>
      <div className="flex justify-end gap-2.5">
        <Button onClick={onClose}>Go back and edit</Button>
        <Button variant="primary" onClick={onSign}>
          <IconSign size={15} /> Sign &amp; lock
        </Button>
      </div>
    </Modal>
  );
}

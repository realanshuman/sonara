"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FlagChip, Pill, type PillTone } from "@/components/ui/badge";
import { Input, Field, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { EmptyState, Kbd } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import {
  IconChevronRight,
  IconPlus,
  IconSearch,
  IconToday,
  IconWarn,
} from "@/components/ui/icons";
import {
  patientFlags,
  useActions,
  useAppState,
  useMe,
} from "@/lib/store";
import { fuzzyScore } from "@/lib/fuzzy";
import { longToday, timeOfDay } from "@/lib/format";
import type { Appointment, Sex } from "@/lib/types";
import { cx } from "@/lib/cx";

const STATUS_META: Record<
  Appointment["status"],
  { label: string; tone: PillTone; order: number }
> = {
  in_room: { label: "In room", tone: "sea", order: 0 },
  arrived: { label: "Waiting", tone: "wait", order: 1 },
  scheduled: { label: "Scheduled", tone: "neutral", order: 2 },
  signed: { label: "Signed", tone: "ok", order: 3 },
  no_show: { label: "No show", tone: "neutral", order: 4 },
};

export default function TodayPage() {
  const state = useAppState();
  const { me, isClinical } = useMe();
  const actions = useActions();
  const toast = useToast();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [walkInOpen, setWalkInOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const rows = useMemo(() => {
    const withPatient = state.appointments
      .map((a) => ({
        appt: a,
        patient: state.patients.find((p) => p.id === a.patientId),
      }))
      .filter((r) => !!r.patient);
    const filtered = query.trim()
      ? withPatient.filter(
          (r) => fuzzyScore(query, r.patient!.fullName, r.patient!.phone) > 0,
        )
      : withPatient;
    return filtered.sort(
      (a, b) =>
        STATUS_META[a.appt.status].order - STATUS_META[b.appt.status].order ||
        a.appt.scheduledAt.localeCompare(b.appt.scheduledAt),
    );
  }, [state.appointments, state.patients, query]);

  const counts = useMemo(() => {
    const c = { signed: 0, waiting: 0, in_room: 0, scheduled: 0, no_show: 0 };
    for (const a of state.appointments) {
      if (a.status === "signed") c.signed++;
      else if (a.status === "arrived") c.waiting++;
      else if (a.status === "in_room") c.in_room++;
      else if (a.status === "scheduled") c.scheduled++;
      else if (a.status === "no_show") c.no_show++;
    }
    return c;
  }, [state.appointments]);

  const openRoom = (apptId: string) => {
    const visitId = actions.openRoom(apptId);
    if (visitId) router.push(`/consult/${visitId}`);
  };

  return (
    <div className="max-w-[1060px] mx-auto px-6 py-7">
      {/* header */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <div className="t-eyebrow mb-1">{longToday()}</div>
          <h1 className="t-h2">Today</h1>
          <div className="t-mono text-muted mt-1">
            {counts.signed} signed · {counts.in_room} in room · {counts.waiting}{" "}
            waiting · {counts.scheduled} scheduled
            {counts.no_show > 0 && ` · ${counts.no_show} no-show`}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <IconSearch
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or phone"
              className="pl-9 w-[240px] py-[8px] text-[14px]"
              aria-label="Search today's patients"
            />
            {!query && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <Kbd>/</Kbd>
              </span>
            )}
          </div>
          <Button variant="primary" onClick={() => setWalkInOpen(true)}>
            <IconPlus size={15} /> Walk-in
          </Button>
        </div>
      </div>

      {/* queue */}
      {rows.length === 0 ? (
        <EmptyState
          icon={<IconToday size={34} />}
          title={query ? "No one matches" : "The book is empty"}
          action={
            query ? (
              <Button onClick={() => setQuery("")}>Clear search</Button>
            ) : (
              <Button variant="primary" onClick={() => setWalkInOpen(true)}>
                <IconPlus size={15} /> Add a walk-in
              </Button>
            )
          }
        >
          {query
            ? `Nothing in today's list for "${query}". Try fewer letters — the search is forgiving.`
            : "Add a walk-in patient, or import an appointment book from Settings."}
        </EmptyState>
      ) : (
        <div className="bg-chalk border border-line rounded-panel overflow-hidden">
          {rows.map(({ appt, patient }, i) => {
            const flags = patientFlags(state, patient!.id);
            const visit = state.visits.find((v) => v.appointmentId === appt.id);
            const sm = STATUS_META[appt.status];
            const isNext =
              appt.status === "arrived" &&
              rows.find((r) => r.appt.status === "arrived")?.appt.id === appt.id;
            return (
              <div
                key={appt.id}
                className={cx(
                  "flex items-center gap-4 px-5 py-3.5 group",
                  i > 0 && "border-t border-line",
                  appt.status === "in_room" && "bg-soft",
                  (appt.status === "no_show" || appt.status === "signed") &&
                    "opacity-75",
                )}
              >
                <span className="t-mono text-muted w-8 shrink-0">
                  {String(appt.tokenNumber).padStart(2, "0")}
                </span>
                <div className="min-w-0 w-[230px]">
                  <div className="font-semibold text-[14.5px] truncate">
                    {patient!.fullName}
                  </div>
                  <div className="text-[12.5px] text-muted truncate">
                    {patient!.ageYears}
                    {patient!.sex} · {appt.visitType} ·{" "}
                    {timeOfDay(appt.scheduledAt)}
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
                  {isClinical ? (
                    <>
                      {flags.allergies.map((f) => (
                        <FlagChip key={f.id} kind="allergy">
                          <IconWarn size={11} /> {f.label}
                        </FlagChip>
                      ))}
                      {flags.chronic.slice(0, 2).map((f) => (
                        <FlagChip key={f.id} kind="chronic">
                          {f.label}
                        </FlagChip>
                      ))}
                      {flags.meds.length > 0 && (
                        <FlagChip kind="medication">
                          {flags.meds.length} running med
                          {flags.meds.length > 1 ? "s" : ""}
                        </FlagChip>
                      )}
                    </>
                  ) : (
                    <span className="t-mono text-muted">{patient!.phone}</span>
                  )}
                </div>

                <Pill tone={sm.tone}>{sm.label}</Pill>

                <div className="w-[130px] flex justify-end shrink-0">
                  {isClinical ? (
                    appt.status === "signed" ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          visit && router.push(`/consult/${visit.id}`)
                        }
                      >
                        View note
                      </Button>
                    ) : appt.status === "no_show" ? (
                      <Button size="sm" onClick={() => actions.checkIn(appt.id)}>
                        Arrived late
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant={
                          appt.status === "in_room" || isNext
                            ? "primary"
                            : "ghost"
                        }
                        onClick={() => openRoom(appt.id)}
                      >
                        {appt.status === "in_room" ? "Continue" : "Open room"}
                        <IconChevronRight size={13} />
                      </Button>
                    )
                  ) : appt.status === "scheduled" ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        actions.checkIn(appt.id);
                        toast(`${patient!.fullName} checked in`);
                      }}
                    >
                      Check in
                    </Button>
                  ) : appt.status === "arrived" ? (
                    <Button
                      size="sm"
                      variant="quiet"
                      onClick={() => actions.markNoShow(appt.id)}
                    >
                      No show
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isClinical && (
        <p className="t-mono-sm text-muted mt-4 leading-relaxed">
          Front-desk view — clinical flags, notes and recordings are not
          available to this role. Every record access is logged.
        </p>
      )}

      <WalkInModal
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        onAdd={(fields) => {
          const dup = state.patients.find(
            (p) =>
              p.phone.replace(/\D/g, "").endsWith(fields.phone.replace(/\D/g, "").slice(-10)) &&
              fields.phone.replace(/\D/g, "").length >= 10,
          );
          const res = actions.addWalkIn(fields);
          setWalkInOpen(false);
          toast(
            dup
              ? `Added — heads up, ${dup.fullName} has the same phone`
              : `${fields.fullName} added to the queue`,
            dup ? "warn" : "ok",
          );
          if (isClinical && me.role !== "front_desk") {
            // doctor adding a walk-in usually goes straight to the room
            const visitId = actions.openRoom(res.apptId);
            if (visitId) router.push(`/consult/${visitId}`);
          }
        }}
      />
    </div>
  );
}

/* FR-APPT-2: name + age + sex + phone only — addable in under 15 seconds. */
function WalkInModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (fields: {
    fullName: string;
    ageYears: number;
    sex: Sex;
    phone: string;
    visitType: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex>("F");
  const [phone, setPhone] = useState("");
  const [visitType, setVisitType] = useState("walk-in");

  useEffect(() => {
    if (open) {
      setName("");
      setAge("");
      setPhone("");
      setVisitType("walk-in");
    }
  }, [open]);

  const valid = name.trim().length > 1 && Number(age) > 0 && phone.trim().length >= 10;

  return (
    <Modal open={open} onClose={onClose} eyebrow="New walk-in" title="Add to today's queue">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onAdd({
            fullName: name.trim(),
            ageYears: Number(age),
            sex,
            phone: phone.trim(),
            visitType,
          });
        }}
        className="space-y-4"
      >
        <Field label="Full name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="As the patient says it"
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Age">
            <Input
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="34"
            />
          </Field>
          <Field label="Sex">
            <Select value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="F">Female</option>
              <option value="M">Male</option>
              <option value="O">Other</option>
            </Select>
          </Field>
          <Field label="Visit">
            <Select value={visitType} onChange={(e) => setVisitType(e.target.value)}>
              <option value="walk-in">Walk-in</option>
              <option value="follow-up">Follow-up</option>
              <option value="new complaint">New complaint</option>
              <option value="report review">Report review</option>
            </Select>
          </Field>
        </div>
        <Field
          label="Phone"
          hint="These four fields are all that's required — everything else can wait."
        >
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="+91 …"
          />
        </Field>
        <div className="flex gap-2.5 justify-end pt-1">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={!valid}>
            Add to queue
          </Button>
        </div>
      </form>
    </Modal>
  );
}

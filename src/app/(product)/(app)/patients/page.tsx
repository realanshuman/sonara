"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FlagChip, Tag } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Avatar, EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import {
  IconChevronRight,
  IconPatients,
  IconPlus,
  IconSearch,
  IconWarn,
} from "@/components/ui/icons";
import { patientFlags, useActions, useAppState, useMe, visitsOfPatient } from "@/lib/store";
import { fuzzyScore } from "@/lib/fuzzy";
import { patientCode, shortDate } from "@/lib/format";
import type { ConsentLanguage, Sex } from "@/lib/types";

export default function PatientsPage() {
  const state = useAppState();
  const { isClinical } = useMe();
  const actions = useActions();
  const toast = useToast();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  /** every symptom tag seen in signed notes — FR-PAT-5 */
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const list of Object.values(state.tags)) {
      for (const t of list) {
        if (t.kind === "symptom" || t.kind === "condition") {
          counts.set(t.label, (counts.get(t.label) ?? 0) + 1);
        }
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [state.tags]);

  const rows = useMemo(() => {
    let list = state.patients.map((p) => {
      const visits = visitsOfPatient(state, p.id);
      return { p, visits, last: visits[0] };
    });

    if (tagFilter) {
      list = list.filter(({ visits }) =>
        visits.some((v) =>
          (state.tags[v.id] ?? []).some((t) => t.label === tagFilter),
        ),
      );
    }
    if (q.trim()) {
      list = list
        .map((r) => ({ ...r, score: fuzzyScore(q, r.p.fullName, r.p.phone) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score);
    } else {
      list = list.sort((a, b) => {
        if (!a.last && !b.last) return a.p.fullName.localeCompare(b.p.fullName);
        if (!a.last) return 1;
        if (!b.last) return -1;
        return b.last.date.localeCompare(a.last.date);
      });
    }
    return list;
  }, [state, q, tagFilter]);

  return (
    <div className="max-w-[1060px] mx-auto px-6 py-7">
      <div className="flex flex-wrap items-end gap-4 mb-5">
        <div>
          <div className="t-eyebrow mb-1">{state.clinic.name}</div>
          <h1 className="t-h2">Patients</h1>
          <div className="t-mono text-muted mt-1">
            {state.patients.length} records
            {tagFilter && ` · filtered by “${tagFilter}”`}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <div className="relative">
            <IconSearch
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name or phone — typos are fine"
              className="pl-9 w-[260px] py-[8px] text-[14px]"
              aria-label="Search patients"
            />
          </div>
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <IconPlus size={15} /> New patient
          </Button>
        </div>
      </div>

      {isClinical && allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="t-label">Filter by tag</span>
          {allTags.map(([label, n]) => (
            <button
              key={label}
              type="button"
              onClick={() => setTagFilter(tagFilter === label ? "" : label)}
              className="focus-visible:outline-sea"
            >
              <Tag
                label={`${label} · ${n}`}
                code={tagFilter === label ? undefined : null}
                className={
                  tagFilter === label
                    ? "ring-1 ring-sea bg-tint-sea text-petrol"
                    : "hover:bg-mist"
                }
              />
            </button>
          ))}
          {tagFilter && (
            <button
              type="button"
              className="t-mono-sm text-muted underline underline-offset-2 hover:text-ink"
              onClick={() => setTagFilter("")}
            >
              clear
            </button>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          icon={<IconPatients size={34} />}
          title="Nothing matches"
          action={
            <Button
              onClick={() => {
                setQ("");
                setTagFilter("");
              }}
            >
              Clear filters
            </Button>
          }
        >
          No patient matches that search. The search is forgiving — try fewer
          letters, or the last four digits of a phone number.
        </EmptyState>
      ) : (
        <div className="bg-chalk border border-line rounded-panel overflow-hidden">
          {rows.map(({ p, visits, last }, i) => {
            const flags = patientFlags(state, p.id);
            return (
              <Link
                key={p.id}
                href={`/patients/${p.id}`}
                className={`flex items-center gap-4 px-5 py-3 hover:bg-soft group ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <Avatar name={p.fullName} size={32} />
                <div className="min-w-0 w-[220px]">
                  <div className="font-semibold text-[14.5px] truncate">
                    {p.fullName}
                  </div>
                  <div className="t-mono-sm text-muted truncate">
                    {p.ageYears}
                    {p.sex} · {patientCode(p.id)} · {p.phone}
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
                  {isClinical &&
                    flags.allergies.map((f) => (
                      <FlagChip key={f.id} kind="allergy">
                        <IconWarn size={11} /> {f.label}
                      </FlagChip>
                    ))}
                  {isClinical &&
                    flags.chronic.slice(0, 2).map((f) => (
                      <FlagChip key={f.id} kind="chronic">
                        {f.label}
                      </FlagChip>
                    ))}
                </div>
                <div className="t-mono-sm text-muted text-right shrink-0">
                  {last ? (
                    <>
                      {visits.length} visit{visits.length > 1 ? "s" : ""}
                      <span className="block">last {shortDate(last.date)}</span>
                    </>
                  ) : (
                    "no visits yet"
                  )}
                </div>
                <IconChevronRight
                  size={14}
                  className="text-faint opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                />
              </Link>
            );
          })}
        </div>
      )}

      <NewPatientModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        existingPhones={state.patients.map((p) => ({
          phone: p.phone,
          name: p.fullName,
          id: p.id,
        }))}
        onAdd={(fields) => {
          const id = actions.addPatient(fields);
          setAddOpen(false);
          toast(`${fields.fullName} added`);
          router.push(`/patients/${id}`);
        }}
      />
    </div>
  );
}

/* FR-APPT-5: duplicate detection warns and offers the existing record;
   it never auto-merges. */
function NewPatientModal({
  open,
  onClose,
  onAdd,
  existingPhones,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (f: {
    fullName: string;
    ageYears: number;
    sex: Sex;
    phone: string;
    preferredLanguage: ConsentLanguage;
  }) => void;
  existingPhones: { phone: string; name: string; id: string }[];
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex>("F");
  const [phone, setPhone] = useState("");
  const [lang, setLang] = useState<ConsentLanguage>("hi");

  const digits = phone.replace(/\D/g, "");
  const dup =
    digits.length >= 10
      ? existingPhones.find((e) => e.phone.replace(/\D/g, "").endsWith(digits.slice(-10)))
      : undefined;
  const valid = name.trim().length > 1 && Number(age) > 0 && digits.length >= 10;

  return (
    <Modal open={open} onClose={onClose} eyebrow="New record" title="Add a patient">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onAdd({
            fullName: name.trim(),
            ageYears: Number(age),
            sex,
            phone: phone.trim(),
            preferredLanguage: lang,
          });
        }}
      >
        <Field label="Full name">
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Age">
            <Input
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
            />
          </Field>
          <Field label="Sex">
            <Select value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="F">Female</option>
              <option value="M">Male</option>
              <option value="O">Other</option>
            </Select>
          </Field>
          <Field label="Speaks">
            <Select
              value={lang}
              onChange={(e) => setLang(e.target.value as ConsentLanguage)}
            >
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
              <option value="en">English</option>
            </Select>
          </Field>
        </div>
        <Field label="Phone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
        </Field>

        {dup && (
          <div className="border border-tint-amber-line bg-tint-amber rounded-field px-3.5 py-2.5 text-[13.5px] leading-snug">
            <b className="font-semibold">{dup.name}</b> already has this phone
            number.{" "}
            <Link
              href={`/patients/${dup.id}`}
              className="underline underline-offset-2"
              onClick={onClose}
            >
              Open that record
            </Link>{" "}
            instead — records are never merged automatically.
          </div>
        )}

        <div className="flex justify-end gap-2.5">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={!valid}>
            {dup ? "Add anyway" : "Add patient"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

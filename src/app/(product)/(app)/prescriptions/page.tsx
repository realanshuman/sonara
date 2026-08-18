"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/badge";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/misc";
import {
  IconPrint,
  IconRx,
  IconSearch,
  IconWarn,
} from "@/components/ui/icons";
import { useAppState, useMe } from "@/lib/store";
import { drugById } from "@/lib/drugs";
import { fuzzyScore } from "@/lib/fuzzy";
import { dateTimeStamp, shortDate } from "@/lib/format";

export default function PrescriptionsPage() {
  const state = useAppState();
  const { isClinical } = useMe();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "signed" | "draft">("all");

  const rows = useMemo(() => {
    const all = Object.values(state.prescriptions)
      .map((rx) => {
        const visit = state.visits.find((v) => v.id === rx.visitId);
        const patient = state.patients.find((p) => p.id === visit?.patientId);
        const overrides = state.overrides.filter((o) => o.visitId === rx.visitId);
        const deliveries = state.deliveries.filter(
          (d) => d.prescriptionId === rx.id,
        );
        return { rx, visit, patient, overrides, deliveries };
      })
      .filter((r) => !!r.visit && !!r.patient && r.rx.items.length > 0);

    return all
      .filter((r) => (filter === "all" ? true : r.rx.state === filter))
      .filter((r) =>
        q.trim() ? fuzzyScore(q, r.patient!.fullName, r.patient!.phone) > 0 : true,
      )
      .sort((a, b) =>
        (b.rx.signedAt ?? b.visit!.date).localeCompare(
          a.rx.signedAt ?? a.visit!.date,
        ),
      );
  }, [state, q, filter]);

  if (!isClinical) {
    return (
      <EmptyState title="Not available to the front desk">
        Prescriptions are handed over as printouts. The clinical list is
        restricted to doctors.
      </EmptyState>
    );
  }

  const counts = {
    signed: Object.values(state.prescriptions).filter(
      (r) => r.state === "signed" && r.items.length > 0,
    ).length,
    draft: Object.values(state.prescriptions).filter(
      (r) => r.state === "draft" && r.items.length > 0,
    ).length,
  };

  return (
    <div className="max-w-[1060px] mx-auto px-6 py-7">
      <div className="flex flex-wrap items-end gap-4 mb-5">
        <div>
          <div className="t-eyebrow mb-1">Signed and unsigned</div>
          <h1 className="t-h2">Prescriptions</h1>
          <div className="t-mono text-muted mt-1">
            {counts.signed} signed · {counts.draft} still unsigned
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <div className="flex bg-chalk border border-line rounded-field p-0.5">
            {(["all", "signed", "draft"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`t-mono-sm px-2.5 py-1.5 rounded-[7px] transition-colors ${
                  filter === f
                    ? "bg-petrol text-chalk"
                    : "text-muted hover:text-ink"
                }`}
              >
                {f === "draft" ? "unsigned" : f}
              </button>
            ))}
          </div>
          <div className="relative">
            <IconSearch
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Patient name"
              className="pl-9 w-[220px] py-[8px] text-[14px]"
              aria-label="Search prescriptions"
            />
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<IconRx size={34} />} title="Nothing here yet">
          Prescriptions appear once a medicine has been added to a visit.
          They stay unsigned, and undeliverable, until a verified doctor
          signs.
        </EmptyState>
      ) : (
        <div className="bg-chalk border border-line rounded-panel overflow-hidden">
          {rows.map(({ rx, visit, patient, overrides, deliveries }, i) => (
            <div
              key={rx.id}
              className={`flex items-start gap-4 px-5 py-3.5 ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <div className="min-w-0 w-[190px]">
                <Link
                  href={`/consult/${visit!.id}`}
                  className="font-semibold text-[14.5px] hover:text-petrol truncate block"
                >
                  {patient!.fullName}
                </Link>
                <div className="t-mono-sm text-muted">
                  {rx.signedAt
                    ? dateTimeStamp(rx.signedAt)
                    : shortDate(visit!.date)}
                </div>
              </div>

              <div className="flex-1 min-w-0 text-[13.5px]">
                {rx.items.map((it) => (
                  <div key={it.id} className="truncate">
                    <b className="font-semibold">
                      {drugById(it.drugId)?.brand ?? it.freeTextName}
                    </b>
                    <span className="t-mono-sm text-muted ml-2">
                      {[
                        it.frequency,
                        it.durationDays ? `${it.durationDays}d` : null,
                        it.instructions || null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                ))}
                {overrides.length > 0 && (
                  <div className="t-mono-sm text-amber-text mt-1 flex items-center gap-1">
                    <IconWarn size={11} /> {overrides.length} allergy override
                    logged
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Pill tone={rx.state === "signed" ? "ok" : "warn"}>
                  {rx.state === "signed" ? "signed" : "unsigned"}
                </Pill>
                {deliveries.length > 0 && (
                  <span className="t-mono-sm text-muted">
                    {deliveries.map((d) => d.channel).join(" · ")}
                  </span>
                )}
              </div>

              <div className="w-[92px] flex justify-end shrink-0">
                {rx.state === "signed" ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      window.open(`/rx/${visit!.id}/print`, "_blank")
                    }
                  >
                    <IconPrint size={13} /> Print
                  </Button>
                ) : (
                  <Button size="sm" href={`/consult/${visit!.id}`}>
                    Review
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

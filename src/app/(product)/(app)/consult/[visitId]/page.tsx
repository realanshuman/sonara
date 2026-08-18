"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { PatientHeader } from "@/components/consult/patient-header";
import { VisitPanel } from "@/components/consult/visit-panel";
import { PipelinePanel } from "@/components/consult/pipeline-panel";
import { TranscriptPanel } from "@/components/consult/transcript-panel";
import { NotePanel } from "@/components/consult/note-panel";
import { RxPanel } from "@/components/consult/rx-panel";
import { ContextRail } from "@/components/consult/context-rail";
import { useRecorder } from "@/components/consult/use-recorder";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { IconChevronLeft } from "@/components/ui/icons";
import { useAppState, useMe } from "@/lib/store";
import type { NoteSectionKey } from "@/lib/types";

export default function ConsultPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = use(params);
  const state = useAppState();
  const { isClinical } = useMe();
  const [hoverSection, setHoverSection] = useState<NoteSectionKey | null>(null);

  const visit = state.visits.find((v) => v.id === visitId);
  const patient = state.patients.find((p) => p.id === visit?.patientId);
  const recorder = useRecorder(visitId, visit?.patientId ?? "generic");

  // scroll to the draft as soon as it lands
  const drafted = visit?.state === "drafted";
  useEffect(() => {
    if (drafted) {
      const t = setTimeout(
        () =>
          document
            .getElementById("note")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        150,
      );
      return () => clearTimeout(t);
    }
  }, [drafted]);

  if (!state.hydrated) return null;

  if (!isClinical) {
    return (
      <EmptyState
        title="Not available to the front desk"
        action={<Button href="/today">Back to Today</Button>}
      >
        Clinical notes, transcripts and recordings are restricted to the
        treating doctor. This attempt is recorded in the audit log.
      </EmptyState>
    );
  }

  if (!visit || !patient) {
    return (
      <EmptyState
        title="That visit isn't here"
        action={<Button href="/today">Back to Today</Button>}
      >
        The visit may belong to another clinic, or it was removed. Nothing else
        is disclosed about it.
      </EmptyState>
    );
  }

  return (
    <div>
      <PatientHeader patient={patient} visit={visit} />

      <div className="flex gap-5 max-w-[1320px] mx-auto px-6 py-5 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <Link
            href="/today"
            className="inline-flex items-center gap-1 t-mono-sm text-muted hover:text-ink no-print"
          >
            <IconChevronLeft size={13} /> today's list
          </Link>

          <VisitPanel visit={visit} patient={patient} recorder={recorder} />
          <PipelinePanel visit={visit} />
          <TranscriptPanel visit={visit} hoverSection={hoverSection} />
          <NotePanel visit={visit} onHoverSection={setHoverSection} />
          <RxPanel visit={visit} patient={patient} />
        </div>

        <ContextRail patient={patient} visit={visit} />
      </div>
    </div>
  );
}

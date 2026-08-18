"use client";

import { Panel, PanelHeader } from "@/components/ui/panel";
import { Tick } from "@/components/ui/misc";
import { useAppState } from "@/lib/store";
import type { PipelineStageKey, StageState, Visit } from "@/lib/types";
import { cx } from "@/lib/cx";

const STAGES: { key: PipelineStageKey; label: string }[] = [
  { key: "audio", label: "Audio" },
  { key: "transcript", label: "Transcript" },
  { key: "speakers", label: "Speakers" },
  { key: "note", label: "Case sheet" },
];

const STATE_LABEL: Record<StageState, string> = {
  idle: "-",
  running: "Working",
  done: "Done",
  failed: "Failed",
};

/** FR-NOTE-8 territory: the visible End-visit → draft pipeline. */
export function PipelinePanel({ visit }: { visit: Visit }) {
  const state = useAppState();
  const pipe = state.pipeline[visit.id];
  if (!pipe || visit.state === "signed") return null;

  return (
    <Panel>
      <PanelHeader
        title="From the room to the record"
        meta={
          visit.state === "processing" ? (
            <span className="text-amber-text">a few seconds</span>
          ) : visit.state === "drafted" ? (
            "complete"
          ) : (
            "live"
          )
        }
      />
      <div className="flex flex-wrap">
        {STAGES.map((st, i) => {
          const stg = pipe[st.key];
          return (
            <div
              key={st.key}
              className={cx(
                "flex-1 min-w-[130px] px-4 py-3",
                i > 0 && "border-l border-line",
              )}
            >
              <div className="t-label mb-1">{st.label}</div>
              <div className="flex items-center gap-2 text-[14px] font-semibold">
                <Tick state={stg} />
                <span className={cx(stg === "idle" && "text-muted")}>
                  {stg === "done" && st.key === "note"
                    ? "Drafted"
                    : STATE_LABEL[stg]}
                </span>
              </div>
              {pipe.detail[st.key] && (
                <div className="t-mono-sm text-muted mt-0.5">
                  {pipe.detail[st.key]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

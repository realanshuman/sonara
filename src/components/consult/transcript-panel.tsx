"use client";

import { useEffect, useRef, useState } from "react";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/panel";
import { SpeakerTag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconSwap } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { useActions, useAppState } from "@/lib/store";
import { msToStamp } from "@/lib/format";
import type { NoteSectionKey, Visit } from "@/lib/types";
import { cx } from "@/lib/cx";

export function TranscriptPanel({
  visit,
  hoverSection,
}: {
  visit: Visit;
  hoverSection: NoteSectionKey | null;
}) {
  const state = useAppState();
  const actions = useActions();
  const toast = useToast();
  const segments = state.segments[visit.id] ?? [];
  const provenance = state.provenance[visit.id];
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const live = visit.state === "recording";
  const highlighted =
    hoverSection && provenance ? new Set(provenance[hoverSection] ?? []) : null;

  useEffect(() => {
    if (live && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments.length, live]);

  if (visit.state === "open" && segments.length === 0) return null;

  return (
    <Panel>
      <PanelHeader
        title="Transcript"
        meta={
          <>
            {visit.languageDetected && <span>{visit.languageDetected}</span>}
            {live && <span className="text-signal">streaming</span>}
            {!live && segments.length > 0 && visit.state !== "signed" && (
              <button
                type="button"
                onClick={() => {
                  actions.swapSpeakers(visit.id);
                  toast("Speaker labels swapped");
                }}
                className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-ink"
                title="Labels wrong way round? Swap DR and PT"
              >
                <IconSwap size={12} /> swap DR/PT
              </button>
            )}
          </>
        }
      />
      <PanelBody>
        {segments.length === 0 ? (
          <p className="text-[14px] text-muted m-0">
            {live
              ? "Listening. The first words land within a few seconds."
              : "No transcript for this visit."}
          </p>
        ) : (
          <div
            ref={scrollRef}
            data-scroll
            className="max-h-[260px] overflow-y-auto pr-1"
          >
            {segments.map((seg) => {
              const text = seg.correctedText ?? seg.text;
              const isGap =
                seg.speaker === "UNKNOWN" && /^recording (paused|resumed)$/.test(text);
              const dim = seg.confidence < 0.7;
              const hl = highlighted?.has(seg.seq);
              if (isGap) {
                return (
                  <div
                    key={seg.id}
                    className="t-mono-sm text-faint text-center py-1.5"
                  >
                    {text}
                  </div>
                );
              }
              return (
                <div
                  key={seg.id}
                  className={cx(
                    "flex gap-2.5 py-2 border-b border-dashed border-line last:border-0 rounded-[6px] px-1.5 -mx-1.5 transition-colors",
                    hl && "bg-tint-sea border-transparent",
                  )}
                >
                  <SpeakerTag speaker={seg.speaker} />
                  <span className="t-mono-sm text-faint shrink-0 pt-[3px]">
                    {msToStamp(seg.startMs)}
                  </span>
                  {editing === seg.id ? (
                    <form
                      className="flex-1 flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        actions.correctSegment(visit.id, seg.id, draft.trim());
                        setEditing(null);
                        toast("Correction saved. It teaches this clinic's vocabulary");
                      }}
                    >
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        autoFocus
                        className="flex-1 text-[14px] px-2 py-1 border border-sea rounded-[6px] bg-chalk focus:outline-none"
                      />
                      <Button size="sm" variant="primary" type="submit">
                        Save
                      </Button>
                      <Button size="sm" variant="quiet" onClick={() => setEditing(null)}>
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      disabled={live || visit.state === "signed"}
                      onClick={() => {
                        setEditing(seg.id);
                        setDraft(text);
                      }}
                      title={
                        live || visit.state === "signed"
                          ? undefined
                          : "Tap to correct this line"
                      }
                      className={cx(
                        "flex-1 text-left text-[14px] leading-relaxed rounded-[5px] disabled:cursor-default",
                        !live && visit.state !== "signed" && "hover:bg-soft",
                        seg.interim && "text-muted italic",
                        dim && !seg.interim && "text-muted underline decoration-dotted decoration-faint underline-offset-4",
                      )}
                    >
                      {text}
                      {seg.correctedText && (
                        <span className="t-mono-sm text-sea ml-2">corrected</span>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {!live && segments.length > 0 && visit.state !== "signed" && (
          <p className="t-mono-sm text-muted mt-3 mb-0">
            Final pass shown. Dotted lines were hard to hear. Tap a line to
            correct it; corrections build this clinic's vocabulary, never a
            shared model.
          </p>
        )}
      </PanelBody>
    </Panel>
  );
}

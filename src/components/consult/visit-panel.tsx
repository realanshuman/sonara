"use client";

import { useState } from "react";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/misc";
import { Waveform } from "@/components/ui/waveform";
import { Modal } from "@/components/ui/modal";
import { Textarea, Select, Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import {
  IconMicOff,
  IconPause,
  IconPlay,
  IconWarn,
} from "@/components/ui/icons";
import { useActions, useAppState } from "@/lib/store";
import { bytes, mmss, timeOfDay } from "@/lib/format";
import type { ConsentLanguage, Patient, Visit } from "@/lib/types";
import { cx } from "@/lib/cx";
import { useRecorder, WARN_AT_S } from "./use-recorder";

const CONSENT_SCRIPTS: Record<ConsentLanguage, { name: string; text: string }> =
  {
    en: {
      name: "English",
      text: "“I'm going to record this visit so your notes are written properly. The recording stays private, and you can say no. Is that okay?”",
    },
    hi: {
      name: "हिन्दी",
      text: "“मैं आपके नोट्स ठीक से लिखने के लिए यह परामर्श रिकॉर्ड करूँगा। रिकॉर्डिंग निजी रहेगी, और आप मना कर सकते हैं। ठीक है?”",
    },
    mr: {
      name: "मराठी",
      text: "“तुमच्या नोंदी नीट लिहिण्यासाठी मी ही तपासणी रेकॉर्ड करणार आहे. रेकॉर्डिंग खासगी राहील, आणि तुम्ही नाही म्हणू शकता. चालेल का?”",
    },
  };

export function VisitPanel({
  visit,
  patient,
  recorder,
}: {
  visit: Visit;
  patient: Patient;
  recorder: ReturnType<typeof useRecorder>;
}) {
  const state = useAppState();
  const actions = useActions();
  const toast = useToast();

  const consent = state.consents.find((c) => c.visitId === visit.id);
  const activeConsent = consent && !consent.withdrawnAt ? consent : undefined;
  const meta = state.recording[visit.id];
  const [lang, setLang] = useState<ConsentLanguage>(patient.preferredLanguage);
  const [method, setMethod] = useState<"verbal" | "written">("verbal");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");

  const { recording, elapsed, paused } = recorder;
  const ended = visit.state === "processing" || visit.state === "drafted" || visit.state === "signed";

  const stateLabel =
    visit.state === "recording"
      ? "Recording"
      : visit.state === "processing"
        ? "Processing"
        : visit.state === "drafted"
          ? "Draft ready"
          : visit.state === "signed"
            ? "Signed"
            : activeConsent
              ? "Ready to record"
              : "Awaiting consent";

  return (
    <Panel>
      <PanelHeader
        title="This visit"
        meta={
          <span className={cx(visit.state === "recording" && "text-signal")}>
            {stateLabel}
          </span>
        }
      />
      <PanelBody className="space-y-3.5">
        {/* ── consent: FR-CONS-1…6. Legally load-bearing; not simplifiable. ── */}
        {!ended && !activeConsent && (
          <div className="border border-tint-amber-line bg-tint-amber rounded-field p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="t-label text-amber-text">
                Per-visit consent · required before the mic opens
              </span>
              <div className="ml-auto flex gap-1">
                {(Object.keys(CONSENT_SCRIPTS) as ConsentLanguage[]).map(
                  (l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      className={cx(
                        "t-mono-sm px-2 py-1 rounded-[5px] transition-colors",
                        l === lang
                          ? "bg-chalk text-petrol font-medium"
                          : "text-amber-text hover:bg-chalk/60",
                      )}
                    >
                      {CONSENT_SCRIPTS[l].name}
                    </button>
                  ),
                )}
              </div>
            </div>
            <p className="text-[15px] leading-relaxed mb-3">
              {CONSENT_SCRIPTS[lang].text}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-[168px] shrink-0">
                <Select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as "verbal" | "written")}
                  className="py-[7px] text-[13.5px] bg-chalk"
                  aria-label="Consent method"
                >
                  <option value="verbal">Agreed verbally</option>
                  <option value="written">Signed on paper</option>
                </Select>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  actions.captureConsent(visit.id, lang, method);
                  toast(`Consent recorded · ${CONSENT_SCRIPTS[lang].name}, ${method}`);
                }}
              >
                Patient agreed, record consent
              </Button>
              <Button
                variant="quiet"
                size="sm"
                onClick={() => {
                  actions.manualNote(visit.id);
                  toast("No recording. Write the note below", "info");
                }}
              >
                Patient declined · write manually
              </Button>
            </div>
            {consent?.withdrawnAt && (
              <p className="t-mono-sm text-amber-text mt-3">
                Earlier consent was withdrawn at {timeOfDay(consent.withdrawnAt)},
                audio and transcript are scheduled for deletion within 24h. A
                fresh consent is needed to record again.
              </p>
            )}
          </div>
        )}

        {activeConsent && !ended && (
          <div className="flex items-center gap-2.5 text-[13.5px] text-muted flex-wrap">
            <span className="size-[7px] rounded-full bg-sea shrink-0" />
            <span>
              <b className="font-semibold text-ink">Consent on record</b>:{" "}
              {activeConsent.method}, asked in{" "}
              {CONSENT_SCRIPTS[activeConsent.language].name} at{" "}
              {timeOfDay(activeConsent.capturedAt)}. Applies to this visit
              only.
            </span>
            <button
              type="button"
              className="t-mono-sm underline underline-offset-2 hover:text-ink ml-auto"
              onClick={() => setWithdrawOpen(true)}
            >
              patient withdraws consent
            </button>
          </div>
        )}

        {/* ── recorder ── */}
        <div className="flex items-center gap-4 flex-wrap">
          {!recording && !ended && (
            <Button
              variant="rec"
              disabled={!activeConsent}
              title={
                activeConsent
                  ? undefined
                  : "Recording can't start without this visit's consent"
              }
              onClick={async () => {
                const ok = await recorder.start("mic");
                if (ok) toast("Recording. The transcript streams below", "info");
              }}
            >
              <span className="size-2 rounded-full bg-chalk/90" /> Start
              recording
            </Button>
          )}
          {recording && (
            <>
              <Button variant="ghost" onClick={recorder.end}>
                <span className="size-2.5 bg-signal rounded-[2px]" /> End visit
              </Button>
              <Button
                variant="quiet"
                size="sm"
                onClick={recorder.togglePause}
                title={paused ? "Resume recording" : "Pause recording"}
              >
                {paused ? <IconPlay size={14} /> : <IconPause size={14} />}
                {paused ? "Resume" : "Pause"}
              </Button>
            </>
          )}

          <div className="flex-1 min-w-[180px]">
            <Waveform
              mode={
                recording && !paused
                  ? recorder.isRealMic
                    ? "live"
                    : "demo"
                  : ended || paused
                    ? "frozen"
                    : "idle"
              }
              getLevel={recorder.getLevel}
              height={44}
            />
          </div>

          <span
            className={cx(
              "font-mono text-[20px] tracking-[-0.02em] tabular-nums",
              recording && !paused ? "text-ink" : "text-muted",
            )}
          >
            {mmss(ended ? (visit.durationSeconds ?? 0) : elapsed)}
          </span>
        </div>

        {/* honest machine-state line */}
        {(recording || ended) && meta && (
          <div className="t-mono-sm text-muted flex items-center gap-3 flex-wrap">
            {recorder.isRealMic && recorder.micLabel && (
              <span>mic · {recorder.micLabel}</span>
            )}
            {!recorder.isRealMic && recording && <span>simulated consult</span>}
            <span>
              {meta.chunksUploaded} chunks uploaded
              {meta.bytes > 0 && ` · ${bytes(meta.bytes)}`}
            </span>
            {meta.bufferedChunks > 0 && (
              <span className="text-amber-text">
                {meta.bufferedChunks} buffered locally, uploads on reconnect
              </span>
            )}
            {recording && <span>auto-stop at 45:00</span>}
          </div>
        )}

        {/* failure & warning states: plain language, never a raw error */}
        {recorder.micError && (
          <Banner
            tone="warn"
            icon={<IconMicOff size={16} />}
            action={
              <span className="flex gap-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    await recorder.start("mic");
                  }}
                >
                  Try again
                </Button>
                <Button
                  size="sm"
                  variant="quiet"
                  onClick={() => recorder.start("demo")}
                >
                  Run a simulated consult
                </Button>
              </span>
            }
          >
            {recorder.micError}
          </Banner>
        )}
        {recording && recorder.silent && recorder.isRealMic && (
          <Banner tone="warn" icon={<IconWarn size={16} />}>
            <b className="font-semibold">We can't hear anything.</b> The level
            meter has been flat for a few seconds. Check the mic isn't muted.
            The recording itself continues.
          </Banner>
        )}
        {recording && recorder.recovered && (
          <Banner tone="info">
            <b className="font-semibold">Recording recovered.</b> This visit
            was mid-recording when the page was closed, so the buffered audio
            was kept and the clock resumed. End the visit whenever you're
            ready.
          </Banner>
        )}
        {recording && elapsed >= WARN_AT_S && (
          <Banner tone="warn" icon={<IconWarn size={16} />}>
            This recording has been running {Math.floor(elapsed / 60)} minutes.
            It stops itself at 45, and the audio is always kept, never discarded.
          </Banner>
        )}
        {!recording && !ended && activeConsent && (
          <p className="t-mono-sm text-muted">
            No microphone handy?{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-ink"
              onClick={() => recorder.start("demo")}
            >
              run a simulated consult
            </button>{" "}
            with the same pipeline and scripted audio.
          </p>
        )}

        {/* withdraw-consent modal (FR-CONS-5) */}
        <Modal
          open={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
          eyebrow="Consent withdrawn mid-visit"
          title="Stop and delete this recording"
        >
          <p className="text-[13.5px] text-muted leading-relaxed mb-3.5">
            Recording stops immediately. The audio and transcript are deleted
            within 24 hours, and the deletion is written to the audit log. The
            note can still be written manually.
          </p>
          <Field label="Reason (optional)">
            <Textarea
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              placeholder="e.g. patient asked to stop"
              rows={2}
            />
          </Field>
          <div className="flex justify-end gap-2.5 mt-4">
            <Button onClick={() => setWithdrawOpen(false)}>Keep recording</Button>
            <Button
              variant="primary"
              onClick={() => {
                recorder.stopForWithdrawal();
                actions.withdrawConsent(
                  visit.id,
                  withdrawReason.trim() || "patient withdrew",
                );
                setWithdrawOpen(false);
                setWithdrawReason("");
                toast("Recording stopped. Deletion scheduled and logged", "warn");
              }}
            >
              Stop &amp; schedule deletion
            </Button>
          </div>
        </Modal>
      </PanelBody>
    </Panel>
  );
}

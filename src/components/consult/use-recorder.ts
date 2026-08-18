"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { openMic, type MicSession } from "@/lib/audio";
import { scenarioForPatient } from "@/lib/scripts";
import { useActions, useAppState } from "@/lib/store";
import { uid } from "@/lib/format";

/** demo timeline runs the scripted consult at 2× so it's watchable */
const TIME_SCALE = 0.5;
export const WARN_AT_S = 20 * 60;
export const AUTOSTOP_AT_S = 45 * 60;

export function useRecorder(visitId: string, patientId: string) {
  const state = useAppState();
  const actions = useActions();
  const visit = state.visits.find((v) => v.id === visitId);
  const meta = state.recording[visitId];

  const [elapsed, setElapsed] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [micLabel, setMicLabel] = useState<string | null>(null);
  const [silent, setSilent] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [paused, setPausedLocal] = useState(false);

  const micRef = useRef<MicSession | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamedRef = useRef(0);
  const elapsedRef = useRef(0);
  const pausedRef = useRef(false);
  const endRef = useRef<() => void>(() => {});

  const scenario = scenarioForPatient(patientId);
  const recording = visit?.state === "recording";

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const tickBody = useCallback(() => {
    if (pausedRef.current) return;
    elapsedRef.current += 0.25;
    const el = elapsedRef.current;
    if (Math.abs(el - Math.round(el)) < 0.01) setElapsed(Math.round(el));

    // stream the scripted interim transcript
    const ms = el * 1000;
    while (
      streamedRef.current < scenario.lines.length &&
      scenario.lines[streamedRef.current].atMs * TIME_SCALE <= ms
    ) {
      const line = scenario.lines[streamedRef.current];
      actions.appendSegment(visitId, {
        id: uid("seg"),
        seq: streamedRef.current,
        speaker: line.speaker,
        startMs: line.atMs,
        endMs: line.atMs + 2500,
        text: line.text,
        confidence: Math.max(0.5, line.confidence - 0.06), // interim pass is rougher
        interim: true,
      });
      streamedRef.current += 1;
    }

    // 5-second chunk uploads (FR-REC-2)
    if (Math.round(el * 4) % 20 === 0) {
      actions.recordTick(visitId, Math.floor(el / 5), Math.floor(el * 12000));
    }

    // silence watch (FR-REC-4)
    if (micRef.current) setSilent(micRef.current.isSilent());

    if (el >= AUTOSTOP_AT_S) endRef.current();
  }, [actions, scenario.lines, visitId]);

  const startTimer = useCallback(() => {
    clearTimers();
    timerRef.current = setInterval(tickBody, 250);
  }, [clearTimers, tickBody]);

  const start = useCallback(
    async (mode: "mic" | "demo") => {
      setMicError(null);
      if (mode === "mic") {
        const res = await openMic();
        if (!res.ok) {
          setMicError(res.reason);
          return false;
        }
        micRef.current = res.session;
        setMicLabel(res.session.deviceLabel);
      } else {
        micRef.current = null;
        setMicLabel(null);
      }
      elapsedRef.current = 0;
      streamedRef.current = 0;
      pausedRef.current = false;
      setPausedLocal(false);
      setElapsed(0);
      setSilent(false);
      actions.startRecording(visitId);
      startTimer();
      return true;
    },
    [actions, startTimer, visitId],
  );

  const end = useCallback(() => {
    clearTimers();
    micRef.current?.stop();
    micRef.current = null;
    setSilent(false);
    actions.endVisit(visitId, Math.round(elapsedRef.current));
  }, [actions, clearTimers, visitId]);
  endRef.current = end;

  /** consent withdrawn: stop capture, run no pipeline — the store handles
      state transition and the deletion audit entries */
  const stopForWithdrawal = useCallback(() => {
    clearTimers();
    micRef.current?.stop();
    micRef.current = null;
    setSilent(false);
    setMicLabel(null);
    elapsedRef.current = 0;
    setElapsed(0);
  }, [clearTimers]);

  const togglePause = useCallback(() => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPausedLocal(next);
    actions.setPaused(visitId, next, Math.round(elapsedRef.current * 1000));
  }, [actions, visitId]);

  // Recovery: the visit is mid-recording in the store but this component
  // just mounted (tab was closed / navigated away). Resume the clock from
  // the stored start time; the mic handle is gone, so the meter runs in
  // demo mode — mirrors FR-REC recovery behaviour.
  useEffect(() => {
    if (recording && !timerRef.current && meta) {
      const already = (Date.now() - meta.startedAt) / 1000;
      elapsedRef.current = already;
      streamedRef.current = state.segments[visitId]?.length ?? 0;
      setElapsed(Math.round(already));
      setRecovered(true);
      startTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

  // teardown on unmount: release the mic but keep the visit recording —
  // the store clock carries on and the session recovers on return.
  useEffect(
    () => () => {
      clearTimers();
      micRef.current?.stop();
      micRef.current = null;
    },
    [clearTimers],
  );

  const getLevel = useCallback(
    () => micRef.current?.getLevel() ?? 0,
    [],
  );

  return {
    visit,
    recording,
    elapsed,
    paused,
    micError,
    micLabel,
    silent,
    recovered,
    isRealMic: !!micLabel,
    start,
    end,
    stopForWithdrawal,
    togglePause,
    getLevel,
    dismissMicError: () => setMicError(null),
  };
}

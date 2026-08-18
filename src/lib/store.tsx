"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { buildSeed, type SeedData } from "./seed";
import { scenarioForPatient } from "./scripts";
import type {
  Appointment,
  AuditEntry,
  Consent,
  ConsentLanguage,
  Delivery,
  NoteAddendum,
  NoteSectionKey,
  NoteTag,
  Patient,
  PatientFlag,
  PipelineStageKey,
  Provenance,
  RxItem,
  SafetyOverride,
  Sex,
  StageState,
  TranscriptSegment,
  Visit,
} from "./types";
import { hashContent, todayKey, uid } from "./format";

/* ────────────────────────────── state ────────────────────────────── */

export interface RecordingMeta {
  startedAt: number;
  chunksUploaded: number;
  bufferedChunks: number;
  bytes: number;
  paused: boolean;
}

export interface AppState extends Omit<SeedData, "seedDate"> {
  seedDate: string;
  hydrated: boolean;
  currentUserId: string;
  segments: Record<string, TranscriptSegment[]>;
  provenance: Record<string, Provenance>;
  addenda: Record<string, NoteAddendum[]>;
  overrides: SafetyOverride[];
  pipeline: Record<
    string,
    {
      audio: StageState;
      transcript: StageState;
      speakers: StageState;
      note: StageState;
      detail: Partial<Record<PipelineStageKey, string>>;
    }
  >;
  recording: Record<string, RecordingMeta>;
  connection: "online" | "offline";
  demo: { simulateUnverified: boolean };
}

function emptyState(): AppState {
  const seed = buildSeed();
  return {
    ...seed,
    hydrated: false,
    currentUserId: "u-menon",
    segments: {},
    provenance: {},
    addenda: {},
    overrides: [],
    pipeline: {},
    recording: {},
    connection: "online",
    demo: { simulateUnverified: false },
  };
}

/* ────────────────────────────── actions ───────────────────────────── */

type Act =
  | { type: "HYDRATE"; state: AppState }
  | { type: "SIGN_IN"; userId: string }
  | { type: "SET_CONNECTION"; online: boolean }
  | { type: "CHECK_IN"; apptId: string }
  | { type: "MARK_NO_SHOW"; apptId: string }
  | { type: "ADD_WALK_IN"; patient: Patient; appt: Appointment }
  | { type: "ADD_PATIENT"; patient: Patient }
  | { type: "OPEN_ROOM"; apptId: string; visit: Visit }
  | { type: "LOG_VIEW"; patientId: string; context: string }
  | { type: "CAPTURE_CONSENT"; consent: Consent }
  | { type: "WITHDRAW_CONSENT"; visitId: string; reason: string }
  | { type: "START_RECORDING"; visitId: string; at: number }
  | { type: "RECORD_TICK"; visitId: string; chunks: number; bytes: number }
  | { type: "SET_PAUSED"; visitId: string; paused: boolean; atMs: number }
  | { type: "APPEND_SEGMENT"; visitId: string; segment: TranscriptSegment }
  | { type: "END_VISIT"; visitId: string; durationSeconds: number }
  | { type: "PIPELINE_STAGE"; visitId: string; stage: PipelineStageKey; state: StageState; detail?: string }
  | {
      type: "NOTE_READY";
      visitId: string;
      sections: Record<NoteSectionKey, string>;
      confidenceFlags: Partial<Record<NoteSectionKey, "low">>;
      tags: NoteTag[];
      provenance: Provenance;
      finalSegments: TranscriptSegment[];
      languageDetected: string;
      avgConfidence: number;
      generationMs: number;
    }
  | { type: "MANUAL_NOTE"; visitId: string }
  | { type: "CORRECT_SEGMENT"; visitId: string; segmentId: string; text: string }
  | { type: "SWAP_SPEAKERS"; visitId: string }
  | { type: "EDIT_NOTE"; visitId: string; section: NoteSectionKey; text: string }
  | { type: "DISCARD_DRAFT"; visitId: string }
  | { type: "ADD_RX_ITEM"; visitId: string; item: RxItem }
  | { type: "REMOVE_RX_ITEM"; visitId: string; itemId: string }
  | { type: "OVERRIDE_ALLERGY"; override: SafetyOverride }
  | { type: "SIGN_VISIT"; visitId: string }
  | { type: "ADD_ADDENDUM"; visitId: string; addendum: NoteAddendum }
  | { type: "DELIVER_RX"; delivery: Delivery }
  | { type: "DELIVERY_STATE"; deliveryId: string; state: Delivery["state"] }
  | { type: "MOVE_VISIT"; visitId: string; newPatientId: string }
  | { type: "ADD_FLAG"; flag: PatientFlag }
  | { type: "DEACTIVATE_FLAG"; flagId: string }
  | { type: "EXPORT_PATIENT"; patientId: string }
  | { type: "DELETE_PATIENT"; patientId: string }
  | { type: "SET_RETENTION"; days: number }
  | { type: "SET_SIM_UNVERIFIED"; on: boolean }
  | { type: "ADD_VOCAB"; term: string }
  | { type: "REMOVE_VOCAB"; term: string }
  | { type: "UPDATE_CLINIC"; fields: Partial<AppState["clinic"]> }
  | { type: "RESET_DEMO" };

/* ────────────────────────────── reducer ───────────────────────────── */

function log(
  s: AppState,
  action: string,
  entityType: string,
  entityId: string,
  extra?: Partial<AuditEntry>,
): AppState {
  const entry: AuditEntry = {
    id: (s.audit[s.audit.length - 1]?.id ?? 0) + 1,
    clinicId: s.clinic.id,
    actorId: s.currentUserId,
    action,
    entityType,
    entityId,
    ip: "103.86.182.44",
    at: new Date().toISOString(),
    ...extra,
  };
  return { ...s, audit: [...s.audit, entry] };
}

function patientOfVisit(s: AppState, visitId: string) {
  return s.visits.find((v) => v.id === visitId)?.patientId;
}

function reducer(s: AppState, a: Act): AppState {
  switch (a.type) {
    case "HYDRATE":
      return { ...a.state, hydrated: true };

    case "SIGN_IN": {
      const next = { ...s, currentUserId: a.userId };
      return log(next, "session.sign_in", "user", a.userId);
    }

    case "SET_CONNECTION":
      return { ...s, connection: a.online ? "online" : "offline" };

    case "CHECK_IN": {
      const appts = s.appointments.map((ap) =>
        ap.id === a.apptId ? { ...ap, status: "arrived" as const } : ap,
      );
      const appt = s.appointments.find((ap) => ap.id === a.apptId);
      return log({ ...s, appointments: appts }, "patient.checked_in", "appointment", a.apptId, {
        patientId: appt?.patientId,
      });
    }

    case "MARK_NO_SHOW": {
      const appts = s.appointments.map((ap) =>
        ap.id === a.apptId ? { ...ap, status: "no_show" as const } : ap,
      );
      const appt = s.appointments.find((ap) => ap.id === a.apptId);
      return log({ ...s, appointments: appts }, "appointment.marked_no_show", "appointment", a.apptId, {
        patientId: appt?.patientId,
      });
    }

    case "ADD_WALK_IN": {
      const next = {
        ...s,
        patients: [...s.patients, a.patient],
        appointments: [...s.appointments, a.appt],
      };
      return log(next, "patient.created", "patient", a.patient.id, {
        patientId: a.patient.id,
        metadata: { walkIn: true },
      });
    }

    case "ADD_PATIENT": {
      const next = { ...s, patients: [...s.patients, a.patient] };
      return log(next, "patient.created", "patient", a.patient.id, { patientId: a.patient.id });
    }

    case "OPEN_ROOM": {
      const exists = s.visits.some((v) => v.id === a.visit.id);
      const appts = s.appointments.map((ap) =>
        ap.id === a.apptId && (ap.status === "arrived" || ap.status === "scheduled")
          ? { ...ap, status: "in_room" as const }
          : ap,
      );
      const next = {
        ...s,
        appointments: appts,
        visits: exists ? s.visits : [...s.visits, a.visit],
      };
      return log(next, "patient.record_viewed", "visit", a.visit.id, {
        patientId: a.visit.patientId,
        visitId: a.visit.id,
        metadata: { surface: "consult room" },
      });
    }

    case "LOG_VIEW":
      return log(s, "patient.record_viewed", "patient", a.patientId, {
        patientId: a.patientId,
        metadata: { surface: a.context },
      });

    case "CAPTURE_CONSENT": {
      const next = { ...s, consents: [...s.consents, a.consent] };
      return log(next, "consent.captured", "consent", a.consent.id, {
        patientId: patientOfVisit(s, a.consent.visitId),
        visitId: a.consent.visitId,
        metadata: { language: a.consent.language, method: a.consent.method },
      });
    }

    case "WITHDRAW_CONSENT": {
      const consents = s.consents.map((c) =>
        c.visitId === a.visitId && !c.withdrawnAt
          ? { ...c, withdrawnAt: new Date().toISOString(), withdrawalReason: a.reason }
          : c,
      );
      const visits = s.visits.map((v) =>
        v.id === a.visitId ? { ...v, state: "open" as const } : v,
      );
      const segments = { ...s.segments };
      delete segments[a.visitId];
      const recording = { ...s.recording };
      delete recording[a.visitId];
      let next = { ...s, consents, visits, segments, recording };
      next = log(next, "consent.withdrawn", "consent", a.visitId, {
        patientId: patientOfVisit(s, a.visitId),
        visitId: a.visitId,
        metadata: { reason: a.reason },
      });
      return log(next, "recording.deletion_scheduled", "recording", a.visitId, {
        patientId: patientOfVisit(s, a.visitId),
        visitId: a.visitId,
        metadata: { window: "24h" },
      });
    }

    case "START_RECORDING": {
      // FR-CONS-1 enforced at the data layer, not the UI: no valid
      // consent record → the recording session is never created.
      const consent = s.consents.find(
        (c) => c.visitId === a.visitId && !c.withdrawnAt,
      );
      if (!consent) return s;
      const visits = s.visits.map((v) =>
        v.id === a.visitId
          ? { ...v, state: "recording" as const, startedAt: new Date().toISOString() }
          : v,
      );
      const next: AppState = {
        ...s,
        visits,
        segments: { ...s.segments, [a.visitId]: [] },
        recording: {
          ...s.recording,
          [a.visitId]: { startedAt: a.at, chunksUploaded: 0, bufferedChunks: 0, bytes: 0, paused: false },
        },
        pipeline: {
          ...s.pipeline,
          [a.visitId]: {
            audio: "running",
            transcript: "running",
            speakers: "running",
            note: "idle",
            detail: { audio: "capturing · 16kHz mono", transcript: "streaming", speakers: "separating" },
          },
        },
      };
      return log(next, "recording.started", "recording", a.visitId, {
        patientId: patientOfVisit(s, a.visitId),
        visitId: a.visitId,
      });
    }

    case "RECORD_TICK": {
      const meta = s.recording[a.visitId];
      if (!meta) return s;
      const offline = s.connection === "offline";
      return {
        ...s,
        recording: {
          ...s.recording,
          [a.visitId]: {
            ...meta,
            // a.chunks is the running total; offline chunks buffer locally
            // (IndexedDB) and flush the moment the connection returns.
            chunksUploaded: offline ? meta.chunksUploaded : a.chunks,
            bufferedChunks: offline ? a.chunks - meta.chunksUploaded : 0,
            bytes: a.bytes,
          },
        },
      };
    }

    case "SET_PAUSED": {
      const meta = s.recording[a.visitId];
      if (!meta) return s;
      const segs = s.segments[a.visitId] ?? [];
      const gap: TranscriptSegment = {
        id: uid("seg"),
        seq: segs.length,
        speaker: "UNKNOWN",
        startMs: a.atMs,
        endMs: a.atMs,
        text: a.paused ? "recording paused" : "recording resumed",
        confidence: 1,
      };
      const next = {
        ...s,
        recording: { ...s.recording, [a.visitId]: { ...meta, paused: a.paused } },
        segments: { ...s.segments, [a.visitId]: [...segs, gap] },
      };
      return log(next, a.paused ? "recording.paused" : "recording.resumed", "recording", a.visitId, {
        patientId: patientOfVisit(s, a.visitId),
        visitId: a.visitId,
      });
    }

    case "APPEND_SEGMENT": {
      const segs = s.segments[a.visitId] ?? [];
      return { ...s, segments: { ...s.segments, [a.visitId]: [...segs, a.segment] } };
    }

    case "END_VISIT": {
      const visits = s.visits.map((v) =>
        v.id === a.visitId
          ? {
              ...v,
              state: "processing" as const,
              endedAt: new Date().toISOString(),
              durationSeconds: a.durationSeconds,
            }
          : v,
      );
      const pipe = s.pipeline[a.visitId];
      const next: AppState = {
        ...s,
        visits,
        pipeline: {
          ...s.pipeline,
          [a.visitId]: {
            ...(pipe ?? { audio: "running", transcript: "running", speakers: "running", note: "idle", detail: {} }),
            note: "idle" as const,
            detail: { ...(pipe?.detail ?? {}), audio: "finalising" },
          },
        },
      };
      return log(next, "recording.stopped", "recording", a.visitId, {
        patientId: patientOfVisit(s, a.visitId),
        visitId: a.visitId,
        metadata: { durationSeconds: a.durationSeconds },
      });
    }

    case "PIPELINE_STAGE": {
      const pipe = s.pipeline[a.visitId] ?? {
        audio: "idle" as StageState,
        transcript: "idle" as StageState,
        speakers: "idle" as StageState,
        note: "idle" as StageState,
        detail: {},
      };
      return {
        ...s,
        pipeline: {
          ...s.pipeline,
          [a.visitId]: {
            ...pipe,
            [a.stage]: a.state,
            detail: { ...pipe.detail, [a.stage]: a.detail ?? pipe.detail[a.stage] },
          },
        },
      };
    }

    case "NOTE_READY": {
      const visits = s.visits.map((v) =>
        v.id === a.visitId
          ? {
              ...v,
              state: "drafted" as const,
              languageDetected: a.languageDetected,
              avgConfidence: a.avgConfidence,
            }
          : v,
      );
      const next: AppState = {
        ...s,
        visits,
        segments: { ...s.segments, [a.visitId]: a.finalSegments },
        notes: {
          ...s.notes,
          [a.visitId]: {
            visitId: a.visitId,
            sections: a.sections,
            confidenceFlags: a.confidenceFlags,
            state: "draft",
            modelUsed: "claude-sonnet-5",
            promptVersion: "note-v3.2",
            generationMs: a.generationMs,
            updatedAt: new Date().toISOString(),
          },
        },
        tags: { ...s.tags, [a.visitId]: a.tags },
        provenance: { ...s.provenance, [a.visitId]: a.provenance },
      };
      return log(next, "note.generated", "note", a.visitId, {
        patientId: patientOfVisit(s, a.visitId),
        visitId: a.visitId,
        metadata: { generationMs: a.generationMs, promptVersion: "note-v3.2" },
      });
    }

    case "MANUAL_NOTE": {
      // FR-CONS-6: the manual path is first-class: an empty, editable
      // draft with no recording attached, not a degraded mode.
      if (s.notes[a.visitId]) return s;
      const visits = s.visits.map((v) =>
        v.id === a.visitId ? { ...v, state: "drafted" as const } : v,
      );
      const next: AppState = {
        ...s,
        visits,
        notes: {
          ...s.notes,
          [a.visitId]: {
            visitId: a.visitId,
            sections: {
              presentingComplaint: "",
              history: "",
              examination: "",
              assessment: "",
              plan: "",
            },
            confidenceFlags: {},
            state: "draft",
            modelUsed: "manual",
            promptVersion: "-",
            generationMs: 0,
            updatedAt: new Date().toISOString(),
          },
        },
      };
      return log(next, "note.manual_started", "note", a.visitId, {
        patientId: patientOfVisit(s, a.visitId),
        visitId: a.visitId,
      });
    }

    case "CORRECT_SEGMENT": {
      const segs = (s.segments[a.visitId] ?? []).map((sg) =>
        sg.id === a.segmentId ? { ...sg, correctedText: a.text } : sg,
      );
      const terms = a.text
        .split(/\s+/)
        .filter((w) => w.length > 3 && /^[A-Z]/.test(w) && !s.vocabulary.includes(w));
      const next = {
        ...s,
        segments: { ...s.segments, [a.visitId]: segs },
        vocabulary: [...s.vocabulary, ...terms.slice(0, 2)],
      };
      return log(next, "transcript.corrected", "transcript", a.segmentId, {
        patientId: patientOfVisit(s, a.visitId),
        visitId: a.visitId,
      });
    }

    case "SWAP_SPEAKERS": {
      const segs = (s.segments[a.visitId] ?? []).map((sg) => ({
        ...sg,
        speaker:
          sg.speaker === "DR" ? ("PT" as const) : sg.speaker === "PT" ? ("DR" as const) : sg.speaker,
      }));
      const next = { ...s, segments: { ...s.segments, [a.visitId]: segs } };
      return log(next, "transcript.speakers_swapped", "transcript", a.visitId, {
        patientId: patientOfVisit(s, a.visitId),
        visitId: a.visitId,
      });
    }

    case "EDIT_NOTE": {
      const note = s.notes[a.visitId];
      if (!note || note.state === "signed") return s;
      const next: AppState = {
        ...s,
        notes: {
          ...s.notes,
          [a.visitId]: {
            ...note,
            sections: { ...note.sections, [a.section]: a.text },
            updatedAt: new Date().toISOString(),
          },
        },
      };
      return log(next, "note.edited", "note", a.visitId, {
        patientId: patientOfVisit(s, a.visitId),
        visitId: a.visitId,
        metadata: { section: a.section },
      });
    }

    case "DISCARD_DRAFT": {
      const notes = { ...s.notes };
      delete notes[a.visitId];
      const tags = { ...s.tags };
      delete tags[a.visitId];
      const visits = s.visits.map((v) =>
        v.id === a.visitId ? { ...v, state: "open" as const } : v,
      );
      const next = { ...s, notes, tags, visits };
      return log(next, "note.draft_discarded", "note", a.visitId, {
        patientId: patientOfVisit(s, a.visitId),
        visitId: a.visitId,
        metadata: { transcriptKept: true, counterMetric: true },
      });
    }

    case "ADD_RX_ITEM": {
      const existing = s.prescriptions[a.visitId];
      const rx =
        existing && existing.state === "draft"
          ? { ...existing, items: [...existing.items, a.item] }
          : existing && existing.state === "signed"
            ? existing // never mutate a signed rx
            : {
                id: uid("rx"),
                visitId: a.visitId,
                state: "draft" as const,
                items: [a.item],
              };
      if (existing && existing.state === "signed") return s;
      return { ...s, prescriptions: { ...s.prescriptions, [a.visitId]: rx } };
    }

    case "REMOVE_RX_ITEM": {
      const rx = s.prescriptions[a.visitId];
      if (!rx || rx.state !== "draft") return s;
      return {
        ...s,
        prescriptions: {
          ...s.prescriptions,
          [a.visitId]: { ...rx, items: rx.items.filter((i) => i.id !== a.itemId) },
        },
      };
    }

    case "OVERRIDE_ALLERGY": {
      const next = { ...s, overrides: [...s.overrides, a.override] };
      return log(next, "override.allergy_block", "safety_override", a.override.id, {
        patientId: patientOfVisit(s, a.override.visitId),
        visitId: a.override.visitId,
        metadata: { drug: a.override.detail.drug, allergy: a.override.detail.allergy },
      });
    }

    case "SIGN_VISIT": {
      const me = s.users.find((u) => u.id === s.currentUserId);
      const profile = s.doctorProfiles[s.currentUserId];
      const verified =
        !!me &&
        me.role !== "front_desk" &&
        profile?.verificationStatus === "verified" &&
        !s.demo.simulateUnverified;
      const note = s.notes[a.visitId];
      if (!verified || !note || note.state === "signed") return s; // invariant, not UI convention
      const now = new Date().toISOString();
      const noteHash = hashContent(Object.values(note.sections).join("\n"));
      const rx = s.prescriptions[a.visitId];
      const visits = s.visits.map((v) =>
        v.id === a.visitId ? { ...v, state: "signed" as const } : v,
      );
      const visit = s.visits.find((v) => v.id === a.visitId);
      const appointments = s.appointments.map((ap) =>
        ap.id === visit?.appointmentId ? { ...ap, status: "signed" as const } : ap,
      );
      let next: AppState = {
        ...s,
        visits,
        appointments,
        notes: {
          ...s.notes,
          [a.visitId]: {
            ...note,
            state: "signed",
            signedBy: s.currentUserId,
            signedAt: now,
            contentHash: noteHash,
          },
        },
      };
      if (rx && rx.items.length > 0) {
        next = {
          ...next,
          prescriptions: {
            ...next.prescriptions,
            [a.visitId]: {
              ...rx,
              state: "signed",
              signedAt: now,
              signedBy: s.currentUserId,
              contentHash: hashContent(
                rx.items.map((i) => `${i.drugId ?? i.freeTextName}|${i.frequency}`).join("~"),
              ),
              signatureSnapshot: {
                name: me!.fullName,
                qualifications: profile!.qualifications,
                registration: `${profile!.registrationNumber} · ${profile!.registrationCouncil}`,
                clinic: `${s.clinic.name}, ${s.clinic.address}, ${s.clinic.city} ${s.clinic.pincode}`,
              },
            },
          },
        };
      }
      next = log(next, "note.signed", "note", a.visitId, {
        patientId: patientOfVisit(s, a.visitId),
        visitId: a.visitId,
        metadata: { contentHash: noteHash },
      });
      if (rx && rx.items.length > 0) {
        next = log(next, "rx.signed", "prescription", rx.id, {
          patientId: patientOfVisit(s, a.visitId),
          visitId: a.visitId,
          metadata: { items: rx.items.length },
        });
      }
      return next;
    }

    case "ADD_ADDENDUM": {
      const list = s.addenda[a.visitId] ?? [];
      const next = { ...s, addenda: { ...s.addenda, [a.visitId]: [...list, a.addendum] } };
      return log(next, "note.addendum_added", "note", a.visitId, {
        patientId: patientOfVisit(s, a.visitId),
        visitId: a.visitId,
        metadata: { reason: a.addendum.reason },
      });
    }

    case "DELIVER_RX": {
      const next = { ...s, deliveries: [...s.deliveries, a.delivery] };
      return log(next, "rx.delivery_attempted", "prescription", a.delivery.prescriptionId, {
        patientId: patientOfVisit(s, a.delivery.visitId),
        visitId: a.delivery.visitId,
        metadata: { channel: a.delivery.channel },
      });
    }

    case "DELIVERY_STATE": {
      const deliveries = s.deliveries.map((d) =>
        d.id === a.deliveryId ? { ...d, state: a.state } : d,
      );
      const d = s.deliveries.find((x) => x.id === a.deliveryId);
      let next = { ...s, deliveries };
      if (d && (a.state === "delivered" || a.state === "failed")) {
        next = log(next, "rx.delivered", "prescription", d.prescriptionId, {
          patientId: patientOfVisit(s, d.visitId),
          visitId: d.visitId,
          metadata: { channel: d.channel, state: a.state },
        });
      }
      return next;
    }

    case "MOVE_VISIT": {
      const visit = s.visits.find((v) => v.id === a.visitId);
      if (!visit || visit.state === "signed") return s; // immutable after signing
      const visits = s.visits.map((v) =>
        v.id === a.visitId ? { ...v, patientId: a.newPatientId } : v,
      );
      const appointments = s.appointments.map((ap) =>
        ap.id === visit.appointmentId ? { ...ap, patientId: a.newPatientId } : ap,
      );
      const next = { ...s, visits, appointments };
      return log(next, "visit.moved_to_patient", "visit", a.visitId, {
        patientId: a.newPatientId,
        visitId: a.visitId,
        metadata: { from: visit.patientId },
      });
    }

    case "ADD_FLAG": {
      const next = { ...s, flags: [...s.flags, a.flag] };
      return log(next, "patient.flag_added", "patient_flag", a.flag.id, {
        patientId: a.flag.patientId,
        metadata: { kind: a.flag.kind, label: a.flag.label },
      });
    }

    case "DEACTIVATE_FLAG": {
      const flag = s.flags.find((f) => f.id === a.flagId);
      const flags = s.flags.map((f) => (f.id === a.flagId ? { ...f, active: false } : f));
      const next = { ...s, flags };
      return log(next, "patient.flag_deactivated", "patient_flag", a.flagId, {
        patientId: flag?.patientId,
      });
    }

    case "EXPORT_PATIENT":
      return log(s, "data.exported", "patient", a.patientId, {
        patientId: a.patientId,
        metadata: { format: "json" },
      });

    case "DELETE_PATIENT": {
      // DPDP erasure with medical-records retention: signed notes and
      // prescriptions stay; identity, flags, transcripts and drafts go.
      const patients = s.patients.filter((p) => p.id !== a.patientId);
      const flags = s.flags.filter((f) => f.patientId !== a.patientId);
      const appointments = s.appointments.filter((ap) => ap.patientId !== a.patientId);
      const affectedVisits = s.visits.filter((v) => v.patientId === a.patientId);
      const segments = { ...s.segments };
      const notes = { ...s.notes };
      for (const v of affectedVisits) {
        delete segments[v.id];
        if (notes[v.id]?.state === "draft") delete notes[v.id];
      }
      const visits = s.visits.filter(
        (v) => v.patientId !== a.patientId || v.state === "signed",
      );
      const next = { ...s, patients, flags, appointments, visits, segments, notes };
      return log(next, "data.deleted", "patient", a.patientId, {
        patientId: a.patientId,
        metadata: { retained: "signed notes & prescriptions", purged: "audio, transcripts, drafts, identity" },
      });
    }

    case "SET_RETENTION": {
      const next = { ...s, clinic: { ...s.clinic, audioRetentionDays: a.days } };
      return log(next, "settings.retention_changed", "clinic", s.clinic.id, {
        metadata: { days: a.days },
      });
    }

    case "SET_SIM_UNVERIFIED":
      return { ...s, demo: { ...s.demo, simulateUnverified: a.on } };

    case "ADD_VOCAB":
      if (s.vocabulary.includes(a.term)) return s;
      return { ...s, vocabulary: [...s.vocabulary, a.term] };

    case "REMOVE_VOCAB":
      return { ...s, vocabulary: s.vocabulary.filter((t) => t !== a.term) };

    case "UPDATE_CLINIC":
      return { ...s, clinic: { ...s.clinic, ...a.fields } };

    case "RESET_DEMO": {
      const fresh = emptyState();
      return { ...fresh, hydrated: true, currentUserId: s.currentUserId };
    }

    default:
      return s;
  }
}

/* ────────────────────────── provider & hooks ─────────────────────── */

const STORAGE_KEY = "sonara-demo-v1";

const StateCtx = createContext<AppState | null>(null);
const DispatchCtx = createContext<React.Dispatch<Act> | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, emptyState);

  // hydrate from localStorage (or fresh seed when the saved day is stale)
  useEffect(() => {
    let next: AppState | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as AppState;
        if (saved.seedDate === todayKey()) next = saved;
      }
    } catch {
      /* fall through to fresh seed */
    }
    dispatch({ type: "HYDRATE", state: next ?? emptyState() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist (throttled)
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!state.hydrated) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* storage full or unavailable; demo keeps running in memory */
      }
    }, 400);
  }, [state]);

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useAppState(): AppState {
  const s = useContext(StateCtx);
  if (!s) throw new Error("useAppState outside StoreProvider");
  return s;
}

export function useDispatchCtx() {
  const d = useContext(DispatchCtx);
  if (!d) throw new Error("useDispatch outside StoreProvider");
  return d;
}

/* ─────────────────────── derived helpers/actions ─────────────────── */

export function useActions() {
  const dispatch = useDispatchCtx();
  const state = useAppState();
  const stateRef = useRef(state);
  stateRef.current = state;

  return useMemo(() => {
    const runPipeline = (visitId: string) => {
      const st = stateRef.current;
      const visit = st.visits.find((v) => v.id === visitId);
      if (!visit) return;
      const scenario = scenarioForPatient(visit.patientId);
      const stage = (
        stage: PipelineStageKey,
        stg: StageState,
        detail?: string,
      ) => dispatch({ type: "PIPELINE_STAGE", visitId, stage, state: stg, detail });

      const t0 = performance.now();
      stage("audio", "running", "finalising chunks");
      setTimeout(() => {
        stage("audio", "done", "saved · encrypted");
        stage("transcript", "running", "final pass");
      }, 700);
      setTimeout(() => {
        stage("transcript", "done", `${Math.round(scenario.avgConfidence * 100)}% confidence`);
        stage("speakers", "running", "attributing");
      }, 2100);
      setTimeout(() => {
        const speakers = new Set(scenario.lines.map((l) => l.speaker));
        stage(
          "speakers",
          "done",
          `${speakers.size} found · ${[...speakers].join(" · ")}`,
        );
        stage("note", "running", "drafting");
      }, 2800);
      setTimeout(() => {
        const generationMs = Math.round(performance.now() - t0);
        const finalSegments: TranscriptSegment[] = scenario.lines.map((l, i) => ({
          id: `seg-${visitId}-${i}`,
          seq: i,
          speaker: l.speaker,
          startMs: l.atMs,
          endMs: l.atMs + 2500,
          text: l.text,
          confidence: l.confidence,
        }));
        stage("note", "done", `drafted · ${(generationMs / 1000).toFixed(0)}s`);
        dispatch({
          type: "NOTE_READY",
          visitId,
          sections: { ...scenario.note },
          confidenceFlags: { ...scenario.confidenceFlags },
          tags: scenario.tags.map((t) => ({ ...t, id: uid("tag") })),
          provenance: scenario.provenance,
          finalSegments,
          languageDetected: scenario.languageDetected,
          avgConfidence: scenario.avgConfidence,
          generationMs,
        });
      }, 4400);
    };

    return {
      signIn: (userId: string) => dispatch({ type: "SIGN_IN", userId }),
      setConnection: (online: boolean) => dispatch({ type: "SET_CONNECTION", online }),
      checkIn: (apptId: string) => dispatch({ type: "CHECK_IN", apptId }),
      markNoShow: (apptId: string) => dispatch({ type: "MARK_NO_SHOW", apptId }),

      addWalkIn: (fields: { fullName: string; ageYears: number; sex: Sex; phone: string; visitType: string }) => {
        const st = stateRef.current;
        const patient: Patient = {
          id: uid("p"),
          clinicId: st.clinic.id,
          fullName: fields.fullName,
          sex: fields.sex,
          ageYears: fields.ageYears,
          phone: fields.phone,
          preferredLanguage: "hi",
          createdAt: new Date().toISOString(),
        };
        const token = Math.max(0, ...st.appointments.map((x) => x.tokenNumber)) + 1;
        const appt: Appointment = {
          id: uid("a"),
          clinicId: st.clinic.id,
          patientId: patient.id,
          doctorId: "u-menon",
          scheduledAt: new Date().toISOString(),
          tokenNumber: token,
          visitType: fields.visitType || "walk-in",
          status: "arrived",
        };
        dispatch({ type: "ADD_WALK_IN", patient, appt });
        return { patientId: patient.id, apptId: appt.id };
      },

      addPatient: (fields: { fullName: string; ageYears: number; sex: Sex; phone: string; preferredLanguage?: ConsentLanguage }) => {
        const st = stateRef.current;
        const patient: Patient = {
          id: uid("p"),
          clinicId: st.clinic.id,
          fullName: fields.fullName,
          sex: fields.sex,
          ageYears: fields.ageYears,
          phone: fields.phone,
          preferredLanguage: fields.preferredLanguage ?? "hi",
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: "ADD_PATIENT", patient });
        return patient.id;
      },

      openRoom: (apptId: string) => {
        const st = stateRef.current;
        const appt = st.appointments.find((x) => x.id === apptId);
        if (!appt) return null;
        const existing = st.visits.find((v) => v.appointmentId === apptId);
        const visit: Visit = existing ?? {
          id: `v-${apptId}`,
          clinicId: st.clinic.id,
          appointmentId: apptId,
          patientId: appt.patientId,
          doctorId: st.currentUserId,
          date: new Date().toISOString(),
          state: "open",
        };
        dispatch({ type: "OPEN_ROOM", apptId, visit });
        return visit.id;
      },

      startVisitForPatient: (patientId: string) => {
        const st = stateRef.current;
        const token = Math.max(0, ...st.appointments.map((x) => x.tokenNumber)) + 1;
        const appt: Appointment = {
          id: uid("a"),
          clinicId: st.clinic.id,
          patientId,
          doctorId: st.currentUserId,
          scheduledAt: new Date().toISOString(),
          tokenNumber: token,
          visitType: "walk-in",
          status: "arrived",
        };
        const patient = st.patients.find((p) => p.id === patientId)!;
        dispatch({ type: "ADD_WALK_IN", patient: { ...patient }, appt });
        return appt.id;
      },

      logView: (patientId: string, context: string) =>
        dispatch({ type: "LOG_VIEW", patientId, context }),

      captureConsent: (visitId: string, language: ConsentLanguage, method: "verbal" | "written") => {
        const consent: Consent = {
          id: uid("cons"),
          visitId,
          capturedBy: stateRef.current.currentUserId,
          capturedAt: new Date().toISOString(),
          language,
          method,
        };
        dispatch({ type: "CAPTURE_CONSENT", consent });
      },

      withdrawConsent: (visitId: string, reason: string) =>
        dispatch({ type: "WITHDRAW_CONSENT", visitId, reason }),

      startRecording: (visitId: string) =>
        dispatch({ type: "START_RECORDING", visitId, at: Date.now() }),

      recordTick: (visitId: string, chunks: number, bytesN: number) =>
        dispatch({ type: "RECORD_TICK", visitId, chunks, bytes: bytesN }),

      setPaused: (visitId: string, paused: boolean, atMs: number) =>
        dispatch({ type: "SET_PAUSED", visitId, paused, atMs }),

      appendSegment: (visitId: string, segment: TranscriptSegment) =>
        dispatch({ type: "APPEND_SEGMENT", visitId, segment }),

      endVisit: (visitId: string, durationSeconds: number) => {
        dispatch({ type: "END_VISIT", visitId, durationSeconds });
        runPipeline(visitId);
      },

      regenerateNote: (visitId: string) => {
        dispatch({ type: "PIPELINE_STAGE", visitId, stage: "note", state: "running", detail: "re-drafting" });
        const st = stateRef.current;
        const visit = st.visits.find((v) => v.id === visitId);
        if (!visit) return;
        const scenario = scenarioForPatient(visit.patientId);
        setTimeout(() => {
          dispatch({
            type: "NOTE_READY",
            visitId,
            sections: { ...scenario.note },
            confidenceFlags: { ...scenario.confidenceFlags },
            tags: scenario.tags.map((t) => ({ ...t, id: uid("tag") })),
            provenance: scenario.provenance,
            finalSegments: st.segments[visitId] ?? [],
            languageDetected: scenario.languageDetected,
            avgConfidence: scenario.avgConfidence,
            generationMs: 1800,
          });
        }, 1800);
      },

      manualNote: (visitId: string) => dispatch({ type: "MANUAL_NOTE", visitId }),

      correctSegment: (visitId: string, segmentId: string, text: string) =>
        dispatch({ type: "CORRECT_SEGMENT", visitId, segmentId, text }),
      swapSpeakers: (visitId: string) => dispatch({ type: "SWAP_SPEAKERS", visitId }),
      editNote: (visitId: string, section: NoteSectionKey, text: string) =>
        dispatch({ type: "EDIT_NOTE", visitId, section, text }),
      discardDraft: (visitId: string) => dispatch({ type: "DISCARD_DRAFT", visitId }),

      addRxItem: (visitId: string, item: Omit<RxItem, "id" | "seq" | "source">) => {
        const st = stateRef.current;
        const rx = st.prescriptions[visitId];
        const seq = (rx?.items.length ?? 0) + 1;
        dispatch({
          type: "ADD_RX_ITEM",
          visitId,
          item: { ...item, id: uid("rxi"), seq, source: "doctor" },
        });
      },
      removeRxItem: (visitId: string, itemId: string) =>
        dispatch({ type: "REMOVE_RX_ITEM", visitId, itemId }),

      overrideAllergy: (visitId: string, drug: string, allergy: string, typedReason: string) => {
        dispatch({
          type: "OVERRIDE_ALLERGY",
          override: {
            id: uid("ovr"),
            visitId,
            userId: stateRef.current.currentUserId,
            kind: "allergy_block",
            detail: { drug, allergy },
            typedReason,
            createdAt: new Date().toISOString(),
          },
        });
      },

      signVisit: (visitId: string) => dispatch({ type: "SIGN_VISIT", visitId }),

      addAddendum: (visitId: string, body: string, reason: string) =>
        dispatch({
          type: "ADD_ADDENDUM",
          visitId,
          addendum: {
            id: uid("add"),
            authorId: stateRef.current.currentUserId,
            body,
            reason,
            createdAt: new Date().toISOString(),
          },
        }),

      deliverRx: (visitId: string, channel: Delivery["channel"]) => {
        const st = stateRef.current;
        const rx = st.prescriptions[visitId];
        if (!rx || rx.state !== "signed") return;
        const patient = st.patients.find(
          (p) => p.id === st.visits.find((v) => v.id === visitId)?.patientId,
        );
        const delivery: Delivery = {
          id: uid("dl"),
          prescriptionId: rx.id,
          visitId,
          channel,
          destination:
            channel === "whatsapp"
              ? (patient?.phone ?? "")
              : channel === "email"
                ? "patient inbox"
                : "front desk printer",
          state: channel === "print" ? "delivered" : "sending",
          attemptedAt: new Date().toISOString(),
        };
        dispatch({ type: "DELIVER_RX", delivery });
        if (channel !== "print") {
          const willFail = stateRef.current.connection === "offline";
          setTimeout(() => {
            dispatch({
              type: "DELIVERY_STATE",
              deliveryId: delivery.id,
              state: willFail ? "failed" : "delivered",
            });
          }, 1400);
        }
        return delivery.id;
      },

      retryDelivery: (deliveryId: string) => {
        dispatch({ type: "DELIVERY_STATE", deliveryId, state: "sending" });
        setTimeout(() => {
          dispatch({
            type: "DELIVERY_STATE",
            deliveryId,
            state: stateRef.current.connection === "offline" ? "failed" : "delivered",
          });
        }, 1200);
      },

      moveVisit: (visitId: string, newPatientId: string) =>
        dispatch({ type: "MOVE_VISIT", visitId, newPatientId }),

      addFlag: (flag: Omit<PatientFlag, "id" | "recordedAt" | "active">) =>
        dispatch({
          type: "ADD_FLAG",
          flag: { ...flag, id: uid("fl"), recordedAt: new Date().toISOString(), active: true },
        }),
      deactivateFlag: (flagId: string) => dispatch({ type: "DEACTIVATE_FLAG", flagId }),

      exportPatient: (patientId: string) => dispatch({ type: "EXPORT_PATIENT", patientId }),
      deletePatient: (patientId: string) => dispatch({ type: "DELETE_PATIENT", patientId }),

      setRetention: (days: number) => dispatch({ type: "SET_RETENTION", days }),
      setSimUnverified: (on: boolean) => dispatch({ type: "SET_SIM_UNVERIFIED", on }),
      addVocab: (term: string) => dispatch({ type: "ADD_VOCAB", term }),
      removeVocab: (term: string) => dispatch({ type: "REMOVE_VOCAB", term }),
      updateClinic: (fields: Partial<AppState["clinic"]>) =>
        dispatch({ type: "UPDATE_CLINIC", fields }),
      resetDemo: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        dispatch({ type: "RESET_DEMO" });
      },
    };
  }, [dispatch]);
}

/* selectors */

export function useMe() {
  const s = useAppState();
  const me = s.users.find((u) => u.id === s.currentUserId) ?? s.users[0];
  const profile = s.doctorProfiles[me.id];
  const isClinical = me.role !== "front_desk";
  const verified =
    isClinical && profile?.verificationStatus === "verified" && !s.demo.simulateUnverified;
  return { me, profile, isClinical, verified };
}

export function usePatient(patientId?: string) {
  const s = useAppState();
  return s.patients.find((p) => p.id === patientId);
}

export function patientFlags(s: AppState, patientId: string) {
  const active = s.flags.filter((f) => f.patientId === patientId && f.active);
  return {
    allergies: active.filter((f) => f.kind === "allergy"),
    chronic: active.filter((f) => f.kind === "chronic"),
    meds: active.filter((f) => f.kind === "running_medication"),
  };
}

export function visitsOfPatient(s: AppState, patientId: string) {
  return s.visits
    .filter((v) => v.patientId === patientId && v.state === "signed")
    .sort((a, b) => b.date.localeCompare(a.date));
}

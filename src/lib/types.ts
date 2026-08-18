/**
 * Domain types, mirroring the PRD §7 data model (Neon/Postgres) so the
 * client store can be swapped for real queries without renaming anything.
 */

export type Role = "owner" | "doctor" | "front_desk";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type ApptStatus =
  | "scheduled"
  | "arrived"
  | "in_room"
  | "signed"
  | "no_show";
export type VisitState =
  | "open"
  | "recording"
  | "processing"
  | "drafted"
  | "signed"
  | "discarded";
export type Speaker = "DR" | "PT" | "ATT" | "UNKNOWN";
export type FlagKind = "allergy" | "chronic" | "running_medication";
export type ConsentLanguage = "en" | "hi" | "mr";
export type Sex = "M" | "F" | "O";

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  audioRetentionDays: number;
}

export interface User {
  id: string;
  clinicId: string;
  email: string;
  fullName: string;
  role: Role;
  phone: string;
}

export interface DoctorProfile {
  userId: string;
  registrationNumber: string;
  registrationCouncil: string;
  qualifications: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
}

export interface Patient {
  id: string;
  clinicId: string;
  fullName: string;
  sex: Sex;
  ageYears: number;
  dateOfBirth?: string;
  phone: string;
  preferredLanguage: ConsentLanguage;
  createdAt: string;
}

export interface PatientFlag {
  id: string;
  patientId: string;
  kind: FlagKind;
  label: string;
  detail?: string;
  severity?: "mild" | "moderate" | "severe";
  recordedAt: string;
  active: boolean;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  tokenNumber: number;
  visitType: string;
  status: ApptStatus;
}

export interface Visit {
  id: string;
  clinicId: string;
  appointmentId?: string;
  patientId: string;
  doctorId: string;
  date: string;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  state: VisitState;
  /** transcript-quality hint set by the pipeline for this visit */
  languageDetected?: string;
  avgConfidence?: number;
}

export interface Consent {
  id: string;
  visitId: string;
  capturedBy: string;
  capturedAt: string;
  language: ConsentLanguage;
  method: "verbal" | "written";
  withdrawnAt?: string;
  withdrawalReason?: string;
}

export interface TranscriptSegment {
  id: string;
  seq: number;
  speaker: Speaker;
  startMs: number;
  endMs: number;
  text: string;
  confidence: number;
  correctedText?: string;
  interim?: boolean;
}

export type NoteSectionKey =
  | "presentingComplaint"
  | "history"
  | "examination"
  | "assessment"
  | "plan";

export const NOTE_SECTIONS: { key: NoteSectionKey; label: string }[] = [
  { key: "presentingComplaint", label: "Presenting complaint" },
  { key: "history", label: "History" },
  { key: "examination", label: "On examination" },
  { key: "assessment", label: "Assessment (draft)" },
  { key: "plan", label: "Plan" },
];

export interface Note {
  visitId: string;
  sections: Record<NoteSectionKey, string>;
  confidenceFlags: Partial<Record<NoteSectionKey, "low">>;
  state: "draft" | "signed";
  signedBy?: string;
  signedAt?: string;
  contentHash?: string;
  modelUsed: string;
  promptVersion: string;
  generationMs: number;
  updatedAt: string;
}

export interface NoteTag {
  id: string;
  kind: "symptom" | "finding" | "condition";
  label: string;
  codeSystem?: "ICD-10" | "SNOMED";
  code?: string;
  confidence: number;
}

/** section → transcript segment seqs that produced it (FR-NOTE-6) */
export type Provenance = Partial<Record<NoteSectionKey, number[]>>;

export interface NoteAddendum {
  id: string;
  authorId: string;
  body: string;
  reason: string;
  createdAt: string;
}

export interface RxItem {
  id: string;
  seq: number;
  drugId?: string;
  freeTextName?: string;
  strength: string;
  form: string;
  frequency: string;
  durationDays: number | null;
  instructions: string;
  source: "doctor";
}

export interface Prescription {
  id: string;
  visitId: string;
  state: "draft" | "signed" | "superseded";
  items: RxItem[];
  signedAt?: string;
  signedBy?: string;
  supersedesId?: string;
  signatureSnapshot?: {
    name: string;
    qualifications: string;
    registration: string;
    clinic: string;
  };
  contentHash?: string;
}

export interface Delivery {
  id: string;
  prescriptionId: string;
  visitId: string;
  channel: "print" | "email" | "whatsapp";
  destination: string;
  state: "queued" | "sending" | "delivered" | "failed";
  attemptedAt: string;
}

export interface SafetyOverride {
  id: string;
  visitId: string;
  userId: string;
  kind: "allergy_block";
  detail: { drug: string; allergy: string };
  typedReason: string;
  createdAt: string;
}

export interface AuditEntry {
  id: number;
  clinicId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  patientId?: string;
  visitId?: string;
  metadata?: Record<string, string | number | boolean>;
  ip: string;
  at: string;
}

export interface Drug {
  id: string;
  brand: string;
  generic: string;
  salt: string;
  strength: string;
  form: string;
  schedule?: "H" | "H1" | "OTC";
  /** used for allergy matching, e.g. "penicillin" */
  saltFamily?: string;
}

export type PipelineStageKey = "audio" | "transcript" | "speakers" | "note";
export type StageState = "idle" | "running" | "done" | "failed";

export interface PipelineState {
  audio: StageState;
  transcript: StageState;
  speakers: StageState;
  note: StageState;
  /** human details rendered under each stage */
  detail: Partial<Record<PipelineStageKey, string>>;
  startedAt?: number;
  finishedAt?: number;
}

import type {
  Appointment,
  AuditEntry,
  Clinic,
  Consent,
  Delivery,
  DoctorProfile,
  Note,
  NoteSectionKey,
  NoteTag,
  Patient,
  PatientFlag,
  Prescription,
  RxItem,
  User,
  Visit,
} from "./types";
import { daysAgo, hashContent, todayAt, todayKey } from "./format";

export interface SeedData {
  seedDate: string;
  clinic: Clinic;
  users: User[];
  doctorProfiles: Record<string, DoctorProfile>;
  patients: Patient[];
  flags: PatientFlag[];
  appointments: Appointment[];
  visits: Visit[];
  consents: Consent[];
  notes: Record<string, Note>;
  tags: Record<string, NoteTag[]>;
  prescriptions: Record<string, Prescription>;
  deliveries: Delivery[];
  audit: AuditEntry[];
  vocabulary: string[];
}

const CLINIC_ID = "c-sunrise";
const DR_MENON = "u-menon";
const DR_RAO = "u-rao";
const FRONT_DESK = "u-sunita";

let auditId = 1;
let seq = 1;
const nid = (p: string) => `${p}-seed${(seq++).toString(36)}`;

function audit(
  entries: AuditEntry[],
  at: string,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  extra?: Partial<AuditEntry>,
) {
  entries.push({
    id: auditId++,
    clinicId: CLINIC_ID,
    actorId,
    action,
    entityType,
    entityId,
    ip: "103.86.182.44",
    at,
    ...extra,
  });
}

export function buildSeed(): SeedData {
  auditId = 1;
  seq = 1;

  const clinic: Clinic = {
    id: CLINIC_ID,
    name: "Sunrise Polyclinic",
    address: "Plot 14, Sector 17, Vashi",
    city: "Navi Mumbai",
    state: "Maharashtra",
    pincode: "400703",
    phone: "+91 22 2789 4410",
    audioRetentionDays: 90,
  };

  const users: User[] = [
    { id: DR_MENON, clinicId: CLINIC_ID, email: "a.menon@sunrisepolyclinic.in", fullName: "Dr. Arvind Menon", role: "owner", phone: "+91 98204 14417" },
    { id: DR_RAO, clinicId: CLINIC_ID, email: "k.rao@sunrisepolyclinic.in", fullName: "Dr. Kavita Rao", role: "doctor", phone: "+91 98331 20844" },
    { id: FRONT_DESK, clinicId: CLINIC_ID, email: "frontdesk@sunrisepolyclinic.in", fullName: "Sunita Pawar", role: "front_desk", phone: "+91 90042 77120" },
  ];

  const doctorProfiles: Record<string, DoctorProfile> = {
    [DR_MENON]: {
      userId: DR_MENON,
      registrationNumber: "MMC 44712209",
      registrationCouncil: "Maharashtra Medical Council",
      qualifications: "MBBS, MD (General Medicine)",
      verificationStatus: "verified",
      verifiedAt: daysAgo(41, "16:20"),
    },
    [DR_RAO]: {
      userId: DR_RAO,
      registrationNumber: "MMC 51230981",
      registrationCouncil: "Maharashtra Medical Council",
      qualifications: "MBBS, DNB (Family Medicine)",
      verificationStatus: "pending",
    },
  };

  const P = (
    id: string,
    fullName: string,
    sex: Patient["sex"],
    ageYears: number,
    phone: string,
    preferredLanguage: Patient["preferredLanguage"],
    createdDaysAgo = 300,
  ): Patient => ({
    id,
    clinicId: CLINIC_ID,
    fullName,
    sex,
    ageYears,
    phone,
    preferredLanguage,
    createdAt: daysAgo(createdDaysAgo),
  });

  const patients: Patient[] = [
    P("p-priya", "Priya Nair", "F", 34, "+91 98920 40219", "hi", 460),
    P("p-rakesh", "Rakesh Bhosale", "M", 58, "+91 99674 11832", "mr", 700),
    P("p-arjun", "Arjun Kulkarni", "M", 6, "+91 98230 66504", "mr", 180),
    P("p-ramanathan", "S. Ramanathan", "M", 66, "+91 98191 22876", "en", 900),
    P("p-meera", "Meera Joshi", "F", 41, "+91 98205 33914", "mr", 540),
    P("p-fatima", "Fatima Shaikh", "F", 27, "+91 97690 84421", "hi", 0),
    P("p-ibrahim", "Ibrahim Ansari", "M", 72, "+91 98670 20953", "hi", 820),
    P("p-lakshmi", "Lakshmi Iyer", "F", 55, "+91 98921 75330", "en", 610),
    P("p-dinesh", "Dinesh Gupta", "M", 45, "+91 99303 51278", "hi", 350),
    P("p-anita", "Anita Deshmukh", "F", 29, "+91 98334 90112", "mr", 90),
    P("p-vikram", "Vikram Patil", "M", 52, "+91 99871 34560", "mr", 400),
    P("p-sushila", "Sushila Devi", "F", 68, "+91 97024 18837", "hi", 640),
    P("p-priyanka", "Priyanka Naik", "F", 31, "+91 98198 55672", "mr", 210),
    P("p-prakash", "Prakash Nayak", "M", 47, "+91 98675 09314", "hi", 520),
  ];

  const F = (
    patientId: string,
    kind: PatientFlag["kind"],
    label: string,
    detail?: string,
    severity?: PatientFlag["severity"],
    recordedDaysAgo = 200,
  ): PatientFlag => ({
    id: nid("fl"),
    patientId,
    kind,
    label,
    detail,
    severity,
    recordedAt: daysAgo(recordedDaysAgo),
    active: true,
  });

  const flags: PatientFlag[] = [
    F("p-priya", "chronic", "Asthma, childhood", "No inhaler use since 2016", "mild", 460),
    F("p-rakesh", "allergy", "Penicillin", "Urticaria after amoxicillin, 2019", "severe", 700),
    F("p-rakesh", "chronic", "Hypertension", "Diagnosed 2021", "moderate", 500),
    F("p-rakesh", "running_medication", "Telma 40", "Telmisartan 40mg · 1-0-0", undefined, 500),
    F("p-ramanathan", "chronic", "Type 2 diabetes", "Diagnosed 2015 · last HbA1c 7.2%", "moderate", 900),
    F("p-ramanathan", "chronic", "Hypertension", "Diagnosed 2018", "mild", 800),
    F("p-ramanathan", "running_medication", "Glycomet 500 SR", "Metformin 500mg · 1-0-1", undefined, 700),
    F("p-ramanathan", "running_medication", "Telma H", "Telmisartan + HCTZ · 1-0-0", undefined, 600),
    F("p-meera", "chronic", "Hypothyroidism", "On replacement since 2022", "mild", 540),
    F("p-meera", "running_medication", "Thyronorm 50", "Levothyroxine 50mcg · morning, empty stomach", undefined, 540),
    F("p-ibrahim", "chronic", "COPD", "Ex-smoker, quit 2014", "moderate", 820),
    F("p-ibrahim", "running_medication", "Deriphyllin", "1-0-1", undefined, 400),
    F("p-ibrahim", "allergy", "Sulfa drugs", "Rash, 2017", "moderate", 820),
    F("p-lakshmi", "chronic", "Osteoarthritis, knees", "Bilateral, right worse", "moderate", 610),
    F("p-sushila", "chronic", "Osteoporosis", "On calcium + D3", "mild", 640),
    F("p-sushila", "running_medication", "Shelcal 500", "0-0-1", undefined, 640),
  ];

  const A = (
    id: string,
    patientId: string,
    hhmm: string,
    tokenNumber: number,
    visitType: string,
    status: Appointment["status"],
  ): Appointment => ({
    id,
    clinicId: CLINIC_ID,
    patientId,
    doctorId: DR_MENON,
    scheduledAt: todayAt(hhmm),
    tokenNumber,
    visitType,
    status,
  });

  const appointments: Appointment[] = [
    A("a-01", "p-anita", "10:00", 1, "fever", "signed"),
    A("a-02", "p-vikram", "10:15", 2, "acidity", "signed"),
    A("a-03", "p-sushila", "10:30", 3, "follow-up", "signed"),
    A("a-04", "p-dinesh", "10:35", 4, "new complaint", "no_show"),
    A("a-05", "p-ramanathan", "10:50", 5, "diabetes review", "signed"),
    A("a-06", "p-meera", "11:05", 6, "thyroid review", "signed"),
    A("a-07", "p-priya", "11:20", 7, "follow-up", "arrived"),
    A("a-08", "p-rakesh", "11:35", 8, "BP review", "arrived"),
    A("a-09", "p-fatima", "11:50", 9, "new patient", "scheduled"),
    A("a-10", "p-arjun", "12:05", 10, "fever · with parent", "arrived"),
    A("a-11", "p-ibrahim", "12:20", 11, "breathlessness", "scheduled"),
    A("a-12", "p-lakshmi", "12:35", 12, "knee pain review", "scheduled"),
  ];

  const visits: Visit[] = [];
  const consents: Consent[] = [];
  const notes: Record<string, Note> = {};
  const tags: Record<string, NoteTag[]> = {};
  const prescriptions: Record<string, Prescription> = {};
  const deliveries: Delivery[] = [];
  const auditLog: AuditEntry[] = [];

  audit(auditLog, todayAt("09:52"), FRONT_DESK, "session.sign_in", "user", FRONT_DESK);
  audit(auditLog, todayAt("09:58"), DR_MENON, "session.sign_in", "user", DR_MENON);

  /** Build a fully signed visit with note, rx and audit chain. */
  function signedVisit(opts: {
    id: string;
    appointmentId?: string;
    patientId: string;
    at: string; // ISO of visit start (today or past)
    durationMin: number;
    language: Consent["language"];
    sections: Record<NoteSectionKey, string>;
    tagList?: Omit<NoteTag, "id">[];
    rx: Array<{
      drugId?: string;
      freeTextName?: string;
      strength: string;
      form: string;
      frequency: string;
      durationDays: number | null;
      instructions?: string;
    }>;
    deliver?: Array<"print" | "whatsapp" | "email">;
    isToday?: boolean;
  }) {
    const start = new Date(opts.at);
    const end = new Date(start.getTime() + opts.durationMin * 60000);
    const signAt = new Date(end.getTime() + 3 * 60000);
    const patient = patients.find((p) => p.id === opts.patientId)!;

    visits.push({
      id: opts.id,
      clinicId: CLINIC_ID,
      appointmentId: opts.appointmentId,
      patientId: opts.patientId,
      doctorId: DR_MENON,
      date: opts.at,
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      durationSeconds: opts.durationMin * 60,
      state: "signed",
      languageDetected: "Hindi + English",
      avgConfidence: 0.93,
    });

    consents.push({
      id: nid("cons"),
      visitId: opts.id,
      capturedBy: DR_MENON,
      capturedAt: start.toISOString(),
      language: opts.language,
      method: "verbal",
    });

    const noteBody = Object.values(opts.sections).join("\n");
    notes[opts.id] = {
      visitId: opts.id,
      sections: opts.sections,
      confidenceFlags: {},
      state: "signed",
      signedBy: DR_MENON,
      signedAt: signAt.toISOString(),
      contentHash: hashContent(noteBody),
      modelUsed: "claude-sonnet-5",
      promptVersion: "note-v3.2",
      generationMs: 7600,
      updatedAt: signAt.toISOString(),
    };
    if (opts.tagList) {
      tags[opts.id] = opts.tagList.map((t) => ({ ...t, id: nid("tg") }));
    }

    const items: RxItem[] = opts.rx.map((r, i) => ({
      id: nid("rxi"),
      seq: i + 1,
      drugId: r.drugId,
      freeTextName: r.freeTextName,
      strength: r.strength,
      form: r.form,
      frequency: r.frequency,
      durationDays: r.durationDays,
      instructions: r.instructions ?? "",
      source: "doctor",
    }));
    const rxId = `rx-${opts.id}`;
    prescriptions[opts.id] = {
      id: rxId,
      visitId: opts.id,
      state: "signed",
      items,
      signedAt: signAt.toISOString(),
      signedBy: DR_MENON,
      signatureSnapshot: {
        name: "Dr. Arvind Menon",
        qualifications: "MBBS, MD (General Medicine)",
        registration: "MMC 44712209 · Maharashtra Medical Council",
        clinic: "Sunrise Polyclinic, Plot 14, Sector 17, Vashi, Navi Mumbai 400703",
      },
      contentHash: hashContent(items.map((i) => i.drugId ?? i.freeTextName).join("|")),
    };

    for (const ch of opts.deliver ?? []) {
      deliveries.push({
        id: nid("dl"),
        prescriptionId: rxId,
        visitId: opts.id,
        channel: ch,
        destination: ch === "whatsapp" ? patient.phone : ch === "email" ? "patient inbox" : "front desk printer",
        state: "delivered",
        attemptedAt: new Date(signAt.getTime() + 60000).toISOString(),
      });
    }

    // audit chain for the visit
    const t = (m: number) => new Date(start.getTime() + m * 60000).toISOString();
    audit(auditLog, t(0), DR_MENON, "consent.captured", "consent", opts.id, { patientId: opts.patientId, visitId: opts.id, metadata: { language: opts.language, method: "verbal" } });
    audit(auditLog, t(0), DR_MENON, "recording.started", "recording", opts.id, { patientId: opts.patientId, visitId: opts.id });
    audit(auditLog, t(opts.durationMin), DR_MENON, "recording.stopped", "recording", opts.id, { patientId: opts.patientId, visitId: opts.id, metadata: { durationSeconds: opts.durationMin * 60 } });
    audit(auditLog, t(opts.durationMin + 1), DR_MENON, "note.generated", "note", opts.id, { patientId: opts.patientId, visitId: opts.id, metadata: { generationMs: 7600, promptVersion: "note-v3.2" } });
    audit(auditLog, t(opts.durationMin + 2), DR_MENON, "note.edited", "note", opts.id, { patientId: opts.patientId, visitId: opts.id, metadata: { section: "plan", charsChanged: 18 } });
    audit(auditLog, t(opts.durationMin + 3), DR_MENON, "note.signed", "note", opts.id, { patientId: opts.patientId, visitId: opts.id, metadata: { contentHash: notes[opts.id].contentHash! } });
    audit(auditLog, t(opts.durationMin + 3), DR_MENON, "rx.signed", "prescription", rxId, { patientId: opts.patientId, visitId: opts.id, metadata: { items: items.length } });
    for (const ch of opts.deliver ?? []) {
      audit(auditLog, t(opts.durationMin + 4), DR_MENON, "rx.delivered", "prescription", rxId, { patientId: opts.patientId, visitId: opts.id, metadata: { channel: ch, state: "delivered" } });
    }
  }

  /* ── today's completed morning ── */

  signedVisit({
    id: "v-anita-today", appointmentId: "a-01", patientId: "p-anita", at: todayAt("10:02"), durationMin: 5, language: "mr",
    sections: {
      presentingComplaint: "Fever and body ache for 2 days.",
      history: "Low-grade fever ×2 days with generalised body ache. No cough. Family members recently unwell.",
      examination: "Temp 99.6°F. Throat mildly congested. Chest clear.",
      assessment: "Viral fever — draft.",
      plan: "Symptomatic treatment, hydration. Review if fever persists beyond 3 days.",
    },
    tagList: [
      { kind: "symptom", label: "fever", codeSystem: "ICD-10", code: "R50.9", confidence: 0.96 },
      { kind: "symptom", label: "body ache", codeSystem: "ICD-10", code: "M79.1", confidence: 0.9 },
    ],
    rx: [
      { drugId: "d-dolo650", strength: "650mg", form: "tablet", frequency: "1-0-1", durationDays: 3, instructions: "After food" },
      { drugId: "d-cetzine", strength: "10mg", form: "tablet", frequency: "0-0-1", durationDays: 3 },
    ],
    deliver: ["whatsapp", "print"], isToday: true,
  });

  signedVisit({
    id: "v-vikram-today", appointmentId: "a-02", patientId: "p-vikram", at: todayAt("10:17"), durationMin: 6, language: "mr",
    sections: {
      presentingComplaint: "Burning epigastric discomfort after meals, 1 week.",
      history: "Post-prandial burning ×1 week, worse with spicy food and late dinners. No vomiting, no black stools. Tea 5–6 cups/day.",
      examination: "Abdomen soft, mild epigastric tenderness. No guarding.",
      assessment: "Gastritis, likely dietary — draft.",
      plan: "PPI for 2 weeks, meal-timing advice, reduce tea. Report immediately if black stools or vomiting.",
    },
    tagList: [
      { kind: "symptom", label: "epigastric burning", confidence: 0.9 },
      { kind: "condition", label: "gastritis", codeSystem: "ICD-10", code: "K29.7", confidence: 0.87 },
    ],
    rx: [
      { drugId: "d-pan40", strength: "40mg", form: "tablet", frequency: "1-0-0", durationDays: 14, instructions: "30 min before breakfast" },
    ],
    deliver: ["print"], isToday: true,
  });

  signedVisit({
    id: "v-sushila-today", appointmentId: "a-03", patientId: "p-sushila", at: todayAt("10:33"), durationMin: 7, language: "hi",
    sections: {
      presentingComplaint: "Routine follow-up, knee stiffness in the mornings.",
      history: "Morning stiffness ~15 minutes, improves with movement. Taking calcium regularly. Walks 20 minutes daily.",
      examination: "Mild crepitus both knees. No effusion. Gait steady.",
      assessment: "Osteoporosis with early degenerative knee changes — stable.",
      plan: "Continue calcium + D3. Quadriceps exercises demonstrated. Review in 3 months.",
    },
    rx: [
      { drugId: "d-shelcal", strength: "500mg", form: "tablet", frequency: "0-0-1", durationDays: 90, instructions: "After dinner" },
    ],
    deliver: ["print"], isToday: true,
  });

  signedVisit({
    id: "v-raman-today", appointmentId: "a-05", patientId: "p-ramanathan", at: todayAt("10:52"), durationMin: 9, language: "en",
    sections: {
      presentingComplaint: "Quarterly diabetes review. No new complaints.",
      history: "Adherent to metformin and telmisartan+HCTZ. Fasting sugars at home 110–126. Walks daily. No hypoglycaemic episodes, no visual complaints, no foot symptoms.",
      examination: "BP 132/84. Weight 71 kg (stable). Foot examination — pulses present, sensation intact, no lesions.",
      assessment: "Type 2 diabetes with hypertension — acceptable control.",
      plan: "Continue current medication. HbA1c and renal profile before next visit. Annual eye check reminded. Review in 3 months.",
    },
    tagList: [
      { kind: "condition", label: "type 2 diabetes", codeSystem: "ICD-10", code: "E11.9", confidence: 0.97 },
      { kind: "condition", label: "hypertension", codeSystem: "ICD-10", code: "I10", confidence: 0.95 },
      { kind: "finding", label: "BP 132/84", confidence: 0.94 },
    ],
    rx: [
      { drugId: "d-glycomet", strength: "500mg", form: "tablet", frequency: "1-0-1", durationDays: 90, instructions: "With meals" },
      { drugId: "d-telma-h", strength: "40/12.5mg", form: "tablet", frequency: "1-0-0", durationDays: 90 },
      { drugId: "d-becosules", strength: "—", form: "capsule", frequency: "1-0-0", durationDays: 30 },
    ],
    deliver: ["whatsapp"], isToday: true,
  });

  signedVisit({
    id: "v-meera-today", appointmentId: "a-06", patientId: "p-meera", at: todayAt("11:06"), durationMin: 6, language: "mr",
    sections: {
      presentingComplaint: "Thyroid review with recent reports.",
      history: "TSH 3.1 on current dose (report 14 Aug). Energy levels good, weight stable. Taking dose on empty stomach as advised.",
      examination: "Pulse 74. No tremor. Thyroid not palpably enlarged.",
      assessment: "Hypothyroidism — euthyroid on current replacement.",
      plan: "Continue Thyronorm 50mcg. Repeat TSH in 6 months, earlier if symptoms.",
    },
    rx: [
      { drugId: "d-thyronorm", strength: "50mcg", form: "tablet", frequency: "1-0-0", durationDays: 90, instructions: "Empty stomach, 30 min before breakfast" },
    ],
    deliver: ["whatsapp", "print"], isToday: true,
  });

  /* ── history for timelines ── */

  signedVisit({
    id: "v-priya-mar", patientId: "p-priya", at: daysAgo(159, "11:40"), durationMin: 7, language: "hi",
    sections: {
      presentingComplaint: "Facial heaviness and thick nasal discharge, 5 days.",
      history: "Purulent nasal discharge, facial pressure worse on bending, low-grade fever. Second episode this year.",
      examination: "Maxillary tenderness both sides. Post-nasal drip present. Temp 99.8°F.",
      assessment: "Acute bacterial sinusitis — draft.",
      plan: "Antibiotic course, steam inhalation, saline rinses. Review in 5 days.",
    },
    tagList: [
      { kind: "condition", label: "acute sinusitis", codeSystem: "ICD-10", code: "J01.90", confidence: 0.91 },
    ],
    rx: [
      { drugId: "d-azithral", strength: "500mg", form: "tablet", frequency: "1-0-0", durationDays: 5, instructions: "After food" },
      { drugId: "d-otrivin", strength: "0.1%", form: "nasal drops", frequency: "1-1-1", durationDays: 5, instructions: "Not beyond 5 days" },
    ],
    deliver: ["print"],
  });

  signedVisit({
    id: "v-priya-jan", patientId: "p-priya", at: daysAgo(226, "10:30"), durationMin: 5, language: "hi",
    sections: {
      presentingComplaint: "Routine check before travel.",
      history: "No complaints. Sleep and appetite normal.",
      examination: "BP 118/76. Hb 11.9 (report seen). General examination normal.",
      assessment: "Routine check — normal.",
      plan: "No medication. Continue as usual.",
    },
    rx: [],
  });

  signedVisit({
    id: "v-rakesh-jun", patientId: "p-rakesh", at: daysAgo(60, "18:30"), durationMin: 8, language: "mr",
    sections: {
      presentingComplaint: "BP review.",
      history: "On telmisartan 40mg. Reports good adherence this period. Occasional evening headaches.",
      examination: "BP 138/88. Pulse 76 regular. Chest clear.",
      assessment: "Hypertension — borderline control.",
      plan: "Continue same dose. Home BP diary twice a week. Review in 8 weeks.",
    },
    rx: [
      { drugId: "d-telma", strength: "40mg", form: "tablet", frequency: "1-0-0", durationDays: 60, instructions: "Morning, same time daily" },
    ],
    deliver: ["print"],
  });

  signedVisit({
    id: "v-rakesh-feb", patientId: "p-rakesh", at: daysAgo(180, "18:15"), durationMin: 6, language: "mr",
    sections: {
      presentingComplaint: "Hypertension follow-up.",
      history: "Doses regular. No headaches this period.",
      examination: "BP 134/86. No oedema.",
      assessment: "Hypertension — adequate control.",
      plan: "Continue telmisartan 40mg. Salt restriction reinforced.",
    },
    rx: [
      { drugId: "d-telma", strength: "40mg", form: "tablet", frequency: "1-0-0", durationDays: 90 },
    ],
  });

  signedVisit({
    id: "v-raman-may", patientId: "p-ramanathan", at: daysAgo(95, "10:45"), durationMin: 8, language: "en",
    sections: {
      presentingComplaint: "Quarterly diabetes review.",
      history: "HbA1c 7.2% (May). Adherent. One episode of evening giddiness, resolved with food.",
      examination: "BP 130/82. Weight 71.4 kg.",
      assessment: "Type 2 diabetes — stable.",
      plan: "Continue metformin. Discussed evening snack timing.",
    },
    rx: [
      { drugId: "d-glycomet", strength: "500mg", form: "tablet", frequency: "1-0-1", durationDays: 90, instructions: "With meals" },
      { drugId: "d-telma-h", strength: "40/12.5mg", form: "tablet", frequency: "1-0-0", durationDays: 90 },
    ],
  });

  signedVisit({
    id: "v-raman-feb", patientId: "p-ramanathan", at: daysAgo(186, "10:40"), durationMin: 7, language: "en",
    sections: {
      presentingComplaint: "Diabetes review.",
      history: "Fasting sugars 105–130 at home.",
      examination: "BP 134/86. Foot check normal.",
      assessment: "Type 2 diabetes — stable.",
      plan: "Continue current medication.",
    },
    rx: [
      { drugId: "d-glycomet", strength: "500mg", form: "tablet", frequency: "1-0-1", durationDays: 90 },
    ],
  });

  signedVisit({
    id: "v-ibrahim-jul", patientId: "p-ibrahim", at: daysAgo(35, "12:10"), durationMin: 9, language: "hi",
    sections: {
      presentingComplaint: "Increased breathlessness on stairs, 1 week.",
      history: "COPD, ex-smoker. Breathless after one flight of stairs, no fever, no chest pain. Using Deriphyllin as prescribed.",
      examination: "Scattered rhonchi. SpO2 94% room air. No pedal oedema.",
      assessment: "COPD — mild exacerbation, draft.",
      plan: "Bronchodilator inhaler added. Breathing exercises. Return immediately if breathless at rest.",
    },
    rx: [
      { drugId: "d-asthalin", strength: "100mcg", form: "inhaler", frequency: "SOS", durationDays: null, instructions: "2 puffs when breathless, max 4×/day" },
      { drugId: "d-deriphyllin", strength: "—", form: "tablet", frequency: "1-0-1", durationDays: 30 },
    ],
    deliver: ["print"],
  });

  signedVisit({
    id: "v-lakshmi-jun", patientId: "p-lakshmi", at: daysAgo(55, "12:30"), durationMin: 6, language: "en",
    sections: {
      presentingComplaint: "Right knee pain after standing long hours.",
      history: "Pain after prolonged standing, relieved by rest. No locking or giving way.",
      examination: "Crepitus right knee, medial joint-line tenderness. No effusion.",
      assessment: "Osteoarthritis flare — right knee.",
      plan: "Topical analgesic, quadriceps strengthening, weight counselling. Review in 6 weeks.",
    },
    rx: [
      { drugId: "d-volini", strength: "30g", form: "gel", frequency: "1-1-1", durationDays: 14, instructions: "Local application" },
      { drugId: "d-shelcal", strength: "500mg", form: "tablet", frequency: "0-0-1", durationDays: 60 },
    ],
  });

  signedVisit({
    id: "v-meera-apr", patientId: "p-meera", at: daysAgo(120, "11:00"), durationMin: 5, language: "mr",
    sections: {
      presentingComplaint: "Thyroid review.",
      history: "TSH 4.8 — dose adjusted last visit. Mild fatigue improving.",
      examination: "Pulse 72. Weight stable.",
      assessment: "Hypothyroidism — improving on adjusted dose.",
      plan: "Repeat TSH in 3 months.",
    },
    rx: [
      { drugId: "d-thyronorm", strength: "50mcg", form: "tablet", frequency: "1-0-0", durationDays: 90, instructions: "Empty stomach" },
    ],
  });

  // front-desk activity in the audit log (reads are logged — FR-AUD-5)
  audit(auditLog, todayAt("10:01"), FRONT_DESK, "patient.checked_in", "appointment", "a-01", { patientId: "p-anita" });
  audit(auditLog, todayAt("10:14"), FRONT_DESK, "patient.checked_in", "appointment", "a-02", { patientId: "p-vikram" });
  audit(auditLog, todayAt("10:29"), FRONT_DESK, "patient.checked_in", "appointment", "a-03", { patientId: "p-sushila" });
  audit(auditLog, todayAt("10:49"), FRONT_DESK, "patient.checked_in", "appointment", "a-05", { patientId: "p-ramanathan" });
  audit(auditLog, todayAt("11:04"), FRONT_DESK, "patient.checked_in", "appointment", "a-06", { patientId: "p-meera" });
  audit(auditLog, todayAt("11:18"), FRONT_DESK, "patient.checked_in", "appointment", "a-07", { patientId: "p-priya" });
  audit(auditLog, todayAt("11:32"), FRONT_DESK, "patient.checked_in", "appointment", "a-08", { patientId: "p-rakesh" });
  audit(auditLog, todayAt("11:58"), FRONT_DESK, "patient.checked_in", "appointment", "a-10", { patientId: "p-arjun" });
  audit(auditLog, todayAt("10:36"), FRONT_DESK, "appointment.marked_no_show", "appointment", "a-04", { patientId: "p-dinesh" });
  audit(auditLog, todayAt("10:48"), FRONT_DESK, "patient.record_viewed", "patient", "p-ramanathan", { patientId: "p-ramanathan", metadata: { fields: "demographics only — role: front_desk" } });

  auditLog.sort((a, b) => a.at.localeCompare(b.at));
  auditLog.forEach((e, i) => (e.id = i + 1));

  return {
    seedDate: todayKey(),
    clinic,
    users,
    doctorProfiles,
    patients,
    flags,
    appointments,
    visits,
    consents,
    notes,
    tags,
    prescriptions,
    deliveries,
    audit: auditLog,
    vocabulary: [
      "Azithral", "Dolo 650", "Telma", "Thyronorm", "Glycomet", "Vashi",
      "Koparkhairane", "Deriphyllin", "Shelcal", "bukhar", "taqleef",
    ],
  };
}

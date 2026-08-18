import type {
  NoteSectionKey,
  NoteTag,
  Provenance,
  Speaker,
} from "./types";

/**
 * Scripted consult scenarios that drive the simulated pipeline.
 *
 * In production the streaming transcript comes from the ASR provider and
 * the note from Claude with structured output (PRD §8.4, §9.1). The
 * scenarios below stand in for both so the entire core loop is walkable,
 * including diarization labels, code-mixed utterances, per-line
 * confidence, provenance and confidence flags.
 */

export interface ScriptLine {
  speaker: Speaker;
  atMs: number;
  text: string;
  confidence: number;
}

export interface Scenario {
  id: string;
  patientKey: string; // patient id it belongs to; "generic" = fallback
  languageDetected: string;
  avgConfidence: number;
  lines: ScriptLine[];
  note: Record<NoteSectionKey, string>;
  confidenceFlags: Partial<Record<NoteSectionKey, "low">>;
  tags: Omit<NoteTag, "id">[];
  provenance: Provenance;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "sc-priya",
    patientKey: "p-priya",
    languageDetected: "Hindi + English",
    avgConfidence: 0.94,
    lines: [
      { speaker: "DR", atMs: 4000, text: "Haan Priya, batao, kya taqleef ho rahi hai?", confidence: 0.97 },
      { speaker: "PT", atMs: 7000, text: "Do din se bukhar hai, and throat is paining a lot.", confidence: 0.95 },
      { speaker: "DR", atMs: 14000, text: "Cough? Sardi?", confidence: 0.98 },
      { speaker: "PT", atMs: 17000, text: "Dry cough hai. Raat ko zyada hota hai.", confidence: 0.93 },
      { speaker: "DR", atMs: 24000, text: "Khaana pani theek se le rahi ho? Nigalne mein dard?", confidence: 0.96 },
      { speaker: "PT", atMs: 28000, text: "Swallowing mein thoda dard hai, khaana kam ho gaya hai.", confidence: 0.92 },
      { speaker: "DR", atMs: 36000, text: "Throat dekhte hain… erythema present, tonsils mildly enlarged, no exudate. Temp 100.8.", confidence: 0.96 },
      { speaker: "DR", atMs: 48000, text: "Chest clear hai, breathing theek hai.", confidence: 0.97 },
      { speaker: "DR", atMs: 55000, text: "Pichhli baar azithromycin diya tha na, wo suit hua tha?", confidence: 0.95 },
      { speaker: "PT", atMs: 59000, text: "Haan, theek tha.", confidence: 0.97 },
      { speaker: "DR", atMs: 64000, text: "Abhi antibiotic ki zaroorat nahi lagti. Bukhar ke liye dawa dunga, teen din mein aaram nahi aaya toh wapas aana.", confidence: 0.95 },
    ],
    note: {
      presentingComplaint:
        "Fever for 2 days with sore throat and dry cough, worse at night.",
      history:
        "Fever ×2 days. Throat pain with mild odynophagia; reduced oral intake. Dry cough, nocturnal worsening. Tolerated azithromycin at a previous visit (12 Mar 2026). No breathlessness reported.",
      examination:
        "Pharyngeal erythema, tonsils mildly enlarged, no exudate. Temp 100.8°F. Chest clear.",
      assessment: "Acute pharyngitis, likely viral. For review if not settling.",
      plan:
        "Symptomatic treatment. Review in 3 days if fever persists or breathing worsens. Antibiotic deferred, presentation reads viral.",
    },
    confidenceFlags: {},
    tags: [
      { kind: "symptom", label: "fever", codeSystem: "ICD-10", code: "R50.9", confidence: 0.97 },
      { kind: "symptom", label: "sore throat", codeSystem: "ICD-10", code: "R07.0", confidence: 0.95 },
      { kind: "symptom", label: "dry cough", codeSystem: "ICD-10", code: "R05", confidence: 0.94 },
      { kind: "symptom", label: "odynophagia", codeSystem: "ICD-10", code: "R13.1", confidence: 0.88 },
      { kind: "finding", label: "pharyngeal erythema", codeSystem: "SNOMED", code: "247441003", confidence: 0.93 },
      { kind: "finding", label: "temp 100.8°F", confidence: 0.96 },
      { kind: "condition", label: "acute pharyngitis", codeSystem: "ICD-10", code: "J02.9", confidence: 0.9 },
      { kind: "symptom", label: "nocturnal worsening", confidence: 0.82 },
    ],
    provenance: {
      presentingComplaint: [1, 3],
      history: [1, 3, 5, 9],
      examination: [6, 7],
      assessment: [6, 10],
      plan: [10],
    },
  },

  {
    id: "sc-rakesh",
    patientKey: "p-rakesh",
    languageDetected: "Marathi + English",
    avgConfidence: 0.93,
    lines: [
      { speaker: "DR", atMs: 3000, text: "Bola Rakesh-ji, BP cha kay chalu aahe? Goli gheta ka rozz?", confidence: 0.95 },
      { speaker: "PT", atMs: 8000, text: "Ghetoy daily, pan kadhi kadhi morning la visarto. Doka jad vatate sometimes.", confidence: 0.91 },
      { speaker: "DR", atMs: 18000, text: "Ghari machine var reading ghetla hota ka?", confidence: 0.96 },
      { speaker: "PT", atMs: 22000, text: "Last week 150 by 95 hota, evening la.", confidence: 0.93 },
      { speaker: "DR", atMs: 30000, text: "Aaj clinic la BP 148/92 aahe. Pulse 78, regular. Chest clear, no oedema.", confidence: 0.96 },
      { speaker: "DR", atMs: 44000, text: "Salt kami kara, walking chalu theva. Telma same dose chalu rahu dya, pan roz, na chukta.", confidence: 0.94 },
      { speaker: "PT", atMs: 52000, text: "Ho doctor. Pudhchya veli sugar pan check karaycha ka?", confidence: 0.9 },
      { speaker: "DR", atMs: 56000, text: "Ho, pudhchya visit la fasting sugar ani lipid profile karun ya. Two weeks nantar bhetu.", confidence: 0.95 },
    ],
    note: {
      presentingComplaint:
        "Hypertension review. Occasional morning doses missed; intermittent heaviness of head.",
      history:
        "On telmisartan 40mg daily; reports occasionally missing morning doses. Home reading last week 150/95 (evening). No chest pain or breathlessness reported.",
      examination: "BP 148/92 in clinic. Pulse 78, regular. Chest clear. No pedal oedema.",
      assessment: "Hypertension, control suboptimal and adherence-related (draft for review).",
      plan:
        "Continue telmisartan 40mg daily with emphasis on adherence. Salt restriction and daily walking reinforced. Fasting sugar and lipid profile before next visit. Review in 2 weeks.",
    },
    confidenceFlags: {},
    tags: [
      { kind: "condition", label: "hypertension", codeSystem: "ICD-10", code: "I10", confidence: 0.96 },
      { kind: "finding", label: "BP 148/92", confidence: 0.95 },
      { kind: "symptom", label: "missed doses", confidence: 0.86 },
      { kind: "finding", label: "no oedema", codeSystem: "SNOMED", code: "20741006", confidence: 0.88 },
    ],
    provenance: {
      presentingComplaint: [1],
      history: [1, 3],
      examination: [4],
      assessment: [3, 4],
      plan: [5, 7],
    },
  },

  {
    id: "sc-arjun",
    patientKey: "p-arjun",
    languageDetected: "Hindi + English · 3 speakers",
    avgConfidence: 0.81,
    lines: [
      { speaker: "DR", atMs: 3000, text: "Kya hua Arjun ko? Kab se bukhar hai?", confidence: 0.95 },
      { speaker: "ATT", atMs: 6000, text: "Kal raat se tez bukhar hai doctor, 102 tak gaya. Khaana bhi nahi kha raha.", confidence: 0.92 },
      { speaker: "DR", atMs: 15000, text: "Ulti? Loose motion?", confidence: 0.96 },
      { speaker: "ATT", atMs: 18000, text: "Ek baar ulti hui subah. Motion theek hai.", confidence: 0.9 },
      { speaker: "PT", atMs: 24000, text: "(crying)", confidence: 0.4 },
      { speaker: "DR", atMs: 30000, text: "Throat red hai… ears dekh lete hain… tympanic membrane normal. Chest, thoda ro raha hai, sunna mushkil hai.", confidence: 0.62 },
      { speaker: "DR", atMs: 48000, text: "Temp abhi 101.4 hai. Weight 19 kilo.", confidence: 0.88 },
      { speaker: "DR", atMs: 58000, text: "Bukhar ki syrup dunga weight ke hisaab se. Paani, ORS dete rahiye. Agar bukhar 3 din se zyada rahe ya rash aaye, turant lana.", confidence: 0.93 },
    ],
    note: {
      presentingComplaint: "Fever since last night (up to 102°F reported), reduced intake; one episode of vomiting.",
      history:
        "High-grade fever since last night, reported up to 102°F at home. One episode of vomiting this morning. Stools normal. Oral intake reduced. History given by mother.",
      examination:
        "Throat congested. Tympanic membranes normal. Temp 101.4°F, weight 19 kg. Chest auscultation limited: child crying, audio unclear in this section.",
      assessment: "Febrile illness in a child, likely viral (examination partially limited).",
      plan:
        "Weight-appropriate antipyretic syrup. Maintain hydration with fluids and ORS. Return immediately if fever persists beyond 3 days, rash appears, or the child becomes drowsy.",
    },
    confidenceFlags: { examination: "low" },
    tags: [
      { kind: "symptom", label: "fever", codeSystem: "ICD-10", code: "R50.9", confidence: 0.95 },
      { kind: "symptom", label: "vomiting", codeSystem: "ICD-10", code: "R11.10", confidence: 0.9 },
      { kind: "symptom", label: "reduced intake", confidence: 0.84 },
      { kind: "finding", label: "throat congestion", confidence: 0.7 },
      { kind: "finding", label: "temp 101.4°F", confidence: 0.88 },
    ],
    provenance: {
      presentingComplaint: [1, 3],
      history: [1, 3],
      examination: [5, 6],
      assessment: [1, 5],
      plan: [7],
    },
  },

  {
    id: "sc-generic",
    patientKey: "generic",
    languageDetected: "Hindi + English",
    avgConfidence: 0.92,
    lines: [
      { speaker: "DR", atMs: 3000, text: "Haan, boliye, kya problem ho rahi hai?", confidence: 0.96 },
      { speaker: "PT", atMs: 6000, text: "Teen din se sardi hai, naak band rehti hai, and there is a headache also.", confidence: 0.93 },
      { speaker: "DR", atMs: 14000, text: "Bukhar aaya? Body pain?", confidence: 0.97 },
      { speaker: "PT", atMs: 17000, text: "Halka sa bukhar kal shaam ko tha. Body pain thoda hai.", confidence: 0.92 },
      { speaker: "DR", atMs: 26000, text: "Throat normal, nasal mucosa congested. Temp 99.2. Chest clear.", confidence: 0.95 },
      { speaker: "DR", atMs: 38000, text: "Viral lag raha hai. Aaram karo, paani zyada. Dawa likh raha hoon. Teen din mein theek nahi hua toh dobara aana.", confidence: 0.94 },
    ],
    note: {
      presentingComplaint: "Nasal congestion and headache for 3 days; low-grade fever yesterday evening.",
      history:
        "Coryza with blocked nose ×3 days, frontal headache, mild body ache. Low-grade fever yesterday evening. No cough or breathlessness reported.",
      examination: "Nasal mucosa congested. Throat normal. Temp 99.2°F. Chest clear.",
      assessment: "Viral upper respiratory infection (draft).",
      plan: "Rest and hydration. Symptomatic treatment. Review in 3 days if not settling.",
    },
    confidenceFlags: {},
    tags: [
      { kind: "symptom", label: "nasal congestion", codeSystem: "ICD-10", code: "R09.81", confidence: 0.93 },
      { kind: "symptom", label: "headache", codeSystem: "ICD-10", code: "R51", confidence: 0.94 },
      { kind: "symptom", label: "low-grade fever", confidence: 0.85 },
      { kind: "condition", label: "viral URI", codeSystem: "ICD-10", code: "J06.9", confidence: 0.88 },
    ],
    provenance: {
      presentingComplaint: [1, 3],
      history: [1, 3],
      examination: [4],
      assessment: [4, 5],
      plan: [5],
    },
  },
];

export function scenarioForPatient(patientId: string): Scenario {
  return (
    SCENARIOS.find((s) => s.patientKey === patientId) ??
    SCENARIOS.find((s) => s.patientKey === "generic")!
  );
}

# Sonara — Product Requirements Document

**Product:** Sonara — ambient clinical documentation and prescription assistant for outpatient practice
**Version:** 1.0 (V1 build spec)
**Status:** Draft for build
**Date:** 18 August 2026
**Owner:** Yash
**Build method:** Claude Code, single-developer + AI pairing
**Deployment target:** Self-managed VPS

---

## 0. How to read this document

This PRD is written to be **executable by Claude Code**. Sections 6–9 (functional requirements, data model, architecture) are the parts you will paste into Claude Code as context. Every functional requirement has an ID (`FR-XXX-n`) and acceptance criteria, so you can say "implement FR-REC-3 through FR-REC-7" and get a scoped, verifiable change.

Sections marked **⚠ DECISION NEEDED** are open — do not let Claude Code invent an answer to these. Resolve them yourself first.

---

## 1. Product summary

### 1.1 One-line

Sonara records the doctor–patient consultation, separates the speakers, and produces a structured case sheet and an unsigned draft prescription that the doctor reviews and signs — before the patient has left the room.

### 1.2 The problem

An outpatient doctor in India sees 30–60 patients a day. The clinical record of those visits is created in one of two bad ways:

1. **Typed during the consult** — the doctor loses eye contact, the consult slows, and the note is still thin.
2. **Written after hours** — an hour of unpaid admin every evening, reconstructed from memory and three words on a pad. The details that go missing are precisely the ones needed at follow-up.

The consultation already contains the note. Nobody is capturing it.

### 1.3 Why now

- Ambient scribing is a proven category — the technology risk is largely gone.
- Indian outpatient practice is almost entirely undigitised at the note level, even where billing and appointments are digital.
- The incumbents (Practo Ray, MocDoc, Healthray) are practice-management systems with no ambient layer. The global scribes (Abridge, Nabla, Suki) do not handle Hindi–English code-mixing, Indian brand-name drugs, or a room with a fan and four family members in it.

### 1.4 The wedge

**Code-mixed Indian consultations.** A patient says *"Do din se bukhar hai, and throat is paining."* That is one sentence in two languages. Handling it cleanly — and writing the note in English regardless — is the thing a global competitor cannot ship quickly and a local competitor cannot build quickly.

Do not lead with "AI for doctors." Lead with: *it understands how your patients actually talk.*

---

## 2. Goals, non-goals, success metrics

### 2.1 Product goals (V1)

| # | Goal | Why it matters |
|---|---|---|
| G1 | A six-minute consult produces a reviewable case sheet in under 15 seconds after the doctor ends recording | This is the entire value proposition. If it is slow, the doctor abandons it mid-clinic. |
| G2 | The doctor's median edit time on a draft note is under 30 seconds | If correcting the draft costs more than writing from scratch, we have built nothing. |
| G3 | Speaker attribution is correct on ≥95% of utterances | History belongs to the patient, findings belong to the doctor. Mixing them corrupts the note. |
| G4 | No prescription ever leaves the system unsigned by a verified practitioner | Legal necessity and the basis of clinical trust. |
| G5 | The system is usable on a 3-year-old Windows desktop over a flaky clinic connection | The real deployment environment, not a MacBook on fibre. |

### 2.2 Explicit non-goals for V1

Write these down and defend them. Scope creep kills this product before launch.

- ❌ **No patient-facing app.** Patients receive a prescription; they do not log in.
- ❌ **No billing, inventory, or pharmacy POS.** Different buyer, different product.
- ❌ **No teleconsultation / video.** Sonara is for the physical room in V1.
- ❌ **No diagnosis.** Sonara never asserts a diagnosis; it drafts an *assessment* the doctor edits.
- ❌ **No lab integration, no imaging, no ABDM/ABHA write-back.** V2 at the earliest.
- ❌ **No multi-specialty templates.** V1 ships one general-OPD template.
- ❌ **No mobile app.** Responsive web only. A PWA is acceptable; a React Native build is not.
- ❌ **No drug suggestions in V1.0.** See §3.2 — this is deliberately deferred.

### 2.3 Success metrics

**Activation:** ≥70% of onboarded doctors record ≥5 visits in their first clinic day.
**Core value:** ≥80% of recorded visits result in a signed note.
**Retention:** ≥60% of doctors active in week 1 are still recording in week 4.
**Quality (leading indicator):** median characters edited per draft note, trending down week over week.
**Trust (counter-metric):** rate at which doctors *delete* a draft rather than edit it. If this rises above 10%, the note quality is failing and you must stop shipping features.

### 2.4 Anti-metrics — things we do not optimise for

- Number of AI suggestions accepted. Optimising this creates pressure to make suggestions look agreeable rather than correct.
- Time-to-sign. A doctor who signs in 2 seconds is not reading. We want *fast to read*, not *fast to sign*.

---

## 3. Scope and release phasing

### 3.1 V1.0 — "The note writes itself" (build this first, ship nothing else)

Auth and clinic onboarding · today's appointment queue · consent capture · record/stop · streaming transcript with speaker labels · structured case sheet generation · symptom extraction into tags · doctor edit and sign · patient profile with visit timeline · prescription builder (manual entry, doctor-composed) · print and WhatsApp/email delivery · audit log.

**Note:** in V1.0 the prescription builder is **manual**. The doctor composes the Rx; Sonara only formats, checks against recorded allergies, and delivers it.

### 3.2 V1.5 — "Sonara suggests" (only after V1.0 has real usage)

AI drug suggestions grounded in a licensed drug database · history-aware prompts with reasoning traces · allergy and interaction checks · follow-up recommendations · specialty templates.

**Why deferred:** suggestions "based on the patient's history and previous summaries" require previous summaries to exist. You cannot build this before you have a corpus of real notes. Shipping it on day one means shipping suggestions grounded in nothing, which is both useless and dangerous.

### 3.3 V2 — platform

ABDM/ABHA integration · lab report ingestion · pharmacy-side module (this is where "medicines and pharmacy" from the original vision lives) · multi-doctor clinics with role separation · analytics for clinic owners · teleconsultation.

---

## 4. Users

### 4.1 Primary persona — Dr. A. Menon, the buyer and the user

- 41, MBBS + MD (General Medicine), runs a two-doctor polyclinic in Navi Mumbai.
- Sees 45 patients between 10am and 2pm, and again 6pm to 9pm.
- Uses a Windows desktop at the desk. Has a phone in the coat pocket.
- Currently: paper case sheets, a Practo Ray subscription used only for appointments, prescriptions written by hand on a pad.
- **Buys because** the evening admin hour disappears.
- **Churns because** the note was wrong once in a way that embarrassed him in front of a patient.
- **Technical comfort:** high for consumer apps, zero patience for configuration.

### 4.2 Secondary persona — Sunita, front desk

- Manages the appointment book and the queue, checks patients in, hands over prescriptions.
- Never sees a clinical note. **Hard requirement:** role separation from day one.

### 4.3 Non-user stakeholder — the patient

Never logs in. Interacts with Sonara exactly twice: when consent is asked, and when the prescription arrives. Both moments must be flawless — they are the entire patient-side brand.

---

## 5. End-to-end user flows

### 5.1 Flow A — Clinic onboarding (once)

1. Doctor signs up with email → OTP via Resend → sets password.
2. Enters clinic name, address, and their **NMC/State Medical Council registration number**.
3. Uploads registration certificate → queued for **manual verification by us** (V1: human review within 24h; do not automate this).
4. While pending: full access to record and draft, **signing is blocked**. This is the correct gate.
5. On approval: signing unlocked, signature block configured (name, qualifications, reg number, clinic address).
6. Optional: import today's appointment list via CSV, or add patients manually.

### 5.2 Flow B — The core loop (30–60× per day) — this is the product

```
Front desk marks patient arrived
  → doctor opens Today, taps the patient card
  → patient profile loads: age, last visit, allergies, running medication, chronic flags
  → doctor says "I'm going to record this to write your notes, theek hai?"
  → doctor ticks consent  [BLOCKING — record button is disabled until this is ticked]
  → taps Start recording
  → consultation happens normally; live transcript streams into the panel
  → doctor taps End visit
  → status: Audio saved → Transcript complete → 2 speakers found → Case sheet drafted
  → draft appears: complaint, examination, assessment, plan, symptom tags
  → doctor reads, edits inline, composes prescription
  → taps Review & sign → confirmation sheet shows exactly what will be sent → signs
  → prescription prints and/or goes to WhatsApp; note locks; audit entry written
  → patient card moves to Signed; next patient
```

**Critical timing constraint:** everything from "End visit" to "draft appears" must complete in under 15 seconds for a 10-minute consult, or the doctor will start the next patient before the note is ready and the workflow breaks.

### 5.3 Flow C — Recovery paths (build these; they are not edge cases)

| Situation | Behaviour |
|---|---|
| Doctor forgets to stop recording | Auto-stop at 45 minutes, with a warning banner at 20 minutes. Never silently discard. |
| Network drops mid-consult | Audio buffers locally (IndexedDB), recording continues, banner shows "Saving locally — will upload when connection returns." Never stop the recording because of network. |
| Browser tab closed mid-recording | On reopen, offer to recover the buffered audio and resume or finalise. |
| Transcript quality is poor | Show a confidence banner on the note: "Audio was unclear in parts — please check the examination section." Do not hide low confidence. |
| Doctor rejects the whole draft | One tap: "Discard draft, keep transcript." Then they can write freehand. Log this — it is the counter-metric in §2.4. |
| Wrong patient selected | "Move this visit to another patient" available until signing. After signing, the note is immutable; corrections are an appended addendum with its own timestamp. |
| Patient refuses consent | Record button stays disabled. Doctor writes the note manually. This must be a first-class path, not a dead end. |

---

## 6. Functional requirements

Format: `FR-<MODULE>-<n>` · **P0** = V1.0 blocking, **P1** = V1.0 desirable, **P2** = V1.5.

### 6.1 Authentication & accounts — `AUTH`

| ID | P | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-AUTH-1 | P0 | Email + password sign-up with OTP verification via Resend | OTP is 6 digits, valid 10 min, max 5 attempts, rate-limited to 3 sends per email per hour |
| FR-AUTH-2 | P0 | Session-based auth, HTTP-only secure cookies, 12-hour idle timeout | Session survives page reload; expires after 12h inactivity; explicit sign-out clears server-side session |
| FR-AUTH-3 | P0 | Roles: `owner`, `doctor`, `front_desk` | A `front_desk` user receives 403 on any clinical note, transcript, or audio endpoint — enforced at the query layer, not the UI |
| FR-AUTH-4 | P0 | NMC registration captured at onboarding, manually verified | `doctor.verification_status ∈ {pending, verified, rejected}`; signing endpoints reject unless `verified` |
| FR-AUTH-5 | P1 | Password reset via emailed single-use token (Resend), 30-min expiry | Token invalidated on use and on password change |
| FR-AUTH-6 | P0 | All clinical data queries scoped by `clinic_id` from the session, never from a request parameter | Automated test: a doctor from clinic A requesting a note ID from clinic B receives 404, not 403 (do not leak existence) |

### 6.2 Appointments & queue — `APPT`

| ID | P | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-APPT-1 | P0 | Today view listing the day's patients with token number, time, type, status | Sorted by scheduled time; status ∈ `scheduled, arrived, in_room, signed, no_show` |
| FR-APPT-2 | P0 | Front desk can add a walk-in patient in under 15 seconds | Name + age + sex + phone are the only required fields |
| FR-APPT-3 | P0 | Patient search by name or phone, with fuzzy matching | Typing "priya nai" returns "Priya Nair"; search returns in <300ms on 50k patients |
| FR-APPT-4 | P1 | CSV import of an existing appointment book | Column mapping UI; failed rows reported individually, not as a whole-file failure |
| FR-APPT-5 | P1 | Duplicate patient detection on create (same phone or name+DOB) | Warns and offers to open the existing record; never auto-merges |
| FR-APPT-6 | P2 | Queue display for the waiting area | — |

### 6.3 Consent — `CONS`

**This module is legally load-bearing. Do not let it be simplified.**

| ID | P | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-CONS-1 | P0 | Recording cannot start without an explicit per-visit consent action | Record button is `disabled` until the consent checkbox is ticked; server rejects a recording-session create call without a valid consent record |
| FR-CONS-2 | P0 | Consent record stores: visit ID, timestamp, language asked in, method (verbal/written), and the user who captured it | Immutable row; no update endpoint exists |
| FR-CONS-3 | P0 | Consent is per visit, never remembered or defaulted across visits | Loading a new visit always presents an unticked box |
| FR-CONS-4 | P0 | On-screen script the doctor can read, in EN/HI/MR | Displayed next to the checkbox, not behind a tooltip |
| FR-CONS-5 | P0 | Patient can withdraw consent mid-visit → recording stops, audio and transcript deleted within 24h | Deletion is verifiable in the audit log |
| FR-CONS-6 | P0 | A visit with no consent still supports a fully manual note | The manual path is not degraded or nagged |

### 6.4 Recording & audio — `REC`

| ID | P | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-REC-1 | P0 | Browser capture via `MediaRecorder`, mono, 16kHz target | Works in Chrome and Edge on Windows 10+; Safari 16+ on macOS/iOS |
| FR-REC-2 | P0 | Audio chunked into 5-second segments and uploaded progressively | A 30-min recording never holds >30s of unsent audio in memory |
| FR-REC-3 | P0 | Local buffering to IndexedDB; upload resumes automatically on reconnect | Simulated 60s network cut loses zero audio |
| FR-REC-4 | P0 | Live level meter (the waveform), reflecting real input | If the mic is muted or dead, the meter is visibly flat and a warning appears within 5 seconds |
| FR-REC-5 | P0 | Mic permission and device-selection handling with a plain-language failure state | "Your microphone isn't reachable. Check the Windows sound settings, then reload." — not a raw browser error |
| FR-REC-6 | P0 | Auto-stop at 45 min; warning banner at 20 min | Audio is retained, never discarded |
| FR-REC-7 | P0 | Recording continues if the tab loses focus | Verified with the tab backgrounded for 10 minutes |
| FR-REC-8 | P1 | Pause/resume within a visit | Segments concatenate with a gap marker in the transcript |
| FR-REC-9 | P0 | Audio stored encrypted at rest in object storage, never on the VPS filesystem | Objects are private; access only via short-lived signed URLs (≤5 min) |

### 6.5 Transcription & diarization — `TRX`

| ID | P | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-TRX-1 | P0 | Streaming partial transcript during the consult (interim results, low latency) | First words appear within 3s of speech |
| FR-TRX-2 | P0 | Final high-accuracy pass on the complete audio after the visit ends | The final transcript replaces the streamed one; both are retained |
| FR-TRX-3 | P0 | Speaker diarization, minimum 2 speakers | ≥95% utterance-level attribution accuracy on the internal test set |
| FR-TRX-4 | P0 | Speaker roles mapped to `DR` / `PT`, not "Speaker 1 / 2" | Heuristic: the speaker who talks first after recording starts, and asks more questions, is DR. Doctor can swap labels with one tap if wrong. |
| FR-TRX-5 | P0 | Code-mixed Hindi–English and Marathi–English transcription in a single utterance | Test set of 200 real code-mixed utterances; WER ≤20% |
| FR-TRX-6 | P0 | Word-level timestamps and per-word confidence retained | Required for FR-NOTE-6 (traceability) |
| FR-TRX-7 | P1 | Third-speaker handling (attendant/parent) labelled `ATT` | Common in paediatric and elderly visits — do not treat as an edge case |
| FR-TRX-8 | P1 | Doctor can correct a transcript line; corrections are stored per clinic | Corrections build a per-clinic custom vocabulary, never a shared model |
| FR-TRX-9 | P0 | Per-clinic custom vocabulary seeded with Indian drug brand names and local place names | Boosts recognition of the ~500 most-prescribed Indian brands |

### 6.6 Case sheet generation — `NOTE`

| ID | P | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-NOTE-1 | P0 | Generate a structured note from the final transcript + patient context | Sections: Presenting complaint, History, On examination, Assessment (draft), Plan |
| FR-NOTE-2 | P0 | Every section is inline-editable and autosaves | Autosave debounced at 800ms; a "Saved" indicator appears |
| FR-NOTE-3 | P0 | Symptom/finding extraction into structured tags | Tags carry a code where possible (ICD-10 or SNOMED); free-text tags allowed but flagged as uncoded |
| FR-NOTE-4 | P0 | The note is written in English regardless of the spoken language | Verified across the code-mixed test set |
| FR-NOTE-5 | P0 | The model must not introduce clinical content absent from the transcript | Hallucination eval: ≤1% of generated sentences contain an unsupported clinical assertion. **This is a release gate.** |
| FR-NOTE-6 | P0 | Every generated line is traceable to transcript timestamps | Hovering a note line highlights the source utterances |
| FR-NOTE-7 | P0 | Low-confidence sections are visibly marked | Banner: "Audio was unclear here — please check." |
| FR-NOTE-8 | P0 | Generation completes in ≤15s p95 for a 10-min consult | Measured from End visit to note render |
| FR-NOTE-9 | P0 | Notes are immutable after signing; corrections are appended addenda | Addendum carries its own timestamp, author, and reason |
| FR-NOTE-10 | P1 | Regenerate the draft from the transcript, discarding edits, with confirmation | — |
| FR-NOTE-11 | P2 | Per-doctor template learning from accepted edits | — |

### 6.7 Patient record — `PAT`

| ID | P | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-PAT-1 | P0 | Patient profile: demographics, allergies, chronic conditions, running medication, visit timeline | Loads in <500ms |
| FR-PAT-2 | P0 | Allergies are structured, never free text alone | Drug/substance + reaction + severity + date recorded |
| FR-PAT-3 | P0 | Visit timeline shows date, complaint summary, assessment, and prescribed drugs | Reverse chronological, paginated at 20 |
| FR-PAT-4 | P0 | Chronic condition and allergy flags surface on the visit header before recording starts | Cannot be collapsed or hidden |
| FR-PAT-5 | P1 | Filter a doctor's patient list by symptom tag | "Show me everyone with fever this week" |
| FR-PAT-6 | P0 | Patient data export (JSON + PDF) on request | DPDP data-portability obligation |
| FR-PAT-7 | P0 | Patient deletion with cascade, honouring retention rules for signed prescriptions | Signed prescriptions are retained per medical-records law; audio and transcript are deleted |

### 6.8 Prescription — `RX`

**V1.0 is a formatter and a safety net, not a recommender. Read §10 before implementing.**

| ID | P | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-RX-1 | P0 | Doctor composes the Rx: drug, strength, form, frequency, duration, instructions | Autocomplete from the drug database; free text permitted with a warning |
| FR-RX-2 | P0 | Drug entries resolve to a licensed drug database (salt, strength, form) | ⚠ **DECISION NEEDED** — licence a real Indian drug DB. Do not build this from an LLM. |
| FR-RX-3 | P0 | Allergy check against the patient's recorded allergies, blocking | A hard-stop modal on an allergy match; the doctor may override with a typed reason, which is logged |
| FR-RX-4 | P0 | Every prescription is `unsigned` until an explicit sign action by a `verified` doctor | No API path produces a signed Rx without this |
| FR-RX-5 | P0 | Sign action shows a confirmation sheet with the full final content | The doctor sees exactly what the patient will receive |
| FR-RX-6 | P0 | Signed Rx renders as a PDF with the doctor's name, qualifications, registration number, clinic address, date, and patient details | Matches the format Indian pharmacies accept |
| FR-RX-7 | P0 | Delivery: print, plus email via Resend and/or WhatsApp | Delivery attempt and outcome are logged per channel |
| FR-RX-8 | P0 | Signed prescriptions are immutable; a correction is a new prescription referencing the original | — |
| FR-RX-9 | P2 | AI drug suggestions grounded in the drug DB and the patient's record | Each suggestion carries a reasoning trace; never auto-added; see §10 |
| FR-RX-10 | P2 | Drug–drug interaction checking against running medication | Requires a licensed interaction dataset |

### 6.9 Audit & compliance — `AUD`

| ID | P | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-AUD-1 | P0 | Append-only audit log of every clinical action | Actor, action, entity, timestamp, IP, user agent. No update or delete endpoint exists. |
| FR-AUD-2 | P0 | Logged events: consent captured/withdrawn, recording started/stopped, note generated, note edited, note signed, Rx signed, override of an allergy block, data export, data deletion, role change | — |
| FR-AUD-3 | P0 | Audit log is viewable per patient and per visit by `owner` and the treating doctor | Read-only UI |
| FR-AUD-4 | P0 | Configurable audio retention per clinic (default 90 days), with automatic purge | Purge job runs daily; each purge writes an audit entry |
| FR-AUD-5 | P0 | Access to any patient record is logged, including reads | Detects a front-desk account probing clinical data |

---

## 7. Data model (Neon / PostgreSQL)

Every clinical table carries `clinic_id`. Enable **Row-Level Security** in Postgres and scope by `clinic_id` — do not rely on application-layer filtering alone, because one forgotten `WHERE` clause is a cross-clinic data breach.

```sql
-- ─── tenancy & people ───
clinics             (id, name, address, city, state, pincode, phone,
                     audio_retention_days DEFAULT 90, created_at)

users               (id, clinic_id FK, email UNIQUE, password_hash,
                     full_name, role ENUM('owner','doctor','front_desk'),
                     phone, last_login_at, created_at, deleted_at)

doctor_profiles     (user_id PK FK, registration_number, registration_council,
                     qualifications TEXT, verification_status ENUM('pending','verified','rejected'),
                     verified_at, verified_by, signature_block TEXT)

patients            (id, clinic_id FK, full_name, sex, date_of_birth, age_years,
                     phone, preferred_language, external_ref,
                     created_at, updated_at, deleted_at)
                     -- INDEX on (clinic_id, phone), trigram index on full_name

patient_flags       (id, patient_id FK, kind ENUM('allergy','chronic','running_medication'),
                     label, detail, severity, recorded_at, recorded_by, active BOOLEAN)
                     -- allergies live here, structured. Never free text alone.

-- ─── the visit ───
appointments        (id, clinic_id FK, patient_id FK, doctor_id FK,
                     scheduled_at, token_number, visit_type,
                     status ENUM('scheduled','arrived','in_room','signed','no_show'),
                     created_at)

visits              (id, clinic_id FK, appointment_id FK, patient_id FK, doctor_id FK,
                     started_at, ended_at, duration_seconds,
                     state ENUM('open','recording','processing','drafted','signed','discarded'),
                     created_at)

consents            (id, visit_id FK UNIQUE, captured_by FK, captured_at,
                     language, method ENUM('verbal','written'),
                     withdrawn_at NULL, withdrawal_reason)
                     -- APPEND ONLY. No UPDATE except withdrawn_at.

-- ─── audio & transcript ───
recordings          (id, visit_id FK, storage_key, duration_seconds, byte_size,
                     sample_rate, state ENUM('uploading','stored','transcribing','done','failed'),
                     purge_after DATE, purged_at NULL, created_at)

transcripts         (id, visit_id FK, recording_id FK, provider, provider_job_id,
                     pass ENUM('streaming','final'), language_detected,
                     full_text TEXT, avg_confidence NUMERIC, created_at)

transcript_segments (id, transcript_id FK, seq INT, speaker_tag ENUM('DR','PT','ATT','UNKNOWN'),
                     start_ms, end_ms, text TEXT, confidence NUMERIC,
                     corrected_text TEXT NULL, corrected_by NULL, corrected_at NULL)
                     -- INDEX on (transcript_id, seq)

-- ─── the note ───
notes               (id, visit_id FK UNIQUE, transcript_id FK,
                     model_used, prompt_version, generation_ms,
                     presenting_complaint TEXT, history TEXT, examination TEXT,
                     assessment TEXT, plan TEXT,
                     confidence_flags JSONB,   -- {"examination":"low"}
                     state ENUM('draft','signed'),
                     signed_by FK NULL, signed_at NULL, content_hash,
                     created_at, updated_at)

note_addenda        (id, note_id FK, author_id FK, body TEXT, reason TEXT, created_at)
                     -- the only way to change a signed note

note_tags           (id, note_id FK, kind ENUM('symptom','finding','condition'),
                     label, code_system NULL, code NULL, confidence NUMERIC)

note_provenance     (id, note_id FK, field_name, char_start, char_end,
                     segment_ids INT[])
                     -- powers FR-NOTE-6: which transcript lines produced this sentence

-- ─── prescription ───
prescriptions       (id, visit_id FK, patient_id FK, doctor_id FK,
                     state ENUM('draft','signed','superseded'),
                     supersedes_id FK NULL,
                     signed_at NULL, signature_snapshot JSONB, pdf_storage_key,
                     content_hash, created_at)

prescription_items  (id, prescription_id FK, seq,
                     drug_id FK NULL, free_text_name NULL,
                     strength, form, frequency, duration_days, instructions,
                     source ENUM('doctor','suggested_accepted','suggested_edited'))
                     -- `source` is how you measure whether suggestions are trusted (V1.5)

drugs               (id, brand_name, generic_name, salt_composition, strength, form,
                     manufacturer, schedule, is_active)
                     -- POPULATED FROM A LICENSED DATASET. Not generated.

rx_deliveries       (id, prescription_id FK, channel ENUM('print','email','whatsapp'),
                     destination, provider_message_id, state, error, attempted_at)

-- ─── safety & audit ───
safety_overrides    (id, visit_id FK, user_id FK, kind ENUM('allergy_block','interaction_block'),
                     detail JSONB, typed_reason TEXT, created_at)

audit_log           (id BIGSERIAL, clinic_id, actor_id, action, entity_type, entity_id,
                     metadata JSONB, ip INET, user_agent, created_at)
                     -- APPEND ONLY. Revoke UPDATE/DELETE at the DB role level.
```

### 7.1 Neon-specific notes

- Use **branching** for every Claude Code feature branch: a Neon branch per PR gives you a real database to test against without touching production data. This is the single biggest reason Neon is a good choice here.
- **Connection pooling is mandatory** — use the pooled connection string, and keep serverless/edge functions off the direct endpoint.
- **⚠ DECISION NEEDED — region.** Health data under India's DPDP Act should be as close to home as you can get it. Check Neon's current region list and pick the nearest available; if there is no India region, document that decision explicitly and be ready to migrate. Do not discover this during a hospital procurement review.
- Enable **point-in-time restore**. Clinical records are not something you restore from last night's dump.
- Migrations: **Drizzle Kit**, checked into the repo, never applied by hand.

---

## 8. Architecture

### 8.1 Stack

| Layer | Choice | Why |
|---|---|---|
| App | Next.js 15 (App Router) + TypeScript | One repo, server actions, good Claude Code ergonomics |
| UI | Tailwind + shadcn/ui, restyled to the Sonara tokens | Fast, and the tokens are already defined in the brand kit |
| DB | Neon Postgres + Drizzle ORM | Branching per PR; typed queries Claude Code handles well |
| Auth | Auth.js (credentials + email OTP) or Lucia | Self-hosted, no vendor lock |
| Jobs | BullMQ + Valkey/Redis on the VPS | Transcription and note generation must be queued, never in a request |
| Object storage | S3-compatible (Cloudflare R2 or Backblaze B2) | ⚠ **Never store audio on the VPS disk.** It will fill, and it is not backed up. |
| Email | **Resend** | Transactional: OTP, password reset, prescription delivery, verification notices |
| ASR | Deepgram / AssemblyAI / Sarvam AI | ⚠ **DECISION NEEDED** — see §8.3 |
| LLM | Claude (Anthropic API) | Note generation, tag extraction |
| Reverse proxy | Caddy | Automatic TLS, one-line config |
| Process mgmt | Docker Compose, or Dokploy/Coolify on the VPS | Reproducible; Claude Code can write the compose file |
| Errors | Sentry | You will not be watching logs during a clinic day |

### 8.2 Services on the VPS

```
                    ┌─────────────┐
   Browser ──TLS──▶ │    Caddy    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────────┐        ┌──────────────┐
                    │  Next.js app    │───────▶│ Neon Postgres│
                    │  (web + API)    │        └──────────────┘
                    └──────┬──────────┘
                           │ enqueue
                    ┌──────▼──────┐
                    │   Valkey    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────────┐  ┌─▶ ASR provider
                    │  Worker         │──┼─▶ Anthropic API
                    │  (BullMQ)       │  └─▶ Object storage
                    └─────────────────┘

   Audio: browser ──▶ signed URL ──▶ object storage (never through the VPS)
```

**VPS sizing for V1:** 4 vCPU / 8GB RAM / 80GB SSD is comfortable for the first ~50 clinics. The app is I/O-bound, not compute-bound — the heavy work happens at the ASR and LLM providers.

### 8.3 ⚠ DECISION NEEDED — the ASR provider

This is the most important technical decision in the product and it must be made with data, not a vendor page.

**Do this before writing the transcription module:** record 20 real consultations (with consent), build a gold-standard transcript by hand, and run the same audio through Deepgram, AssemblyAI, Speechmatics, and Sarvam AI. Compare on:

1. Word error rate on **code-mixed** utterances specifically, not overall
2. Diarization accuracy (utterance-level speaker attribution)
3. Recognition of Indian drug brand names
4. Streaming latency
5. Cost per hour at your projected volume
6. Data residency and whether they train on your audio (**they must not**)

**Note on Wispr Flow:** it is a dictation product — single speaker, push-to-talk, no diarization — and its API is exclusive-access, gated on organisation approval. It is the wrong tool for two-party ambient capture. Do not build V1 on it.

Design the transcription module behind an interface (`TranscriptionProvider`) so switching providers is a config change. You will switch at least once.

### 8.4 Job pipeline

```
visit.ended
  → job: finalise_audio      (concatenate chunks, verify duration, store)
  → job: transcribe_final    (ASR final pass with diarization)
  → job: map_speakers        (DR/PT heuristic + role assignment)
  → job: generate_note       (Claude, structured output)
  → job: extract_tags        (Claude, structured output)
  → notify client via SSE/WebSocket → UI renders the draft
```

Every job is **idempotent** and keyed on `visit_id` + job type. Retries: 3 with exponential backoff. A permanently failed job surfaces in the UI as a plain-language state with a Retry button — never a silent failure, because a doctor who thinks a note is coming and gets nothing has lost the patient's visit.

### 8.5 Environment variables

```
DATABASE_URL / DATABASE_URL_UNPOOLED     # Neon
REDIS_URL
ANTHROPIC_API_KEY
ASR_PROVIDER / ASR_API_KEY
STORAGE_ENDPOINT / STORAGE_BUCKET / STORAGE_KEY_ID / STORAGE_SECRET
RESEND_API_KEY / RESEND_FROM_ADDRESS
AUTH_SECRET / APP_URL
SENTRY_DSN
AUDIO_RETENTION_DEFAULT_DAYS=90
```

Secrets live in the VPS environment or a secrets manager, never in the repo. Add a pre-commit hook that blocks committed keys — Claude Code will occasionally paste one into an example file.

---

## 9. The AI layer

### 9.1 Note generation

**Model:** Claude, called from the worker with structured output (JSON schema), never free-form prose parsed with regex.

**Inputs:** the diarized transcript with speaker labels; patient context (age, sex, allergies, chronic flags, running medication, last 3 visit summaries); the clinic's note template.

**Rules the prompt must enforce, and the eval must verify:**

1. **Only what was said.** Never introduce a symptom, finding, measurement, or history item not present in the transcript. If the doctor did not state a temperature, there is no temperature in the note.
2. **Attribution is preserved.** Patient utterances become History. Doctor utterances become Examination and Plan. Never move content across this boundary.
3. **Assessment is a draft, phrased as one.** "Acute pharyngitis, likely viral" — not "The patient has acute pharyngitis."
4. **Uncertainty is surfaced, not smoothed.** If a section is thin because the audio was poor, say so in `confidence_flags` rather than writing plausible filler. **A confident wrong note is far more dangerous than an incomplete one.**
5. **Output English** regardless of the spoken language.
6. **Never a drug, dose, or prescription** in the generated note. That is the doctor's, in a separate module.

`prompt_version` is stored on every note. When you change the prompt, you need to know which notes came from which version.

### 9.2 Evaluation — build this before you build the feature

A held-out set of 100 real consultations with hand-written gold notes. Run on every prompt or model change:

| Metric | Gate |
|---|---|
| Hallucination rate (unsupported clinical assertions per generated sentence) | ≤1% — **release blocking** |
| Speaker attribution accuracy | ≥95% |
| Clinically significant omissions per note | ≤0.1 |
| Symptom tag precision / recall | ≥0.9 / ≥0.85 |
| p95 generation latency | ≤15s |

You cannot ship a clinical documentation product on vibes. If you build one thing before the feature, build the eval harness.

### 9.3 V1.5 — suggestions, and the rules they live under

When you get to drug suggestions:

- Suggestions are **selected from the licensed drug database**, never generated as free text by a language model. An LLM inventing a dose is the failure mode that ends the company.
- Every suggestion carries a **reasoning trace** pointing at its source — a transcript line, a prior visit, a recorded allergy. If the doctor cannot see why, they cannot evaluate it, and an unevaluatable suggestion is worse than none.
- Suggestions are **never auto-added** to the prescription. They are proposals with Add and Dismiss.
- Dismissals are logged and reviewed. A suggestion type dismissed >70% of the time gets removed, not tuned.
- The system may suggest **withholding** as well as prescribing ("presentation reads viral, antibiotic not added"). This is often the most clinically valuable thing it can say.

---

## 10. Clinical safety, legal and regulatory

**This section is not boilerplate. Read it before writing the prescription module.** It is also, commercially, the thing that makes doctors trust you over a faster competitor.

### 10.1 The prescribing line

Under Indian medical practice rules and the Telemedicine Practice Guidelines, **only a registered medical practitioner may prescribe.** Software cannot. This produces three hard product constraints:

1. Every prescription originates as `draft`/unsigned and requires an explicit sign action by a doctor whose registration is `verified`.
2. The doctor must see the complete final content at the moment of signing — not a summary, not a count of items.
3. The signature event is recorded immutably: who, when, what content hash, from what IP.

Build these as database and API invariants, not UI conventions. A UI convention gets refactored away in month four.

### 10.2 What Sonara must never do

- Never assert a diagnosis as fact. It drafts an assessment; a doctor confirms it.
- Never present a suggestion without its source.
- Never send anything to a patient before a doctor signs.
- Never record without per-visit consent.
- Never train any model on patient data. Put this in the contract, and confirm your ASR and LLM providers honour it via their zero-retention / no-training options.
- Never let marketing say "AI-generated prescriptions." That single phrase creates a regulatory problem out of nothing.

### 10.3 DPDP Act 2023 obligations

| Obligation | Implementation |
|---|---|
| Purpose-limited consent | Per-visit consent record (FR-CONS-*), stating the purpose |
| Right to erasure | FR-PAT-7, cascading deletion honouring medical-record retention |
| Right to access / portability | FR-PAT-6, JSON + PDF export |
| Breach notification | Documented incident runbook; Sentry alerting; owner contact on file |
| Data minimisation | Audio purged on the retention schedule; the transcript and note are the durable record |
| Processor agreements | Signed DPAs with Neon, the ASR provider, Anthropic, Resend, and the storage provider |

**⚠ DECISION NEEDED:** appoint a named person responsible for data protection before you onboard the first paying clinic.

### 10.4 Medical record retention

Signed notes and prescriptions are medical records and must be retained per applicable Indian medical-records requirements (commonly cited as 3 years for outpatient records; confirm with a lawyer for your states of operation). Audio is *not* the medical record — the signed note is. This is why audio is purgeable at 90 days and the note is not.

### 10.5 Get a doctor on the team

Not an advisor for the pitch deck — a practising physician who reviews the note template, the eval gold standard, and every safety rule in this section. Building clinical software without one is the most expensive mistake available to you.

---

## 11. Non-functional requirements

### 11.1 Performance

| Surface | Target |
|---|---|
| Today view first paint | <1.5s on a 4-year-old desktop, 10Mbps |
| Patient profile load | <500ms p95 |
| Live transcript first word | <3s from speech |
| End visit → draft rendered | <15s p95 (10-min consult) |
| Note autosave round trip | <400ms p95 |
| Patient search | <300ms at 50k patients |

### 11.2 Reliability

- Target 99.5% uptime during Indian clinic hours (09:00–22:00 IST). Schedule all maintenance outside that window.
- **Recording must survive a backend outage.** If the API is down, the browser keeps recording to IndexedDB and uploads later. Losing a consult is unforgivable in a way that a slow note is not.
- Nightly Neon backup plus PITR. Test a restore before launch, not after an incident.

### 11.3 Poor-connectivity behaviour

Assume the clinic's internet drops several times a day.

- Local audio buffering with automatic resume (FR-REC-3).
- Optimistic UI on note edits with a queued-sync indicator.
- Never block the doctor's next action on a network round trip.
- A visible, honest connection state — "Saving locally" is reassuring; a spinner is not.

### 11.4 Security

- TLS 1.3 everywhere; HSTS.
- Encryption at rest for audio (storage-side) and Postgres (Neon-side).
- Signed URLs for audio, ≤5-minute expiry, never a public bucket.
- Rate limiting on auth, OTP, and export endpoints.
- Row-Level Security in Postgres scoped by `clinic_id`.
- Audit log written by a DB role that has INSERT but not UPDATE or DELETE.
- Dependency scanning in CI; secret scanning pre-commit.
- Annual penetration test once you have paying clinics.

### 11.5 Accessibility & environment

- Keyboard-operable throughout — the doctor's hands are on a keyboard, not a trackpad.
- Visible focus states (already in the design tokens).
- Minimum 16px body text; the primary user is over 40 and reading across a desk.
- Chrome and Edge on Windows 10/11 are the primary targets. Safari on macOS/iPadOS secondary. Do not spend V1 time on Firefox.

---

## 12. Analytics & instrumentation

Instrument these from day one — you cannot reconstruct them later.

**Funnel:** signed up → verified → first recording → first signed note → 5 notes in a day → active in week 4.

**Per-visit telemetry (no clinical content, ever):** recording duration, upload retries, ASR latency, note generation latency, characters edited per section, time from draft to sign, whether the draft was discarded, transcript confidence.

**The three numbers that tell you if the product works:**

1. **Characters edited per draft note** — trending down means the note is getting good.
2. **Draft discard rate** — rising means it is getting worse. Stop feature work.
3. **Notes signed per doctor per clinic day** — the real usage number. Everything else is vanity.

Analytics events must never carry patient identifiers, transcript text, or note content. Enforce this with a typed event schema that makes it impossible rather than a code-review convention.

---

## 13. Build plan for Claude Code

Sequenced so that something is demoable at the end of every phase. Give Claude Code one phase at a time with the relevant FR IDs pasted in as context.

| Phase | Scope | Demoable outcome |
|---|---|---|
| **0** — Foundations | Repo, Next.js + TS, Tailwind + design tokens from the brand kit, Drizzle + Neon, Docker Compose, Caddy, CI, Sentry | Empty app deploys to the VPS over HTTPS |
| **1** — Auth & tenancy | FR-AUTH-1…6, Resend OTP, RLS, roles, clinic onboarding | Two clinics exist and cannot see each other. Write the cross-tenant test here. |
| **2** — Patients & queue | FR-APPT-1…5, FR-PAT-1…4 | Front desk runs a real appointment book |
| **3** — Consent & recording | FR-CONS-1…6, FR-REC-1…9, object storage, IndexedDB buffering | Record a 10-minute consult, kill the wifi mid-way, lose nothing |
| **4** — Transcription | FR-TRX-1…9, provider interface, BullMQ pipeline | Live diarized transcript on screen |
| **5** — The note | FR-NOTE-1…9, Claude integration, eval harness, provenance | **The product exists.** Everything before this is scaffolding. |
| **6** — Prescription | FR-RX-1…8, drug DB, allergy blocking, PDF, delivery | End-to-end: patient in, signed prescription out |
| **7** — Audit & compliance | FR-AUD-1…5, retention purge, export, deletion | Ready for a procurement conversation |
| **8** — Harden | Load test, restore drill, pen-test fixes, error states, empty states | Ready for a pilot clinic |

**Rule for phases 3–6:** do not begin the next phase until the previous one has been used on real audio from a real consultation. Synthetic test data will hide every problem that matters.

### 13.1 Working effectively with Claude Code on this

- Keep a `CLAUDE.md` at the repo root with the stack, the design tokens, the safety invariants from §10.2, and the convention that every clinical query is `clinic_id`-scoped. It gets read on every session.
- Use a Neon branch per feature branch. Claude Code can run migrations against a throwaway database without any risk to real data.
- Ask for the test before the implementation on anything in §10. "Write a failing test that proves an unverified doctor cannot sign a prescription" then "make it pass."
- The safety invariants are the one place to be strict in review. Everything else can be refactored later; a prescription signed by an unverified account cannot be un-signed.

---

## 14. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Code-mixed transcription is worse than expected | Fatal — this is the wedge | Bake-off in §8.3 **before** committing to the architecture. If no provider clears the bar, the product thesis changes. |
| The note is good but not good enough to trust | Doctors churn silently in week 2 | The eval harness and the discard-rate counter-metric. Watch discards weekly. |
| A hallucinated clinical detail reaches a signed note | Existential — clinical and reputational | FR-NOTE-5 as a release gate; provenance on every line; the doctor sees the full content at signing |
| Doctors will not ask for consent | Feature is bypassed or the product is abandoned | Make the script one line, on screen, in the patient's language. Test this with real doctors in week 1 of the pilot. |
| Unit economics break — ASR + LLM cost per visit exceeds price | Slow death | Model it now: (ASR ₹/hr × avg duration) + (LLM ₹/note) × 45 visits/day × 26 days. Know your per-doctor gross margin before pricing. |
| A single VPS is a single point of failure | Outage during clinic hours | Local recording buffer means an outage delays notes but does not lose consults. Plan a second region before 100 clinics. |
| Scope creep back toward "medicines, pharmacy and doctors" | Never ships | §2.2 is the defence. Reread it monthly. |

---

## 15. Open decisions

Resolve these yourself. Do not let Claude Code choose.

1. **ASR provider** — run the bake-off in §8.3.
2. **Drug database licence** — which vendor, what it costs, what it covers. Blocks FR-RX-2.
3. **Neon region** and the data-residency position you will defend in a procurement review.
4. **Pricing model** — per doctor per month, or per note? Per-note aligns cost with value but punishes exactly the high-volume doctors you most want.
5. **Clinical advisor** — who, and by when.
6. **WhatsApp delivery** — Business API provider and template approval, which takes weeks. Start it early.
7. **Pilot clinics** — three named clinics who have agreed to be first. Get these before phase 5, not after phase 8.

---

## 16. Glossary

**Ambient scribing** — capturing a consultation as it naturally happens, without dictation. **Diarization** — determining who spoke each utterance. **Code-mixing** — switching languages within a single sentence. **OPD** — outpatient department. **Case sheet** — the clinical record of a visit. **NMC** — National Medical Commission, India's medical registration body. **ABDM / ABHA** — India's national digital health infrastructure and its patient health ID. **DPDP Act** — Digital Personal Data Protection Act, 2023. **WER** — word error rate. **RLS** — row-level security.

---

*End of document. Sections marked ⚠ DECISION NEEDED are blocking. Section 10 is not optional.*

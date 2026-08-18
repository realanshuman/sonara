<div align="center">

# Sonara

**The consultation already contains the note.**

Ambient clinical documentation and prescription assistant for Indian
outpatient practice. A working V1.0 build of the [product spec](./sonara-prd.md).

</div>

---

Sonara records the doctor–patient consultation, separates the speakers, and
produces a structured case sheet and an unsigned draft prescription that the
doctor reviews and signs, before the patient has left the room.

The wedge is **code-mixed Indian consultations**. A patient says *"Do din se
bukhar hai, and throat is paining."* That is one sentence in two languages.
Handling it cleanly, and writing the note in English regardless, is the
thing a global competitor cannot ship quickly and a local competitor cannot
build quickly.

## What's in here

| Route | What it is |
|---|---|
| `/` | Landing page, built from scratch for this repo |
| `/design` | Living design system, rendered from the real components |
| `/sign-in`, `/onboarding` | Auth surfaces, including the registration-verification gate |
| `/today` | The clinic day: queue, walk-ins, fuzzy search, role-aware actions |
| `/consult/[visitId]` | **The core loop**: consent → record → transcript → case sheet → prescription → sign → deliver |
| `/patients`, `/patients/[id]` | Records, flags, visit timeline, export, erasure |
| `/prescriptions` | Signed and unsigned, with delivery state |
| `/audit` | Append-only log of every clinical action, including reads |
| `/settings` | Clinic, team, retention, vocabulary, processors |
| `/rx/[visitId]/print` | The prescription as a pharmacy receives it |

## The core loop

```
Front desk marks the patient arrived
  → doctor opens Today, taps the card
  → patient profile loads: age, last visit, allergies, running medication
  → doctor reads the consent line in the patient's language, ticks consent
      [BLOCKING: the record button is disabled, and the store refuses]
  → taps Start recording; live transcript streams in with DR / PT labels
  → taps End visit
  → Audio saved → Transcript complete → 2 speakers found → Case sheet drafted
  → draft appears: complaint, history, examination, assessment, plan, tags
  → doctor reads, edits inline (autosaved), composes the prescription
  → Review & sign shows exactly what will be sent → signs
  → note locks, prescription prints or goes to WhatsApp, audit entry written
```

Every line of the draft traces back to the seconds of transcript that
produced it. Hover a section and the source utterances light up.

## Try it

```bash
npm install
npm run dev
```

Open <http://localhost:3000> for the landing page, or jump straight to
`/today`. The demo seeds a clinic mid-morning with the list half signed.

Three things worth walking:

1. **The core loop.** Open Priya Nair's room. The record button is disabled
   until consent is captured. Use *run a simulated consult* if you'd rather
   not talk to your microphone. The pipeline is identical.
2. **The allergy hard stop.** Open Rakesh Bhosale (penicillin allergy on
   file) and try to add Augmentin. It blocks, and only a typed clinical
   reason gets past it, which is logged with your name.
3. **Role separation.** Switch to Sunita (front desk) from the avatar menu.
   Clinical notes, transcripts and prescriptions disappear; every record
   access is still written to the audit log.

Settings has a *"Act as an unverified doctor"* toggle. Recording and
drafting keep working; every signing path refuses.

## Safety, as built

The things that make this a clinical product rather than a note-taking app
are invariants in the data layer, not UI conventions:

- **Consent is per visit**, never remembered, never defaulted. The store
  refuses to open a recording session without a valid consent record, and
  a withdrawal schedules deletion and writes it to the log.
- **Only a verified practitioner can sign.** There is no code path that
  produces a signed prescription otherwise.
- **Signed records are immutable.** Corrections are appended addenda, or a
  new prescription that references the original.
- **Sonara never asserts a diagnosis** and never puts a drug in the
  generated note. It drafts an assessment; the doctor decides.
- **Uncertainty is surfaced, not smoothed.** Sections built from unclear
  audio say so rather than writing plausible filler.
- **The audit log is append-only** and records reads as well as writes.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · React 19.

The demo runs on a typed client store whose shapes mirror the PRD's
Postgres schema, so moving to Neon + Drizzle with row-level security is a
data-layer swap rather than a rewrite. See [CLAUDE.md](./CLAUDE.md) for
what is simulated and what to replace first. The short answer is the ASR
provider, the note generation, and a licensed Indian drug database.

## Design

Tokens live in one file (`src/app/globals.css`) and `/design` renders the
styleguide from the real components, so it can only go stale if the product
does.

Petrol carries the brand. **Signal red means "recording" and nothing else**:
the moment it also means "error" it stops telling a doctor whether the room
is live. Three faces do three jobs: Bricolage Grotesque for display, Inter
Tight for the interface, IBM Plex Mono for anything scanned rather than read.
Sentence case throughout, 16px floor on body text, tabular figures
everywhere a number can change.

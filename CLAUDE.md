# Sonara: working notes for Claude Code

Ambient clinical documentation and prescription assistant for Indian
outpatient practice. Read `sonara-prd.md` for the full product spec; this
file is the short version that matters on every session.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · React 19.
No database yet. The demo runs on a typed client store
(`src/lib/store.tsx`) whose shapes mirror the PRD §7 Postgres schema, so
swapping in Neon + Drizzle is a data-layer change, not a rewrite.

## Safety invariants: the one place to be strict

These are from PRD §10.2 and are non-negotiable. Enforce them at the data
layer, never as a UI convention (a UI convention gets refactored away in
month four).

1. **No recording without per-visit consent.** `START_RECORDING` refuses
   if there is no un-withdrawn consent row for the visit. Consent is never
   remembered or defaulted across visits.
2. **No signature from an unverified practitioner.** `SIGN_VISIT` refuses
   unless the actor is clinical *and* `verificationStatus === "verified"`.
   Settings has a demo toggle that simulates the unverified case.
3. **Signed notes and prescriptions are immutable.** Corrections are
   appended addenda or a new prescription referencing the original.
4. **Never assert a diagnosis.** The assessment is a draft, phrased as
   one. The generated note never contains a drug, dose or prescription.
   That is the doctor's, in a separate module.
5. **Never introduce clinical content absent from the transcript.**
6. **Surface uncertainty, don't smooth it.** A confident wrong note is far
   more dangerous than an incomplete one.
7. **Audit everything, including reads.** `audit_log` is append-only, and
   there is no update or delete path anywhere.
8. **Every clinical query is `clinic_id`-scoped**, from the session and
   never from a request parameter. Cross-clinic access returns 404, not
   403, so existence is never leaked.

## Design system

Tokens live in `src/app/globals.css` (`@theme inline`). There is no second
source of truth. `/design` renders the live styleguide from the real
components.

- **Petrol** carries the brand. **Signal red means "recording" and nothing
  else**: not errors, not unsigned, not delete. Amber is the caution tone.
- Three faces: Bricolage Grotesque (display), Inter Tight (UI), IBM Plex
  Mono (anything scanned rather than read: timecodes, doses, IDs).
- The `next/font` variables live on `<html>`, not `<body>`. The tokens are
  declared at `:root` and reference them, and a custom property is
  substituted on the element it is declared on: defined only on `<body>`,
  `--font-display` resolves to the guaranteed-invalid value at `:root` and
  every utility built on it silently falls back to system sans.
- Bricolage carries an optical-size axis, so it is requested with
  `axes: ["opsz"]` and left on `font-optical-sizing: auto`, as the kit does.
- Lockups scale from ratios taken off the kit (`src/components/brand/logo.tsx`):
  horizontal, stacked, and the expressive one where the mark replaces the
  "o". The expressive lockup is campaign-only and is the single place
  signal red appears outside a recording state.
- Sentence case everywhere. Body text never below 16px. Tabular figures
  globally. Visible focus ring in sea, 2.5px at 2px offset.
- Voice: say the thing, then stop. Use draft / review / sign. Never
  diagnose / recommend / prescribe, never "seamless" or "powered by AI".

## Layout

```
src/app/
  page.tsx                   landing
  design/                    living styleguide
  (product)/
    sign-in/  onboarding/    auth surfaces
    rx/[visitId]/print/      printable prescription (FR-RX-6)
    patients/[id]/summary/   printable record export (FR-PAT-6)
    (app)/                   the dashboard, inside AppShell
      today/ patients/ consult/[visitId]/ prescriptions/ audit/ settings/
src/components/
  brand/  ui/  app/  consult/  landing/
src/lib/
  store.tsx    reducer + audit logging + simulated job pipeline
  types.ts     mirrors the PRD §7 schema
  seed.ts      a clinic mid-morning, half the list already signed
  scripts.ts   scripted code-mixed consults driving the pipeline
  drugs.ts     demo drug reference + allergy matching (FR-RX-2 stub)
```

## What is simulated, and what to replace first

- **ASR**: `src/lib/scripts.ts` streams scripted code-mixed transcripts.
  Real work goes behind a `TranscriptionProvider` interface (PRD §8.3);
  run the bake-off before committing to a vendor.
- **Note generation**: the same file holds the deterministic note per
  scenario. Replace with Claude structured output in a BullMQ worker, and
  build the eval harness (PRD §9.2) *before* the feature.
- **Drug database**: `src/lib/drugs.ts` is ~40 hand-picked brands.
  FR-RX-2 requires a licensed Indian drug DB. Do not generate this.
- **Persistence**: localStorage, reseeded each clinic day. Replace with
  Neon + Drizzle + row-level security.
- The microphone is real: `src/lib/audio.ts` opens a live stream for the
  level meter, and falls back to a plain-language failure state.

## Commands

```
npm run dev      # localhost:3000
npm run build    # production build, keep this clean
npx tsc --noEmit # typecheck
```

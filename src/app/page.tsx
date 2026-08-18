import Link from "next/link";
import type { Metadata } from "next";
import { ExpressiveLockup, Lockup, Mark } from "@/components/brand/logo";
import { LandingNav } from "@/components/landing/nav";
import { ConsultDemo } from "@/components/landing/consult-demo";
import { RevealOnScroll } from "@/components/landing/reveal";
import { FAQ } from "@/components/landing/faq";
import {
  CodeMixDiagram,
  DiarizationGraphic,
  HeroTrace,
  OfflineGraphic,
  ProvenanceGraphic,
  SigningGate,
  StatBlock,
  SwimlaneGraphic,
} from "@/components/landing/graphics";
import {
  IconArrowRight,
  IconCheck,
  IconClose,
  IconLanguage,
  IconLock,
  IconMic,
  IconWave,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Sonara — the consultation already contains the note",
  description:
    "Sonara listens to the visit, tells the two voices apart, and writes the case sheet. You read it, fix what's wrong, and sign — before the patient stands up. Built for code-mixed Indian OPD practice.",
};

export default function LandingPage() {
  return (
    <div className="bg-paper overflow-x-clip">
      <RevealOnScroll />
      <LandingNav />

      {/* ═══════════ HERO — dark instrument panel ═══════════ */}
      <section className="relative bg-ink text-ink-text pt-[128px] pb-[184px] overflow-hidden">
        <div className="absolute inset-0 grid-ink opacity-70" aria-hidden />
        {/* the trace runs along the floor of the hero, under everything */}
        <div
          className="absolute inset-x-0 bottom-0 h-[132px] opacity-70 pointer-events-none"
          aria-hidden
        >
          <HeroTrace className="w-full h-full" />
        </div>

        <div className="relative max-w-[1180px] mx-auto px-6 grid lg:grid-cols-[1.25fr_1fr] gap-x-16 gap-y-10 items-end">
          <div>
            <span className="t-eyebrow text-ink-faint">
              Ambient case notes · Indian OPD practice
            </span>
            <h1 className="font-display font-extrabold text-chalk tracking-[-0.036em] leading-[1.02] text-[clamp(38px,5.1vw,60px)] mt-4 mb-6 max-w-[17ch]">
              The consultation already contains the note.
            </h1>
            <p className="text-[18px] sm:text-[19px] text-ink-muted leading-relaxed max-w-[50ch] m-0">
              Nobody is writing it down. Sonara listens to the visit, tells your
              voice from the patient's, and hands you a finished case sheet and
              a draft prescription — while they're still putting their shoes
              on.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-8">
              <a
                href="#pilot"
                className="inline-flex items-center gap-2 bg-chalk text-ink font-semibold text-[15px] px-5 py-3 rounded-field hover:bg-mist transition-colors"
              >
                Try it on one clinic day <IconArrowRight size={15} />
              </a>
              <Link
                href="/today"
                className="inline-flex items-center gap-2 border border-ink-3 text-chalk font-semibold text-[15px] px-5 py-3 rounded-field hover:border-sea transition-colors"
              >
                <IconWave size={15} /> Open the live demo
              </Link>
            </div>
            <p className="t-mono-sm text-ink-faint mt-4 mb-0">
              No card. Nothing recorded without the patient's consent.
            </p>
          </div>

          {/* readout column — the claim, stated as instrument values */}
          <dl className="m-0 lg:pb-2">
            {[
              ["Consult", "6 min 12 s", "recorded in the room, as it happened"],
              ["Draft on screen", "+8 s", "complaint, history, examination, plan"],
              ["Your edit", "22 s", "one line changed, then signed"],
              ["Evening admin", "none", "the note was finished before the door"],
            ].map(([k, v, note], i) => (
              <div
                key={k}
                className="flex items-baseline gap-4 py-3 border-t border-ink-3 last:border-b"
                data-reveal
                data-reveal-delay={i * 80}
              >
                <dt className="t-mono-sm text-ink-faint w-[112px] shrink-0">
                  {k}
                </dt>
                <dd className="m-0 min-w-0">
                  <span className="font-display font-semibold text-[19px] tracking-[-0.02em] text-chalk tabular-nums">
                    {v}
                  </span>
                  <span className="block t-mono-sm text-ink-faint mt-0.5">
                    {note}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ═══════════ THE DEMO — overlapping the hero ═══════════ */}
      <section className="relative -mt-24 z-10">
        <div className="max-w-[1000px] mx-auto px-6">
          <div data-reveal>
            <ConsultDemo />
          </div>
          <p className="t-mono-sm text-muted text-center mt-4">
            A real six-minute consult, at speed. Hindi and English in the same
            sentence, because that's how it was said.
          </p>
        </div>
      </section>

      {/* ═══════════ PROOF STRIP ═══════════ */}
      <section className="mt-24">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="bg-ink rounded-[20px] px-8 sm:px-12 py-10" data-reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatBlock value="8" unit="sec" label="Median time from ending the visit to a draft on screen" />
              <StatBlock value="<30" unit="sec" label="Median time a doctor spends correcting that draft" />
              <StatBlock value="0" label="Prescriptions that leave the system unsigned. By construction, not by policy" />
              <StatBlock value="1" unit="hr" label="Evening admin, returned. Every clinic day" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ THE PROBLEM — as a ledger ═══════════ */}
      <section className="py-28">
        <div className="max-w-[1180px] mx-auto px-6 grid lg:grid-cols-[1fr_1.05fr] gap-14 items-start">
          <div data-reveal>
            <span className="t-eyebrow">The arithmetic</span>
            <h2 className="t-display mt-3 mb-4">
              The work doesn't end when the patient leaves.
            </h2>
            <p className="text-[17px] text-muted leading-relaxed max-w-[46ch]">
              It ends at nine in the evening, reconstructing forty visits from
              three words on a pad. Every clinic solves this the same two ways,
              and both of them cost something you can count.
            </p>
            <div className="mt-7 border-l-2 border-mist pl-5 max-w-[44ch]">
              <p className="font-display font-semibold text-[19px] leading-snug tracking-[-0.015em] m-0">
                “The details that go missing are precisely the ones you needed
                at follow-up.”
              </p>
            </div>
          </div>

          <div
            className="bg-chalk border border-line rounded-card overflow-hidden"
            data-reveal
            data-reveal-delay="120"
          >
            <div className="px-6 py-3.5 border-b border-line bg-soft flex items-center gap-3">
              <span className="t-label">One clinic day · 45 patients</span>
              <span className="ml-auto t-mono-sm text-muted">what it costs</span>
            </div>
            {[
              {
                k: "Typing during the consult",
                v: "≈ 2 min / patient",
                note: "and the patient gets the top of your head",
              },
              {
                k: "Writing up afterwards",
                v: "60–75 min",
                note: "unpaid, from memory that's three patients old",
              },
              {
                k: "Detail lost by evening",
                v: "the useful kind",
                note: "duration, what you examined, what you ruled out",
              },
              {
                k: "Notes thin enough to be useless at follow-up",
                v: "most of them",
                note: "three words on a pad is not a case sheet",
              },
            ].map((r) => (
              <div
                key={r.k}
                className="flex items-baseline gap-4 px-6 py-3.5 border-b border-line last:border-0"
              >
                <span className="text-[14.5px] flex-1 min-w-0">
                  {r.k}
                  <span className="block t-mono-sm text-muted mt-0.5">
                    {r.note}
                  </span>
                </span>
                <span className="font-mono text-[13.5px] text-petrol shrink-0 tabular-nums">
                  {r.v}
                </span>
              </div>
            ))}
            <div className="px-6 py-4 bg-tint-petrol flex items-baseline gap-4">
              <span className="text-[14.5px] font-semibold flex-1">
                With Sonara
              </span>
              <span className="font-mono text-[13.5px] text-petrol">
                ≈ 25 sec / patient, in the room
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW A VISIT RUNS — swimlane ═══════════ */}
      <section id="how" className="py-24 bg-chalk border-y border-line">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="max-w-[58ch] mb-12" data-reveal>
            <span className="t-eyebrow">How a visit runs</span>
            <h2 className="t-display mt-3 mb-4">
              One tap at the start. One signature at the end.
            </h2>
            <p className="text-[17px] text-muted leading-relaxed">
              Nothing here changes how you already run your OPD. The lower lane
              is everything Sonara does; the upper lane is everything that stays
              yours — including every decision.
            </p>
          </div>

          <div className="grid lg:grid-cols-[150px_1fr] gap-6 items-start" data-reveal>
            <div className="hidden lg:block">
              <div className="h-[52px] flex flex-col justify-center">
                <div className="t-label">Lane 1</div>
                <div className="t-h3 text-[17px]">You</div>
              </div>
              <div className="h-[21px]" />
              <div className="h-[52px] flex flex-col justify-center">
                <div className="t-label">Lane 2</div>
                <div className="t-h3 text-[17px] text-sea">Sonara</div>
              </div>
            </div>
            <SwimlaneGraphic />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
            {[
              {
                t: "00:00",
                h: "They sit down, you tap record",
                b: "Their name, age, allergies and last visit are already on screen from the queue. One tap logs consent and arms the mic.",
              },
              {
                t: "00:04",
                h: "You talk. It separates the voices.",
                b: "History stays in the patient's words, findings stay in yours. Switch language mid-sentence — it follows without being told.",
              },
              {
                t: "06:12",
                h: "You end it. The note is already forming.",
                b: "Complaint, history, examination, assessment, plan — into the structure your practice already uses, with symptoms pulled out as tags.",
              },
              {
                t: "06:20",
                h: "You read, fix, and sign",
                b: "Every line points at the seconds of audio it came from. Change what's wrong, sign, and it prints or goes to WhatsApp.",
              },
            ].map((s, i) => (
              <div key={s.t} data-reveal data-reveal-delay={i * 90}>
                <div className="font-mono text-[13px] text-sea mb-2.5 tabular-nums">
                  {s.t}
                </div>
                <h3 className="t-h3 text-[17px] mb-1.5">{s.h}</h3>
                <p className="text-[14.5px] text-muted leading-relaxed m-0">
                  {s.b}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ BENTO — what it actually does ═══════════ */}
      <section className="py-28">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="max-w-[54ch] mb-11" data-reveal>
            <span className="t-eyebrow">Built for the room it sits in</span>
            <h2 className="t-display mt-3 mb-0">
              Six things that are hard, done properly.
            </h2>
          </div>

          <div className="grid md:grid-cols-6 gap-4 auto-rows-[auto]">
            <BentoCard span="md:col-span-4" reveal={0}>
              <BentoHead
                eyebrow="The wedge"
                title="Two languages, one sentence"
                body="“Do din se bukhar hai, and throat is paining.” That is one sentence, not two, and it's how consultations here actually sound. Sonara transcribes it whole and writes the note in English regardless."
              />
              <div className="mt-6">
                <CodeMixDiagram />
              </div>
            </BentoCard>

            <BentoCard span="md:col-span-2" reveal={90}>
              <BentoHead
                eyebrow="Diarization"
                title="Who said what"
                body="History belongs to the patient. Findings belong to you. Mixing the two corrupts the record, so speaker attribution is measured, not assumed — and one tap fixes it if the labels land the wrong way round."
              />
              <div className="mt-6">
                <DiarizationGraphic />
              </div>
            </BentoCard>

            <BentoCard span="md:col-span-2" reveal={0}>
              <BentoHead
                eyebrow="Traceability"
                title="Every line has a source"
                body="Hover any sentence in the note and the seconds of conversation that produced it light up. If you can't see where a line came from, you can't check it — so we always show you."
              />
              <div className="mt-6">
                <ProvenanceGraphic />
              </div>
            </BentoCard>

            <BentoCard span="md:col-span-2" reveal={90}>
              <BentoHead
                eyebrow="Poor connectivity"
                title="The clinic wifi will drop"
                body="When it does, recording carries on. Audio buffers in the browser and uploads itself when the link returns. A visit is never lost because a router blinked."
              />
              <div className="mt-6">
                <OfflineGraphic />
              </div>
            </BentoCard>

            <BentoCard span="md:col-span-2" reveal={180}>
              <BentoHead
                eyebrow="Indian drug names"
                title="Brands as they're actually said"
                body="Dolo, Telma, Azithral, Thyronorm — resolved to salt, strength and form, and matched against the allergies on file before anything is printed."
              />
              <div className="mt-6 flex flex-wrap gap-1.5">
                {[
                  "Dolo 650",
                  "Telma 40",
                  "Azithral 500",
                  "Pan 40",
                  "Glycomet SR",
                  "Thyronorm 50",
                  "Montair LC",
                  "Shelcal 500",
                ].map((d) => (
                  <span
                    key={d}
                    className="font-mono text-[11.5px] bg-tint-mist text-petrol px-2 py-1 rounded-chip"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </BentoCard>

            <BentoCard span="md:col-span-3" reveal={0}>
              <BentoHead
                eyebrow="Uncertainty"
                title="It tells you when it couldn't hear"
                body="A confident wrong note is far more dangerous than an incomplete one. When the room got loud or a child was crying through the chest exam, the section says so instead of writing something plausible."
              />
              <div className="mt-6 border border-tint-amber-line bg-tint-amber rounded-field px-4 py-3">
                <div className="t-label text-amber-text mb-1">On examination</div>
                <p className="text-[14px] m-0 leading-snug">
                  Throat congested. Tympanic membranes normal. Chest
                  auscultation limited —{" "}
                  <span className="bg-chalk px-1 rounded-[4px]">
                    child crying, audio unclear here
                  </span>
                  . Please check this section.
                </p>
              </div>
            </BentoCard>

            <BentoCard span="md:col-span-3" reveal={90}>
              <BentoHead
                eyebrow="The record"
                title="Consent, logged, per visit"
                body="Never remembered from last time, never defaulted on. The script is on screen in the language you'll ask in, and the record button simply doesn't work until the patient has said yes."
              />
              <div className="mt-6 space-y-2">
                {[
                  { l: "Asked in Marathi · verbal · 11:21", ok: true },
                  { l: "Applies to this visit only", ok: true },
                  { l: "Withdrawable mid-visit — audio deleted in 24h", ok: true },
                  { l: "Remembered for next time", ok: false },
                ].map((r) => (
                  <div key={r.l} className="flex items-center gap-2.5 text-[13.5px]">
                    <span
                      className={
                        r.ok
                          ? "text-sea shrink-0"
                          : "text-muted shrink-0"
                      }
                    >
                      {r.ok ? <IconCheck size={14} /> : <IconClose size={14} />}
                    </span>
                    <span className={r.ok ? "" : "text-muted line-through"}>
                      {r.l}
                    </span>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ═══════════ LANGUAGES ═══════════ */}
      <section id="languages" className="py-24 bg-ink text-ink-text">
        <div className="max-w-[1180px] mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <div data-reveal>
            <span className="t-eyebrow text-ink-faint">
              <IconLanguage size={13} className="inline mr-1.5 -mt-0.5" />
              Where imported tools fall over
            </span>
            <h2 className="t-display text-chalk mt-3 mb-5">
              Most scribes break the moment a patient answers in Hindi.
            </h2>
            <p className="text-[17px] text-ink-muted leading-relaxed max-w-[48ch]">
              Consultations here aren't in one language. They're in one and a
              half, and the switch happens mid-sentence — which is exactly where
              a tool tuned on a quiet American exam room gives up. A global
              competitor can't ship this quickly, and a local one can't build it
              quickly.
            </p>
            <div className="mt-8 space-y-0">
              {[
                ["Hindi–English", "code-mixed, single utterance"],
                ["Marathi–English", "code-mixed, single utterance"],
                ["The note", "always written in English"],
                ["The room", "a fan, corridor traffic, four family members"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline gap-4 py-2.5 border-t border-ink-3"
                >
                  <span className="text-[14.5px] font-semibold text-chalk w-[150px] shrink-0">
                    {k}
                  </span>
                  <span className="t-mono-sm text-ink-faint">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="bg-ink-2 border border-ink-3 rounded-card p-7"
            data-reveal
            data-reveal-delay="120"
          >
            <div className="t-label text-ink-faint mb-4">
              What the room sounds like
            </div>
            {[
              { s: "DR", t: "Cough? Sardi?" },
              { s: "PT", t: "Dry cough hai. Raat ko zyada hota hai." },
              { s: "DR", t: "Khaana theek se le rahi ho? Nigalne mein dard?" },
              { s: "PT", t: "Swallowing mein thoda dard hai." },
            ].map((l, i) => (
              <div key={i} className="flex gap-3 py-2.5 border-b border-ink-3 last:border-0">
                <span
                  className={
                    l.s === "DR"
                      ? "font-mono text-[10px] font-medium tracking-[0.06em] px-[6px] py-[2px] rounded-[5px] h-fit shrink-0 mt-0.5 bg-petrol text-chalk"
                      : "font-mono text-[10px] font-medium tracking-[0.06em] px-[6px] py-[2px] rounded-[5px] h-fit shrink-0 mt-0.5 bg-ink-3 text-ink-muted"
                  }
                >
                  {l.s}
                </span>
                <span className="text-[14.5px] text-ink-text leading-snug">
                  {l.t}
                </span>
              </div>
            ))}
            <div className="mt-5 pt-5 border-t border-ink-3">
              <div className="t-label text-ink-faint mb-2">
                What goes in the record
              </div>
              <p className="text-[15px] text-chalk leading-relaxed m-0">
                Dry cough with nocturnal worsening. Mild odynophagia; oral
                intake reduced.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ THE LINE — safety ═══════════ */}
      <section id="line" className="py-28">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="max-w-[52ch] mb-12" data-reveal>
            <span className="t-eyebrow">Where the line is</span>
            <h2 className="t-display mt-3 mb-4">
              Sonara drafts. <em className="not-italic text-sea">You are the only one who prescribes.</em>
            </h2>
            <p className="text-[17px] text-muted leading-relaxed">
              This isn't a disclaimer at the bottom of a page — it's how the
              database is built. A prescription starts unsigned and cannot
              become signed except through a doctor whose registration we have
              checked by hand.
            </p>
          </div>

          <div
            className="bg-chalk border border-line rounded-card px-6 sm:px-10 py-9 mb-5"
            data-reveal
          >
            <SigningGate />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: <IconMic size={17} />,
                h: "Consent before the mic opens",
                b: "Timestamped against the visit, in the language the patient was asked in, by the person who asked. It can be withdrawn mid-visit, and then the audio goes.",
              },
              {
                icon: <IconLock size={17} />,
                h: "The recording stays yours",
                b: "Encrypted, reachable only through links that expire in minutes, purged on the schedule you set. Your patients' data never trains a model — ours or anyone's.",
              },
              {
                icon: <IconCheck size={17} />,
                h: "Everything is on the record",
                b: "Who consented, who recorded, who edited, who signed, what the content hashed to, and who so much as opened the file. Append-only — there is no delete.",
              },
            ].map((c, i) => (
              <div
                key={c.h}
                className="bg-chalk border border-line rounded-card p-6"
                data-reveal
                data-reveal-delay={i * 90}
              >
                <span className="inline-grid place-items-center size-9 rounded-[10px] bg-tint-petrol text-petrol mb-4">
                  {c.icon}
                </span>
                <h3 className="t-h3 text-[17px] mb-2">{c.h}</h3>
                <p className="text-[14.5px] text-muted leading-relaxed m-0">
                  {c.b}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SCOPE — the honest list ═══════════ */}
      <section id="scope" className="py-24 bg-chalk border-y border-line">
        <div className="max-w-[1180px] mx-auto px-6 grid lg:grid-cols-[1fr_1.15fr] gap-14 items-start">
          <div data-reveal>
            <span className="t-eyebrow">Scope</span>
            <h2 className="t-display mt-3 mb-4">
              What Sonara deliberately doesn't do.
            </h2>
            <p className="text-[17px] text-muted leading-relaxed max-w-[42ch]">
              Every one of these could be added, and each would make the product
              worse at the one thing you're buying it for. If you need a
              practice-management suite, buy a practice-management suite.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1" data-reveal data-reveal-delay="120">
            {[
              ["No diagnosis", "It drafts an assessment. You confirm it."],
              ["No drug suggestions yet", "Not until there's a corpus of real notes to ground them in."],
              ["No patient login", "Patients get a prescription, not an account."],
              ["No billing or inventory", "Different buyer, different product."],
              ["No teleconsultation", "V1 is for the physical room."],
              ["No mobile app", "Responsive web. Your desktop is the machine that matters."],
            ].map(([h, b]) => (
              <div
                key={h}
                className="flex items-start gap-3 py-3 border-b border-dashed border-line"
              >
                <IconClose size={14} className="text-muted mt-1 shrink-0" />
                <span>
                  <span className="block text-[14.5px] font-semibold">{h}</span>
                  <span className="block text-[13.5px] text-muted leading-snug mt-0.5">
                    {b}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-28">
        <div className="max-w-[1180px] mx-auto px-6 grid lg:grid-cols-[300px_1fr] gap-12 items-start">
          <div data-reveal>
            <span className="t-eyebrow">Questions doctors ask</span>
            <h2 className="t-display mt-3 mb-0 text-[32px]">
              The ones that matter.
            </h2>
          </div>
          <div data-reveal data-reveal-delay="100">
            <FAQ />
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section id="pilot" className="pb-28">
        <div className="max-w-[1180px] mx-auto px-6">
          <div
            className="relative bg-petrol text-chalk rounded-[22px] px-8 sm:px-14 py-16 overflow-hidden text-center"
            data-reveal
          >
            <div
              className="absolute -right-20 -top-20 opacity-[0.09] text-chalk pointer-events-none"
              aria-hidden
            >
              <Mark size={340} />
            </div>
            <div className="relative">
              <ExpressiveLockup size={44} markClass="text-mist" textClass="text-chalk" />
              <h2 className="t-display text-chalk mt-7 mb-4 max-w-[18ch] mx-auto">
                Try it on one clinic day.
              </h2>
              <p className="text-[17px] text-mist leading-relaxed max-w-[48ch] mx-auto mb-8">
                Bring your next twenty patients. If the evening admin hour
                doesn't disappear, you've lost an afternoon of setup and nothing
                else.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href="mailto:hello@sonara.health?subject=Clinic%20day%20pilot"
                  className="inline-flex items-center gap-2 bg-chalk text-petrol font-semibold text-[15px] px-5 py-3 rounded-field hover:bg-mist transition-colors"
                >
                  Book a clinic day <IconArrowRight size={15} />
                </a>
                <Link
                  href="/today"
                  className="inline-flex items-center gap-2 border border-mist/40 text-chalk font-semibold text-[15px] px-5 py-3 rounded-field hover:border-mist transition-colors"
                >
                  Walk the product yourself
                </Link>
              </div>
              <p className="t-mono-sm text-mist/70 mt-6 mb-0">
                Three pilot clinics, then we stop taking them for a while.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-line py-12">
        <div className="max-w-[1180px] mx-auto px-6 flex flex-wrap gap-x-12 gap-y-8 items-start">
          <div className="min-w-[220px]">
            <Lockup markSize={22} textSize={17} />
            <p className="t-mono-sm text-muted mt-3 mb-0 max-w-[30ch] leading-relaxed">
              Ambient case notes and prescriptions for outpatient practice.
              Made in Navi Mumbai.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              ["Open the demo", "/today"],
              ["Design system", "/design"],
              ["Sign in", "/sign-in"],
              ["Register a clinic", "/onboarding"],
            ]}
          />
          <FooterCol
            title="How it works"
            links={[
              ["A visit, end to end", "#how"],
              ["Code-mixed speech", "#languages"],
              ["Who signs", "#line"],
              ["What it doesn't do", "#scope"],
            ]}
          />
          <div className="min-w-[200px]">
            <div className="t-label mb-3">The line we don't cross</div>
            <p className="text-[13.5px] text-muted leading-relaxed m-0">
              Sonara never asserts a diagnosis, never sends anything to a
              patient before a doctor signs, and never trains on your patients'
              data.
            </p>
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto px-6 mt-10 pt-6 border-t border-line flex flex-wrap gap-4 justify-between t-mono-sm text-muted">
          <span>© 2026 Sonara</span>
          <span>Privacy · Security · Consent policy · DPDP</span>
        </div>
      </footer>
    </div>
  );
}

/* ── local building blocks ── */

function BentoCard({
  span,
  reveal,
  children,
}: {
  span: string;
  reveal: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${span} bg-chalk border border-line rounded-card p-6 sm:p-7 flex flex-col`}
      data-reveal
      data-reveal-delay={reveal}
    >
      {children}
    </div>
  );
}

function BentoHead({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <span className="t-label">{eyebrow}</span>
      <h3 className="t-h3 mt-2 mb-2">{title}</h3>
      <p className="text-[14.5px] text-muted leading-relaxed m-0 max-w-[60ch]">
        {body}
      </p>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div className="min-w-[160px]">
      <div className="t-label mb-3">{title}</div>
      <ul className="space-y-2 m-0 p-0 list-none">
        {links.map(([label, href]) => (
          <li key={label}>
            {href.startsWith("#") ? (
              <a href={href} className="text-[14px] text-muted hover:text-ink">
                {label}
              </a>
            ) : (
              <Link href={href} className="text-[14px] text-muted hover:text-ink">
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

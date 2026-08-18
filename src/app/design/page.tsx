"use client";

import { useState } from "react";
import Link from "next/link";
import { ExpressiveLockup, Lockup, Mark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { FlagChip, Pill, SpeakerTag, Tag, type PillTone } from "@/components/ui/badge";
import { Panel, PanelHeader, PanelBody, Card } from "@/components/ui/panel";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Avatar, Banner, Divider, EmptyState, Kbd, KV, Tick } from "@/components/ui/misc";
import { Waveform } from "@/components/ui/waveform";
import {
  IconCheck,
  IconClose,
  IconMic,
  IconNote,
  IconPatients,
  IconPen,
  IconPrint,
  IconRx,
  IconSearch,
  IconSign,
  IconToday,
  IconWarn,
  IconWave,
  IconWifiOff,
} from "@/components/ui/icons";
import { cx } from "@/lib/cx";

/**
 * The living design system. Everything here is the real component from
 * src/components. Nothing is redrawn for the styleguide, so this page
 * goes stale only if the product does.
 */

const PALETTE = [
  { name: "Ink", hex: "#0B2422", use: "Text, dark surfaces, the rail", cls: "bg-ink" },
  { name: "Petrol", hex: "#12514B", use: "Primary. Buttons, the mark, signatures", cls: "bg-petrol" },
  { name: "Sea", hex: "#2F8C7F", use: "Accents, active states, focus ring", cls: "bg-sea" },
  { name: "Mist", hex: "#C9DBD5", use: "Fills, chips, the waveform", cls: "bg-mist" },
  { name: "Paper", hex: "#F1F4F1", use: "App background", cls: "bg-paper" },
  { name: "Chalk", hex: "#FFFFFF", use: "Cards, panels, sheets", cls: "bg-chalk ring-1 ring-line ring-inset" },
  { name: "Line", hex: "#D5DEDA", use: "Borders, dividers, rules", cls: "bg-line" },
  { name: "Signal", hex: "#D8452F", use: "Recording. Nothing else, ever", cls: "bg-signal" },
  { name: "Amber", hex: "#B7801E", use: "Caution: unsigned, pending, low confidence", cls: "bg-amber" },
];

const TONES: { tone: PillTone; label: string; when: string }[] = [
  { tone: "live", label: "Recording", when: "audio is being captured right now" },
  { tone: "wait", label: "Waiting", when: "queued, nothing happening yet" },
  { tone: "sea", label: "In room", when: "active, in progress" },
  { tone: "ok", label: "Signed", when: "done, locked, delivered" },
  { tone: "warn", label: "Unsigned", when: "needs a person before it can move" },
  { tone: "neutral", label: "No show", when: "inert, informational" },
];

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [checked, setChecked] = useState(true);

  return (
    <div className="bg-paper min-h-dvh">
      {/* header */}
      <header className="bg-ink text-ink-text">
        <div className="max-w-[1080px] mx-auto px-7 py-4 flex items-center gap-4">
          <Link href="/">
            <Lockup markSize={24} textSize={19} markClass="text-mist" textClass="text-chalk" />
          </Link>
          <span className="t-mono-sm text-ink-faint ml-auto">
            design system · v1 · Aug 2026
          </span>
        </div>
        <div className="max-w-[1080px] mx-auto px-7 pt-10 pb-14">
          <span className="t-eyebrow text-ink-faint">The system</span>
          <h1 className="font-display font-extrabold text-chalk tracking-[-0.035em] leading-[1.03] text-[clamp(34px,5vw,52px)] mt-3 mb-5 max-w-[18ch]">
            Clinical instrumentation, not a wellness app.
          </h1>
          <p className="text-[17px] text-ink-muted leading-relaxed max-w-[62ch] m-0">
            Everything below is the component the product actually renders. The
            rules are few and they are load-bearing: petrol carries the brand,
            signal red means one thing, numbers never jiggle, and nothing is
            written in Title Case because this product sits next to a patient.
          </p>
        </div>
      </header>

      <div className="max-w-[1080px] mx-auto px-7 py-14 space-y-16">
        {/* ── mark ── */}
        <Section
          eyebrow="Identity"
          title="The mark"
          lede="An aperture with a trace running through it. The line enters flat, breaks into speech, and exits the circle to the right, the consultation leaving the room as a record. The ring is knocked out where the trace crosses it, so the mark holds at 16px."
        >
          <div className="grid sm:grid-cols-4 gap-4">
            <Tile caption="Primary · petrol on paper">
              <Mark size={82} className="text-petrol" />
            </Tile>
            <Tile caption="Reversed · mist on ink" dark>
              <Mark size={82} className="text-mist" />
            </Tile>
            <Tile caption="Solid · white on petrol" petrol>
              <Mark size={82} className="text-chalk" />
            </Tile>
            <Tile caption="Legibility · 16 / 24 / 40px">
              <div className="flex items-center gap-5">
                <Mark size={16} className="text-ink" />
                <Mark size={24} className="text-ink" />
                <Mark size={40} className="text-ink" />
              </div>
            </Tile>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Tile caption="Horizontal lockup · app headers, signatures">
              <Lockup markSize={40} textSize={38} />
            </Tile>
            <Tile caption="Expressive lockup · campaign only, never in product" dark>
              <ExpressiveLockup size={38} markClass="text-sea" textClass="text-chalk" />
            </Tile>
          </div>

          <Card className="mt-4">
            <Rule ok>
              Clear space equal to the diameter of the mark's inner circle, on all
              four sides.
            </Rule>
            <Rule ok>
              Minimums: mark alone <Kbd>16px</Kbd> · horizontal lockup{" "}
              <Kbd>96px</Kbd> wide · stacked lockup <Kbd>72px</Kbd> wide.
            </Rule>
            <Rule>
              Never recolour the trace separately from the ring, add a gradient,
              or place the mark on a photograph without a solid plate behind it.
            </Rule>
            <Rule>
              Never lock a tagline to it. Taglines change; marks shouldn't.
            </Rule>
          </Card>
        </Section>

        {/* ── palette ── */}
        <Section
          eyebrow="Colour"
          title="Palette"
          lede="Petrol carries the brand: the colour of scrubs and drapes, clinical without reading as a hospital corridor. Signal red has exactly one job."
        >
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PALETTE.map((c) => (
              <div
                key={c.name}
                className="border border-line rounded-card overflow-hidden bg-chalk"
              >
                <div className={cx("h-20", c.cls)} />
                <div className="px-3.5 py-2.5">
                  <div className="text-[14px] font-semibold">{c.name}</div>
                  <div className="t-mono-sm text-muted">{c.hex}</div>
                  <div className="t-mono-sm text-muted mt-1 leading-snug">
                    {c.use}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Banner tone="live" icon={<IconMic size={16} />} className="mt-4">
            <b className="font-semibold">The signal rule.</b> Red appears only
            while audio is being captured: the pulsing dot, the record button,
            the word “Recording”. Not for errors, not for unsigned, not for
            delete buttons. If it means three things it means nothing, and a
            doctor can no longer tell at a glance whether the room is being
            recorded.
          </Banner>
        </Section>

        {/* ── type ── */}
        <Section
          eyebrow="Typography"
          title="Three faces, three jobs"
          lede="Bricolage Grotesque is the only place the brand raises its voice. Inter Tight runs the interface. IBM Plex Mono handles anything a doctor scans rather than reads: timecodes, speaker labels, doses, IDs."
        >
          <Card className="space-y-0">
            <TypeRow label="Display / 800">
              <span className="font-display font-extrabold text-[38px] tracking-[-0.035em] leading-[1.05]">
                Six minutes in the room. Eight seconds of typing.
              </span>
            </TypeRow>
            <TypeRow label="Display / 600">
              <span className="t-h2">Section headings and empty states</span>
            </TypeRow>
            <TypeRow label="Body / 400">
              <span className="text-[16px]">
                Sonara records the consultation, separates the doctor from the
                patient, and writes up the visit in the structure you already
                use. You read it, change what's wrong, and sign.
              </span>
            </TypeRow>
            <TypeRow label="Body / 600">
              <span className="text-[16px] font-semibold">
                Buttons, labels, and anything the doctor must not miss
              </span>
            </TypeRow>
            <TypeRow label="Mono / 400">
              <span className="font-mono text-[14px]">
                04:12 · DR &nbsp;|&nbsp; PT-40219 &nbsp;|&nbsp; Amoxicillin
                500mg · 1-0-1 · 5d
              </span>
            </TypeRow>
            <TypeRow label="Mono / caps" last>
              <span className="t-eyebrow">
                Eyebrows, table headers, status labels
              </span>
            </TypeRow>
          </Card>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <Card>
              <h3 className="t-h3 text-[16px] mb-2">A gapped scale</h3>
              <p className="text-[14.5px] text-muted m-0 leading-relaxed">
                Display 60 / 38 / 26 · Body 19 / 16 / 14.5 · Mono 14 / 12 / 11.
                Nothing between 19 and 26, and that gap is what makes hierarchy
                obvious at a glance in a busy OPD.
              </p>
            </Card>
            <Card>
              <h3 className="t-h3 text-[16px] mb-2">Tabular figures</h3>
              <p className="text-[14.5px] text-muted m-0 leading-relaxed">
                <code className="font-mono text-[13px] bg-tint-mist px-1.5 py-0.5 rounded-[4px]">
                  font-variant-numeric: tabular-nums
                </code>{" "}
                is set globally. A running timer must not make the layout twitch.
              </p>
            </Card>
            <Card>
              <h3 className="t-h3 text-[16px] mb-2">Sentence case</h3>
              <p className="text-[14.5px] text-muted m-0 leading-relaxed">
                Every label, button and heading. Title Case reads as marketing;
                this product sits next to a patient. Body text never below 16px
                The primary user is over 40, reading across a desk.
              </p>
            </Card>
          </div>
        </Section>

        {/* ── status vocabulary ── */}
        <Section
          eyebrow="Status"
          title="The state vocabulary"
          lede="A visit moves through a fixed set of states, and each has one colour everywhere it appears: the queue, the visit header, the prescription list, the audit log."
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TONES.map((t) => (
              <div
                key={t.label}
                className="border border-line rounded-card bg-chalk px-4 py-3.5"
              >
                <Pill tone={t.tone}>{t.label}</Pill>
                <p className="text-[13.5px] text-muted mt-2 mb-0 leading-snug">
                  {t.when}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <span className="t-label w-full">Clinical flags · never collapsible</span>
            <FlagChip kind="allergy">
              <IconWarn size={11} /> Allergy · Penicillin (severe)
            </FlagChip>
            <FlagChip kind="chronic">Hypertension</FlagChip>
            <FlagChip kind="medication">Telma 40 · 1-0-0</FlagChip>
            <FlagChip kind="ok">No known allergies</FlagChip>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <span className="t-label w-full">
              Extracted tags · coded in mist, uncoded flagged amber
            </span>
            <Tag label="fever" code="R50.9" />
            <Tag label="sore throat" code="R07.0" />
            <Tag label="pharyngeal erythema" code="247441003" />
            <Tag label="nocturnal worsening" />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <span className="t-label w-full">Speaker labels</span>
            <SpeakerTag speaker="DR" />
            <SpeakerTag speaker="PT" />
            <SpeakerTag speaker="ATT" />
            <SpeakerTag speaker="UNKNOWN" />
            <span className="t-mono-sm text-muted">
              never “Speaker 1 / Speaker 2”
            </span>
          </div>
        </Section>

        {/* ── controls ── */}
        <Section
          eyebrow="Components"
          title="Controls"
          lede="Keyboard-operable throughout, with a visible focus ring in sea. The doctor's hands are on a keyboard, not a trackpad."
        >
          <Card>
            <div className="t-label mb-3">Buttons</div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="primary">
                <IconSign size={15} /> Review &amp; sign
              </Button>
              <Button>Add medicine</Button>
              <Button variant="quiet">Dismiss</Button>
              <Button variant="rec">
                <span className="size-2 rounded-full bg-chalk/90" /> Start
                recording
              </Button>
              <Button disabled>Disabled until consent</Button>
              <Button size="sm">Small</Button>
            </div>

            <Divider className="my-6" />

            <div className="t-label mb-3">Fields</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Patient name" hint="Fuzzy-matched. Typos are fine.">
                <Input defaultValue="Priya Nair" />
              </Field>
              <Field label="Frequency">
                <Select defaultValue="1-0-1">
                  <option value="1-0-1">1-0-1 · morning &amp; night</option>
                  <option value="SOS">SOS · when needed</option>
                </Select>
              </Field>
              <Field label="Instructions" className="sm:col-span-2">
                <Textarea
                  rows={2}
                  defaultValue="After food. Return if fever persists beyond 3 days."
                />
              </Field>
            </div>
            <div className="mt-4">
              <Checkbox
                label={
                  <span>
                    <b className="font-semibold">Patient consent taken.</b> Asked
                    in Marathi, agreed verbally at 11:21.
                  </span>
                }
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
            </div>

            <Divider className="my-6" />

            <div className="t-label mb-3">Icons · 24-grid, stroked 1.8, round caps</div>
            <div className="flex flex-wrap gap-4 text-ink">
              {[IconToday, IconPatients, IconNote, IconRx, IconMic, IconWave, IconSign, IconPrint, IconSearch, IconPen, IconCheck, IconWarn, IconWifiOff, IconClose].map(
                (Icon, i) => (
                  <span
                    key={i}
                    className="size-10 grid place-items-center border border-line rounded-[10px] bg-soft"
                  >
                    <Icon size={19} />
                  </span>
                ),
              )}
            </div>
          </Card>
        </Section>

        {/* ── surfaces ── */}
        <Section
          eyebrow="Components"
          title="Surfaces & feedback"
          lede="One panel, one card, one banner. The banner text is always plain language, because a doctor mid-clinic should never have to interpret a state."
        >
          <div className="grid lg:grid-cols-2 gap-4 items-start">
            <Panel>
              <PanelHeader title="This visit" meta={<span className="text-signal">Recording</span>} />
              <PanelBody className="space-y-3">
                <div className="flex items-center gap-4">
                  <Button variant="ghost">
                    <span className="size-2.5 bg-signal rounded-[2px]" /> End visit
                  </Button>
                  <div className="flex-1">
                    <Waveform mode="demo" height={40} />
                  </div>
                  <span className="font-mono text-[19px]">04:12</span>
                </div>
                <div className="flex gap-4">
                  {(["done", "done", "running", "idle"] as const).map((s, i) => (
                    <span key={i} className="flex items-center gap-2 t-mono-sm">
                      <Tick state={s} />
                      {["Audio", "Transcript", "Speakers", "Case sheet"][i]}
                    </span>
                  ))}
                </div>
              </PanelBody>
            </Panel>

            <div className="space-y-3">
              <Banner tone="warn" icon={<IconWarn size={16} />}>
                Audio was unclear here. Please check the examination section.
              </Banner>
              <Banner tone="live" icon={<IconMic size={16} />}>
                <b className="font-semibold">We can't hear anything.</b> The meter
                has been flat for a few seconds. Check the mic isn't muted. The
                recording continues.
              </Banner>
              <Banner tone="info" icon={<IconWifiOff size={16} />}>
                <b className="font-semibold">Working offline.</b> Saving locally
                and uploading when the connection returns. Keep consulting.
              </Banner>
              <Banner tone="ok" icon={<IconCheck size={16} />}>
                Signed and locked. The prescription is ready to deliver.
              </Banner>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 items-start mt-4">
            <Card>
              <div className="t-label mb-2">Definition rows</div>
              <KV k="Registration">MMC 44712209</KV>
              <KV k="Council">Maharashtra Medical Council</KV>
              <KV k="Audio retention">90 days, purged daily</KV>
            </Card>
            <Panel>
              <PanelHeader title="Empty states name the next action" />
              <EmptyState
                icon={<IconRx size={30} />}
                title="Nothing here yet"
                action={<Button size="sm">Add medicine</Button>}
              >
                Prescriptions appear once a medicine has been added to a visit.
              </EmptyState>
            </Panel>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Button onClick={() => setModalOpen(true)}>Open a dialog</Button>
            <span className="t-mono-sm text-muted">
              Escape closes · focus moves inside · body scroll locks
            </span>
          </div>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            eyebrow="Allergy on record"
            title="Stopped before it reached the prescription"
          >
            <p className="text-[13.5px] text-muted leading-relaxed mb-4">
              Destructive and irreversible actions get a dialog with the full
              consequence written out, and a typed confirmation where the action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5">
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Remove it, good catch
              </Button>
              <Button onClick={() => setModalOpen(false)}>Override &amp; add</Button>
            </div>
          </Modal>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <span className="t-label">Avatars</span>
            {["Dr. Arvind Menon", "Priya Nair", "S. Ramanathan"].map((n) => (
              <span key={n} className="flex items-center gap-2">
                <Avatar name={n} size={32} />
                <span className="text-[13.5px]">{n}</span>
              </span>
            ))}
          </div>
        </Section>

        {/* ── voice ── */}
        <Section
          eyebrow="Voice"
          title="Say the thing, then stop"
          lede="The reader is a doctor with eleven people waiting outside. Never claim the software knows anything clinical: it drafts, the doctor decides."
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <div className="t-label mb-3">Write like this</div>
              <p className="font-display font-semibold text-[18px] tracking-[-0.015em] leading-snug">
                “Note ready. <span className="text-sea">Review before signing.</span>”
              </p>
              <p className="font-display font-semibold text-[18px] tracking-[-0.015em] leading-snug m-0">
                “Couldn't hear the last 40 seconds. The room got loud.{" "}
                <span className="text-sea">Recording saved anyway.</span>”
              </p>
            </Card>
            <Card>
              <div className="t-label mb-3">Not like this</div>
              <p className="font-display font-semibold text-[18px] tracking-[-0.015em] leading-snug text-muted">
                “Your AI-powered clinical documentation is complete! 🎉”
              </p>
              <p className="font-display font-semibold text-[18px] tracking-[-0.015em] leading-snug text-muted m-0">
                “Sonara has diagnosed the patient with a viral upper respiratory
                infection.”
              </p>
            </Card>
          </div>

          <Card className="mt-4">
            <Rule ok>
              <b className="font-semibold">Draft, suggestion, review, sign.</b>{" "}
              These describe what actually happens and leave the doctor in charge
              of it.
            </Rule>
            <Rule ok>
              <b className="font-semibold">
                Visit, case sheet, complaint, follow-up.
              </b>{" "}
              The vocabulary already on the wall in an Indian OPD.
            </Rule>
            <Rule>
              <b className="font-semibold">Diagnose, recommend, prescribe.</b>{" "}
              Sonara does none of these. A doctor does, using Sonara.
            </Rule>
            <Rule>
              <b className="font-semibold">
                Seamless, revolutionary, powered by AI.
              </b>{" "}
              Every competitor says these, so they carry no information.
            </Rule>
          </Card>
        </Section>

        {/* ── tokens ── */}
        <Section
          eyebrow="Implementation"
          title="Where the tokens live"
          lede="One file. Tailwind v4 reads the @theme block directly, so there is no second source of truth to drift."
        >
          <Card>
            <KV k="Tokens">
              <code className="font-mono text-[13px]">src/app/globals.css</code>:
              colours, type utilities, radii, shadows, motion
            </KV>
            <KV k="Brand mark">
              <code className="font-mono text-[13px]">
                src/components/brand/logo.tsx
              </code>
            </KV>
            <KV k="Primitives">
              <code className="font-mono text-[13px]">src/components/ui/*</code>:
              button, badge, panel, field, modal, toast, waveform, icons
            </KV>
            <KV k="Focus ring">
              2.5px sea at 2px offset, on every interactive element
            </KV>
            <KV k="Motion">
              One easing curve. Everything collapses under{" "}
              <code className="font-mono text-[13px]">prefers-reduced-motion</code>
            </KV>
          </Card>
        </Section>
      </div>

      <footer className="border-t border-line py-10">
        <div className="max-w-[1080px] mx-auto px-7 flex flex-wrap gap-4 justify-between items-center">
          <Lockup markSize={20} textSize={16} />
          <div className="flex gap-5 t-mono-sm text-muted">
            <Link href="/" className="hover:text-ink">landing</Link>
            <Link href="/today" className="hover:text-ink">the product</Link>
            <Link href="/sign-in" className="hover:text-ink">sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── local building blocks ── */

function Section({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="max-w-[68ch] mb-6">
        <span className="t-eyebrow">{eyebrow}</span>
        <h2 className="t-h2 mt-2 mb-2">{title}</h2>
        <p className="text-[15.5px] text-muted leading-relaxed m-0">{lede}</p>
      </div>
      {children}
    </section>
  );
}

function Tile({
  children,
  caption,
  dark,
  petrol,
}: {
  children: React.ReactNode;
  caption: string;
  dark?: boolean;
  petrol?: boolean;
}) {
  return (
    <div>
      <div
        className={cx(
          "border rounded-card grid place-items-center min-h-[160px] p-6",
          dark
            ? "bg-ink border-ink"
            : petrol
              ? "bg-petrol border-petrol"
              : "bg-chalk border-line",
        )}
      >
        {children}
      </div>
      <div className="t-mono-sm text-muted mt-2">{caption}</div>
    </div>
  );
}

function TypeRow({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex flex-wrap items-baseline gap-x-6 gap-y-2 py-4",
        !last && "border-b border-dashed border-line",
      )}
    >
      <span className="t-mono-sm text-muted w-[104px] shrink-0">{label}</span>
      <span className="flex-1 min-w-[260px]">{children}</span>
    </div>
  );
}

function Rule({
  ok,
  children,
}: {
  ok?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-dashed border-line last:border-0 text-[14.5px] leading-snug">
      <span
        className={cx(
          "font-mono text-[10.5px] font-medium px-2 py-1 rounded-[5px] shrink-0 mt-px",
          ok ? "bg-tint-petrol text-petrol" : "bg-tint-amber text-amber-text",
        )}
      >
        {ok ? "do" : "don't"}
      </span>
      <span>{children}</span>
    </div>
  );
}

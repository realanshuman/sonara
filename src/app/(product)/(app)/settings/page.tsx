"use client";

import { useState } from "react";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/field";
import { Avatar, Banner, EmptyState, KV } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import {
  IconCheck,
  IconClock,
  IconClose,
  IconLanguage,
  IconPlus,
  IconWarn,
} from "@/components/ui/icons";
import { useActions, useAppState, useMe } from "@/lib/store";
import { shortDate } from "@/lib/format";

const RETENTIONS = [30, 60, 90, 180, 365];

export default function SettingsPage() {
  const state = useAppState();
  const actions = useActions();
  const { me } = useMe();
  const toast = useToast();
  const [vocab, setVocab] = useState("");

  if (me.role !== "owner") {
    return (
      <EmptyState title="Owner settings">
        Clinic settings, retention and verification are managed by the clinic
        owner.
      </EmptyState>
    );
  }

  return (
    <div className="max-w-[880px] mx-auto px-6 py-7 space-y-4">
      <div className="mb-1">
        <div className="t-eyebrow mb-1">{state.clinic.name}</div>
        <h1 className="t-h2">Settings</h1>
      </div>

      {/* clinic */}
      <Panel>
        <PanelHeader title="Clinic" meta="appears on every prescription" />
        <PanelBody className="space-y-3.5">
          <div className="grid sm:grid-cols-2 gap-3.5">
            <Field label="Clinic name">
              <Input
                value={state.clinic.name}
                onChange={(e) => actions.updateClinic({ name: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={state.clinic.phone}
                onChange={(e) => actions.updateClinic({ phone: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Address">
            <Input
              value={state.clinic.address}
              onChange={(e) => actions.updateClinic({ address: e.target.value })}
            />
          </Field>
          <div className="grid sm:grid-cols-3 gap-3.5">
            <Field label="City">
              <Input
                value={state.clinic.city}
                onChange={(e) => actions.updateClinic({ city: e.target.value })}
              />
            </Field>
            <Field label="State">
              <Input
                value={state.clinic.state}
                onChange={(e) => actions.updateClinic({ state: e.target.value })}
              />
            </Field>
            <Field label="PIN code">
              <Input
                value={state.clinic.pincode}
                onChange={(e) => actions.updateClinic({ pincode: e.target.value })}
              />
            </Field>
          </div>
        </PanelBody>
      </Panel>

      {/* team & verification */}
      <Panel>
        <PanelHeader title="Team & signing rights" meta={`${state.users.length} people`} />
        <PanelBody className="space-y-3">
          {state.users.map((u) => {
            const profile = state.doctorProfiles[u.id];
            return (
              <div
                key={u.id}
                className="flex items-center gap-3 py-2.5 border-b border-dashed border-line last:border-0"
              >
                <Avatar name={u.fullName} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[14px]">{u.fullName}</div>
                  <div className="t-mono-sm text-muted truncate">
                    {u.email} ·{" "}
                    {u.role === "front_desk" ? "front desk" : u.role}
                    {profile && ` · ${profile.registrationNumber}`}
                  </div>
                </div>
                {profile ? (
                  profile.verificationStatus === "verified" ? (
                    <Pill tone="ok">
                      <IconCheck size={11} /> can sign
                    </Pill>
                  ) : (
                    <Pill tone="warn">
                      <IconClock size={11} /> verification pending
                    </Pill>
                  )
                ) : (
                  <Pill tone="neutral">no clinical access</Pill>
                )}
              </div>
            );
          })}
          <p className="t-mono-sm text-muted leading-relaxed m-0">
            Registration certificates are checked by a human within 24 hours.
            Until then a doctor can record and draft, but signing stays locked —
            that gate is enforced in the API, not just here.
          </p>
        </PanelBody>
      </Panel>

      {/* retention */}
      <Panel>
        <PanelHeader title="Audio retention" meta="purge runs daily" />
        <PanelBody className="space-y-3.5">
          <Banner tone="info">
            Audio is not the medical record — the signed note is. That's why
            recordings can be purged on a schedule while notes are kept for the
            statutory period.
          </Banner>
          <div className="flex gap-2 flex-wrap items-center">
            {RETENTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  actions.setRetention(d);
                  toast(`Audio now purged after ${d} days`);
                }}
                className={`px-3.5 py-2 rounded-field border text-[13.5px] font-semibold transition-colors ${
                  state.clinic.audioRetentionDays === d
                    ? "bg-petrol text-chalk border-petrol"
                    : "bg-chalk border-line hover:border-sea"
                }`}
              >
                {d} days
              </button>
            ))}
            <span className="t-mono-sm text-muted ml-1">
              every purge writes an audit entry
            </span>
          </div>
        </PanelBody>
      </Panel>

      {/* vocabulary */}
      <Panel>
        <PanelHeader
          title="Clinic vocabulary"
          meta={`${state.vocabulary.length} terms`}
        />
        <PanelBody className="space-y-3">
          <p className="text-[13.5px] text-muted m-0 leading-relaxed">
            Brand names, local place names and the words your patients actually
            use. These boost recognition for this clinic only — corrections
            never leave your account and never train a shared model.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {state.vocabulary.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 font-mono text-[12px] bg-tint-mist text-petrol px-2 py-1 rounded-chip group"
              >
                {t}
                <button
                  type="button"
                  onClick={() => actions.removeVocab(t)}
                  className="opacity-40 group-hover:opacity-100"
                  aria-label={`Remove ${t}`}
                >
                  <IconClose size={10} />
                </button>
              </span>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!vocab.trim()) return;
              actions.addVocab(vocab.trim());
              setVocab("");
            }}
          >
            <Input
              value={vocab}
              onChange={(e) => setVocab(e.target.value)}
              placeholder="Add a term — e.g. Koparkhairane, Zerodol"
              className="max-w-[320px] py-[8px] text-[14px]"
            />
            <Button size="sm" type="submit">
              <IconPlus size={13} /> Add
            </Button>
          </form>
        </PanelBody>
      </Panel>

      {/* processing & providers */}
      <Panel>
        <PanelHeader title="Where the data goes" meta="processor agreements" />
        <PanelBody className="py-2">
          <KV k="Database">
            Neon Postgres, row-level security scoped by clinic
          </KV>
          <KV k="Audio storage">
            S3-compatible object storage · encrypted at rest · signed URLs
            expiring in 5 minutes
          </KV>
          <KV k="Transcription">
            Configured provider with zero-retention and no-training terms
          </KV>
          <KV k="Note drafting">
            Anthropic Claude · structured output · no training on your data
          </KV>
          <KV k="Email">Resend · OTP, verification and prescription delivery</KV>
          <KV k="Region">
            <span className="inline-flex items-center gap-2">
              Nearest available region to India
              <Pill tone="warn">
                <IconWarn size={10} /> decision pending
              </Pill>
            </span>
          </KV>
        </PanelBody>
      </Panel>

      {/* demo controls */}
      <Panel>
        <PanelHeader title="Demo controls" meta="not part of the product" />
        <PanelBody className="space-y-3.5">
          <div className="flex items-start gap-3 flex-wrap">
            <label className="flex items-start gap-2.5 text-[13.5px] cursor-pointer flex-1 min-w-[260px]">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-petrol"
                checked={state.demo.simulateUnverified}
                onChange={(e) => actions.setSimUnverified(e.target.checked)}
              />
              <span>
                <b className="font-semibold">Act as an unverified doctor.</b>
                <span className="block text-muted">
                  Recording and drafting keep working; every signing path
                  refuses. This is the gate from PRD §10.1.
                </span>
              </span>
            </label>
            <Button
              variant="quiet"
              onClick={() => {
                actions.resetDemo();
                toast("Demo data reset to a fresh clinic day");
              }}
            >
              Reset demo data
            </Button>
          </div>
          <div className="flex items-center gap-2 t-mono-sm text-muted">
            <IconLanguage size={13} />
            Consent scripts ship in English, Hindi and Marathi.
            <span className="ml-auto">
              seeded {shortDate(new Date().toISOString())}
            </span>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lockup } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Banner } from "@/components/ui/misc";
import { Pill } from "@/components/ui/badge";
import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconMail,
  IconUser,
} from "@/components/ui/icons";
import { useActions } from "@/lib/store";
import { cx } from "@/lib/cx";

const STEPS = [
  { key: "account", label: "Account" },
  { key: "clinic", label: "Clinic" },
  { key: "registration", label: "Registration" },
  { key: "done", label: "Ready" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export default function OnboardingPage() {
  const router = useRouter();
  const actions = useActions();
  const [step, setStep] = useState<StepKey>("account");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [city, setCity] = useState("");
  const [regNo, setRegNo] = useState("");
  const [council, setCouncil] = useState("Maharashtra Medical Council");
  const [uploaded, setUploaded] = useState(false);

  const idx = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-line bg-chalk">
        <div className="max-w-[880px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <Lockup markSize={24} textSize={19} />
          </Link>
          <Link href="/sign-in" className="t-mono-sm text-muted hover:text-ink">
            already registered? sign in
          </Link>
        </div>
      </header>

      <div className="max-w-[620px] mx-auto px-6 py-10">
        {/* step rail */}
        <ol className="flex items-center gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <li key={s.key} className="flex items-center gap-1.5 flex-1 last:flex-none">
              <span
                className={cx(
                  "flex items-center gap-2 t-mono-sm whitespace-nowrap",
                  i <= idx ? "text-petrol" : "text-faint",
                )}
              >
                <span
                  className={cx(
                    "size-5 rounded-full grid place-items-center text-[10px] font-medium",
                    i < idx
                      ? "bg-petrol text-chalk"
                      : i === idx
                        ? "border-2 border-petrol text-petrol"
                        : "border border-line text-faint",
                  )}
                >
                  {i < idx ? <IconCheck size={11} /> : i + 1}
                </span>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  className={cx(
                    "h-px flex-1 min-w-4",
                    i < idx ? "bg-petrol" : "bg-line",
                  )}
                />
              )}
            </li>
          ))}
        </ol>

        {step === "account" && (
          <StepCard
            title="Create your account"
            lede="One email per doctor. A 6-digit code confirms it — no password links to lose."
          >
            <Field label="Work email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourclinic.in"
                autoFocus
              />
            </Field>
            <Field
              label="Verification code"
              hint="Codes last 10 minutes, 5 attempts, 3 sends per hour. Any 6 digits work here."
            >
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="······"
                className="font-mono tracking-[0.4em]"
              />
            </Field>
            <div className="flex items-center gap-2 t-mono-sm text-muted">
              <IconMail size={13} /> sent via Resend to {email || "your inbox"}
            </div>
            <StepNav
              onNext={() => setStep("clinic")}
              disabled={!email.includes("@") || otp.length < 6}
            />
          </StepCard>
        )}

        {step === "clinic" && (
          <StepCard
            title="Where do you practise?"
            lede="This is what prints on every prescription, so it's worth getting right — you can edit it later in Settings."
          >
            <Field label="Clinic name">
              <Input
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Sunrise Polyclinic"
                autoFocus
              />
            </Field>
            <Field label="City">
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Navi Mumbai"
              />
            </Field>
            <StepNav
              onBack={() => setStep("account")}
              onNext={() => setStep("registration")}
              disabled={clinicName.trim().length < 2 || city.trim().length < 2}
            />
          </StepCard>
        )}

        {step === "registration" && (
          <StepCard
            title="Your council registration"
            lede="Only a registered practitioner may prescribe. We check the certificate by hand — a person, within 24 hours — because this gate is the basis of everything else."
          >
            <Field label="Registration number">
              <Input
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="MMC 44712209"
                autoFocus
              />
            </Field>
            <Field label="Council">
              <Select value={council} onChange={(e) => setCouncil(e.target.value)}>
                <option>Maharashtra Medical Council</option>
                <option>Karnataka Medical Council</option>
                <option>Delhi Medical Council</option>
                <option>Tamil Nadu Medical Council</option>
                <option>National Medical Commission</option>
              </Select>
            </Field>
            <button
              type="button"
              onClick={() => setUploaded(true)}
              className={cx(
                "w-full border-2 border-dashed rounded-field px-4 py-6 text-center transition-colors",
                uploaded
                  ? "border-sea bg-tint-sea"
                  : "border-line hover:border-sea bg-soft",
              )}
            >
              {uploaded ? (
                <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-petrol">
                  <IconCheck size={15} /> registration-certificate.pdf attached
                </span>
              ) : (
                <>
                  <span className="block text-[14px] font-semibold">
                    Attach your registration certificate
                  </span>
                  <span className="block t-mono-sm text-muted mt-1">
                    PDF or photo · reviewed by a person, not a model
                  </span>
                </>
              )}
            </button>
            <Banner tone="info">
              <b className="font-semibold">You can start today.</b> Recording,
              transcription and drafting all work while verification is
              pending. Only signing waits.
            </Banner>
            <StepNav
              onBack={() => setStep("clinic")}
              onNext={() => setStep("done")}
              nextLabel="Submit for verification"
              disabled={regNo.trim().length < 4 || !uploaded}
            />
          </StepCard>
        )}

        {step === "done" && (
          <StepCard
            title="You're set up"
            lede="Your clinic exists and is yours alone — no other clinic can see a single row of it."
          >
            <div className="space-y-2.5">
              <StatusRow
                icon={<IconCheck size={14} />}
                tone="ok"
                label="Account verified"
                detail={email || "your email"}
              />
              <StatusRow
                icon={<IconCheck size={14} />}
                tone="ok"
                label="Clinic created"
                detail={`${clinicName || "Your clinic"}, ${city || "your city"}`}
              />
              <StatusRow
                icon={<IconClock size={14} />}
                tone="wait"
                label="Registration under review"
                detail={`${regNo || "—"} · ${council} · signing unlocks on approval`}
              />
              <StatusRow
                icon={<IconUser size={14} />}
                tone="neutral"
                label="Next: add today's patients"
                detail="Import a CSV appointment book, or add walk-ins as they arrive"
              />
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full mt-2"
              onClick={() => {
                actions.signIn("u-menon");
                router.push("/today");
              }}
            >
              Open Today <IconArrowRight size={15} />
            </Button>
            <p className="t-mono-sm text-muted text-center m-0">
              the demo drops you into a clinic mid-morning, with the list already
              half signed
            </p>
          </StepCard>
        )}
      </div>
    </div>
  );
}

function StepCard({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-chalk border border-line rounded-card p-7 anim-rise">
      <h1 className="t-h2 mb-1.5">{title}</h1>
      <p className="text-[15px] text-muted leading-relaxed mb-6 mt-0">{lede}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  disabled,
  nextLabel = "Continue",
}: {
  onBack?: () => void;
  onNext: () => void;
  disabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex gap-2.5 justify-end pt-1">
      {onBack && <Button onClick={onBack}>Back</Button>}
      <Button variant="primary" onClick={onNext} disabled={disabled}>
        {nextLabel} <IconArrowRight size={14} />
      </Button>
    </div>
  );
}

function StatusRow({
  icon,
  tone,
  label,
  detail,
}: {
  icon: React.ReactNode;
  tone: "ok" | "wait" | "neutral";
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-dashed border-line last:border-0">
      <span className="mt-0.5">
        <Pill tone={tone}>{icon}</Pill>
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold">{label}</span>
        <span className="block t-mono-sm text-muted">{detail}</span>
      </span>
    </div>
  );
}

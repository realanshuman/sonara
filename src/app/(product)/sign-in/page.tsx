"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Lockup, Mark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Avatar } from "@/components/ui/misc";
import { IconArrowRight, IconLock, IconSign, IconWave } from "@/components/ui/icons";
import { useActions, useAppState } from "@/lib/store";
import { cx } from "@/lib/cx";

export default function SignInPage() {
  const state = useAppState();
  const actions = useActions();
  const router = useRouter();
  const [step, setStep] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("a.menon@sunrisepolyclinic.in");
  const [password, setPassword] = useState("••••••••••");
  const [otp, setOtp] = useState("");

  const enter = (userId: string) => {
    actions.signIn(userId);
    router.push("/today");
  };

  const matchedUser =
    state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ??
    state.users[0];

  return (
    <div className="min-h-dvh grid lg:grid-cols-[1.05fr_1fr] bg-paper">
      {/* ── brand side: the trace, drawn as instrumentation ── */}
      <div className="relative hidden lg:flex flex-col justify-between bg-ink text-ink-text p-11 overflow-hidden">
        <div className="absolute inset-0 grid-ink opacity-60" aria-hidden />
        <div
          className="absolute -right-24 top-1/2 -translate-y-1/2 opacity-[0.07] text-mist"
          aria-hidden
        >
          <Mark size={520} />
        </div>

        <div className="relative">
          <Lockup markSize={26} textSize={20} markClass="text-mist" textClass="text-chalk" />
        </div>

        <div className="relative max-w-[30ch]">
          <p className="font-display font-semibold text-[34px] leading-[1.12] tracking-[-0.028em] text-chalk m-0">
            Eleven people are waiting outside.
            <br />
            Let's not make this the slow part.
          </p>
          <p className="text-[15px] text-ink-muted mt-4 mb-0 max-w-[36ch] leading-relaxed">
            Sign in and today's list is already loaded — token order, last
            visit, allergies and running medication on every card.
          </p>
        </div>

        <div className="relative space-y-0">
          {[
            { icon: <IconWave size={15} />, text: "Median draft ready in 8 seconds" },
            { icon: <IconLock size={15} />, text: "Audio encrypted, purged on your schedule" },
            { icon: <IconSign size={15} />, text: "Nothing reaches a patient unsigned" },
          ].map((r) => (
            <div
              key={r.text}
              className="flex items-center gap-3 py-2.5 border-t border-ink-3 font-mono text-[12px] text-ink-faint"
            >
              <span className="text-sea">{r.icon}</span>
              {r.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── form side ── */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden mb-8">
            <Lockup markSize={26} textSize={20} />
          </div>
          <Mark size={34} className="text-petrol hidden lg:block" />

          {step === "password" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("otp");
              }}
            >
              <h1 className="font-display font-extrabold text-[30px] tracking-[-0.03em] mt-5 mb-1.5">
                Sign in
              </h1>
              <p className="text-muted text-[15px] mb-6 mt-0">
                Use the email your clinic was registered with.
              </p>

              <div className="space-y-3.5">
                <Field label="Email">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                  />
                </Field>
                <Field label="Password">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </Field>
              </div>

              <Button variant="primary" size="lg" type="submit" className="w-full mt-5">
                Continue <IconArrowRight size={15} />
              </Button>

              <p className="t-mono-sm text-muted mt-4 leading-relaxed">
                A 6-digit code goes to your phone. Sessions last 12 hours of
                inactivity, then ask again.
              </p>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enter(matchedUser.id);
              }}
            >
              <h1 className="font-display font-extrabold text-[30px] tracking-[-0.03em] mt-5 mb-1.5">
                Enter the code
              </h1>
              <p className="text-muted text-[15px] mb-6 mt-0">
                Sent to the phone ending {matchedUser.phone.slice(-4)}. Valid
                for 10 minutes.
              </p>
              <Field label="6-digit code" hint="Any 6 digits work in this demo.">
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="······"
                  autoFocus
                  className="font-mono text-[22px] tracking-[0.5em] text-center"
                />
              </Field>
              <Button
                variant="primary"
                size="lg"
                type="submit"
                className="w-full mt-4"
                disabled={otp.length < 6}
              >
                Verify and open Today
              </Button>
              <button
                type="button"
                onClick={() => setStep("password")}
                className="t-mono-sm text-muted hover:text-ink underline underline-offset-2 mt-4"
              >
                use a different email
              </button>
            </form>
          )}

          {/* demo entry — skips the OTP theatre */}
          <div className="mt-8 pt-6 border-t border-line">
            <div className="t-label mb-2.5">Open the demo as</div>
            <div className="space-y-1.5">
              {state.users.map((u) => {
                const profile = state.doctorProfiles[u.id];
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => enter(u.id)}
                    className={cx(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-field border border-line bg-chalk hover:border-sea transition-colors text-left",
                    )}
                  >
                    <Avatar name={u.fullName} size={30} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold truncate">
                        {u.fullName}
                      </span>
                      <span className="block t-mono-sm text-muted truncate">
                        {u.role === "front_desk"
                          ? "front desk · no clinical access"
                          : profile?.verificationStatus === "verified"
                            ? `${u.role} · verified, can sign`
                            : `${u.role} · verification pending, signing locked`}
                      </span>
                    </span>
                    <IconArrowRight size={14} className="text-faint shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[12.5px] text-muted mt-6 leading-relaxed">
            New clinic?{" "}
            <Link href="/onboarding" className="underline underline-offset-2 hover:text-ink">
              Register your practice
            </Link>
            . Your council registration is verified once, by a person, before
            signing is enabled.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { IconChevronDown } from "@/components/ui/icons";
import { cx } from "@/lib/cx";

const ITEMS = [
  {
    q: "Does the patient have to agree to be recorded?",
    a: "Yes, every single visit. The record button is disabled until consent is captured, and the server refuses to open a recording session without it. There's a one-line script on screen in English, Hindi or Marathi so you can just read it out. Consent is never remembered from last time, and a new visit always asks again.",
  },
  {
    q: "What happens if the internet drops mid-consult?",
    a: "Nothing stops. Audio buffers in the browser and uploads itself when the connection returns; the banner tells you plainly that it's saving locally. Losing a consultation is the one failure we don't accept, so recording never depends on the network being up.",
  },
  {
    q: "Can Sonara prescribe?",
    a: "No, and it's built so that it can't. You compose the prescription; Sonara formats it, checks it against the allergies on file, and delivers it once you've signed. There is no code path that produces a signed prescription without a doctor whose registration we've verified.",
  },
  {
    q: "What if the note is wrong?",
    a: "You edit it, and that's the expected workflow, not a failure. Every line traces back to the transcript timestamps that produced it, so you can check the source in a second. If the whole draft is off, one tap discards it and keeps the transcript. We track how often that happens, because a rising discard rate means the note quality is slipping.",
  },
  {
    q: "Where does the audio live, and for how long?",
    a: "In encrypted object storage, never on a server disk, reachable only through links that expire in five minutes. You choose the retention window (90 days by default) and the purge runs daily with an audit entry each time. The signed note is the medical record; the audio isn't, which is why it can be deleted while notes are kept.",
  },
  {
    q: "Is our patient data used to train anything?",
    a: "No. Not by us, and not by the transcription or language providers. We run them on zero-retention, no-training terms and that's in the processor agreements. Corrections you make to transcripts build a vocabulary for your clinic alone.",
  },
  {
    q: "Will it work on the clinic desktop?",
    a: "That's the machine we build for: Chrome or Edge on Windows 10 or 11, on a connection that comes and goes. Body text is 16px minimum and everything is keyboard-operable, because your hands are already on the keyboard and the screen is across a desk.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t border-line">
      {ITEMS.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className="border-b border-line">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-start gap-4 py-4 text-left group"
              >
                <span className="t-h3 text-[17px] flex-1 group-hover:text-petrol transition-colors">
                  {it.q}
                </span>
                <IconChevronDown
                  size={17}
                  className={cx(
                    "text-muted shrink-0 mt-1 transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
            </h3>
            <div
              className={cx(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="text-[15px] text-muted leading-relaxed max-w-[68ch] pb-5 pr-8 m-0">
                  {it.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

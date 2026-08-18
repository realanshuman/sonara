"use client";

/**
 * Real microphone capture for the level meter (FR-REC-1, FR-REC-4,
 * FR-REC-5). The demo does not persist audio anywhere — the stream feeds
 * the meter and a byte counter only, and is torn down on stop.
 *
 * If the mic is unreachable the caller gets a plain-language failure
 * string, never a raw browser error, and the consult falls back to a
 * simulated visit so the flow is still walkable.
 */

export interface MicSession {
  /** instantaneous input level 0..1 */
  getLevel: () => number;
  /** true when the input has been effectively silent for >5s */
  isSilent: () => boolean;
  stop: () => void;
  deviceLabel: string;
}

export async function openMic(): Promise<
  { ok: true; session: MicSession } | { ok: false; reason: string }
> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return {
      ok: false,
      reason:
        "This browser can't reach a microphone. Use Chrome or Edge on the clinic desktop.",
    };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.6;
    source.connect(analyser);
    const buf = new Uint8Array(analyser.frequencyBinCount);

    let lastLoudAt = performance.now();

    const getLevel = () => {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      const level = Math.min(1, rms * 4.5);
      if (level > 0.035) lastLoudAt = performance.now();
      return level;
    };

    const label =
      stream.getAudioTracks()[0]?.label?.trim() || "Default microphone";

    return {
      ok: true,
      session: {
        getLevel,
        isSilent: () => performance.now() - lastLoudAt > 5000,
        deviceLabel: label,
        stop: () => {
          stream.getTracks().forEach((t) => t.stop());
          void ctx.close().catch(() => {});
        },
      },
    };
  } catch (err) {
    const name = err instanceof DOMException ? err.name : "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      return {
        ok: false,
        reason:
          "Microphone permission was refused. Allow the mic for this site in the browser's address bar, then try again.",
      };
    }
    if (name === "NotFoundError" || name === "OverconstrainedError") {
      return {
        ok: false,
        reason:
          "Your microphone isn't reachable. Check the Windows sound settings, then reload.",
      };
    }
    return {
      ok: false,
      reason:
        "Couldn't open the microphone. Close other apps that may be using it, then try again.",
    };
  }
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { Block } from "@/library/schema";
import { beep, primeAudio } from "@/lib/audio";
import { vibrate } from "@/lib/haptics";

type Meditation = Extract<Block, { type: "meditation" }>;

/**
 * Unguided meditation block: an interval bell (start/end + every `intervalMin`)
 * and an optional ~6 breaths/min paced-breathing animation (expanding orb).
 */
export function MeditationBlock({ block, onDone }: { block: Meditation; onDone: () => void }) {
  const bell = block.bell;
  const breathing = block.breathing;
  const totalSec = block.durationMin * 60;

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const lastRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    lastRef.current = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const delta = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setElapsed((e) => {
        const next = e + delta;
        const prevWhole = Math.floor(e);
        const nextWhole = Math.floor(next);
        // Interval chime.
        if (bell && nextWhole > prevWhole) {
          const intervalSec = bell.intervalMin * 60;
          if (nextWhole > 0 && nextWhole % intervalSec === 0 && nextWhole < totalSec) {
            beep(false);
            if (bell.haptics) vibrate(60);
          }
        }
        if (next >= totalSec) {
          if (bell?.endBell) {
            beep(true);
            if (bell.haptics) vibrate([80, 40, 80]);
          }
          setRunning(false);
          return totalSec;
        }
        return next;
      });
    }, 200);
    return () => window.clearInterval(id);
  }, [running, bell, totalSec]);

  function start() {
    primeAudio();
    if (bell?.startBell) {
      beep(true);
      if (bell.haptics) vibrate([80, 40, 80]);
    }
    setElapsed(0);
    setRunning(true);
  }

  const remaining = Math.max(0, Math.ceil(totalSec - elapsed));
  const mm = Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0");
  const ss = (remaining % 60).toString().padStart(2, "0");

  // Paced-breathing orb phase. Cycle = inhale + holdIn + exhale + holdOut.
  let breatheLabel = "Breathe";
  let scale = 1;
  if (breathing) {
    const inhale = breathing.inhaleSec;
    const holdIn = breathing.holdInSec ?? 0;
    const exhale = breathing.exhaleSec;
    const holdOut = breathing.holdOutSec ?? 0;
    const cycle = inhale + holdIn + exhale + holdOut;
    const t = elapsed % cycle;
    if (t < inhale) {
      breatheLabel = "Inhale";
      scale = 0.5 + 0.5 * (t / inhale);
    } else if (t < inhale + holdIn) {
      breatheLabel = "Hold";
      scale = 1;
    } else if (t < inhale + holdIn + exhale) {
      breatheLabel = "Exhale";
      scale = 1 - 0.5 * ((t - inhale - holdIn) / exhale);
    } else {
      breatheLabel = "Hold";
      scale = 0.5;
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
          Wellness · ~6 breaths/min
        </p>
        <p className="font-mono text-board-xl font-black tabular-nums text-tier-green">
          {mm}:{ss}
        </p>
      </div>

      {breathing && breathing.visual !== "none" ? (
        <div className="flex h-64 w-64 items-center justify-center">
          <div
            data-testid="breathing-orb"
            className="flex h-56 w-56 items-center justify-center rounded-full bg-tier-green/20"
            style={{
              transform: `scale(${scale.toFixed(3)})`,
              transition: "transform 0.2s linear",
            }}
          >
            <span className="text-lg font-semibold uppercase tracking-widest text-tier-green">
              {running ? breatheLabel : "Ready"}
            </span>
          </div>
        </div>
      ) : null}

      {block.script ? (
        <p className="max-w-md text-sm leading-relaxed text-neutral-400">{block.script}</p>
      ) : null}

      <div className="flex gap-3">
        {!running ? (
          <button
            type="button"
            onClick={start}
            className="rounded-xl bg-tier-green px-10 py-4 text-xl font-extrabold uppercase tracking-widest text-black"
          >
            {elapsed >= totalSec ? "Restart" : "Begin"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setRunning(false)}
            className="rounded-xl border-2 border-neutral-600 px-10 py-4 text-xl font-bold uppercase tracking-widest text-neutral-200"
          >
            Pause
          </button>
        )}
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl border-2 border-neutral-700 px-8 py-4 text-xl font-bold uppercase tracking-widest text-neutral-300"
        >
          Done
        </button>
      </div>
    </div>
  );
}

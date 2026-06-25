"use client";

import { useEffect, useRef, useState } from "react";
import type { Block } from "@/library/schema";
import { beep, primeAudio } from "@/lib/audio";
import { vibrate } from "@/lib/haptics";
import { releaseWakeLock, requestWakeLock } from "@/lib/wakeLock";
import {
  cuesFor,
  initTimer,
  isBoundary,
  remainingSec,
  tickTimer,
  type TimerState,
} from "@/lib/timer/machine";
import { formatLoad, movementName } from "@/lib/runner/session";

type ConditioningBlock = Extract<Block, { type: "conditioning" }>;

const PHASE_LABEL: Record<string, string> = {
  countdown: "GET READY",
  work: "WORK",
  rest: "REST",
  round: "ROUND",
  done: "DONE",
};

/**
 * The conditioning takeover: a huge countdown (text-timer), the movements big,
 * loud beep + vibration on each boundary, and a screen wake-lock for the
 * duration. Captures a result on stop. Pure FSM (`lib/timer/machine`) drives it;
 * the clock here is `performance.now()` via setInterval inside an effect.
 */
export function ConditioningTimer({
  block,
  onDone,
}: {
  block: ConditioningBlock;
  onDone: (result: string) => void;
}) {
  const config = block.timer;
  const cues = cuesFor(config);

  const [state, setState] = useState<TimerState>(() => initTimer(config));
  const [running, setRunning] = useState(false);
  const stateRef = useRef(state);
  const lastRef = useRef<number>(0);
  stateRef.current = state;

  // The driving clock: a 200ms interval feeding real deltas into the pure FSM.
  useEffect(() => {
    if (!running) return;
    lastRef.current = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const delta = now - lastRef.current;
      lastRef.current = now;
      const prev = stateRef.current;
      const next = tickTimer(prev, delta, config);
      if (isBoundary(prev, next)) {
        const strong = next.done || (next.phase === "work" && next.round !== prev.round);
        if (cues.loudCue) beep(strong);
        if (cues.haptics) vibrate(strong ? [80, 40, 80] : 60);
      }
      setState(next);
      if (next.done) setRunning(false);
    }, 200);
    return () => window.clearInterval(id);
  }, [running, config, cues.loudCue, cues.haptics]);

  // Wake lock only while running.
  useEffect(() => {
    if (running && cues.wakeLock) {
      void requestWakeLock();
      return () => {
        void releaseWakeLock();
      };
    }
    return undefined;
  }, [running, cues.wakeLock]);

  function start() {
    primeAudio();
    if (cues.loudCue) beep(false); // unlock + an audible "go"
    setState(initTimer(config));
    setRunning(true);
  }

  function stop() {
    setRunning(false);
    const result =
      block.scoreType === "time"
        ? `${state.elapsedSec}s elapsed`
        : `stopped at ${state.elapsedSec}s`;
    onDone(result);
  }

  const secs = remainingSec(state);
  const mm = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const ss = (secs % 60).toString().padStart(2, "0");
  const phaseColor =
    state.phase === "rest"
      ? "text-tier-amber"
      : state.phase === "done"
        ? "text-tier-green"
        : "text-neutral-100";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
          {block.name}
        </p>
        <p
          className={`text-board-xl font-bold uppercase tracking-widest ${
            state.phase === "rest" ? "text-tier-amber" : "text-tier-green"
          }`}
          data-testid="timer-phase"
        >
          {PHASE_LABEL[state.phase]}
          {state.totalRounds ? (
            <span className="ml-3 text-neutral-500">
              R{state.round}/{state.totalRounds}
            </span>
          ) : null}
        </p>
      </div>

      <div
        className={`font-mono text-timer font-black tabular-nums ${phaseColor}`}
        data-testid="timer-clock"
      >
        {mm}:{ss}
      </div>

      <ul className="space-y-2">
        {block.movements.map((m, i) => (
          <li key={i} className="text-2xl font-bold">
            {m.reps !== undefined ? (
              <span className="text-tier-green">{String(m.reps)} </span>
            ) : null}
            {movementName(m.movement)}
            {m.load ? (
              <span className="ml-2 text-lg font-medium text-neutral-400">
                @ {formatLoad(m.load)}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="flex gap-3 pt-4">
        {!running && !state.done ? (
          <button
            type="button"
            onClick={start}
            className="rounded-xl bg-tier-green px-10 py-4 text-xl font-extrabold uppercase tracking-widest text-black"
          >
            {state.elapsedSec > 0 ? "Resume" : "Go"}
          </button>
        ) : null}
        {running ? (
          <button
            type="button"
            onClick={() => setRunning(false)}
            className="rounded-xl border-2 border-neutral-600 px-10 py-4 text-xl font-bold uppercase tracking-widest text-neutral-200"
          >
            Pause
          </button>
        ) : null}
        <button
          type="button"
          onClick={stop}
          className="rounded-xl border-2 border-neutral-700 px-8 py-4 text-xl font-bold uppercase tracking-widest text-neutral-300"
        >
          {state.done ? "Next" : "Stop"}
        </button>
      </div>
    </div>
  );
}

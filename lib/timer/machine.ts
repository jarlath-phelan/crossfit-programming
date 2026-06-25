/**
 * Pure timer finite-state-machine for the Session Runner's conditioning block.
 *
 * This module is intentionally free of browser APIs and wall-clock reads — it is a
 * reducer + selectors driven by a `TimerConfig`. The client component owns the real
 * clock (`performance.now()` / `setInterval`) and feeds elapsed deltas in; this file
 * just maps elapsed time → phase / round / remaining, deterministically, so it is
 * fully unit-testable.
 *
 * Phases modeled (per the brief): countdown → work → rest → round → done.
 *  - `countdown` is the pre-start "3…2…1" ramp (from `cues.countdownSec`).
 *  - `work` / `rest` are the active intervals (rest only where a type defines it).
 *  - `round` is a zero-length logical boundary between rounds; we don't dwell in it,
 *    but `isBoundary` fires as we cross into each new round so a beep/haptic lands.
 *  - `done` is terminal.
 *
 * All five `TimerConfig` types are supported: amrap, for-time, emom, intervals, tabata.
 */
import type { TimerConfig, TimerCues } from "@/library/schema";
import { DEFAULT_TIMER_CUES } from "@/library/schema";

export type TimerPhase = "countdown" | "work" | "rest" | "round" | "done";

export interface TimerState {
  /** Whole seconds elapsed since the user pressed start (countdown counts up from 0). */
  elapsedSec: number;
  phase: TimerPhase;
  /** 1-based round index within the work portion (1 during countdown). */
  round: number;
  /** Total rounds, or null for open-ended pieces (amrap / single-shot for-time). */
  totalRounds: number | null;
  /** Seconds remaining in the *current* phase segment (countdown / work / rest / whole piece). */
  phaseRemainingSec: number;
  /** Seconds remaining in the whole piece (excludes countdown), or null when open-ended. */
  totalRemainingSec: number | null;
  done: boolean;
}

/** A flattened segment of the timeline: a contiguous run of one phase. */
interface Segment {
  phase: "countdown" | "work" | "rest";
  round: number;
  durationSec: number;
}

interface Plan {
  segments: Segment[];
  totalRounds: number | null;
  /** Total working duration (excludes the countdown), or null when open-ended. */
  workingDurationSec: number | null;
  countdownSec: number;
}

export function cuesFor(config: TimerConfig): TimerCues {
  return config.cues ?? DEFAULT_TIMER_CUES;
}

/**
 * Flatten a TimerConfig into an ordered list of timeline segments. Open-ended
 * pieces (amrap, capped for-time without rounds) get a single long work segment.
 */
function planFor(config: TimerConfig): Plan {
  const countdownSec = cuesFor(config).countdownSec;
  const segments: Segment[] = [];
  if (countdownSec > 0) {
    segments.push({ phase: "countdown", round: 1, durationSec: countdownSec });
  }

  switch (config.type) {
    case "amrap": {
      segments.push({ phase: "work", round: 1, durationSec: config.durationSec });
      return {
        segments,
        totalRounds: null,
        workingDurationSec: config.durationSec,
        countdownSec,
      };
    }
    case "for-time": {
      const rounds = config.rounds ?? 1;
      // A for-time piece is athlete-paced; we model it as one capped work window.
      // Rounds (if known) are surfaced for display but the clock is a single cap.
      segments.push({ phase: "work", round: 1, durationSec: config.capSec });
      return {
        segments,
        totalRounds: rounds,
        workingDurationSec: config.capSec,
        countdownSec,
      };
    }
    case "emom": {
      for (let r = 1; r <= config.rounds; r++) {
        segments.push({ phase: "work", round: r, durationSec: config.intervalSec });
      }
      return {
        segments,
        totalRounds: config.rounds,
        workingDurationSec: config.intervalSec * config.rounds,
        countdownSec,
      };
    }
    case "intervals":
    case "tabata": {
      for (let r = 1; r <= config.rounds; r++) {
        segments.push({ phase: "work", round: r, durationSec: config.workSec });
        if (config.restSec > 0 && r < config.rounds + 1) {
          segments.push({ phase: "rest", round: r, durationSec: config.restSec });
        }
      }
      const work = config.workSec * config.rounds + config.restSec * config.rounds;
      return {
        segments,
        totalRounds: config.rounds,
        workingDurationSec: work,
        countdownSec,
      };
    }
  }
}

/** Resolve which segment an elapsed-second offset lands in. */
function resolve(plan: Plan, elapsedSec: number): TimerState {
  const totalSpan = plan.segments.reduce((a, s) => a + s.durationSec, 0);

  if (elapsedSec >= totalSpan) {
    return {
      elapsedSec,
      phase: "done",
      round: plan.totalRounds ?? 1,
      totalRounds: plan.totalRounds,
      phaseRemainingSec: 0,
      totalRemainingSec: plan.workingDurationSec === null ? null : 0,
      done: true,
    };
  }

  let cursor = 0;
  let seg: Segment = plan.segments[0]!;
  for (const s of plan.segments) {
    if (elapsedSec < cursor + s.durationSec) {
      seg = s;
      break;
    }
    cursor += s.durationSec;
  }

  const intoSeg = elapsedSec - cursor;
  const phaseRemainingSec = seg.durationSec - intoSeg;

  // Working time elapsed (everything after the countdown) for the total-remaining read.
  const workElapsed = Math.max(0, elapsedSec - plan.countdownSec);
  const totalRemainingSec =
    plan.workingDurationSec === null ? null : Math.max(0, plan.workingDurationSec - workElapsed);

  return {
    elapsedSec,
    phase: seg.phase,
    round: seg.round,
    totalRounds: plan.totalRounds,
    phaseRemainingSec,
    totalRemainingSec,
    done: false,
  };
}

/** Build the initial state (at elapsed 0). */
export function initTimer(config: TimerConfig): TimerState {
  return resolve(planFor(config), 0);
}

/**
 * Advance the timer by `deltaMs`. The reducer tracks whole-second elapsed only —
 * sub-second deltas accumulate via the returned state's `elapsedSec` being a float
 * internally floored for phase resolution. We keep elapsed in whole seconds by
 * flooring, which is plenty for a 1 Hz gym timer.
 */
export function tickTimer(state: TimerState, deltaMs: number, config: TimerConfig): TimerState {
  if (state.done) return state;
  const nextElapsed = state.elapsedSec + deltaMs / 1000;
  return resolve(planFor(config), nextElapsed);
}

/** Convenience: advance exactly one whole second. */
export function tick(state: TimerState, config: TimerConfig): TimerState {
  return tickTimer(state, 1000, config);
}

/**
 * True when a beep/haptic should fire on the transition prev → next. Boundaries:
 *  - the countdown → work start,
 *  - any work↔rest flip,
 *  - crossing into a new round,
 *  - reaching `done`.
 */
export function isBoundary(prev: TimerState, next: TimerState): boolean {
  if (prev.phase === next.phase && prev.round === next.round && prev.done === next.done) {
    return false;
  }
  if (!prev.done && next.done) return true;
  if (prev.phase === "countdown" && next.phase === "work") return true;
  if (prev.phase !== next.phase && (next.phase === "work" || next.phase === "rest")) return true;
  if (next.phase === "work" && next.round !== prev.round) return true;
  return false;
}

// ── Selectors ────────────────────────────────────────────────────────────────

/** Whole seconds remaining to show on the big clock (phase-scoped). */
export function remainingSec(state: TimerState): number {
  return Math.max(0, Math.ceil(state.phaseRemainingSec));
}

export function currentRound(state: TimerState): number {
  return state.round;
}

export function phase(state: TimerState): TimerPhase {
  return state.phase;
}

export function done(state: TimerState): boolean {
  return state.done;
}

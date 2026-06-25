import { describe, expect, it } from "vitest";
import type { TimerConfig } from "@/library/schema";
import {
  currentRound,
  done,
  initTimer,
  isBoundary,
  phase,
  remainingSec,
  tick,
  tickTimer,
  type TimerState,
} from "./machine";

const NO_COUNTDOWN = { countdownSec: 0, loudCue: true, haptics: true, wakeLock: true };

/** Run the timer to completion, collecting every state and the boundary flags. */
function run(config: TimerConfig, maxSec = 2000): { states: TimerState[]; boundaries: number[] } {
  let s = initTimer(config);
  const states: TimerState[] = [s];
  const boundaries: number[] = [];
  for (let i = 0; i < maxSec && !s.done; i++) {
    const next = tick(s, config);
    if (isBoundary(s, next)) boundaries.push(next.elapsedSec);
    states.push(next);
    s = next;
  }
  return { states, boundaries };
}

describe("countdown", () => {
  it("starts in countdown and transitions to work, firing a boundary on start", () => {
    const config: TimerConfig = { type: "amrap", durationSec: 60 };
    const s0 = initTimer(config); // default cues → 3s countdown
    expect(phase(s0)).toBe("countdown");
    expect(remainingSec(s0)).toBe(3);

    const { boundaries } = run(config, 70);
    // First boundary fires at elapsed 3 (countdown→work start).
    expect(boundaries[0]).toBe(3);
  });

  it("omits the countdown when countdownSec is 0", () => {
    const config: TimerConfig = { type: "amrap", durationSec: 10, cues: NO_COUNTDOWN };
    const s0 = initTimer(config);
    expect(phase(s0)).toBe("work");
  });
});

describe("amrap", () => {
  const config: TimerConfig = { type: "amrap", durationSec: 20, cues: NO_COUNTDOWN };

  it("runs one open-ended work window then done", () => {
    const { states } = run(config, 40);
    expect(states[0]!.phase).toBe("work");
    expect(states[0]!.totalRounds).toBeNull();
    const last = states[states.length - 1]!;
    expect(done(last)).toBe(true);
    expect(last.elapsedSec).toBe(20);
  });

  it("counts the big clock down across the window", () => {
    let s = initTimer(config);
    expect(remainingSec(s)).toBe(20);
    s = tickTimer(s, 5000, config);
    expect(remainingSec(s)).toBe(15);
  });

  it("fires a done boundary at the end", () => {
    const { boundaries } = run(config, 40);
    expect(boundaries[boundaries.length - 1]).toBe(20);
  });
});

describe("for-time", () => {
  const config: TimerConfig = { type: "for-time", capSec: 30, rounds: 3, cues: NO_COUNTDOWN };

  it("models a single capped work window and surfaces rounds for display", () => {
    const s0 = initTimer(config);
    expect(s0.phase).toBe("work");
    expect(s0.totalRounds).toBe(3);
    const { states } = run(config, 60);
    const last = states[states.length - 1]!;
    expect(done(last)).toBe(true);
    expect(last.elapsedSec).toBe(30);
  });
});

describe("emom", () => {
  const config: TimerConfig = {
    type: "emom",
    intervalSec: 60,
    rounds: 4,
    cues: NO_COUNTDOWN,
  };

  it("ticks a new work round every interval", () => {
    let s = initTimer(config);
    expect(currentRound(s)).toBe(1);
    s = tickTimer(s, 60_000, config);
    expect(currentRound(s)).toBe(2);
    s = tickTimer(s, 60_000, config);
    expect(currentRound(s)).toBe(3);
  });

  it("fires a boundary at each minute and at done", () => {
    const { boundaries } = run(config, 300);
    // boundaries at the top of rounds 2,3,4 plus done at 240
    expect(boundaries).toContain(60);
    expect(boundaries).toContain(120);
    expect(boundaries).toContain(180);
    expect(boundaries).toContain(240);
  });

  it("completes after all rounds", () => {
    const { states } = run(config, 300);
    const last = states[states.length - 1]!;
    expect(done(last)).toBe(true);
    expect(last.elapsedSec).toBe(240);
  });
});

describe("intervals", () => {
  const config: TimerConfig = {
    type: "intervals",
    workSec: 20,
    restSec: 10,
    rounds: 3,
    cues: NO_COUNTDOWN,
  };

  it("alternates work and rest", () => {
    let s = initTimer(config);
    expect(phase(s)).toBe("work");
    s = tickTimer(s, 20_000, config);
    expect(phase(s)).toBe("rest");
    s = tickTimer(s, 10_000, config);
    expect(phase(s)).toBe("work");
    expect(currentRound(s)).toBe(2);
  });

  it("fires boundaries on every work↔rest flip", () => {
    const { boundaries } = run(config, 200);
    // round1 work end@20(rest), rest end@30(work r2), r2 work end@50, rest@60(work r3),
    // r3 work end@80, rest@90 done
    expect(boundaries).toContain(20);
    expect(boundaries).toContain(30);
    expect(boundaries).toContain(90);
  });

  it("handles zero rest (no rest segments)", () => {
    const noRest: TimerConfig = {
      type: "intervals",
      workSec: 15,
      restSec: 0,
      rounds: 2,
      cues: NO_COUNTDOWN,
    };
    let s = initTimer(noRest);
    expect(phase(s)).toBe("work");
    s = tickTimer(s, 15_000, noRest);
    expect(phase(s)).toBe("work");
    expect(currentRound(s)).toBe(2);
  });
});

describe("tabata", () => {
  const config: TimerConfig = {
    type: "tabata",
    workSec: 20,
    restSec: 10,
    rounds: 8,
    cues: NO_COUNTDOWN,
  };

  it("runs 8 rounds of 20s work / 10s rest = 240s", () => {
    const { states } = run(config, 400);
    const last = states[states.length - 1]!;
    expect(done(last)).toBe(true);
    expect(last.elapsedSec).toBe(240);
    expect(last.totalRounds).toBe(8);
  });

  it("reaches round 8 in work", () => {
    const config2 = config;
    let s = initTimer(config2);
    // 7 full work+rest cycles = 210s, then in round 8 work
    s = tickTimer(s, 210_000, config2);
    expect(currentRound(s)).toBe(8);
    expect(phase(s)).toBe("work");
  });
});

describe("isBoundary", () => {
  it("is false when nothing changes", () => {
    const config: TimerConfig = { type: "amrap", durationSec: 60, cues: NO_COUNTDOWN };
    const s = initTimer(config);
    const next = tickTimer(s, 1000, config);
    expect(isBoundary(s, next)).toBe(false);
  });

  it("fires on countdown→work", () => {
    const config: TimerConfig = { type: "amrap", durationSec: 60 };
    let s = initTimer(config);
    let fired = false;
    for (let i = 0; i < 5; i++) {
      const n = tick(s, config);
      if (isBoundary(s, n)) fired = true;
      s = n;
    }
    expect(fired).toBe(true);
  });
});

describe("selectors and totals", () => {
  it("reports total remaining for bounded pieces and null for amrap... wait amrap is bounded", () => {
    const emom: TimerConfig = { type: "emom", intervalSec: 60, rounds: 2, cues: NO_COUNTDOWN };
    let s = initTimer(emom);
    expect(s.totalRemainingSec).toBe(120);
    s = tickTimer(s, 60_000, emom);
    expect(s.totalRemainingSec).toBe(60);
  });
});

import { describe, it, expect } from "vitest";
import {
  AthleteProfile,
  Block,
  GateTracker,
  LoadPrescription,
  Mesocycle,
  NutritionTarget,
  ReadinessEntry,
  Session,
  Supplement,
  TimerConfig,
  Tier,
  toKg,
  toLb,
} from "./index";

// Fixtures lifted directly from docs/data-model.md so the code and the spec can't drift.

const fullSession = {
  id: "2026-06-25",
  date: "2026-06-25",
  title: "Block A · Day 2 — Press Emphasis + Sprinty Couplet",
  mesocycleId: "meso-2026-06-blockA",
  readinessGate: "GREEN",
  estDurationMin: 58,
  classFit: "fits 6:30am or 12pm class — skill is self-paced, MetCon is short",
  rationale: "HRV in band + good sleep → full strict HSPU work fresh, sprinty MetCon.",
  blocks: [
    {
      id: "b1-warmup",
      type: "warmup",
      label: "Temperature-raising ramp (dynamic only)",
      durationMin: 13,
      items: [
        { movement: "row-easy", durationSec: 180, note: "Zone 1, nasal breathing" },
        { movement: "scap-pull-up", reps: 10 },
      ],
    },
    {
      id: "b2-strength-skill",
      type: "gymnastics",
      label: "Strict HSPU progression",
      movement: "wall-hspu-negative",
      sets: 5,
      reps: 3,
      restSec: 120,
      advancementCriteriaRef: "hspu-negatives-to-deficit",
      qualityNote: "3–5 s eccentric, clean reps only.",
      variants: {
        amber: { sets: 3, qualityNote: "No max-effort negatives." },
        red: "skip",
      },
    },
    {
      id: "b3-strength",
      type: "strength",
      label: "Seated DB strict press",
      movement: "seated-db-strict-press",
      sets: 4,
      reps: "8–10",
      loadPrescription: { kind: "rir", rir: 2 },
      tempo: "31X1",
      rir: 2,
      restSec: 90,
      variants: { amber: { sets: 3 }, red: "skip" },
    },
    {
      id: "b4-conditioning",
      type: "conditioning",
      label: "Sprinty Couplet",
      name: "Sprinty Couplet",
      scoreType: "rounds-reps",
      timer: {
        type: "amrap",
        durationSec: 480,
        cues: { countdownSec: 3, loudCue: true, haptics: true, wakeLock: true },
      },
      movements: [
        { movement: "cal-row", reps: 12 },
        { movement: "dumbbell-thruster", reps: 9, load: { kind: "absolute", kg: 22.5 } },
      ],
      variants: { red: "skip" },
    },
    {
      id: "b5-mobility",
      type: "mobility",
      label: "Hip & hamstring floor work",
      target: "hip",
      items: [
        { movement: "couch-stretch", holdSec: 90, sides: 2 },
        { movement: "90-90-hip-switch", holdSec: 60, sides: 2 },
      ],
    },
    {
      id: "b6-meditation",
      type: "meditation",
      label: "Wellness block",
      durationMin: 10,
      bell: { intervalMin: 2, startBell: true, endBell: true, haptics: true },
      breathing: { breathsPerMin: 6, inhaleSec: 4, exhaleSec: 6, visual: "expanding-orb" },
      guidedUrl: null,
      script: "Slow nasal breathing at ~6 breaths/min.",
    },
    { id: "b7-note", type: "note", label: "Reminders", markdown: "**Caffeine:** AM only." },
  ],
};

const athleteExample = {
  id: "athlete-example",
  name: "Example Athlete",
  age: 39,
  sex: "M",
  heightCm: 188,
  weightKg: 96.5,
  bodyfatPct: 13,
  trainingAgeYears: 12,
  chronotype: "neutral",
  fiberBias: "fast-twitch",
  units: { primary: "lb", showBoth: true, loadRoundingKg: 1.25 },
  strengthProfile: { lowerBodyDominant: true, asymmetryNote: "L/R imbalance." },
  constraints: {
    sessionsPerWeekMin: 2,
    sessionsPerWeekTarget: 5,
    sessionsPerWeekMax: 6,
    timePerSessionMin: 60,
    unhurried: true,
    noBackToBackMetcons: true,
    hardConstraints: ["build strict before kipping"],
  },
  equipment: ["barbell", "dumbbells", "rig", "rings", "rower"],
  nutrition: {
    pattern: "omnivore",
    approach: "protein-first",
    proteinTargetGPerKg: [1.6, 2.2],
    cookingStyle: "mixed-fast",
    alcohol: "social-weekends",
    logging: "none",
  },
  supplements: ["creatine-mono", "whey", "collagen-vitc"],
  protocols: {
    caffeine: { use: true, mgPerHardDay: 285, onlyOnTiers: ["GREEN"], amOnly: true, cycle: true },
    collagen: { use: true, gramsPerDay: 15, timingNote: "~45–60 min pre with vitamin C" },
  },
  readinessPrefs: {
    sourceOrder: ["bevel", "whoop", "manual"],
    swc: { metric: "lnRMSSD", bootstrapDays: 14, bandSdMultiplier: 0.5, rollingDays: 7 },
    subjective: {
      mode: "one-tap",
      oneTapTiers: ["GREEN", "AMBER", "RED"],
      allowOptionalScore: true,
    },
    manualOverrideWins: true,
  },
  benchmarks: { Fran: "3:30", Grace: "1:45" },
  goals: ["goal-strict-hspu", "goal-strict-ring-mu"],
};

const readinessGreen = {
  date: "2026-06-25",
  recordedAt: "2026-06-25T05:48:00Z",
  subjectiveTier: "GREEN",
  wearable: { source: "bevel", score: 78, scale: "0-100", entryMethod: "synced" },
  hrv: {
    lnRmssd: 4.24,
    rolling7: 4.18,
    swcBand: { low: 4.12, high: 4.3 },
    inBand: true,
    source: "bevel",
  },
  computedTier: "GREEN",
  engineNotes: "One-tap GREEN agrees with in-band HRV.",
};

const readinessRedOverride = {
  date: "2026-07-02",
  recordedAt: "2026-07-02T05:55:00Z",
  subjectiveTier: "RED",
  override: { freeText: "wrecked — brutal work week" },
  computedTier: "RED",
};

describe("unit helpers", () => {
  it("round-trips kg↔lb", () => {
    expect(toLb(96.5)).toBeCloseTo(212.75, 1);
    expect(toKg(toLb(60))).toBeCloseTo(60, 6);
  });
});

describe("schemas accept the spec's example fixtures", () => {
  it("parses the full GREEN session (§4.6)", () => {
    const parsed = Session.parse(fullSession);
    expect(parsed.blocks).toHaveLength(7);
    expect(parsed.blocks[0]?.type).toBe("warmup");
  });

  it("parses the athlete profile (§1.1) with id-array goals/supplements", () => {
    expect(() => AthleteProfile.parse(athleteExample)).not.toThrow();
  });

  it("parses both readiness examples (§6)", () => {
    expect(ReadinessEntry.parse(readinessGreen).computedTier).toBe("GREEN");
    expect(ReadinessEntry.parse(readinessRedOverride).computedTier).toBe("RED");
  });

  it("parses a mesocycle, nutrition target, supplement, and gate tracker", () => {
    expect(() =>
      Mesocycle.parse({ id: "m1", startDate: "2026-06-15", weeks: 6, focus: "pressing" }),
    ).not.toThrow();
    expect(() =>
      NutritionTarget.parse({
        proteinGPerDay: [165, 210],
        emphasis: ["protein first"],
        guidanceOnly: true,
      }),
    ).not.toThrow();
    expect(() =>
      Supplement.parse({ id: "creatine-mono", name: "Creatine", dose: "5 g", timing: "daily" }),
    ).not.toThrow();
    expect(() =>
      GateTracker.parse({
        updatedAt: "2026-06-24T07:05:00Z",
        gates: [
          { goalId: "g1", criterionId: "c1", movement: "wall-hspu-negative", state: "passed" },
        ],
      }),
    ).not.toThrow();
  });
});

describe("discriminated unions reject malformed input", () => {
  it("rejects an unknown block type", () => {
    expect(Block.safeParse({ id: "x", type: "cardio", label: "n/a" }).success).toBe(false);
  });

  it("rejects an unknown load kind", () => {
    expect(LoadPrescription.safeParse({ kind: "newtons", value: 9 }).success).toBe(false);
  });

  it("rejects an unknown timer type and a non-tabata tabata", () => {
    expect(TimerConfig.safeParse({ type: "stopwatch", durationSec: 60 }).success).toBe(false);
    expect(
      TimerConfig.safeParse({ type: "tabata", workSec: 30, restSec: 10, rounds: 8 }).success,
    ).toBe(false);
  });

  it("rejects a bad tier and a malformed ISO date", () => {
    expect(Tier.safeParse("YELLOW").success).toBe(false);
    expect(Session.safeParse({ ...fullSession, date: "June 25" }).success).toBe(false);
  });
});

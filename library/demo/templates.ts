/**
 * Weekly day templates for the demo generator (library/demo).
 *
 * These encode the training-system rules as data, not prose:
 *  - 5-day undulating week: hard / easy / hard / easy / hard — never two grinders back to back.
 *  - No back-to-back MetCons (rail 4): MetCon-heavy days are spaced; easy days run Zone-2 or none.
 *  - Every session opens with a 12–15 min temperature-raising warmup (rail 8).
 *  - Strict-skill/strength placed first while fresh (rail 3).
 *  - Daily mobility, biased to overhead/t-spine then hips/hamstrings/ankles (rail 9).
 *  - Daily ~10–20 min meditation/wellness block as the LAST block and the RED default (rail 11).
 *  - Polarized conditioning (rail 10): a day is sprinty/short OR easy Zone-2, never both.
 *
 * `build.ts` consumes these templates and emits concrete, dated, schema-valid Sessions.
 * Only movement ids from `library/movements` are referenced.
 */
import type { Block, TimerConfig } from "@/library/schema";
import { DEFAULT_TIMER_CUES } from "@/library/schema";

/** A weekday slot's training character, used for assertions and titling. */
export type DayKind = "hard" | "easy";

/** How a day's conditioning is classified for the no-back-to-back-MetCon rail. */
export type ConditioningKind = "metcon" | "zone2" | "sprint" | "none";

/**
 * A day template is a pure description; `build.ts` turns it into a Session.
 * `middleBlocks` are the ordered training blocks placed BETWEEN the warmup
 * (prepended by the builder) and the mobility + meditation tail (appended by
 * the builder), so every emitted session is warmup-first / meditation-last.
 */
export interface DayTemplate {
  /** 0–4 within the Mon–Fri week. */
  dayIndex: number;
  kind: DayKind;
  conditioning: ConditioningKind;
  /** Short title fragment, e.g. "Press Emphasis + Sprinty Couplet". */
  titleFragment: string;
  /** Which mobility target to emphasise this day (rotates across the week). */
  mobilityTarget: "thoracic" | "hip" | "hamstring" | "ankle" | "shoulder" | "general";
  /** The ordered "middle" blocks (strength/gymnastics/conditioning/note). */
  middleBlocks: Block[];
}

const cues = DEFAULT_TIMER_CUES;

/** A standard short sprinty AMRAP (polarized — high quality, short window). */
const sprintyAmrap = (durationSec: number): TimerConfig => ({
  type: "amrap",
  durationSec,
  cues,
});

/** An easy Zone-2 interval piece — explicitly NOT a MetCon (used on easy days). */
const zone2Intervals = (workSec: number, restSec: number, rounds: number): TimerConfig => ({
  type: "intervals",
  workSec,
  restSec,
  rounds,
  cues,
});

/** The pressing-emphasis caffeine/collagen reminder shown on hard skill days. */
const hardDayNote: Block = {
  id: "note-fuel-hard",
  type: "note",
  label: "Reminders — hard day",
  markdown:
    "**Caffeine:** optional ~285 mg (≈3 mg/kg) AM, GREEN day only, cycled — drop it if sleep suffers. " +
    "**Collagen:** 15 g + vitamin C ~45–60 min pre (tendon governor). Protein-first all day.",
};

/** A lighter, fuel-only reminder for easy days (no caffeine prompt). */
const easyDayNote: Block = {
  id: "note-fuel-easy",
  type: "note",
  label: "Reminders — easy day",
  markdown:
    "Easy/strength day — **no caffeine** today (cycle it). Hit the protein target and keep the session unhurried.",
};

/**
 * The five day templates (Mon–Fri). The undulation is:
 *   Mon hard (press skill + sprinty MetCon)
 *   Tue easy (pull strength/skill + Zone-2 base)
 *   Wed hard (press strength + sprint intervals — sprints, spaced from Mon's MetCon)
 *   Thu easy (lower maintenance + accessory, no conditioning)
 *   Fri hard (mixed gymnastics + sprinty MetCon)
 * No two MetCon-heavy days are adjacent; easy days carry Zone-2 or no conditioning.
 */
export const WEEK_TEMPLATES: DayTemplate[] = [
  {
    dayIndex: 0,
    kind: "hard",
    conditioning: "metcon",
    titleFragment: "Press Emphasis + Sprinty Couplet",
    mobilityTarget: "thoracic",
    middleBlocks: [
      {
        id: "skill-hspu",
        type: "gymnastics",
        label: "Strict HSPU progression (priority — first while fresh)",
        movement: "wall-hspu-negative",
        sets: 5,
        reps: 3,
        restSec: 120,
        advancementCriteriaRef: "hspu-negatives-to-deficit",
        qualityNote: "3–5 s eccentric, clean reps only. Never grind to failure.",
        variants: {
          amber: { sets: 3, qualityNote: "No max-effort negatives; stop at first form break." },
          red: "skip",
        },
      },
      {
        id: "strength-db-press",
        type: "strength",
        label: "Seated DB strict press (chest/delts → HSPU + hypertrophy)",
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
        id: "core-antirotation",
        type: "strength",
        label: "Pallof press (anti-rotation — asymmetry lever)",
        movement: "pallof-press",
        sets: 3,
        reps: "10/side",
        loadPrescription: { kind: "band", color: "red" },
        restSec: 45,
        variants: { amber: { sets: 2 }, red: "skip" },
      },
      {
        id: "cond-sprinty-couplet",
        type: "conditioning",
        label: "Sprinty Couplet (short, sharp — polarized)",
        name: "Sprinty Couplet",
        scoreType: "rounds-reps",
        timer: sprintyAmrap(480),
        movements: [
          { movement: "cal-row", reps: 12 },
          { movement: "dumbbell-thruster", reps: 9, load: { kind: "absolute", kg: 22.5 } },
        ],
        variants: {
          amber: {
            label: "Zone-2 trim (~40% volume cut)",
            timer: sprintyAmrap(300),
          },
          red: "skip",
        },
      },
      hardDayNote,
    ],
  },
  {
    dayIndex: 1,
    kind: "easy",
    conditioning: "zone2",
    titleFragment: "Pull Strength + Zone-2 Base",
    mobilityTarget: "shoulder",
    middleBlocks: [
      {
        id: "skill-false-grip",
        type: "gymnastics",
        label: "False-grip work (strict-MU limiter — build patiently)",
        movement: "false-grip-hang",
        sets: 5,
        reps: "max-quality hold",
        restSec: 90,
        advancementCriteriaRef: "false-grip-hang-to-rows",
        qualityNote: "Quality seconds, not max grind. Tendons first.",
        variants: { amber: { sets: 3 }, red: "skip" },
      },
      {
        id: "strength-pull-up",
        type: "gymnastics",
        label: "Strict pull-ups (back/lats → muscle-up)",
        movement: "strict-pull-up",
        sets: 4,
        reps: "5–8",
        restSec: 120,
        qualityNote: "Strict, full dead-hang. Leave 1–2 in the tank.",
        variants: { amber: { sets: 3 }, red: "skip" },
      },
      {
        id: "accessory-suitcase",
        type: "strength",
        label: "Suitcase carry (anti-lateral-flexion — asymmetry)",
        movement: "suitcase-carry",
        sets: 3,
        reps: "30 m/side",
        loadPrescription: { kind: "rir", rir: 3 },
        restSec: 60,
        variants: { amber: { sets: 2 }, red: "skip" },
      },
      {
        id: "cond-zone2",
        type: "conditioning",
        label: "Zone-2 aerobic base (easy — NOT a MetCon)",
        name: "Zone-2 Row",
        scoreType: "cals",
        timer: zone2Intervals(300, 60, 3),
        movements: [{ movement: "row-easy", reps: "steady Zone 2" }],
        variants: {
          amber: { label: "Shorter Zone-2 flush", timer: zone2Intervals(240, 60, 2) },
          red: "skip",
        },
      },
      easyDayNote,
    ],
  },
  {
    dayIndex: 2,
    kind: "hard",
    conditioning: "sprint",
    titleFragment: "Press Strength + Hill Sprints",
    mobilityTarget: "hip",
    middleBlocks: [
      {
        id: "skill-pike-press",
        type: "gymnastics",
        label: "Wall-walk pike press (HSPU build — first while fresh)",
        movement: "wall-pike-press",
        sets: 4,
        reps: "5–6",
        restSec: 120,
        qualityNote: "Steep pike, controlled. Stop before form breaks.",
        variants: { amber: { sets: 3 }, red: "skip" },
      },
      {
        id: "strength-barbell-press",
        type: "strength",
        label: "Barbell strict press (vertical pressing strength)",
        movement: "strict-press",
        sets: 5,
        reps: 5,
        loadPrescription: { kind: "rir", rir: 2 },
        tempo: "20X1",
        rir: 2,
        restSec: 150,
        variants: { amber: { sets: 3, reps: 5 }, red: "skip" },
      },
      {
        id: "hyp-bench",
        type: "strength",
        label: "DB bench press (chest hypertrophy — V-taper goal)",
        movement: "db-bench-press",
        sets: 3,
        reps: "10–12",
        loadPrescription: { kind: "rir", rir: 2 },
        restSec: 90,
        variants: { amber: { sets: 2 }, red: "skip" },
      },
      {
        id: "cond-hill-sprints",
        type: "conditioning",
        label: "Hill sprints (polarized — short, near-max, full recovery)",
        name: "Hill Sprints",
        scoreType: "time",
        timer: { type: "intervals", workSec: 20, restSec: 100, rounds: 8, cues },
        movements: [{ movement: "hill-sprint", reps: "near-max effort" }],
        variants: {
          amber: {
            label: "Sub-max strides",
            timer: { type: "intervals", workSec: 20, restSec: 120, rounds: 5, cues },
          },
          red: "skip",
        },
      },
      hardDayNote,
    ],
  },
  {
    dayIndex: 3,
    kind: "easy",
    conditioning: "none",
    titleFragment: "Lower Maintenance + Accessory",
    mobilityTarget: "ankle",
    middleBlocks: [
      {
        id: "strength-back-squat",
        type: "strength",
        label: "Back squat (lower-body MAINTENANCE — already dominant)",
        movement: "back-squat",
        sets: 3,
        reps: 5,
        loadPrescription: { kind: "rir", rir: 3 },
        restSec: 150,
        scalingNote: "Maintenance dose only — 6–9 hard sets/wk for legs.",
        variants: { amber: { sets: 2 }, red: "skip" },
      },
      {
        id: "hinge-rdl",
        type: "strength",
        label: "Romanian deadlift (posterior chain — controlled, neutral spine)",
        movement: "romanian-deadlift",
        sets: 3,
        reps: "8–10",
        loadPrescription: { kind: "rir", rir: 3 },
        restSec: 120,
        variants: { amber: { sets: 2 }, red: "skip" },
      },
      {
        id: "core-antiext",
        type: "strength",
        label: "Hollow hold (anti-extension core)",
        movement: "hollow-hold",
        sets: 3,
        reps: "30–45 s",
        loadPrescription: { kind: "bodyweight" },
        restSec: 45,
        variants: { amber: { sets: 2 }, red: "skip" },
      },
      easyDayNote,
    ],
  },
  {
    dayIndex: 4,
    kind: "hard",
    conditioning: "metcon",
    titleFragment: "Mixed Gymnastics + Sprinty MetCon",
    mobilityTarget: "hamstring",
    middleBlocks: [
      {
        id: "skill-pull-up-mu",
        type: "gymnastics",
        label: "Strict pull-up / muscle-up transition drill (first while fresh)",
        movement: "false-grip-ring-row",
        sets: 5,
        reps: "5",
        restSec: 120,
        advancementCriteriaRef: "false-grip-hang-to-rows",
        qualityNote: "Maintain false grip through every rep. No grind.",
        variants: { amber: { sets: 3 }, red: "skip" },
      },
      {
        id: "press-pushup",
        type: "gymnastics",
        label: "Strict push-ups (horizontal press — chest)",
        movement: "push-up",
        sets: 4,
        reps: "8–12",
        restSec: 75,
        qualityNote: "Hollow body, full ROM. 1–2 RIR.",
        variants: { amber: { sets: 3 }, red: "skip" },
      },
      {
        id: "cond-sprinty-triplet",
        type: "conditioning",
        label: "Sprinty Triplet (short, sharp — polarized)",
        name: "Sprinty Triplet",
        scoreType: "rounds-reps",
        timer: sprintyAmrap(540),
        movements: [
          { movement: "double-under", reps: 40 },
          { movement: "cal-bike", reps: 10 },
          { movement: "burpee", reps: 8 },
        ],
        variants: {
          amber: { label: "Zone-2 trim (~40% volume cut)", timer: sprintyAmrap(330) },
          red: "skip",
        },
      },
      hardDayNote,
    ],
  },
];

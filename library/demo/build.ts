/**
 * Demo generator (library/demo) — builds a full 6-week rolling Block A from the
 * weekly day templates. This is a code-generated demo rather than ~30 hand-written
 * JSON files: less error-prone, and a precursor to the future `/replan` skill that
 * will emit the same Session shapes (see BUILD-LOG D6).
 *
 * `buildDemoBlock(startISODate)` returns a Mesocycle + ~30 Sessions, all GREEN-gated
 * baselines that the day-of autoregulation engine can downshift. Dates are derived
 * purely from the passed start via UTC arithmetic — no `Date.now()` / `new Date()`
 * with no args — so the output is deterministic and testable.
 */
import type { Block, Mesocycle, Session } from "@/library/schema";
import { WEEK_TEMPLATES, type DayTemplate } from "./templates";

const MESO_ID = "meso-demo-blockA";
const WEEKS = 6;
const DAYS_PER_WEEK = 5;

/** Parse "YYYY-MM-DD" and add `days`, returning a new "YYYY-MM-DD" (UTC, no TZ drift). */
export function addDays(isoDate: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    throw new Error(`addDays: expected YYYY-MM-DD, got "${isoDate}"`);
  }
  const [, y, m, d] = match;
  const base = Date.UTC(Number(y), Number(m) - 1, Number(d));
  const next = new Date(base + days * 24 * 60 * 60 * 1000);
  const yyyy = next.getUTCFullYear().toString().padStart(4, "0");
  const mm = (next.getUTCMonth() + 1).toString().padStart(2, "0");
  const dd = next.getUTCDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** A temperature-raising warmup (rail 8) — dynamic ramp shared across days. */
function warmupBlock(): Block {
  return {
    id: "warmup",
    type: "warmup",
    label: "Temperature-raising ramp (dynamic only)",
    durationMin: 13,
    items: [
      { movement: "row-easy", durationSec: 180, note: "Zone 1, nasal breathing" },
      { movement: "thoracic-extension-opener", durationSec: 60, note: "Open the t-spine first" },
      { movement: "scap-pull-up", reps: 10 },
      { movement: "wall-handstand-hold", durationSec: 30 },
      { movement: "band-press-warmup", reps: 15 },
    ],
  };
}

/** Daily mobility — rotates target across the week; overhead/t-spine prioritised (rail 9). */
function mobilityBlock(template: DayTemplate): Block {
  switch (template.mobilityTarget) {
    case "thoracic":
    case "shoulder":
      return {
        id: "mobility",
        type: "mobility",
        label: "Overhead / t-spine ROM (loaded end-range)",
        target: "thoracic",
        items: [
          { movement: "thoracic-extension-opener", holdSec: 90 },
          {
            movement: "overhead-pvc-pass",
            holdSec: 60,
            loadNote: "PVC or light plate — active reach",
          },
        ],
      };
    case "hip":
      return {
        id: "mobility",
        type: "mobility",
        label: "Hip floor work (loaded end-range)",
        target: "hip",
        items: [
          { movement: "couch-stretch", holdSec: 90, sides: 2 },
          { movement: "ninety-ninety-hip-switch", holdSec: 60, sides: 2 },
        ],
      };
    case "hamstring":
      return {
        id: "mobility",
        type: "mobility",
        label: "Hamstring ROM (light, full-ROM — mind end-range flexion)",
        target: "hamstring",
        items: [
          { movement: "hamstring-floss", holdSec: 60, sides: 2 },
          {
            movement: "jefferson-curl",
            holdSec: 0,
            loadNote:
              "LIGHT load, 5 slow reps — only after physio screen clears end-range spinal flexion",
          },
        ],
      };
    case "ankle":
      return {
        id: "mobility",
        type: "mobility",
        label: "Ankle dorsiflexion + hip flow",
        target: "ankle",
        items: [
          { movement: "ankle-dorsiflexion-rock", holdSec: 60, sides: 2 },
          { movement: "ninety-ninety-hip-switch", holdSec: 45, sides: 2 },
        ],
      };
    default:
      return {
        id: "mobility",
        type: "mobility",
        label: "General mobility flow",
        target: "general",
        items: [
          { movement: "thoracic-extension-opener", holdSec: 60 },
          { movement: "couch-stretch", holdSec: 60, sides: 2 },
        ],
      };
  }
}

/** The daily wellness block — last block + the RED default (rail 11). */
function meditationBlock(): Block {
  return {
    id: "meditation",
    type: "meditation",
    label: "Wellness block (daily, first-class — IS the RED-day session)",
    durationMin: 12,
    bell: { intervalMin: 2, startBell: true, endBell: true, haptics: true },
    breathing: {
      breathsPerMin: 6,
      inhaleSec: 4,
      exhaleSec: 6,
      visual: "expanding-orb",
    },
    guidedUrl: null,
    script:
      "Slow nasal breathing at ~6 breaths/min, exhale longer than inhale. A chime every 2 minutes lands you back in the breath. Eyes soft. This is the key recovery lever — sleep follows.",
  };
}

/**
 * Estimate session minutes from its blocks. Deliberately rough — the schema only
 * needs a positive number, and the runner shows the real clock. Kept ≤ 60 to honour
 * the unhurried 45–60 min envelope.
 */
function estimateMinutes(blocks: Block[]): number {
  let mins = 0;
  for (const b of blocks) {
    switch (b.type) {
      case "warmup":
        mins += b.durationMin;
        break;
      case "meditation":
        mins += b.durationMin;
        break;
      case "mobility":
        mins += 6;
        break;
      case "strength":
      case "gymnastics":
        mins += 9;
        break;
      case "conditioning":
        mins += 10;
        break;
      case "note":
        break;
    }
  }
  return Math.min(60, Math.max(30, mins));
}

/** Build one day's Session from a template + its computed date and week index. */
function buildSession(template: DayTemplate, date: string, weekIndex: number): Session {
  const isDeloadWeek = weekIndex === WEEKS - 1;
  const blocks: Block[] = [
    warmupBlock(),
    ...template.middleBlocks,
    mobilityBlock(template),
    meditationBlock(),
  ];

  const weekLabel = `Week ${weekIndex + 1}${isDeloadWeek ? " (deload)" : ""}`;
  const title = `Block A · ${weekLabel} · Day ${template.dayIndex + 1} — ${template.titleFragment}`;

  const rationale =
    template.kind === "hard"
      ? "Undulated HARD day: strict-skill first while fresh, then pressing strength and a short polarized conditioning hit; daily mobility + wellness close it out."
      : "Undulated EASY day: strength/skill + Zone-2 (or none) — recovery between grinders. No back-to-back MetCons. Mobility + wellness as always.";

  return {
    id: date,
    date,
    title,
    mesocycleId: MESO_ID,
    readinessGate: "GREEN",
    estDurationMin: estimateMinutes(blocks),
    classFit:
      template.conditioning === "metcon"
        ? "Fits a class slot — skill is self-paced, the MetCon is short. Skip a class MetCon if it clashes with the no-back-to-back rail."
        : "Fits a class slot — but this is an easy/strength day; a class MetCon would clash. Advise running the plan as written.",
    rationale,
    blocks,
  };
}

/**
 * Build a full 6-week rolling Block A (pressing emphasis), 5 sessions/week
 * (~30 sessions), each a valid GREEN-baseline Session. Dates increment by calendar
 * day from `startISODate` (Mon–Fri pattern: weeks are 7 days apart, days 1 apart).
 */
export function buildDemoBlock(startISODate: string): {
  mesocycle: Mesocycle;
  sessions: Session[];
} {
  const mesocycle: Mesocycle = {
    id: MESO_ID,
    startDate: startISODate,
    weeks: WEEKS,
    focus: "pressing",
    maintained: ["pulling", "mobility", "conditioning", "lower-body-strength"],
    deloadWeek: WEEKS,
    swcBaseline: {
      metric: "lnRMSSD",
      meanLnRmssd: 4.21,
      sdLnRmssd: 0.18,
      bandLow: 4.12,
      bandHigh: 4.3,
      computedFrom: addDays(startISODate, -1),
      status: "calibrating",
    },
    rationaleRef: "generated/mesocycles/meso-demo-blockA.rationale.md",
  };

  const sessions: Session[] = [];
  for (let week = 0; week < WEEKS; week++) {
    const weekStart = addDays(startISODate, week * 7);
    for (let day = 0; day < DAYS_PER_WEEK; day++) {
      const template = WEEK_TEMPLATES[day];
      if (!template) {
        continue;
      }
      const date = addDays(weekStart, day);
      sessions.push(buildSession(template, date, week));
    }
  }

  return { mesocycle, sessions };
}

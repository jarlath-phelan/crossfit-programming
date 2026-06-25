# Data Model — The Single Source of Truth

*This document is the canonical, implementable specification of every core entity in the system: the athlete profile (with units, nutrition, supplement and readiness-source prefs), the movement library, the session/block schema (with `strength | conditioning | gymnastics | mobility | meditation` block types, timer config and bell/breathing config), the program/mesocycle calendar, the daily readiness entry (one-tap subjective tier + optional wearable score), the nutrition target & supplement guidance, the progress/gate tracker, and the workout log/history. Each entity is given a field table and at least one concrete JSON example.*

This is the **bridge document** referenced by [`architecture.md`](./architecture.md) §3 ("Data model — the single source of truth") and [`training-system.md`](./training-system.md). The software renders and runs from these shapes; the AI coach reads and writes them; the chalkboard and PDF render from them. They must never drift, so this file is the one place the shapes are defined. Fueling rationale lives in [`nutrition.md`](./nutrition.md); the app UX that surfaces these shapes lives in [`functional-design.md`](./functional-design.md); the week 1–2 gate-setting protocol lives in [`testing-protocol.md`](./testing-protocol.md); the "why" behind the priors lives in [`science-foundations.md`](./science-foundations.md).

---

## 0. Conventions

These rules apply to every entity below.

- **Schemas are Zod.** All types live in `library/schema/*.ts` as Zod schemas. Zod does three jobs from one definition: it **validates** human- and AI-authored data, **generates** the TS types the app consumes (`z.infer<typeof Schema>`), and **constrains** AI output to a shape that must parse before it is committed.
- **IDs are stable, kebab-case slugs**, never display strings. `movementId: "strict-hspu"`, not `"Strict Handstand Push-Up"`. Renaming a label never breaks a reference.
- **Dates are ISO 8601.** Calendar dates are `ISODate` = `"YYYY-MM-DD"` (local box date — no timezone games at 6am). Timestamps are full ISO `"YYYY-MM-DDTHH:mm:ssZ"`.
- **Durations are explicit units in the field name.** `durationSec`, `restSec`, `holdSec`, `durationMin`, `timePerSessionMin`. Never a bare number.
- **Loads and bodyweights are stored canonically in kilograms; display is a preference.** Every stored mass is kg (`weightKg`, `loadKg`, `kg`). The UI renders **both lb and kg** (or the athlete's chosen primary) by converting at display time — the data never carries a unit ambiguity. See `units` on the profile (§1) and the conversion note in §0.1.
- **Loads are prescriptions, not just numbers.** A `LoadPrescription` can be an absolute load, a %1RM, an RPE/RIR target, or bodyweight — see §4.3.
- **Three tiers, one enum, everywhere.** `Tier = "GREEN" | "AMBER" | "RED"`. The same three values appear in readiness, scaling variants, and logs.
- **Every block can be autoregulated locally.** Each block carries either explicit `green/amber/red` variants **or** a `scaling` rule, so the runner downshifts offline with zero LLM call (see [`architecture.md`](./architecture.md) §7).
- **Ownership zones** (see [`architecture.md`](./architecture.md) §5): `profile/` and `history/` are athlete/app-owned data; `library/` is the shared engine; `generated/` is AI-owned plan. The app **reads** `generated/` + `profile/`; it **writes** `history/`; it never writes `generated/`.
- **Privacy split is a data-level fact, not just a repo policy.** `profile/` and `history/` hold the athlete's real, identifying data and are **gitignored**; the repo ships only sanitized `*.example.json` templates of those same shapes. `library/` and `generated/` are publishable. See §9.

### 0.1 Shared primitives

```ts
type ISODate   = `${number}-${number}-${number}`;       // "2026-06-25"
type Timestamp = string;                                 // full ISO 8601
type Tier      = "GREEN" | "AMBER" | "RED";
type UUID      = string;

type MovementId   = string;   // kebab-case slug, FK into the movement library
type EquipmentId  = string;   // "barbell" | "rings" | "rig" | "dumbbells" | "rower" | ...
type GoalId       = string;
type MesocycleId  = string;
type SessionId    = string;   // typically the ISODate, optionally suffixed

// Mass is stored in kg everywhere; the UI converts for display.
const LB_PER_KG = 2.2046226218;
const toLb = (kg: number) => kg * LB_PER_KG;     // 96.5 kg → 212.7 lb
const toKg = (lb: number) => lb / LB_PER_KG;     // entry helper when athlete logs in lb
```

### 0.2 Entity map (how things reference each other)

```
AthleteProfile ──owns──▶ Goal[]                         (profile/)
AthleteProfile ──owns──▶ NutritionTarget                (profile/)
AthleteProfile ──owns──▶ Supplement[]                   (profile/)
Movement ◀──referenced by── Block.movement(Id)          (library/)
ProgramCalendar ──contains──▶ Session ──contains──▶ Block[]   (generated/)
Block.ConditioningBlock ──has──▶ TimerConfig
Block.MeditationBlock ──has──▶ BellConfig + PacedBreathing
Session ──belongs to──▶ Mesocycle                       (generated/)
ReadinessEntry ──gates──▶ Session (selects Tier)        (history/)
WorkoutLog ──refs──▶ Session, ──contains──▶ BlockResult[]    (history/)
GateTracker ──reads──▶ WorkoutLog[], ──fires──▶ Goal.advancementCriteria  (history/)
```

---

## 1. AthleteProfile — `profile/athlete.ts`

**Zone:** `profile/` (athlete-owned truth; the primary thing a forker edits). **Gitignored** — the repo ships `profile/athlete.example.json` only (§9).
**Purpose:** Who is training, what they're built like, what they own, what they eat, what they supplement, how they read readiness, and what they're chasing. Read by every `/replan` pass as the top input; never written by the app.

| Field | Type | Req | Description |
|---|---|---|---|
| `id` | `UUID` | ✓ | Stable athlete id. |
| `name` | `string` | ✓ | Display name. |
| `age` | `int` | ✓ | Years. Drives tendon-aware ramp priors (see [`training-system.md`](./training-system.md) §1). |
| `sex` | `"M" \| "F" \| "other"` | ✓ | Used for population HRV/SWC priors and load norms. |
| `heightCm` | `number` | ✓ | Height in cm. |
| `weightKg` | `number` | ✓ | Current bodyweight (kg, canonical). |
| `targetWeightKg` | `number` | — | Goal bodyweight, if any. *(May be omitted — some athletes track by mirror/performance and ignore the scale.)* |
| `bodyfatPct` | `number` | — | Estimated body-fat %. |
| `trainingAgeYears` | `number` | ✓ | Years of consistent training. |
| `chronotype` | `"AM" \| "PM" \| "neutral"` | ✓ | When they train; biases ramp-up + caffeine timing. `"neutral"` = in-between (morning fine, no strong evening penalty). |
| `fiberBias` | `"fast-twitch" \| "slow-twitch" \| "mixed"` | — | Informs rep/intensity bias. |
| `units` | `UnitPrefs` | ✓ | Display-unit preferences (both lb+kg supported). See below. |
| `strengthProfile` | `StrengthProfile` | — | Structural skews (see below). |
| `goals` | `Goal[] \| GoalId[]` | ✓ | Ranked, weighted goals (§2). Usually authored in `profile/goals.ts` and imported. |
| `constraints` | `Constraints` | ✓ | Schedule/time envelope. |
| `equipment` | `EquipmentId[]` | ✓ | What the box/garage has. Authored in `profile/equipment.ts`. |
| `nutrition` | `NutritionPrefs` | — | Diet style + protein target + cooking style. Resolves to a `NutritionTarget` (§8). |
| `supplements` | `Supplement[] \| SupplementId[]` | — | Supplement stack (§8.2). |
| `protocols` | `Protocols` | — | Caffeine/collagen/etc. toggles surfaced as NoteBlocks. |
| `readinessPrefs` | `ReadinessPrefs` | ✓ | Readiness-source order + SWC band config + subjective prefs. Authored in `profile/readiness-prefs.ts`. |
| `benchmarks` | `Record<string, string \| number>` | — | Named benchmark results / 1RMs (`"Fran": "3:30"`, `"strictPress1RM": 70`). Numeric loads are kg. |

```ts
UnitPrefs {
  primary: "lb" | "kg";       // which unit leads in the UI (the big number)
  showBoth: boolean;          // true → render the secondary unit alongside (e.g. "60 kg (132 lb)")
  loadRoundingKg?: number;    // snap displayed plate math, e.g. 1.25 (kg) for barbell increments
}

StrengthProfile {
  lowerBodyDominant?: boolean;
  upperPushDominant?: boolean;
  upperPullDominant?: boolean;
  posteriorChainStrong?: boolean;
  asymmetryNote?: string;     // e.g. structural L/R imbalance → unilateral + anti-rotation bias
  notes?: string;
}

Constraints {
  sessionsPerWeekMin: number;     // busy-week floor, e.g. 2
  sessionsPerWeekTarget?: number; // preferred cadence, e.g. 5
  sessionsPerWeekMax: number;     // e.g. 6
  timePerSessionMin: number;      // minutes available per session, e.g. 60
  unhurried?: boolean;            // true → pad transitions; don't pack the session go-go-go
  noBackToBackMetcons?: boolean;  // true → never schedule MetCon-heavy days adjacent
  hardConstraints?: string[];     // free-text non-negotiables, e.g. ["no heavy end-range spinal flexion until physio screen"]
}

Protocols {
  caffeine?: { use: boolean; mgPerHardDay?: number; onlyOnTiers?: Tier[]; amOnly?: boolean; cycle?: boolean };
  collagen?: { use: boolean; gramsPerDay?: number; timingNote?: string };
  [k: string]: unknown;           // extensible
}
```

`ReadinessPrefs` now leads with an explicit **source order** so the day-of engine knows what to trust and in what fallback order (wearable score → other wearable → manual tap). The manual override still always wins.

```ts
ReadinessPrefs {
  // Ordered: the engine reads the first available source each morning, else falls through.
  sourceOrder: ReadinessSource[];   // e.g. ["bevel", "whoop", "manual"]
  swc: {
    metric: "lnRMSSD";
    bootstrapDays: number;        // familiarization window, e.g. 14 → "still calibrating" note
    bandSdMultiplier: number;     // GREEN band = mean ± (multiplier × SD), e.g. 0.5
    rollingDays: number;          // rolling average window, e.g. 7
  };
  subjective: {
    mode: "one-tap" | "hooper-1-7";  // one-tap = single overall feel; hooper = 4-axis detail
    oneTapTiers: Tier[];             // the tap options, e.g. ["GREEN","AMBER","RED"]
    allowOptionalScore: boolean;     // true → athlete may also type a wearable score
  };
  manualOverrideWins: boolean;       // true — subjective/override beats wearable
}

type ReadinessSource = "bevel" | "whoop" | "healthkit" | "manual";
```

> **One-tap is the default friction floor.** The morning check-in is a single overall-feel tap (`GREEN`/`AMBER`/`RED`). If a wearable has synced an overnight score, the athlete may *optionally* type/confirm the number (`allowOptionalScore`), and the engine blends it; if nothing synced, the tap alone gates the day. This mirrors `ReadinessEntry` in §6.

### 1.1 Example — `profile/athlete.json` (gitignored; shipped as `athlete.example.json`)

```json
{
  "id": "athlete-example",
  "name": "Example Athlete",
  "age": 39,
  "sex": "M",
  "heightCm": 188,
  "weightKg": 96.5,
  "bodyfatPct": 13,
  "trainingAgeYears": 12,
  "chronotype": "neutral",
  "fiberBias": "fast-twitch",
  "units": { "primary": "lb", "showBoth": true, "loadRoundingKg": 1.25 },
  "strengthProfile": {
    "lowerBodyDominant": true,
    "posteriorChainStrong": true,
    "asymmetryNote": "Structural L/R imbalance → unilateral + anti-rotation emphasis; conservative spinal loading until cleared."
  },
  "constraints": {
    "sessionsPerWeekMin": 2,
    "sessionsPerWeekTarget": 5,
    "sessionsPerWeekMax": 6,
    "timePerSessionMin": 60,
    "unhurried": true,
    "noBackToBackMetcons": true,
    "hardConstraints": ["build strict before kipping", "legs at maintenance only", "no heavy end-range spinal flexion until physio screen"]
  },
  "equipment": ["barbell", "dumbbells", "rig", "rings", "rower", "bike-erg", "ski-erg", "ghd", "bands", "ab-mat"],
  "nutrition": {
    "pattern": "omnivore",
    "approach": "protein-first",
    "proteinTargetGPerKg": [1.6, 2.2],
    "cookingStyle": "mixed-fast",
    "alcohol": "social-weekends",
    "logging": "none"
  },
  "supplements": ["creatine-mono", "whey", "collagen-vitc", "vitamin-d", "omega-3"],
  "protocols": {
    "caffeine": { "use": true, "mgPerHardDay": 285, "onlyOnTiers": ["GREEN"], "amOnly": true, "cycle": true },
    "collagen": { "use": true, "gramsPerDay": 15, "timingNote": "~45–60 min pre-session with vitamin C" }
  },
  "readinessPrefs": {
    "sourceOrder": ["bevel", "whoop", "manual"],
    "swc": { "metric": "lnRMSSD", "bootstrapDays": 14, "bandSdMultiplier": 0.5, "rollingDays": 7 },
    "subjective": { "mode": "one-tap", "oneTapTiers": ["GREEN", "AMBER", "RED"], "allowOptionalScore": true },
    "manualOverrideWins": true
  },
  "benchmarks": { "Fran": "3:30", "Grace": "1:45" },
  "goals": ["goal-strict-hspu", "goal-strict-ring-mu", "goal-chest-back", "goal-hip-ham-rom", "goal-conditioning-maint"]
}
```

> Notes: `goals` and `supplements` may be authored inline as objects or, as above, as arrays of ids resolved from `profile/goals.ts` / `profile/supplements.ts`. Both forms validate; the build step resolves ids to objects. `benchmarks` intentionally omits self-estimated 1RMs until they're measured in the week 1–2 testing block (see [`testing-protocol.md`](./testing-protocol.md)) — don't fabricate gate numbers.

---

## 2. Goal — `profile/goals.ts`

**Zone:** `profile/`.
**Purpose:** A ranked, weighted, **data-gated** objective. The `advancementCriteria` is what the AI fires against logged history to progress a movement (e.g. "5 clean wall-HSPU negatives → progress to deficit"). This is the hook that makes progression data-driven, not calendar-driven.

| Field | Type | Req | Description |
|---|---|---|---|
| `id` | `GoalId` | ✓ | Stable slug. |
| `label` | `string` | ✓ | Human-readable. |
| `type` | `"skill" \| "strength" \| "hypertrophy" \| "mobility" \| "wellness"` | ✓ | Category; routes the goal into the right block types. |
| `weight` | `number` (0–1) | ✓ | Relative priority used to bias volume allocation. |
| `targetMovement` | `MovementId` | — | The movement this goal advances, if applicable. |
| `advancementCriteria` | `AdvancementCriterion[]` | — | Data-gated rungs the AI tests against `history/`. |
| `metric` | `string` | — | What "done"/progress means (`"ROM degrees"`, `"strict reps"`, `"mirror/performance"`). |
| `retestEveryDays` | `number` | — | For mobility/ROM goals: re-test cadence (periodic, not continuous), e.g. 28. |
| `notes` | `string` | — | Free text / rationale. |

```ts
AdvancementCriterion {
  id: string;
  description: string;            // "5 clean wall-HSPU negatives in a session"
  whenMovement: MovementId;
  metric: "reps" | "load" | "time" | "rom" | "rir" | "clean-reps";
  comparator: ">=" | ">" | "==" | "<=" | "<";
  threshold: number;
  overSessions?: number;          // must hold across N logged sessions
  thenAdvanceTo?: MovementId;     // next progression rung
}
```

### 2.1 Example — `profile/goals.ts`

```json
[
  {
    "id": "goal-strict-hspu",
    "label": "Strict handstand push-up",
    "type": "skill",
    "weight": 0.30,
    "targetMovement": "strict-hspu",
    "metric": "strict reps",
    "advancementCriteria": [
      {
        "id": "hspu-negatives-to-deficit",
        "description": "5 clean wall HSPU negatives in one session",
        "whenMovement": "wall-hspu-negative",
        "metric": "clean-reps",
        "comparator": ">=",
        "threshold": 5,
        "overSessions": 1,
        "thenAdvanceTo": "deficit-hspu-negative"
      }
    ]
  },
  {
    "id": "goal-hip-ham-rom",
    "label": "Hip & hamstring range of motion",
    "type": "mobility",
    "weight": 0.15,
    "metric": "ROM degrees / feel",
    "retestEveryDays": 28,
    "notes": "Light loaded end-range; RED-day default. Re-test toe-touch / overhead / dorsiflexion every ~4 wks, not daily. Sold as 'feels better,' not 'less soreness.'"
  }
]
```

---

## 3. Movement — `library/movements/`

**Zone:** `library/` (shared; forkers inherit, may extend). **Publishable.**
**Purpose:** The reusable exercise catalogue. Blocks reference movements by id. Each movement carries its **progression chain** and **per-tier scaling**, so a block can downshift a single movement without re-authoring the block.

| Field | Type | Req | Description |
|---|---|---|---|
| `id` | `MovementId` | ✓ | Stable slug, referenced by blocks and goals. |
| `name` | `string` | ✓ | Display name. |
| `category` | `"strength" \| "gymnastics" \| "conditioning" \| "mobility" \| "meditation" \| "accessory"` | ✓ | Primary classification; aligns with block types. |
| `pattern` | `string` | — | Movement pattern (`"vertical-press"`, `"pull"`, `"hinge"`, `"squat"`, `"core-anti-extension"`, `"core-anti-rotation"`, …) for volume-per-pattern accounting. |
| `equipment` | `EquipmentId[]` | ✓ | Required equipment (empty `[]` = bodyweight). |
| `progressions` | `MovementId[]` | — | Ordered easier→harder chain. |
| `scaling` | `MovementScaling` | — | How to downshift this movement per tier. |
| `loadsTendon` | `boolean` | — | Flags tendon-governed movements for conservative ramp (≤~10%/wk). |
| `cues` | `string[]` | — | Coaching cues shown in the runner. |
| `demoUrl` | `string` | — | Demo video/image. |

```ts
MovementScaling {
  green: { movement?: MovementId; note?: string };
  amber: { movement?: MovementId; note?: string };
  red:   { movement?: MovementId; note?: string };
}
```

### 3.1 Example — `library/movements/strict-hspu.json`

```json
{
  "id": "strict-hspu",
  "name": "Strict Handstand Push-Up",
  "category": "gymnastics",
  "pattern": "vertical-press",
  "equipment": ["rig", "ab-mat"],
  "progressions": ["box-pike-press", "wall-pike-press", "deficit-hspu-negative", "wall-hspu-negative", "strict-hspu"],
  "scaling": {
    "green": { "note": "Full strict reps, fresh, first in session." },
    "amber": { "movement": "wall-hspu-negative", "note": "Eccentric-only, no max-effort negatives." },
    "red":   { "movement": "box-pike-press", "note": "Skip if shoulder/wrist flagged; default to mobility." }
  },
  "loadsTendon": true,
  "cues": ["Hollow body", "Head through at top", "Control the descent — no crash"],
  "demoUrl": "https://example.com/demo/strict-hspu.mp4"
}
```

---

## 4. Session & Block schema — `library/schema/session.ts`

**Zone:** schema in `library/`; instances live in `generated/calendar/`.
**Purpose:** A **Session is one day** — an ordered list of typed **Blocks**. Every block is both **renderable** (screen / chalkboard / PDF) and **runnable** (the runner walks them in order). There is no separate display format.

### 4.1 Session

| Field | Type | Req | Description |
|---|---|---|---|
| `id` | `SessionId` | ✓ | Usually the `ISODate`. |
| `date` | `ISODate` | ✓ | The calendar day. |
| `title` | `string` | ✓ | Display title for the home card / board. |
| `mesocycleId` | `MesocycleId` | ✓ | The block this day belongs to (§5). |
| `readinessGate` | `Tier` | ✓ | The tier this session was **authored for** (the planned/GREEN baseline). The runner may downshift it day-of. |
| `estDurationMin` | `number` | ✓ | Estimated total minutes. |
| `classFit` | `string` | — | Advisory: which box class slot this day's plan fits (e.g. "fits 6:30am or 12pm class"). |
| `blocks` | `Block[]` | ✓ | Ordered blocks. |
| `rationale` | `string` | — | One-line "why this today" from the AI, shown in the transparency UI. |

### 4.2 Block (discriminated union on `type`)

Every block shares a common envelope and is discriminated by `type`. Each block carries **either** explicit `variants` (per-tier replacements) **or** an inline `scaling` rule — this is what lets the runner autoregulate offline.

```ts
BlockBase {
  id: string;
  type: "warmup" | "strength" | "gymnastics" | "conditioning" | "mobility" | "meditation" | "note";
  label: string;
  variants?: { amber?: Partial<Block>; red?: Partial<Block> | "skip" };
  scalingNote?: string;
}
```

| `type` | Entity | Drives |
|---|---|---|
| `warmup` | `WarmupBlock` | A temperature-raising ramp-up checklist (dynamic only — no long static pre-lift). |
| `strength` | `StrengthBlock` | Sets × reps × load × tempo × RIR × rest. |
| `gymnastics` | `GymnasticsSkillBlock` | Skill progression work with advancement criteria. |
| `conditioning` | `ConditioningBlock` | A MetCon **driven by a `TimerConfig`** (§4.4). |
| `mobility` | `MobilityBlock` | Held/loaded end-range positions. |
| `meditation` | `MeditationBlock` | Interval-bell timer + optional paced breathing (§4.5). The default RED-day session. |
| `note` | `NoteBlock` | Markdown — caffeine/collagen reminders, rationale. |

### 4.3 Per-type fields

```ts
WarmupBlock extends BlockBase {
  type: "warmup";
  durationMin: number;              // temperature-raising ramp, typically 12–15
  items: { movement: MovementId; reps?: number; durationSec?: number; note?: string }[];
}

StrengthBlock extends BlockBase {
  type: "strength";
  movement: MovementId;
  sets: number;
  reps: number | string;            // 8, or "8–10", or "AMRAP" for the last set
  loadPrescription: LoadPrescription;
  tempo?: string;                   // "31X1" (ecc-pause-con-pause)
  rir?: number;                     // reps in reserve target
  restSec: number;
}

GymnasticsSkillBlock extends BlockBase {
  type: "gymnastics";
  movement: MovementId;
  sets: number;
  reps: number | string;
  restSec: number;
  advancementCriteriaRef?: string;  // id into a Goal.advancementCriteria[]
  qualityNote?: string;             // "1–3 RIR, never grind to failure"
}

ConditioningBlock extends BlockBase {
  type: "conditioning";
  name: string;                     // "Sprinty Couplet", "Grace"
  timer: TimerConfig;               // §4.4 — drives the runner FSM, carries cue/haptic flags
  movements: {
    movement: MovementId;
    reps?: number | string;
    load?: LoadPrescription;
    scaling?: MovementScaling;      // overrides the movement's own scaling for this WOD
  }[];
  scoreType: "rounds-reps" | "time" | "reps" | "load" | "cals";
}

MobilityBlock extends BlockBase {
  type: "mobility";
  target: "hip" | "hamstring" | "shoulder" | "thoracic" | "ankle" | "general";
  items: { movement: MovementId; holdSec: number; sides?: 1 | 2; loadNote?: string }[];
}

NoteBlock extends BlockBase {
  type: "note";
  markdown: string;
}
```

```ts
// LoadPrescription — one of (all masses in kg):
LoadPrescription =
  | { kind: "absolute"; kg: number }
  | { kind: "percent1RM"; pct: number; of: string }   // of = benchmark key, e.g. "backSquat1RM"
  | { kind: "rpe"; rpe: number }
  | { kind: "rir"; rir: number }
  | { kind: "bodyweight"; addedKg?: number }
  | { kind: "band"; color: string };
```

### 4.4 TimerConfig — drives the runner FSM

**Purpose:** A declarative timer definition. The runner's finite state machine (`countdown → work → rest → round → done`) is driven entirely by this config — never hand-coded per workout — so **every** generated WOD is instantly runnable and instantly printable. The same FSM ports to the Watch.

Cue behaviour is **authored on the config** (not silently layered by the runner) so a printed/shared WOD declares its own loud-beep and haptic intent, and a forker can default it once.

| Variant | Fields | Meaning |
|---|---|---|
| `amrap` | `durationSec` | As many rounds/reps as possible in a fixed window. |
| `for-time` | `capSec`, `rounds?` | Complete the work for time, with a time cap. |
| `emom` | `intervalSec`, `rounds`, `slots?` | Every minute (or interval) on the minute; optional per-slot movement rotation. |
| `intervals` | `workSec`, `restSec`, `rounds` | Generic work/rest intervals (sprints, hill repeats, Zone-2 pieces). |
| `tabata` | `workSec` (20), `restSec` (10), `rounds` (8) | Tabata preset. |

```ts
TimerCues {
  countdownSec: number;     // lead-in count, e.g. 3
  loudCue: boolean;         // loud beeps on every boundary (start/round/work↔rest/done)
  haptics: boolean;         // device vibration on every boundary (phone-driven for now)
  wakeLock: boolean;        // keep the screen awake for the duration (gym-display friendly)
}

type TimerConfig =
  | { type: "amrap";     durationSec: number;                                cues?: TimerCues }
  | { type: "for-time";  capSec: number; rounds?: number;                    cues?: TimerCues }
  | { type: "emom";      intervalSec: number; rounds: number;
                          slots?: { movement: MovementId; reps: number }[];  cues?: TimerCues }
  | { type: "intervals"; workSec: number; restSec: number; rounds: number;   cues?: TimerCues }
  | { type: "tabata";    workSec: 20; restSec: 10; rounds: 8;                cues?: TimerCues };

// If `cues` is omitted, the runner applies the athlete's default:
//   { countdownSec: 3, loudCue: true, haptics: true, wakeLock: true }
```

### 4.5 MeditationBlock — interval bell + optional paced breathing

**Purpose:** The daily wellness block is **first-class programming** and the **default RED-day session**. It supports two independent, composable mechanisms:

1. **Interval bell** — a total session duration with a recurring chime every *N* minutes (a 1–5 min interval bell, like a Zen/Insight-timer setup). Unguided by default.
2. **Optional paced breathing** — a breathing pacer at ~6 breaths/min (0.1 Hz resonance frequency) for sleep/recovery, with explicit inhale/exhale seconds.

A block may use the bell alone (silent sit), the breathing pacer alone, or both together.

```ts
MeditationBlock extends BlockBase {
  type: "meditation";
  durationMin: number;              // total length of the sit
  bell?: BellConfig;                // interval-bell timer (may be used alone)
  breathing?: PacedBreathing;       // optional paced-breathing pacer (may be used alone)
  guidedUrl?: string;               // occasional external link (e.g. a Calm session); default unguided
  script?: string;                  // optional shown/spoken text
}

BellConfig {
  intervalMin: 1 | 2 | 3 | 4 | 5;   // chime every N minutes
  startBell: boolean;               // chime at start
  endBell: boolean;                 // chime at end
  haptics?: boolean;                // also buzz on each bell (phone-driven)
}

PacedBreathing {
  breathsPerMin: number;            // ~6 (resonance); 0.1 Hz
  inhaleSec: number;                // e.g. 4
  exhaleSec: number;                // e.g. 6  (exhale ≥ inhale for vagal bias)
  holdInSec?: number;
  holdOutSec?: number;
  visual: "expanding-orb" | "rising-bar" | "wave" | "none";  // the on-screen pacer
}
```

### 4.6 Full example — a complete GREEN session: conditioning block with timer + meditation block with bell + breathing

`generated/calendar/2026-06-25.json`

```json
{
  "id": "2026-06-25",
  "date": "2026-06-25",
  "title": "Block A · Day 2 — Press Emphasis + Sprinty Couplet",
  "mesocycleId": "meso-2026-06-blockA",
  "readinessGate": "GREEN",
  "estDurationMin": 58,
  "classFit": "fits 6:30am or 12pm class — skill is self-paced, MetCon is short",
  "rationale": "HRV in band + good sleep → full strict HSPU work fresh, sprinty MetCon, daily wellness block.",
  "blocks": [
    {
      "id": "b1-warmup",
      "type": "warmup",
      "label": "Temperature-raising ramp (dynamic only)",
      "durationMin": 13,
      "items": [
        { "movement": "row-easy", "durationSec": 180, "note": "Zone 1, nasal breathing" },
        { "movement": "scap-pull-up", "reps": 10 },
        { "movement": "wall-handstand-hold", "durationSec": 30 },
        { "movement": "band-press-warmup", "reps": 15 }
      ]
    },
    {
      "id": "b2-strength-skill",
      "type": "gymnastics",
      "label": "Strict HSPU progression (priority — first while fresh)",
      "movement": "wall-hspu-negative",
      "sets": 5,
      "reps": 3,
      "restSec": 120,
      "advancementCriteriaRef": "hspu-negatives-to-deficit",
      "qualityNote": "3–5 s eccentric, clean reps only. Never grind to failure.",
      "variants": {
        "amber": { "sets": 3, "qualityNote": "No max-effort negatives; stop at first form break." },
        "red": "skip"
      }
    },
    {
      "id": "b3-strength",
      "type": "strength",
      "label": "Seated DB strict press (chest/delts — counts toward HSPU + hypertrophy)",
      "movement": "seated-db-strict-press",
      "sets": 4,
      "reps": "8–10",
      "loadPrescription": { "kind": "rir", "rir": 2 },
      "tempo": "31X1",
      "rir": 2,
      "restSec": 90,
      "variants": { "amber": { "sets": 3 }, "red": "skip" }
    },
    {
      "id": "b4-conditioning",
      "type": "conditioning",
      "label": "Sprinty Couplet",
      "name": "Sprinty Couplet",
      "scoreType": "rounds-reps",
      "timer": {
        "type": "amrap",
        "durationSec": 480,
        "cues": { "countdownSec": 3, "loudCue": true, "haptics": true, "wakeLock": true }
      },
      "movements": [
        { "movement": "cal-row", "reps": 12 },
        { "movement": "dumbbell-thruster", "reps": 9, "load": { "kind": "absolute", "kg": 22.5 } }
      ],
      "variants": {
        "amber": {
          "label": "Zone 2 trim (~40% volume cut)",
          "timer": { "type": "amrap", "durationSec": 300, "cues": { "countdownSec": 3, "loudCue": true, "haptics": true, "wakeLock": true } }
        },
        "red": "skip"
      }
    },
    {
      "id": "b5-mobility",
      "type": "mobility",
      "label": "Hip & hamstring floor work (loaded end-range)",
      "target": "hip",
      "items": [
        { "movement": "couch-stretch", "holdSec": 90, "sides": 2 },
        { "movement": "jefferson-curl", "holdSec": 0, "loadNote": "LIGHT load, 5 slow reps — only after physio screen clears end-range spinal flexion" },
        { "movement": "90-90-hip-switch", "holdSec": 60, "sides": 2 }
      ]
    },
    {
      "id": "b6-meditation",
      "type": "meditation",
      "label": "Wellness block (daily, first-class — IS the RED-day session)",
      "durationMin": 10,
      "bell": { "intervalMin": 2, "startBell": true, "endBell": true, "haptics": true },
      "breathing": {
        "breathsPerMin": 6,
        "inhaleSec": 4,
        "exhaleSec": 6,
        "visual": "expanding-orb"
      },
      "guidedUrl": null,
      "script": "Slow nasal breathing at ~6 breaths/min, exhale longer than inhale. A chime every 2 minutes; let it land you back in the breath. Eyes soft."
    },
    {
      "id": "b7-note",
      "type": "note",
      "label": "Reminders",
      "markdown": "**Caffeine:** ~285 mg (3 mg/kg) taken AM pre-session — GREEN day only, cycled. **Collagen:** 15 g + vitamin C ~45–60 min pre. Re-test HSPU gate at end of this block (week 6 deload)."
    }
  ]
}
```

> **How the runner uses this:** it walks `blocks` in order. On `b4-conditioning` the **timer takes over** — the AMRAP FSM runs an 8-minute window (`durationSec: 480`), counts down 3, fires loud beeps + haptics on each round boundary, holds a screen wake-lock (good on the iPad gym display), and captures `rounds-reps` on stop. On `b6-meditation` it shows the expanding-orb pacer at 6 breaths/min (4 s in / 6 s out) **and** chimes every 2 minutes for a 10-minute sit. If the athlete sets the day to AMBER, the runner swaps each block for its `variants.amber`; on RED, blocks marked `"skip"` drop out and the session collapses to mobility + the meditation block — **never zero** (and even that is an *offer*, not a mandate; a true full rest day is allowed).

---

## 5. Mesocycle & ProgramCalendar — `generated/`

**Zone:** `generated/` (AI-owned, git-tracked). **Publishable** (no identifying data).
**Purpose:** The program structure. A `Mesocycle` is a rolling 6-week emphasis block (no peaking); the `ProgramCalendar` is the dated map of `Session`s the AI fills on a rolling window (past sessions immutable, next 1–2 weeks rewritten).

### 5.1 Mesocycle — `generated/mesocycles/*.json`

| Field | Type | Req | Description |
|---|---|---|---|
| `id` | `MesocycleId` | ✓ | Stable slug. |
| `startDate` | `ISODate` | ✓ | Block start. |
| `weeks` | `number` | ✓ | Length (typically 6). |
| `focus` | `string` | ✓ | Primary emphasis (`"pressing"`, `"pulling"`, `"integration"`). |
| `maintained` | `string[]` | — | What runs at maintenance this block. |
| `deloadWeek` | `number` | — | Which week deloads (autoregulated; may pull earlier). |
| `swcBaseline` | `SwcBaseline` | — | The HRV band this block was planned against. |
| `rationaleRef` | `string` | — | Path to `rationale.md` for this block. |

```ts
SwcBaseline {
  metric: "lnRMSSD";
  meanLnRmssd: number;
  sdLnRmssd: number;
  bandLow: number;       // mean − multiplier×SD
  bandHigh: number;      // mean + multiplier×SD
  computedFrom: ISODate; // last re-baseline date
  status: "calibrating" | "established";  // "calibrating" during first ~14 days
}
```

```json
{
  "id": "meso-2026-06-blockA",
  "startDate": "2026-06-15",
  "weeks": 6,
  "focus": "pressing",
  "maintained": ["pulling", "mobility", "conditioning", "lower-body-strength"],
  "deloadWeek": 6,
  "swcBaseline": {
    "metric": "lnRMSSD",
    "meanLnRmssd": 4.21,
    "sdLnRmssd": 0.18,
    "bandLow": 4.12,
    "bandHigh": 4.30,
    "computedFrom": "2026-06-14",
    "status": "established"
  },
  "rationaleRef": "generated/mesocycles/meso-2026-06-blockA.rationale.md"
}
```

### 5.2 ProgramCalendar — `generated/calendar/`

A `ProgramCalendar` is the keyed map of dates → sessions. In the repo it is stored as one file per day (`generated/calendar/<ISODate>.json`); the build step assembles them into the in-memory shape below.

| Field | Type | Req | Description |
|---|---|---|---|
| `sessionsByDate` | `Record<ISODate, Session>` | ✓ | Dated sessions. The AI writes the rolling window; past dates are immutable. |
| `windowStart` | `ISODate` | — | First day of the currently mutable rolling window. |
| `windowEnd` | `ISODate` | — | Last planned day. |

```json
{
  "windowStart": "2026-06-25",
  "windowEnd": "2026-07-08",
  "sessionsByDate": {
    "2026-06-25": { "id": "2026-06-25", "date": "2026-06-25", "title": "Block A · Day 2 — Press Emphasis + Sprinty Couplet", "mesocycleId": "meso-2026-06-blockA", "readinessGate": "GREEN", "estDurationMin": 58, "blocks": [] }
  }
}
```

> The `blocks: []` above is elided for brevity — each dated entry is a full `Session` exactly like §4.6.

---

## 6. ReadinessEntry — `history/readiness/`

**Zone:** `history/` (athlete/app-owned feedback). **Gitignored** — shipped as `readiness.example.json` only.
**Purpose:** One daily check-in. Feeds the **deterministic, offline** autoregulation function `(ReadinessEntry, ReadinessPrefs) → Tier` (see [`architecture.md`](./architecture.md) §7). The check-in is **one-tap by default** — a single overall-feel tier — with an **optional numeric wearable score** (Bevel/Whoop) carried alongside, tagged with its source. The **manual override (the tap) always wins**.

| Field | Type | Req | Description |
|---|---|---|---|
| `date` | `ISODate` | ✓ | The day. |
| `recordedAt` | `Timestamp` | ✓ | When the check-in happened (morning). |
| `subjectiveTier` | `Tier` | ✓ | The one-tap overall-feel selection. This is the manual signal. |
| `subjectiveDetail` | `Subjective` | — | Optional 4-axis Hooper detail, if the athlete opted into `hooper-1-7` mode. |
| `wearable` | `WearableScore` | — | Optional numeric overnight readiness/recovery score with its source. |
| `hrv` | `Hrv` | — | Optional raw HRV trend (when a source exposes lnRMSSD vs. just a composite score). |
| `override` | `Tier \| { freeText: string }` | — | Explicit manual override; free text like `"exhausted, busy day"` forces a downshift and always wins. |
| `computedTier` | `Tier` | ✓ | The output of the rule engine — the tier the runner gates on. |
| `engineNotes` | `string` | — | Why the engine landed on this tier (transparency); includes the "still calibrating" note in the first ~14 days. |

```ts
// One-tap is the default. The 4-axis detail is optional and only present in hooper mode.
Subjective {
  sleep: 1|2|3|4|5|6|7;        // 1 = best, 7 = worst (Hooper convention)
  soreness: 1|2|3|4|5|6|7;
  stress: 1|2|3|4|5|6|7;
  energy: 1|2|3|4|5|6|7;
}

// Optional numeric wearable score (Bevel/Whoop). `score` is the app-facing composite; `scale` says how to read it.
WearableScore {
  source: "bevel" | "whoop" | "healthkit";
  score: number;              // the typed/synced number, e.g. 62 (Whoop recovery %), 78 (Bevel readiness)
  scale: "0-100" | "z" | "ms";
  syncedAt?: Timestamp;       // when the wearable produced it
  entryMethod: "synced" | "typed";  // typed = athlete entered it by hand (hybrid input)
}

Hrv {
  rmssd?: number;             // raw ms
  lnRmssd?: number;
  rolling7?: number;          // 7-day rolling lnRMSSD
  swcBand?: { low: number; high: number };
  inBand?: boolean;
  source?: "bevel" | "whoop" | "healthkit" | "manual";
}
```

### 6.1 Example — a one-tap GREEN day with a synced wearable score — `history/readiness/2026-06-25.json`

```json
{
  "date": "2026-06-25",
  "recordedAt": "2026-06-25T05:48:00Z",
  "subjectiveTier": "GREEN",
  "wearable": {
    "source": "bevel",
    "score": 78,
    "scale": "0-100",
    "syncedAt": "2026-06-25T05:30:00Z",
    "entryMethod": "synced"
  },
  "hrv": {
    "lnRmssd": 4.24,
    "rolling7": 4.18,
    "swcBand": { "low": 4.12, "high": 4.30 },
    "inBand": true,
    "source": "bevel"
  },
  "computedTier": "GREEN",
  "engineNotes": "One-tap GREEN agrees with in-band HRV (4.24 within 4.12–4.30) and Bevel score 78 → GREEN. Session in §4.6 runs as authored."
}
```

### 6.2 Example — a one-tap RED override, no wearable synced (manual tap wins) — `history/readiness/2026-07-02.json`

```json
{
  "date": "2026-07-02",
  "recordedAt": "2026-07-02T05:55:00Z",
  "subjectiveTier": "RED",
  "override": { "freeText": "wrecked — brutal work week, slept 5h restless" },
  "computedTier": "RED",
  "engineNotes": "No wearable synced this morning; one-tap RED + manual override → RED (override always wins). Session collapses to hip/hamstring mobility + 10–20 min wellness breathing; a true rest day is also allowed. Bank HSPU negatives for the next GREEN day."
}
```

> During the first ~14 days there is no personal SWC baseline, so `engineNotes` carries a "still calibrating — leaning on your tap" message and the engine trusts the subjective tier over any wearable number. See [`testing-protocol.md`](./testing-protocol.md).

---

## 7. WorkoutLog & BlockResult — `history/logs/`

**Zone:** `history/` (app-owned, committed back for the AI). **Gitignored** — shipped as `log.example.json` only.
**Purpose:** What actually happened. This is the **feedback loop**: the AI reads logs to fire advancement criteria, re-baseline the SWC, and reason over trends — not prose. Logging is deliberately light: a **quick "done + how it felt"** per block plus the timer/key result. Written locally to IndexedDB as the session runs, then serialized to a file.

| Field | Type | Req | Description |
|---|---|---|---|
| `id` | `UUID` | ✓ | Log id. |
| `date` | `ISODate` | ✓ | Day trained. |
| `sessionRef` | `SessionId` | ✓ | The session that was run. |
| `tierUsed` | `Tier` | ✓ | The tier actually trained at (after any day-of override). |
| `startedAt` | `Timestamp` | ✓ | Session start. |
| `completedAt` | `Timestamp` | — | Session end (absent if abandoned). |
| `results` | `BlockResult[]` | ✓ | Per-block outcomes (ordered as run). |
| `feltOverall` | `1\|2\|3\|4\|5` | — | The quick "how it felt" overall rating (1 = great, 5 = rough). |
| `benchmarkPRs` | `{ name: string; value: string \| number }[]` | — | Any PRs hit. |
| `painFlags` | `PainFlag[]` | — | Flagged joints → AI auto-cuts the offending volume. |
| `notes` | `string` | — | Free text "how it felt." |

```ts
BlockResult {
  blockId: string;
  type: Block["type"];
  completed: boolean;
  // strength / gymnastics
  setsCompleted?: { reps: number; loadKg?: number; rir?: number; clean?: boolean }[];
  // conditioning (driven by TimerConfig score)
  score?: {
    scoreType: "rounds-reps" | "time" | "reps" | "load" | "cals";
    rounds?: number; reps?: number; timeSec?: number; value?: number;
  };
  // mobility / meditation
  durationSec?: number;
  felt?: 1|2|3|4|5;           // quick per-block "how it felt"
  scaledTier?: Tier;          // if this block ran at a downshifted variant
  note?: string;
}

PainFlag {
  joint: "wrist" | "elbow" | "shoulder" | "lower-back" | "knee" | "hip" | "ankle" | "other";
  severity: 1|2|3|4|5;
  movement?: MovementId;
  note?: string;
}
```

### 7.1 Example — `history/logs/2026-06-24.json`

```json
{
  "id": "log-2026-06-24-01",
  "date": "2026-06-24",
  "sessionRef": "2026-06-24",
  "tierUsed": "GREEN",
  "startedAt": "2026-06-24T06:02:00Z",
  "completedAt": "2026-06-24T07:00:00Z",
  "feltOverall": 2,
  "results": [
    { "blockId": "b1-warmup", "type": "warmup", "completed": true, "durationSec": 760 },
    {
      "blockId": "b2-strength-skill",
      "type": "gymnastics",
      "completed": true,
      "setsCompleted": [
        { "reps": 3, "clean": true }, { "reps": 3, "clean": true },
        { "reps": 3, "clean": true }, { "reps": 3, "clean": true },
        { "reps": 2, "clean": true }
      ],
      "felt": 2,
      "note": "5 clean wall-HSPU negatives across the session → fires hspu-negatives-to-deficit gate."
    },
    {
      "blockId": "b3-strength",
      "type": "strength",
      "completed": true,
      "setsCompleted": [
        { "reps": 10, "loadKg": 22.5, "rir": 2 }, { "reps": 9, "loadKg": 22.5, "rir": 2 },
        { "reps": 8, "loadKg": 22.5, "rir": 1 }, { "reps": 8, "loadKg": 22.5, "rir": 1 }
      ]
    },
    {
      "blockId": "b4-conditioning",
      "type": "conditioning",
      "completed": true,
      "score": { "scoreType": "rounds-reps", "rounds": 6, "reps": 8 },
      "felt": 3
    },
    { "blockId": "b5-mobility", "type": "mobility", "completed": true, "durationSec": 420 },
    { "blockId": "b6-meditation", "type": "meditation", "completed": true, "durationSec": 600, "note": "Used 2-min bell + 6 bpm pacer." }
  ],
  "benchmarkPRs": [],
  "painFlags": [{ "joint": "wrist", "severity": 2, "movement": "wall-hspu-negative", "note": "Mild — monitor; cut deficit volume if it persists." }],
  "notes": "Felt strong. Press fresh. Wrist a touch cranky on negatives."
}
```

---

## 8. Nutrition & supplements — `profile/`

Fueling is a **first-class pillar**, not an afterthought. The full rationale (protein targets, fast high-protein options, alcohol/recovery, tendon-supporting collagen timing) lives in [`nutrition.md`](./nutrition.md); this section defines the **shapes** that doc renders from. Both are athlete-owned and **gitignored**.

### 8.1 NutritionPrefs & NutritionTarget — `profile/nutrition.ts`

`NutritionPrefs` is the lightweight, author-once preference object (it hangs off `AthleteProfile.nutrition`). The build step resolves it — together with `weightKg` — into a concrete `NutritionTarget` the app can display as a simple daily guidance card. Deliberately **not** a food log: protein-first, eyeball the rest.

```ts
NutritionPrefs {
  pattern: "omnivore" | "vegetarian" | "vegan" | "pescatarian";
  approach: "protein-first" | "macro-tracked" | "intuitive";
  proteinTargetGPerKg: number | [number, number];  // e.g. [1.6, 2.2]
  cookingStyle: "mixed-fast" | "meal-prep" | "convenience" | "scratch";
  alcohol?: "none" | "social-weekends" | "regular";
  logging?: "none" | "light" | "full";              // "none" = don't nag for entries
}

NutritionTarget {
  proteinGPerDay: [number, number];   // resolved range, e.g. [165, 210] from gPerKg × weightKg
  emphasis: string[];                 // ["protein at every meal", "carbs around training", "fast options on busy days"]
  hydrationNote?: string;
  recoveryNotes?: string[];           // e.g. ["alcohol mostly weekends → expect a softer Monday; protein + sleep first"]
  guidanceOnly: true;                 // signals the UI: show a card, never a logging nag
}
```

### 8.1.1 Example — resolved `NutritionTarget` (derived, shown in-app)

```json
{
  "proteinGPerDay": [165, 210],
  "emphasis": ["protein at every meal", "carbs around training", "fast high-protein options on busy days"],
  "hydrationNote": "Steady water; salt around sweaty sessions.",
  "recoveryNotes": ["Alcohol is social/weekend → expect a softer Monday; bias protein + sleep that day."],
  "guidanceOnly": true
}
```

### 8.2 Supplement — `profile/supplements.ts`

A small catalogue entity. Each entry is one supplement with a dose, a timing string, and an optional link to the rationale (e.g. the tendon "collagen + vitamin C pre-session" lever, which ties back to the tendon-governor prior in [`training-system.md`](./training-system.md)).

| Field | Type | Req | Description |
|---|---|---|---|
| `id` | `SupplementId` | ✓ | Stable slug (`"creatine-mono"`, `"collagen-vitc"`). |
| `name` | `string` | ✓ | Display name. |
| `dose` | `string` | ✓ | Human-readable dose (`"5 g"`, `"15 g + 50 mg vitamin C"`). |
| `timing` | `string` | ✓ | When to take it (`"daily, any time"`, `"~45–60 min pre-session"`). |
| `purpose` | `string` | — | Why it's in the stack. |
| `tiedToProtocol` | `string` | — | Cross-link to a `Protocols` key or training lever (e.g. `"tendon-governor"`). |
| `surfaceAs` | `"note-block" \| "card" \| "silent"` | — | How/whether the app surfaces it (e.g. a pre-session NoteBlock reminder). |

### 8.2.1 Example — `profile/supplements.ts`

```json
[
  { "id": "creatine-mono", "name": "Creatine monohydrate", "dose": "5 g", "timing": "daily, any time", "purpose": "Strength/power + lean mass; well-evidenced.", "surfaceAs": "silent" },
  { "id": "whey", "name": "Whey protein", "dose": "1–2 scoops as needed", "timing": "to hit daily protein target", "purpose": "Fast, convenient protein toward the 165–210 g/day target.", "surfaceAs": "card" },
  { "id": "collagen-vitc", "name": "Collagen + vitamin C", "dose": "15 g + ~50 mg vitamin C", "timing": "~45–60 min pre-session", "purpose": "Connective-tissue support — the tendon governor for new gymnastics volume.", "tiedToProtocol": "tendon-governor", "surfaceAs": "note-block" },
  { "id": "vitamin-d", "name": "Vitamin D3", "dose": "per bloodwork (commonly 1000–2000 IU)", "timing": "daily with food", "purpose": "Recovery/sleep/immune; dose to measured level.", "surfaceAs": "silent" },
  { "id": "omega-3", "name": "Omega-3 (EPA/DHA)", "dose": "~1–2 g EPA+DHA", "timing": "daily with food", "purpose": "Recovery and sleep quality support.", "surfaceAs": "silent" }
]
```

---

## 9. Progress & gates — `history/gates.ts`

**Zone:** `history/` (app-owned, derived from logs). **Gitignored.**
**Purpose:** Progress is tracked primarily by **skill/strength GATES** (ownership triggers fired from logged history), **not by dates**, plus **periodic ROM re-test markers** (a testing-block cadence, not continuous measurement). This entity is the at-a-glance state of each gate and re-test — the thing the app's progress view and the AI's `/replan` both read. It is *derived*: the AI recomputes it from `WorkoutLog[]` and the `Goal.advancementCriteria`.

| Field | Type | Req | Description |
|---|---|---|---|
| `updatedAt` | `Timestamp` | ✓ | When last recomputed. |
| `gates` | `GateStatus[]` | ✓ | One per tracked advancement criterion. |
| `romMarkers` | `RomMarker[]` | — | Periodic ROM re-test results (e.g. toe-touch, overhead, dorsiflexion). |
| `calibrating` | `boolean` | — | True during the first ~14 days / before baselines are set. |

```ts
GateStatus {
  goalId: GoalId;
  criterionId: string;            // FK into Goal.advancementCriteria[]
  movement: MovementId;
  state: "locked" | "in-progress" | "passed";
  progress?: { observed: number; threshold: number; overSessions?: number; metAt?: ISODate };
  nextRung?: MovementId;          // what passing advances to
  note?: string;
}

RomMarker {
  marker: "toe-touch" | "overhead-reach" | "ankle-dorsiflexion" | "hip-rotation" | string;
  lastTested: ISODate;
  retestEveryDays: number;        // periodic cadence, e.g. 28
  value: string;                  // "knees-to-shins", "overhead with effort", "5 cm forward of toes"
  trend?: "improving" | "holding" | "regressing";
  nextRetestDue?: ISODate;
}
```

### 9.1 Example — `history/gates.json`

```json
{
  "updatedAt": "2026-06-24T07:05:00Z",
  "calibrating": false,
  "gates": [
    {
      "goalId": "goal-strict-hspu",
      "criterionId": "hspu-negatives-to-deficit",
      "movement": "wall-hspu-negative",
      "state": "passed",
      "progress": { "observed": 5, "threshold": 5, "overSessions": 1, "metAt": "2026-06-24" },
      "nextRung": "deficit-hspu-negative",
      "note": "Hit 5 clean negatives on 2026-06-24 → advance to deficit negatives next pressing block."
    },
    {
      "goalId": "goal-strict-ring-mu",
      "criterionId": "false-grip-hang-to-rows",
      "movement": "false-grip-hang",
      "state": "in-progress",
      "progress": { "observed": 8, "threshold": 20 },
      "nextRung": "false-grip-ring-row",
      "note": "False-grip hang ~8 s; gate is a 20 s hold. The strict-MU limiter — build patiently (tendons first)."
    }
  ],
  "romMarkers": [
    {
      "marker": "toe-touch",
      "lastTested": "2026-06-16",
      "retestEveryDays": 28,
      "value": "knees-to-shins",
      "trend": "holding",
      "nextRetestDue": "2026-07-14"
    },
    {
      "marker": "overhead-reach",
      "lastTested": "2026-06-16",
      "retestEveryDays": 28,
      "value": "reaches overhead with effort",
      "trend": "improving",
      "nextRetestDue": "2026-07-14"
    }
  ]
}
```

> ROM is re-tested on a cadence (here every 28 days), not measured every session — it's a marker you check at the testing block, consistent with "patience, tendons first." Gate state is recomputed from logs each `/replan`. Placeholder gate thresholds (false-grip seconds, strict-press 1RM, etc.) are filled in during week 1–2 — see [`testing-protocol.md`](./testing-protocol.md); don't fabricate them.

---

## 10. Validation, build, privacy, and ownership summary

| Entity | Schema (`library/schema/`) | Instances (zone) | Published? | Written by | Read by |
|---|---|---|---|---|---|
| `AthleteProfile` | `athlete.ts` | `profile/` | example only | human / `/onboard` | AI (`/replan`), app |
| `Goal` | `goal.ts` | `profile/` | example only | human / `/onboard` | AI, app |
| `NutritionPrefs` / `NutritionTarget` | `nutrition.ts` | `profile/` | example only | human / `/onboard` | app, AI |
| `Supplement` | `supplement.ts` | `profile/` | example only | human | app, AI |
| `Movement` | `movement.ts` | `library/movements/` | yes | human (shared) | AI, app |
| `Session` / `Block` / `TimerConfig` / `MeditationBlock` | `session.ts` | `generated/calendar/` | yes | AI (`/replan`, `/today`) | app (runner/board/PDF) |
| `Mesocycle` / `ProgramCalendar` | `program.ts` | `generated/` | yes | AI | app |
| `ReadinessEntry` | `readiness.ts` | `history/readiness/` | example only | human / app | autoregulation engine, AI |
| `WorkoutLog` / `BlockResult` | `log.ts` | `history/logs/` | example only | app (Dexie → file) | AI |
| `GateTracker` / `RomMarker` | `gates.ts` | `history/` | example only | AI (derived) | app, AI |

**Build-time contract:** every authored or generated file is parsed with its Zod schema before it is committed or loaded. A file that fails to parse is a hard error — the app refuses to load an invalid session, and the AI must re-emit conforming output. This single contract is what guarantees the chalkboard, the PDF, the runner, and the Watch all render the same truth (see [`architecture.md`](./architecture.md) §2–§3).

**Privacy split (data-level):** `profile/` and `history/` carry the athlete's real, identifying data and are **gitignored**. The public repo ships **only sanitized `*.example.json` templates** of each of those shapes — same schema, fake data — so a forker has a working skeleton without inheriting anyone's personal record. `library/`, `generated/`, and `docs/` are publishable. Because gitignored data is *not* persisted by the public repo (nor by an ephemeral working container), keep a **local copy** and consider a **future private data repo or git submodule** for durable history. See [`architecture.md`](./architecture.md) §5 for the repo-policy view of the same split.

**Forking a new athlete:** copy the `*.example.json` files into the real (gitignored) paths and edit `profile/athlete.ts`, `profile/goals.ts`, `profile/equipment.ts`, `profile/nutrition.ts`, `profile/supplements.ts`, `profile/readiness-prefs.ts`; optionally extend `library/movements/`. Run `/replan` to fill `generated/`. Everything else — schemas, engine, runner — is inherited unchanged.

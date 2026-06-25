# ROADMAP

A phased, incremental build plan taking this repo from empty to the full vision:
an **open-source, forkable, adaptive CrossFit + wellness programming system** where one
human-authored, typed source of truth compiles to both a printable program and an offline-first
PWA, and a Claude Code agent continuously re-plans against logged history and daily readiness.

This roadmap is the sequencing contract. It is deliberately ordered so that **every phase
ships something usable on its own** and each phase's deliverables are inputs the next phase
depends on.

Two sequencing biases come straight from the athlete's decisions
([`docs/decisions.md`](docs/decisions.md)) and shape the whole order below:

- **Phone-haptics-first, Watch-later.** Day-one haptics/audio come from the phone in hand or
  pocket; a dedicated native Apple Watch app is a *later, additive* wrapper — not a blocker for
  daily use.
- **Local-first, hosted-later.** Everything runs locally (the PWA in the browser/installed,
  Claude Code in the repo) with no server, no account, no network. An *optional* hosted
  regeneration path comes last and never displaces the zero-cost local default.

The companion designs this roadmap implements:

- [`docs/training-system.md`](docs/training-system.md) — the *coach*: non-peaking rolling
  ~6-week emphasis blocks, tendons-as-governor, strict-before-kipping, AM ramp + situational
  caffeine, mobility as loaded end-range, hybrid HRV/subjective readiness gate, ownership-based
  progression gates.
- [`docs/architecture.md`](docs/architecture.md) — the *software*: Next.js + TS + Zod PWA,
  single typed source of truth → app + print, deterministic offline autoregulation engine,
  Claude Code skills that rewrite `generated/` on a rolling window.
- [`docs/data-model.md`](docs/data-model.md) — the *schemas* every phase reads and writes.
- [`docs/functional-design.md`](docs/functional-design.md) — the *app UX*: runner, timer,
  one-tap check-in, meditation, quick logging.
- [`docs/nutrition.md`](docs/nutrition.md) — fueling/recovery guidance the planning skills emit.
- [`docs/science-foundations.md`](docs/science-foundations.md) — the *why* behind every rail.
- [`docs/testing-protocol.md`](docs/testing-protocol.md) — the gentle Week 1–2 baseline block.
- [`docs/decisions.md`](docs/decisions.md) — the log of athlete choices this build implements.
- [`CLAUDE.md`](CLAUDE.md) — the guardrails the planning agent operates within.

---

## Guiding sequencing rules

1. **Privacy is a Phase-0 property, not a cleanup.** This repo is **public**; the athlete's real
   profile and logged history are **private**. The `.gitignore` split, the sanitized
   `*.example.md` templates, and the MIT `LICENSE` land before any real data exists, so nothing
   has to be retrofitted and no private data is ever the only copy of a needed structure.
2. **Typed data before anything reads it.** The Zod contract in `library/schema/` is the spine;
   UI, generator, print, and autoregulation all depend on it. The athlete profile is *typed
   data*, not prose. It lands in Phase 0.
3. **Deterministic before AI.** The autoregulation rule engine and the timer FSM are pure,
   tested TypeScript that never call an LLM. The agent *proposes plans*; the rule engine and the
   human *gate the day*. The engine lands in Phase 0 alongside the schema it consumes.
4. **Ship the daily-use surface before the AI loop.** The PWA runner + timer + one-tap check-in +
   meditation + quick logging are the highest-value surface and come *before* the Claude Code
   planning skills. The athlete can run and log a hand-seeded program for weeks before any
   regeneration exists.
5. **Local-first, offline-always.** No server or auth until the very last phase. The box wifi is
   bad and it's 6am — today's session, the timer, the check-in, and logging must work with zero
   network.
6. **Generated content is git-tracked and reviewable.** The agent edits files in `generated/`;
   every change is a diff, never a black box. Past sessions are immutable; only today-forward is
   rewritten.
7. **Forkability is a feature, not an afterthought.** The folder separation (`profile/` vs
   `library/` vs `generated/` vs `history/`) and the public/private split are established in
   Phase 0; forkability is validated explicitly in the final phase.

### Definition of Done (applies to every milestone)

- Code typechecks (`tsc --noEmit`) and lints clean.
- New pure logic (schema, autoregulation, timer, generator transforms) has unit tests.
- The phase's acceptance criteria are demonstrably met (manually or by test).
- Public docs stay **forkable and generic** — no private specifics leak out of the gitignored
  `profile/`/`history/` into committed files.
- README / relevant docs updated so a forker could follow along.
- Work merged via PR from a feature branch (never committed straight to default).

---

## Phase 0 — Privacy, schema, typed profile, autoregulation engine, first printable program

**Goal:** Stand up the repo skeleton, the **public/private split**, the typed single source of
truth, the **deterministic readiness engine**, and the **Week 1–2 testing protocol** — then emit
a complete, printable first program **with no app yet**. This phase proves the data model can
express real programming, keeps the athlete's data private from commit #1, and produces something
trainable immediately.

### Milestone 0.1 — Repo scaffolding, privacy structure & license
**Deliverables**
- Node + TypeScript project (`package.json`, `tsconfig.json`, strict mode), ESLint + Prettier,
  Vitest configured.
- The forkable folder skeleton, present and documented:
  ```
  profile/        library/        generated/        history/
  scripts/        .claude/skills/  docs/             tests/
  ```
- **Privacy split (public repo, private data):**
  - `.gitignore` that excludes the **real** profile (`profile/athlete-profile.md`,
    `*.private.md`, `*.local.*`) and **all** logged history (`history/readiness/*`,
    `history/logs/*`), while keeping structure tracked via `!**/README.md`, `!**/*.example.md`,
    `!**/.gitkeep`.
  - A sanitized, committed **template/example** for each private artifact
    (`profile/athlete-profile.example.md`, plus `history/*/README.md` describing the schema) so a
    forker has a fill-in-the-blanks starting point and the repo is useful with zero private data.
  - `profile/README.md` documenting the fork flow and the **persistence caveat**: gitignored data
    does **not** live in the public repo (or any ephemeral container) — keep a local copy and/or
    a future private data repo/submodule.
- **MIT `LICENSE`** at repo root.
- **History scrub:** purge any previously-committed real profile from git history and force-push
  (athlete-approved), so the public history contains no private data.
- `README.md` with the "Fork → edit `profile/` → run a planning skill → train" pitch.
- `CLAUDE.md` seeded with the planning guardrails (tendons-as-governor, strict-before-kipping,
  legs/conditioning at maintenance, AM ramp mandatory, mobility as loaded end-range,
  autoregulation = consistency not peaking, cap upper-body progression ~+10%/wk, never zero on
  RED).

**Acceptance**
- `npm install && npm run typecheck && npm run lint && npm test` all pass on an empty test.
- A fresh clone of the **public** repo contains the example templates and READMEs but **no real
  profile and no logged history**; `git log` shows no private data in history.
- Folder structure matches [`docs/architecture.md`](docs/architecture.md) §5.

### Milestone 0.2 — Zod data schema (the contract)
**Deliverables** (`library/schema/`)
- Zod schemas + inferred TS types for: `AthleteProfile`, `Goal`, `Movement`, `Session`, and the
  `Block` union (`Warmup`, `Strength`, `GymnasticsSkill`, `Conditioning`, `Mobility`,
  `Meditation`, `Note`), `TimerConfig` (amrap / for-time / emom / intervals / tabata),
  `Mesocycle`, `ProgramCalendar`, `ReadinessEntry`, `WorkoutLog`, and the `Benchmark` /
  `BenchmarkPR` types the testing protocol writes.
- Loads carry **both lb and kg** (canonical unit + display helper) so every surface can show both.
- Each `Block` carries green/amber/red variants or a scaling rule (so the future runner can
  autoregulate locally).
- Schemas exported as the one contract used by validators, the app, and the agent.

**Acceptance**
- Unit tests: valid fixtures parse; malformed fixtures fail with useful errors.
- `TimerConfig` covers all five timer types with discriminated unions.
- Types compile and are importable from a single barrel; see [`docs/data-model.md`](docs/data-model.md).

### Milestone 0.3 — Profile as typed data (athlete + sanitized example)
**Deliverables** (`profile/`)
- The **real** profile authored as typed data validated by the Phase 0.2 schema (gitignored):
  ranked goals (strict HSPU, strict ring muscle-up, chest/core/delt/upper-back hypertrophy +
  midline, hip/hamstring & overhead/t-spine ROM), AM-biased flexible scheduling with a **2-day
  busy-week floor** and a **5-day preferred** cadence, equipment, caffeine/collagen toggles,
  readiness-input preferences, and a unilateral/anti-rotation emphasis flag (asymmetry).
- **Open-question placeholders flagged in-file** for everything the testing protocol will measure
  — strict press 1RM, max strict pull-ups, max strict ring dips, false-grip hang time, ROM
  markers — explicitly marked `// TODO baseline week 1-2`. The agent **must not fabricate** these
  (see [`CLAUDE.md`](CLAUDE.md) "Open calibration items").
- A **conservative-spinal-loading** flag (favor controlled light end-range over heavy loaded
  flexion; optional physio screen before end-range spinal flexion) — encoded generically, no
  private medical detail in any committed file.
- A committed **sanitized `athlete-profile.example.md`** mirroring the structure with illustrative
  values only.

**Acceptance**
- Both the real profile and the example validate against the schema.
- A reviewer can see exactly which numbers are real vs `TODO baseline week 1-2` placeholder.
- No private specifics appear in any tracked file.

### Milestone 0.4 — Movement library + block/session templates
**Deliverables**
- `library/movements/` seeded with the movements the design requires, including progression
  chains (e.g. box-pike → wall-pike → deficit-pike → wall-HSPU negative → strict HSPU;
  false-grip hang → row → assisted transition → low-ring strict → strict MU), each with
  `loadsTendon` flags, `pattern`, `equipment`, and green/amber/red `scaling`.
- `library/templates/` with block/session archetypes (HSPU press block, MU pull block, polarized
  conditioning — sprint/hill quality + Zone-2 machine base, loaded-mobility + 20-min meditation
  block, midline + unilateral/anti-rotation block).
- Undulating **hard/easy** week shape and the **2-day floor** template (full-body
  strict-skill/strength priority + one short quality conditioning hit + wellness/mobility)
  expressed as templates.

**Acceptance**
- Every movement and template validates against the Phase 0.2 schemas.
- Progression chains resolve (no dangling `progressions` references) — covered by a test.

### Milestone 0.5 — Deterministic autoregulation engine (pure, tested)
**Deliverables** (`library/autoregulation/`)
- A pure `(ReadinessEntry, swcConfig) → Tier` function implementing the traffic-light rules:
  - **GREEN** (HRV in/above SWC band + subjective OK): full session, heavy/skill fresh, sprinty
    MetCon, caffeine OK.
  - **AMBER** (lower band edge / rising CV / moderate subjective): keep skill+strength, trim
    volume ~30–50%, drop conditioning to Zone 2, no max-effort negatives.
  - **RED** (below band multi-day OR manual "exhausted/busy" override): the 20-min breathing +
    hip/hamstring mobility block **is** the session — but a **true full rest day is allowed**;
    wellness is the default *offer*, not a mandate. **Never zero by force.**
  - **Manual override always wins** (subjective out-predicts wearable HRV).
- SWC band logic: personal baseline mean ± 0.5×SD from a 14-day familiarization, with a
  documented bootstrap (population prior → personal band) and a **14-day "still calibrating"**
  state.

**Acceptance**
- Exhaustive unit tests over the rule matrix, including override precedence, the
  multi-day-downtrend trigger, and the "still calibrating" cold-start.
- Engine runs offline with **no network/LLM dependency** — it is callable from both the future
  runner and a Claude Code skill.

### Milestone 0.6 — Week 1–2 testing protocol → seeded gates
**Deliverables**
- The gentle calibration block from [`docs/testing-protocol.md`](docs/testing-protocol.md)
  authored as real `Session` objects: strict press (1RM or rep-max), max strict pull-ups, max
  strict ring dips, false-grip hang time, ROM markers (forward fold/toe-touch, overhead, ankle
  dorsiflexion, hip), and **one sub-maximal conditioning anchor** (short sprint or 2k row).
- A documented path for the measured results to replace the `TODO baseline week 1-2` placeholders
  in `profile/` and set the progression gates in `training-system.md` §7 and the SWC band in §5.

**Acceptance**
- The testing block validates against the schema and renders (0.7) as a runnable 2-week opener
  that does **not** crush a re-onboarding athlete.
- A reviewer can trace each test → the gate/placeholder it fills.

### Milestone 0.7 — First program → printable markdown/PDF
**Deliverables**
- A hand-authored (later skill-assisted, Phase 2) first ~2-week `generated/calendar/` of dated
  `Session` objects expressing the **5-day preferred** default with the undulating hard/easy
  shape: mandatory 12–15 min AM ramp, strict-skill-first sequencing, chest/back hypertrophy
  accessory, polarized conditioning, and the daily loaded-mobility + 20-min meditation block —
  opening with the Phase 0.6 testing block.
- `scripts/render-program.ts`: compiles `Session` objects → human-readable **Markdown** and a
  **printable PDF/PNG** "chalkboard" view from the *same* session objects (loads shown in **both
  lb and kg**).
- A rendered `PROGRAM.md` (and a PDF) generated on demand.

**Acceptance**
- `npm run render` produces a clean, printable ~2-week program the athlete could tape to a wall
  and follow.
- Markdown and PDF are generated from identical session data (no hand-duplicated content) —
  proving "one source of truth, two renderers."
- **Phase exit:** the athlete can run the Week 1–2 testing block and the first program off a
  printout, with **no app**, and **no private data is committed to the public repo**.

---

## Phase 1 — PWA runner + timer + one-tap check-in + meditation + quick logging

**Goal:** Turn the typed data into the daily-use experience — *open phone → see today's readiness
+ session → one-tap check-in → hit START → screen takes over with the WOD and a built-in timer →
log it in a tap.* Offline, installable, local-only. **Phone-driven haptics/audio**; the runner is
**responsive so the old iPad works as a dedicated gym display**. This is the highest-value surface
and ships before any AI loop. The full app UX spec is [`docs/functional-design.md`](docs/functional-design.md).

### Milestone 1.1 — Next.js PWA shell (responsive, phone + iPad display)
**Deliverables**
- Next.js (App Router) + React + TypeScript + Tailwind + Radix/shadcn primitives.
- PWA: Web App Manifest + Workbox service worker; installable on iOS/iPadOS; offline cache of
  today + next 14 days of sessions.
- High-contrast "chalkboard" dark theme, large touch targets (sweaty hands), **responsive layout
  that scales up cleanly to a wall-mounted iPad** as a gym display.
- Home screen = one big card: today's session title + readiness color + a `START` button. (The
  deterministic tier from Phase 0.5 is wired to the check-in in 1.2.)

**Acceptance**
- App installs to a phone **and** iPad home screen and loads today's session **with wifi off**
  after first load.
- The runner looks good both phone-size and large (iPad gym display).
- Lighthouse PWA checks pass (installable, offline-capable).

### Milestone 1.2 — One-tap morning check-in + readiness wiring
**Deliverables**
- A **minimal-friction one-tap "overall feel"** check-in (the primary input) with an **optional**
  detailed entry (sleep / soreness / stress / energy) and an **optional HRV-score field** —
  hybrid: type the score if a wearable synced, else just tap. Written to `history/readiness/` as a
  `ReadinessEntry`.
- The Phase 0.5 engine computes the tier; the home card shows it as a color; a **one-tap manual
  override** lets the athlete re-pick the tier on the spot (override always wins).
- The **14-day "still calibrating"** note surfaces while no personal HRV baseline exists.

**Acceptance**
- A single tap produces a valid `ReadinessEntry` and a computed tier offline.
- Forcing a "wrecked"/RED override flips today's session to the meditation + mobility default in
  real time, offline — and still permits a true rest day.

### Milestone 1.3 — Timer finite-state machine (pure, tested)
**Deliverables**
- `app/lib/timer/`: a standalone timer FSM driven by `TimerConfig`, handling countdown → work →
  rest → round → done for all five timer types (amrap, for-time, emom, intervals, tabata).
- Pure reducer / XState machine, isolated from React, **designed to be reused by the Watch later**
  (no logic fork).

**Acceptance**
- Comprehensive unit tests: round transitions, cap/auto-finish, EMOM slot rollover, tabata
  8×(20/10), pause/resume, result capture (rounds/time).
- Timer logic has zero DOM/React dependencies.

### Milestone 1.4 — Full-screen Session Runner (with meditation block)
**Deliverables**
- Runner walks `blocks` in order: AM ramp/warm-up checklist → strength/skill (inline set logging)
  → conditioning (**timer takes over**, big countdown + current movement/reps in huge type) →
  mobility → **meditation block**.
- **Meditation block:** an **interval bell** (set total duration + a 1–5 min bell interval) with
  an **optional ~6 breaths/min (0.1 Hz) paced-breathing visual**; unguided by default, with an
  occasional link out (e.g. Calm).
- Wake-lock API so the screen never sleeps mid-session.
- **Phone-driven** Web Audio **loud beeps** + Vibration **haptics** on interval/round/bell
  boundaries.

**Acceptance**
- A full session (including an AMRAP and an EMOM) runs start-to-finish on a phone with the screen
  awake and **loud audio + haptic** cues firing.
- The meditation block rings on the chosen interval and (optionally) animates a 0.1 Hz breathing
  pace.

### Milestone 1.5 — Quick local-first logging (IndexedDB)
**Deliverables**
- Dexie/IndexedDB store; **quick "done + how it felt"** logging during/after the session
  (sets × reps × load, AMRAP rounds, for-time result, RIR, pain flags, short note) plus the
  timer/key result — minimal taps.
- The chosen tier is recorded on the log (`tierUsed`).
- Logs survive reload mid-WOD; nothing blocks on network.

**Acceptance**
- Logging works fully offline; a forced reload mid-session loses no logged data.
- A completed session produces a schema-valid `WorkoutLog` (with `tierUsed`).
- **Phase exit:** the athlete uses the app daily to check in, run, and log — autoregulating from
  one-tap input alone, with **no AI and no wearable**, even though the program is still
  hand-/script-seeded.

---

## Phase 2 — Claude Code planning skills (program + nutrition regeneration)

**Goal:** Close the loop on the *coach*. Claude Code skills generate and continuously re-plan the
program — and the **nutrition guidance** — from `profile/` + `library/` + recent
`history/{logs,readiness}`, honoring every [`CLAUDE.md`](CLAUDE.md) rail, with every change a
reviewable git diff. Runs **locally in the repo**; no server.

### Milestone 2.1 — Log write-back path
**Deliverables**
- A concrete path for the app's `WorkoutLog`/`ReadinessEntry` to land in `history/` as JSON
  (File System Access API / local dev endpoint for direct write, **or** in-app export → file a
  skill ingests). Ship the simplest reliable option first (export → file), document the
  trade-off. Written files stay **gitignored** (private health data).
- Validation that written logs round-trip through the schema.

**Acceptance**
- A session run in the app produces a schema-valid file in `history/logs/` the agent can read,
  while remaining untracked by git.

### Milestone 2.2 — The planning skills (`/onboard`, `/replan`, `/today`, `/deload`)
**Deliverables** (`.claude/skills/`)
- `/onboard` — interviews a user (or reads an edited `profile/`) and writes the typed `profile/*`,
  flagging unknowns as `TODO baseline week 1-2` rather than inventing numbers.
- `/replan` — reads `profile/` + `library/` + last N weeks of `history/{logs,readiness}` and
  rewrites the **next 1–2 weeks** of `generated/calendar/`, leaving past sessions immutable.
  Fires ownership-based advancement (e.g. "logged 5 clean wall-HSPU negatives → progress to
  deficit"), respects volume targets (chest/back 12–18 hard sets, legs ≤6–9 maintenance), the
  undulating hard/easy shape, the 2-day busy-week floor, and the **+10%/wk upper-body cap**. Emits
  the **nutrition guidance** alongside the training (protein-first target ~1.6–2.2 g/kg, simple
  fueling/recovery principles, collagen+C pre-session, caffeine AM-only on hard days, weekend-
  alcohol Monday-recovery note) per [`docs/nutrition.md`](docs/nutrition.md).
- `/today` — adjusts only today's session tier/scaling from today's `ReadinessEntry`, deferring to
  the deterministic engine and the manual override.
- `/deload` — inserts an autoregulated lighter week when the fatigue/readiness trend warrants.
- All skills honor `CLAUDE.md` (tendons-as-governor, strict-before-kipping, legs at maintenance,
  never zero on RED, no peaking).

**Acceptance**
- `/replan` on real logged history produces a valid, diffable `generated/calendar/` update that
  respects the volume targets and progression gates; past sessions are untouched.
- The agent's rationale (training **and** nutrition choices) is written to
  `generated/mesocycles/rationale.md`.
- `/onboard` produces a schema-valid `profile/` with unknowns flagged, not fabricated.

### Milestone 2.3 — Mesocycle re-baseline loop
**Deliverables**
- A 4–6 week recalibration: re-compute the HRV SWC band from fresh `history`, rotate the A→B→C
  emphasis (press → pull → integration), re-weight volume toward lagging goals, run the
  testing-protocol gate re-tests at the deload, update `rationale.md`.
- Optional Claude Code `loop`/cron skill to run `/replan` weekly and `/today` each morning — each
  change a reviewable commit.

**Acceptance**
- Over a simulated multi-week history, the system rolls a block, re-baselines the SWC, and
  advances/repeats/regresses progression rungs on demonstrated ownership rather than dates.
- **Phase exit:** the full local v1 is shipped — PWA + timer + one-tap readiness + local logging +
  Claude-Code regeneration of program **and** nutrition, all in git, all offline.

---

## Phase 3 — Native Apple Watch app

**Goal:** Move from **phone-driven haptics** to a **native Apple Watch companion** — additive, not
a rewrite. The Watch is explicitly **later**: the phone covers daily use through Phases 1–2.

### Milestone 3.1 — Capacitor native wrappers (iOS first)
**Deliverables**
- Capacitor wrapping the existing web build into an iOS shell (Android optional/secondary): native
  wake-lock, haptics, audio, app-icon/splash.
- Store-submission scaffolding (bundle ID, signing, privacy manifest).

**Acceptance**
- The native app runs the full Session Runner + timer on a physical iPhone from the *same* web
  codebase (no React Native rewrite).

### Milestone 3.2 — Apple Watch companion
**Deliverables**
- A thin Watch app (SwiftUI or Capacitor watch plugin — decision recorded) consuming a small
  "today + timer" payload, mirroring the **Phase 1.3 timer FSM** (no logic fork) and the current
  movement/reps.
- **Haptic-led** timer on the wrist; optionally a one-tap check-in glance.

**Acceptance**
- A conditioning piece runs from the Watch with haptic round cues while the phone stays in a bag.
- The Watch reuses the Phase 1.3 timer state machine.
- **Phase exit:** the athlete can run a WOD from phone or watch, installed natively — haptics now
  on the wrist instead of only the phone.

---

## Phase 4 — Wearable ingestion (Bevel / Whoop) + readiness automation

**Goal:** Remove manual HRV entry by pulling real wearable data into the readiness engine — while
keeping the **one-tap subjective check-in and manual override first-class** (subjective wins).

### Milestone 4.1 — Wearable data ingestion
**Deliverables**
- HRV ingestion from **Bevel** (Apple Watch Ultra 2, primary) via HealthKit and **Whoop**
  (secondary) via webhook/API → auto-fills `ReadinessEntry.hrv` (rmssd, rolling7, swcBand).
  (Resolve the Whoop API-terms open question first; fall back to HealthKit/Bevel/manual if Whoop
  access is unavailable.)
- The existing deterministic engine consumes the auto-filled HRV unchanged; the one-tap subjective
  input and manual override still win.

**Acceptance**
- A morning's wearable HRV auto-populates the readiness tier with no manual HRV entry, and a manual
  override still flips the tier.

### Milestone 4.2 — Continuous re-baseline from wearable trend
**Deliverables**
- The 4–6 week SWC re-baseline (Phase 2.3) now runs off ingested wearable history; CV/trend
  triggers (downtrend, parasympathetic-saturation high HRV) feed `/replan` and `/deload`.

**Acceptance**
- The SWC band re-baselines automatically from real wearable data across a multi-week window, and
  the agent's re-plan reflects the updated band.
- **Phase exit:** daily readiness is hands-off (wearable + one-tap subjective), with override
  preserved.

---

## Phase 5 — Forkability polish, optional hosted regeneration, print/chalkboard polish

**Goal:** Make a stranger's "clone → edit `profile/` → run one skill → train" path frictionless,
offer an **optional hosted** re-planning path for non–Claude-Code users (without compromising the
local-first default), and finish the **print/chalkboard** polish (the athlete ranked print low,
so it lands last).

### Milestone 5.1 — Forkability validation
**Deliverables**
- A clean-room test: a fresh persona edits only `profile/`, optionally extends `library/`, runs
  `/onboard` + `/replan`, and gets a runnable plan — documented as a reproducible walkthrough.
- README "Fork in 5 minutes" guide; `CLAUDE.md` self-contained enough that the agent plans
  correctly for a *different* athlete (different goals/equipment/constraints).
- Confirm no athlete-specific assumptions leak out of the gitignored `profile/` into
  `library/`/`app/`/docs; the public/private split holds end-to-end.

**Acceptance**
- A second, materially different profile (e.g. an evening-trainer endurance athlete) produces a
  coherent, guardrail-respecting plan with no code changes and no private data.

### Milestone 5.2 — Analytics & progress surfaces
**Deliverables**
- Volume-per-muscle/week dashboard, benchmark-trend charts, ROM-marker re-test tracking (periodic,
  not continuous; no mandatory photos), tier distribution — reading from `history/` (the same data
  the agent reasons over). Loads shown in **both lb and kg**.

**Acceptance**
- The athlete can see chest/back weekly hard sets vs the 12–18 target and legs vs the ≤6–9 cap,
  plus HSPU/MU gate progress, at a glance.

### Milestone 5.3 — Print / chalkboard polish
**Deliverables**
- Polished print/PNG "chalkboard" output from the Phase 0.7 renderer: clean wall-tape layout,
  large-type gym-display variant, both-unit loads — the deferred, low-priority finish.

**Acceptance**
- A week of sessions prints to a legible one-page-per-day chalkboard sheet from the same session
  data as the app.

### Milestone 5.4 — Optional hosted regeneration endpoint
**Deliverables**
- An **optional** serverless function (Anthropic API) that runs `/replan` for users who don't open
  the repo in Claude Code; documented as opt-in (adds keys/cost/secrets), with the fully-local
  Claude-Code path remaining the default.
- (Deferred sub-options, only if pulled forward by demand: sync server + accounts for
  multi-athlete/coach use.)

**Acceptance**
- A user without Claude Code can trigger a re-plan via the hosted endpoint and pull the updated
  `generated/` into their fork.
- The default, zero-cost, fully-local path is unchanged and still works offline.
- **Phase exit:** the full vision is realized — forkable, private-by-default, adaptive,
  offline-first, native + watch, wearable-driven, with optional hosting and polished print, with
  the local path always the default.

---

## Cross-cutting concerns (carried through every phase)

- **Privacy:** the repo is public; the real `profile/` and all of `history/` stay gitignored and
  local. Public docs and templates are sanitized/generic — the athlete appears only as an
  illustrative example, never with private specifics. Persistence of private data is the user's
  responsibility (local copy / private data repo).
- **Testing:** pure logic (schema, autoregulation, timer, generator transforms) stays unit-tested;
  the timer FSM and autoregulation engine are the highest-value test targets.
- **Schema as contract:** any new field flows from `library/schema/` outward; the agent's output is
  constrained by the same Zod schemas the app validates against.
- **Git discipline:** generated programming is always a reviewable diff; feature branches + PRs; no
  straight-to-default commits; past sessions immutable.
- **Research priors live in `CLAUDE.md`:** so the agent's planning stays faithful to the design
  (tendons-as-governor, strict-before-kipping, AM ramp + situational caffeine, mobility as loaded
  end-range, autoregulation = consistency not peaking, never zero on RED).
- **Both units everywhere:** loads display in lb **and** kg across runner, print, and analytics.

## Open questions to resolve as phases land

- **Phase 0/2:** real baseline numbers (strict press 1RM, max strict pull-ups/ring dips, false-grip
  hang, ROM markers) replace `profile/` `TODO baseline week 1-2` placeholders from the Week 1–2
  testing block; chronotype confirmation (in-between); back-history / physio screen before loading
  end-range spinal flexion.
- **Phase 0/4:** SWC multiplier tuning (0.5× vs 0.75×SD) against how the athlete actually feels; the
  14-day cold-start bootstrap.
- **Phase 2:** log write-back mechanism (File System Access API / local endpoint vs export →
  ingest).
- **Phase 3:** Watch implementation (native SwiftUI vs Capacitor watch plugin).
- **Phase 4:** Whoop API/webhook terms reality vs HealthKit/Bevel-only/manual fallback.
- **Phase 5:** hosting model for the optional regeneration endpoint (local-only vs Anthropic-API
  serverless); private-data persistence pattern (local-only vs private submodule).

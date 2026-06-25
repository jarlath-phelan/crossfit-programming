# Architecture

*Technical architecture for this repo. It explains what we build, in what order, and why — the tech stack and its rationale, the web-first delivery strategy, the "hit START" runtime experience, how the data model is the single source of truth, the repo layout that makes it forkable, how the published repo keeps athlete data private, how Claude Code drives continuous re-planning, and a hard line between v1 and later.*

For the **training logic** (philosophy, periodization, readiness rules, progression gates) see [`training-system.md`](./training-system.md). For the **schemas** see [`data-model.md`](./data-model.md), for the **app UX** see [`functional-design.md`](./functional-design.md), and for the **evidence basis** see [`science-foundations.md`](./science-foundations.md). This document is the **software**; `training-system.md` is the **coach**. The data model in §3 is the bridge between them.

---

## 1. Guiding principles

These are load-bearing. Every decision below traces back to one of them.

1. **One source of truth, two renderers.** Human-authored typed data compiles to *both* the app runtime *and* (later) the printable/chalkboard program. The phone screen and the big-display board render from the same `Session` objects, so they can never drift.
2. **Local-first, offline-always.** It is 6am and the box wifi is bad. Today's WOD, the timer, and logging must work with zero network, every time. Network is an enhancement, never a dependency.
3. **The AI proposes; the data and the human decide.** Day-of autoregulation is a deterministic, offline rule engine over data — not an opaque model call. The agent edits *files*; every change to your plan is a reviewable git diff.
4. **Forkability is a feature.** A stranger clones the repo, edits *their own* `profile/`, runs one Claude Code skill, and gets *their* program. "My data" vs "the engine" vs "my generated plan" are three clean, separate folders — and the data folder is **private to each forker** (§6).
5. **v1 ships in days, not months.** Build the daily-use surface first — timer, today's WOD, one-tap manual readiness, local logging, and a Claude-Code regeneration loop. Native wrappers, a **native Apple Watch app**, wearable APIs, and print are explicitly deferred. **Pick the simplest thing that works on the phone in your hand.**

---

## 2. Tech stack — and why this, not the alternative

The strategy is **web-first (phone + big display) → native wrappers later → native Watch & print as companions**. One web codebase is the spine; everything else attaches to it.

| Layer | Choice | Why this, not the alternative |
|---|---|---|
| **Framework** | **Next.js (App Router) + React + TypeScript** | One codebase that static-exports today for the PWA *and* can host server routes later (wearable webhooks, optional sync, a hosted regeneration endpoint). Mature, hireable, and AI-legible — Claude Code reads and writes it reliably. |
| **Language / contract** | **TypeScript + Zod** everywhere | Zod is the *single contract*: it validates human-authored data, generates the TS types the app consumes, and constrains AI-generated sessions to a shape that must parse. One schema, three jobs. |
| **Styling / UI** | **Tailwind + Radix / shadcn primitives** | Fast to build, accessible, and easy to make large-touch-target for sweaty hands. The layout must be **responsive and legible at large size** (the old-iPad gym display, §4) as well as in-hand on a phone. A high-contrast dark "chalkboard" theme is a few utility classes, not a redesign. |
| **Offline / install** | **PWA**: Workbox service worker + Web App Manifest; **Screen Wake Lock API**; **Web Audio + Vibration API** for timer cues | Installs on the iPhone and the old iPad a person already owns, with no App Store gate. Caches today + the next ~14 days for offline. **This is v1's entire delivery mechanism.** |
| **Local data** | **IndexedDB via Dexie** | Instant offline logging that survives a mid-WOD reload. No server, no auth, no round-trip. |
| **State** | **Zustand** for app/runtime state; **XState** (or a hand-rolled reducer) for the timer | The timer is a finite state machine (`countdown → work → rest → round → done`). Modeling it explicitly makes it unit-testable and portable to a future native Watch app. |
| **Native path** | **Capacitor** wrapping the *same* web build | Additive, not a rewrite: the existing PWA becomes the iOS/Android app. **Expo/React Native is rejected** — it would force a full rewrite of the web app to reach the stores, throwing away the spine. |
| **Watch** | **Native Apple Watch app (SwiftUI), deferred to later** | See the tradeoff below — a PWA cannot drive real watchOS haptics, so v1 stays phone-driven and the Watch app is a separate, later codebase consuming a tiny "today + timer" payload. |
| **Print / chalkboard** | **React-PDF / Satori → PNG/PDF**, plus a `print:` Tailwind view — **deprioritized to later** | One render path from the same `Session` objects → whiteboard-ready output and a PDF printout. No second authoring system. The big-screen **board view runs in v1** (it's just responsive web); PDF/print export is a later nicety. |
| **AI engine (v1)** | **Claude Code skills in-repo** — no hosted service | Free, transparent, forkable. The "continuously evolving AI coach" is literally the agent rewriting `generated/` on a rolling window, committed to git. A hosted API endpoint is a *later* convenience for non–Claude-Code users. |
| **License** | **MIT** | Maximally permissive so anyone can fork, adapt, and ship their own coach. |

**The through-line:** every choice protects principles 1 and 2. The web build is the single artifact Capacitor and the future Watch app attach to. Zod is the single contract the renderers and the AI share. Dexie keeps START instant when the network is gone.

### 2a. Why phone-haptics-first, and why the native Watch app waits

The athlete wears an Apple Watch and a Watch app is genuinely wanted — but it is deliberately **later**, and the reason is a hard platform constraint, not a preference:

- **A PWA cannot produce watchOS haptics.** The web `Vibration API` runs on the *phone*; there is no web path to the Watch's Taptic Engine. Driving a real wrist tap on each interval/round boundary requires a **native watchOS app** (SwiftUI + WatchKit), which is a *separate* Swift codebase, signing/provisioning, and an App Store submission — a whole second platform.
- **The phone already does everything v1 needs.** For someone training with the phone in-hand or in a pocket nearby, the **Web Audio beep + phone Vibration API + screen wake-lock** cover the timer-cue job completely. That is the simplest thing that works, and it ships in days.
- **So v1 is phone-driven audio + haptics; the native Watch app is a later companion.** When it lands, it consumes the same tiny "current movement + timer FSM" payload the architecture already exposes (§2 *State* row keeps the timer portable). Deferring it keeps v1 to one codebase and avoids paying the native-Watch tax before the core daily loop is proven.

---

## 3. Data model — the single source of truth

All entities are **Zod schemas** in `library/schema/`. Validating authored data, typing the app, and constraining AI output all read from these same definitions. A database is deliberately rejected here: a DB would hide the truth from git, from diffs, and from a forker.

The complete entity reference — `AthleteProfile`, `Goal`, `Movement`, `Session`, the `Block` union (`Warmup` / `Strength` / `GymnasticsSkill` / `Conditioning` / `Mobility` / `Meditation` / `Note`), `TimerConfig`, `Mesocycle` / `ProgramCalendar`, `ReadinessEntry`, and `WorkoutLog` — is documented in **[`data-model.md`](./data-model.md)** (the canonical, implementable schema spec). The *training semantics* of those entities live in **[`training-system.md`](./training-system.md)**.

The architecturally important properties of that model:

- **A `Session` is one day**: an ordered list of typed `Block`s. Each block is both **renderable** (to phone/board/PDF) and **runnable** (by the runner). There is no separate "display format."
- **Every conditioning block carries a declarative `TimerConfig`** (`amrap` / `for-time` / `emom` / `intervals` / `tabata`). The runner's timer is driven by this config, never hand-coded per workout — so *every* generated WOD is instantly runnable and instantly board-renderable.
- **Loads are unit-agnostic and displayed in BOTH lb and kg.** The data stores a canonical numeric load; the renderer shows lb and kg side by side everywhere a weight appears, so the athlete never does mental conversion mid-session.
- **Each block carries GREEN / AMBER / RED variants or a scaling rule.** This is what lets the runner autoregulate *locally and offline* (§4, §7) without an LLM call.
- **`ReadinessEntry` and `WorkoutLog` are structured**, so the AI reasons over *trends* (weekly volume per pattern, benchmark drift, pain flags, tier distribution) rather than prose. `ReadinessEntry` accepts either a **typed HRV/recovery score** (from a wearable) **or** a one-tap subjective tier — see §4 and §7.

---

## 4. The core experience: "open phone, hit START"

This is the surface the athlete touches every morning. It must be boring, instant, and bulletproof. The full UX lives in **[`functional-design.md`](./functional-design.md)**; here is the architecture-level shape.

**Device targets (v1):**

- **iPhone, in-hand / in-pocket** — the primary surface. One-tap check-in, START, the runner, logging.
- **An old iPad as a dedicated gym display** — props up across the room as a large board; the layout is **responsive and legible at distance** (big type, high contrast). Same web build, same `Session` objects.
- **Apple Watch — later** (native app, §2a). v1 leans on phone audio + haptics.

**Morning check-in** = a **one-tap overall-feel** prompt (minimal friction). It optionally accepts a **typed score** (paste/enter the wearable's recovery/HRV number) and, separately, an optional **session score** entry. Inputs are **hybrid** (§7): if a wearable score is available the athlete types it; otherwise they tap GREEN / AMBER / RED. Manual tap always wins.

**Home screen** = one big card: today's session title, the readiness tier as a color, and a full-width **START**.

1. **START** → full-screen **Session Runner**. Screen Wake Lock engages; the screen never sleeps mid-WOD.
2. The runner walks the session's blocks in order: warm-up checklist → strength/skill (inline set logging, loads in **lb + kg**) → conditioning (**the timer takes over**) → mobility → meditation (an interval bell over a 0.1 Hz / ~6-breaths-per-min paced-breathing animation).
3. The **timer** is the FSM driven by the block's `TimerConfig`: huge countdown, current movement + reps in oversized type, **loud audio beep + phone vibration** on each interval/round boundary, auto-advancing rounds, and result capture (rounds or time) on stop.
4. **Everything logs locally to IndexedDB as it happens.** Nothing blocks on the network. A reload mid-session loses nothing.
5. **Readiness downshift:** if today is AMBER/RED, the runner pre-selects the scaled variant of each block (e.g. RED swaps the MetCon for the meditation + hip-mobility floor session). A one-tap toggle lets the athlete re-pick the tier on the spot — **the human override always wins.**
6. **Quick "done + how it felt" logging.** After the session, a low-friction action captures *done*, an overall how-it-felt rating, and the timer/key result, then serializes the day's `WorkoutLog` into `history/logs/` for the AI to read on its next pass. No mandatory field grind.

The **same** `Session` objects render the **board view** (`/board/today`, v1) and a **PDF export** (later). Build it once; surface it where it's needed.

---

## 5. Repo structure — built for forking

Three top-level zones map directly onto the mental model "my data vs the engine vs my plan." Note that the **data zone is private to each forker** — the public repo ships only a sanitized template (§6).

```
crossfit-programming/
├─ README.md                  # "Fork → copy the example profile → edit → run /replan → train"
├─ LICENSE                    # MIT
├─ CLAUDE.md                  # planning philosophy, research priors, guardrails for the agent
├─ .gitignore                 # ignores real profile/ + history/ (see §6)
├─ docs/
│  ├─ architecture.md         # this document — the software
│  ├─ training-system.md      # the coaching logic
│  ├─ data-model.md           # the canonical entity schemas
│  ├─ functional-design.md    # the app UX
│  ├─ nutrition.md            # fueling guidance
│  ├─ science-foundations.md  # the evidence basis, with citations
│  ├─ testing-protocol.md     # week 1–2 baseline testing
│  └─ decisions.md            # the decision log
│
├─ profile.example/           # SANITIZED TEMPLATE — published; forker copies → profile/
│  ├─ athlete.ts              #   AthleteProfile (generic placeholders)
│  ├─ goals.ts                #   ranked goals + advancement criteria
│  ├─ equipment.ts            #   what their box has
│  └─ readiness-prefs.ts      #   SWC settings, caffeine/collagen toggles
│
├─ profile/                   # ATHLETE-OWNED TRUTH — *gitignored*, private to each forker
│  └─ …                       #   (created by copying profile.example/, never committed publicly)
│
├─ library/                   # SHARED ENGINE / DATA — forkers inherit, can extend
│  ├─ schema/                 #   Zod schemas = the contract
│  ├─ movements/              #   movement library + progressions + scaling rules
│  ├─ templates/              #   block/session archetypes (HSPU block, MU block, Z2…)
│  └─ autoregulation/         #   deterministic GREEN/AMBER/RED engine (pure TS, tested)
│
├─ generated/                 # AI-OWNED, GIT-TRACKED PLAN — machine writes, human reviews
│  ├─ mesocycles/             #   current block plan + rationale.md
│  └─ calendar/               #   dated Session objects (rolling window)
│
├─ history/                   # FEEDBACK LOOP — *gitignored*, private to each forker
│  ├─ readiness/              #   daily ReadinessEntry
│  └─ logs/                   #   WorkoutLog per session
│
├─ app/                       # Next.js PWA
│  ├─ (runner)/ (board)/      #   runner UI, big-display board view
│  ├─ components/
│  └─ lib/timer/  lib/store/  #   timer FSM, Zustand/Dexie store
│
├─ scripts/                   # build: data → app bundle; data → PDF/PNG (print later)
├─ .claude/skills/            # the AI engine as Claude Code skills
│  ├─ onboard/ replan/ today/ deload/
└─ tests/
```

**The three ownership zones:**

- **Data (yours, private):** `profile/`, `history/` — edited by the human (or written by the app), and **gitignored** in the public repo (§6). The published artifact is `profile.example/` only.
- **Engine (shared):** `library/`, `app/`, `scripts/`, `.claude/` — the forkable machine.
- **Generated (the AI's):** `generated/` — written by the agent, reviewed via `git diff`, regenerated on a rolling window. The app **reads** `generated/` + `profile/`; it never writes to `generated/`.

**Onboarding a stranger** (the forkability promise, end to end):

1. Fork + clone, open in Claude Code.
2. **Copy `profile.example/` → `profile/`** (which is gitignored) and edit it — or run `/onboard`, which interviews them and writes `profile/*`.
3. Run `/replan` → the agent reads `profile/` + `library/` + (empty) `history/` and writes a 1–2 week `generated/calendar/`.
4. `npm run dev` or install the PWA → hit START.

---

## 6. Data privacy — public repo, private athlete data

**This repo is published PUBLIC under MIT, but the athlete's data is private.** The architecture keeps those two facts compatible.

- **Real `profile/` and `history/` are gitignored.** The only data artifact in the public repo is **`profile.example/`** — a sanitized template with generic placeholders (no real weights, no medical specifics, no gym name, no personal identifiers). Everything published refers to "the athlete" / "you" generically. A forker **copies the example into the gitignored `profile/`** and fills in their own truth, which never leaves their machine.
- **Persistence caveat — read this before relying on it.** Because real `profile/` and `history/` are gitignored, **they are not version-controlled and do not persist in the public repo** (and will not survive an ephemeral/cloud container that is recreated from the repo). Your private data lives only on local disk. Recommended persistence options:
  - keep a **local backup** of `profile/` + `history/` (e.g. a regular copy or a local-only git repo), and/or
  - point `profile/` + `history/` at a **separate private repo or git submodule** — the public engine repo stays public and MIT, your data repo stays private. This is the recommended path once the data is worth protecting long-term.
- **How a forker supplies their own data.** Fork the public engine → `cp -r profile.example profile` → edit `profile/` locally → (optionally) back it up to a private repo/submodule → run `/replan`. The engine never assumes your data is committed publicly; the app reads it straight off local disk.
- **One-time history scrub.** If real profile data was ever committed to the public history, it must be **scrubbed from git history and force-pushed** (the athlete has approved this), then added to `.gitignore` so it cannot be re-committed.

The net effect: the **engine is open and forkable**, while **each person's truth stays on their own machine** by default.

---

## 7. How Claude Code drives continuous re-planning

The "AI coach" is not a hosted model; in v1 it is **Claude Code skills operating on the repo**. The program "continuously evolves" because the agent rewrites the near future on a rolling cadence, and every rewrite is a git commit you can read and revert.

**Inputs are immutable to the agent's pen; only `generated/` is its output.** It reads `profile/` (truth), `library/` (engine + priors), and `history/` (feedback). It writes `generated/`.

**Rolling-window regeneration** keeps history stable while letting tomorrow adapt:

- **`/today`** — fast. Reads today's `ReadinessEntry`, adjusts *only today's* tier/scaling.
- **`/replan`** — reads `profile/` + `library/` + the last N weeks of `history/`, then rewrites the **next 1–2 weeks** of `generated/calendar/`, leaving past sessions immutable. Fires data-gated advancement (e.g. *"logged 5 clean wall-HSPU negatives → progress to deficit"*) rather than calendar-gated bumps.
- **`/deload`** — inserts a lighter week when the readiness trend / accumulated fatigue warrants it (autoregulated, not fixed).
- **Mesocycle re-baseline every 4–6 weeks** — recomputes the HRV SWC band from `history/`, re-weights volume toward lagging goals, and rewrites `generated/mesocycles/rationale.md`.

**Automation:** a Claude Code `loop`/cron skill can run `/replan` weekly and `/today` each morning so the plan evolves without manual prompting — but each change remains a reviewable commit.

**Guardrails live in `CLAUDE.md`**, encoding the research priors from [`training-system.md`](./training-system.md) (tendons are the governor, strict-before-kipping, AM ramp-up, mobility as loaded end-range, autoregulation = consistency not peaking) and hard limits (cap upper-body progression ~+10%/wk, legs at maintenance, never zero on RED). The agent plans *within* these rails; it does not invent them per run.

---

## 8. Autoregulation engine — deterministic, offline, instant

Day-of readiness must not depend on a model call. `library/autoregulation/` is a **pure, tested function**: `(ReadinessEntry, swcConfig) → Tier`.

**Hybrid input, in priority order:** a typed **wearable recovery/HRV score** when available — **Bevel** (Apple Watch) as the primary source, **Whoop** as a second source when subscribed — otherwise a **manual one-tap GREEN / AMBER / RED**. Either drives the same deterministic rule.

- **GREEN** — rolling HRV in/above the SWC band *and* subjective OK → full session: heavy/skill work fresh, sprinty MetCon.
- **AMBER** — lower SWC edge / rising variability / moderate subjective fatigue → keep skill + strength, cut MetCon volume ~30–50%, drop to Zone 2.
- **RED** — below band for multiple days *or* a manual "exhausted, busy day" override → meditation + hip/hamstring mobility + an easy flush only.
- **Manual override always wins** — subjective readiness out-predicts wearable HRV in the literature, and it is first-class in the data model.
- **Calibration window** — the first ~14 days have no personal HRV baseline; the app surfaces a "still calibrating" note and leans on the subjective tap until the band is built.

This runs **in-app with zero LLM call**, so START is instant. The split is clean: **the LLM *plans* (across days); the rule engine *gates* (on the day).**

---

## 9. v1 vs later

**v1 — ship this first:**

- PWA on **iPhone (in-hand) + old iPad (large gym display, responsive/legible)**: home card, full-screen Session Runner, the timer FSM (AMRAP/EMOM/intervals/for-time/tabata) with wake-lock + **phone audio/haptic** cues, inline set logging with **loads in lb + kg**, IndexedDB local store.
- Zod data model + `library/` + `profile/` (copied from `profile.example/`) + render of today's session.
- **One-tap morning check-in** with optional typed score; deterministic GREEN/AMBER/RED engine with **hybrid input (Bevel score or manual tap)** + manual override + "still calibrating" note.
- **Big-display board view** (`/board/today`).
- Quick **"done + how it felt"** logging → `history/logs/`.
- Claude Code skills `/onboard`, `/replan`, `/today`, `/deload`; `generated/` tracked in git, `profile/` + `history/` **gitignored** (§6); `profile.example/` published.
- **MIT `LICENSE`** + `.gitignore` for private data.

**Later — additive, never a rewrite:**

- **Native Apple Watch app** (SwiftUI) for real wrist haptics + current-movement/timer mirror (§2a) — the main deferred platform.
- **Capacitor** native iOS/Android wrappers (App Store / Play Store) over the same web build.
- **Wearable ingestion** — Bevel / Whoop / HealthKit via webhooks → auto-fills `ReadinessEntry.hrv` so the score doesn't need typing (manual subjective check-in stays).
- **Print / PDF export** of the board (deprioritized; the responsive board view covers v1).
- **Optional hosted regeneration endpoint** (Anthropic API serverless function) so non–Claude-Code users get continuous re-planning; plus a sync server + accounts for multi-athlete / coach use, and a **private data repo/submodule** convention for persisting `profile/` + `history/` (§6).
- **Richer analytics** — volume-per-muscle dashboards, benchmark trend, ROM re-test tracking.

---

## 10. Open questions

These are unresolved and worth flagging before they calcify. (Several earlier questions are now **decided**: Watch = native, later; phone-haptics for v1; data is gitignored with a published example; license is MIT; readiness input is Bevel-primary / Whoop-second / manual fallback.)

1. **Log write-back path in v1.** Does the app commit `WorkoutLog` files directly (needs a tiny local dev server or the File System Access API), or does the user run a Claude Code skill that ingests an in-app export? This sets how "hands-off" the daily loop feels before there is any backend.
2. **Private-data persistence convention.** Confirm the recommended shape for surviving real `profile/` + `history/` across machines/containers: local backup only, a private sibling repo, or a git submodule pointed at a private repo. Pick a default and document it in the README.
3. **Wearable data access reality.** Confirm Bevel / Whoop API/webhook terms and HealthKit availability for programmatic HRV-trend pulls, or accept that v1 stays on a **typed score or manual tap** until ingestion lands.
4. **SWC bootstrap.** The first ~14 days have no personal HRV baseline. Confirm the population-prior → personal-band bootstrap and exactly how the app communicates "still calibrating."
5. **Native Watch trigger + payload.** Decide what moves the Watch app from "later" to "now," and lock the minimal "today + timer FSM" payload it consumes so the v1 web timer stays portable to it.
6. **Hosting model for the eventual regeneration endpoint.** Fully local / Claude-Code-only (max forkability, zero cost) vs an optional Anthropic-API serverless function (broader audience, but adds keys/cost/secrets to the fork).

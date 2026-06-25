# Functional Design — The App UX

*This document is the **functional / UX specification** for the app: what the athlete sees and taps, screen by screen, with simple wireframes and explicit acceptance criteria per surface. It is deliberately separate from the **tech** ([`architecture.md`](./architecture.md)) and the **schemas** ([`data-model.md`](./data-model.md)). Where this doc names an entity or field (`Session`, `Block`, `TimerConfig`, `ReadinessEntry`, `WorkoutLog`, `Tier`, `MeditationBlock`…), it means exactly the shape defined in [`data-model.md`](./data-model.md); where it names a tier behaviour it means exactly the rule in [`training-system.md`](./training-system.md) §5.*

This spec is **forkable and generic**. It is written for "the athlete" / "you" so anyone can clone the repo and adapt it. No private specifics live here — no real weights, no gym name, no medical detail, no personal identifiers. The illustrative numbers in wireframes are placeholders.

**Companion docs:**
[`architecture.md`](./architecture.md) is the *software* (wake-lock, IndexedDB/Dexie, the deterministic offline autoregulation engine, one-source-two-renderers, phone-haptics-first, native Watch deferred, big-iPad board). [`data-model.md`](./data-model.md) is the *schemas* every screen renders from. [`training-system.md`](./training-system.md) is the *coach* (GREEN/AMBER/RED tiers, session composition). [`science-foundations.md`](./science-foundations.md) is the *why*.

---

## 0. Design principles for the UX

These are load-bearing and every screen below traces back to them.

1. **Offline-always, instant.** Sections 1–7 work with **zero network**, every time. Network is an enhancement, never a dependency. A mid-session reload loses nothing (§9). Source: [`architecture.md`](./architecture.md) §1, principle 2.
2. **One tap to train.** The morning loop is: open → (optionally) one tap to confirm feel → one big **START**. Friction is the enemy of consistency.
3. **The human override always wins.** Any tier the engine derives is re-pickable by the athlete, on the home screen *and* mid-session. Subjective readiness out-predicts wearable HRV ([`training-system.md`](./training-system.md) §5.1).
4. **One source, two renderers.** Every screen renders from the same `Session` objects. The phone (in-hand) and the propped iPad (gym board) are the **same build** at two sizes (§7). The chalkboard/print view is the same data again, later (§8).
5. **Big, legible, sweaty-hands-friendly.** Oversized type for the live numbers, large touch targets, high contrast. Readable at arm's length on a phone *and* across the room on an iPad.
6. **Both lb and kg, always.** Every load and bodyweight shows both units (§7). The data stores kg canonically; the UI converts at display time. The athlete never does mental math mid-set.

---

## 1. Home screen — today's session card + START

The surface the athlete touches every morning. Boring, instant, bulletproof.

It shows **one card**: today's `Session.title`, the day's readiness `Tier` rendered as a **color**, the estimated duration, and a full-width **START**. It loads entirely from the local store (today's `Session` from `generated/calendar/`, today's `ReadinessEntry` if one exists) with no network call.

```
┌─────────────────────────────────┐
│  Wed · Jun 25            ⚙  ☰    │
│                                 │
│  ┌───────────────────────────┐  │
│  │ ● GREEN                    │  │   ← tier as a color dot + word
│  │                            │  │
│  │ Block A · Day 2            │  │   ← Session.title
│  │ Press Emphasis +           │  │
│  │ Sprinty Couplet            │  │
│  │                            │  │
│  │ ~58 min · 7 blocks         │  │   ← estDurationMin · block count
│  │ fits 6:30am or 12pm class  │  │   ← Session.classFit (advisory, if present)
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │         ▶  START          │  │   ← full-width, thumb-reachable
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  Today's feel:  🟢  🟡  🔴      │   ← one-tap re-pick (§2), pre-set to tier
│  ▸ still calibrating (day 6/14) │   ← only during the bootstrap window
└─────────────────────────────────┘
```

- The **tier color** is the single dominant visual: GREEN / AMBER / RED map to a green / amber / red accent on the card border and the dot. The word is shown alongside the color for accessibility (never color alone).
- If **no `ReadinessEntry` exists for today**, the card still renders the session at its authored `readinessGate` (the planned GREEN baseline) and the one-tap feel row invites a check-in. START still works — readiness can be picked here or on the first runner screen.
- **START** is the primary action: full-width, high-contrast, reachable with one thumb.

**Acceptance criteria**

- [ ] Home renders today's `Session.title`, `estDurationMin`, block count, and (if present) `classFit` from the local store with **zero network requests**.
- [ ] The readiness `Tier` is shown as a color **and** a text label; it never relies on color alone.
- [ ] START is full-width and occupies the lower-third thumb zone on a phone.
- [ ] Tapping START opens the full-screen Session Runner (§3) for today's session at the current tier.
- [ ] If today has no `Session` (rest/unplanned day), the card shows a friendly empty state offering the wellness/mobility block as an option, and START launches it.
- [ ] During the first `swc.bootstrapDays` (~14) days, a "still calibrating (day N/14)" line is shown (§2).
- [ ] Works fully offline; killing the network does not change anything on this screen.

---

## 2. Morning readiness check-in — one tap, optional score, derived tier

A **one-tap overall-feel** prompt (minimal friction) with an **optional** numeric wearable score. This writes a `ReadinessEntry` (see [`data-model.md`](./data-model.md) §6) and the **deterministic, offline** autoregulation engine ([`architecture.md`](./architecture.md) §8) maps it to a `computedTier`, which selects the **tier-scaled session** the runner shows.

### 2.1 The check-in

The default is **a single tap**: 🟢 GREEN / 🟡 AMBER / 🔴 RED (this is `subjectiveTier`). That tap alone is enough to gate the day.

```
┌─────────────────────────────────┐
│  How do you feel this morning?  │
│                                 │
│   ┌───────┐ ┌───────┐ ┌───────┐ │
│   │  🟢   │ │  🟡   │ │  🔴   │ │   ← one tap = subjectiveTier
│   │ GREEN │ │ AMBER │ │  RED  │ │
│   │ good  │ │ meh   │ │wrecked│ │
│   └───────┘ └───────┘ └───────┘ │
│                                 │
│  ▸ Add a recovery score (opt.)  │   ← collapsed by default
│  ┌───────────────────────────┐  │
│  │ Bevel readiness   [  78 ] │  │   ← optional numeric entry, hybrid input
│  └───────────────────────────┘  │
│                                 │
│  ▸ still calibrating (day 6/14):│
│    leaning on your tap          │
└─────────────────────────────────┘
```

### 2.2 Hybrid input — Bevel primary, Whoop later, manual fallback

Input priority follows `readinessPrefs.sourceOrder` (e.g. `["bevel", "whoop", "manual"]`):

- **Synced score (later):** if a wearable has synced an overnight readiness/recovery number, it pre-fills the optional score field with `entryMethod: "synced"`. **Bevel** is the primary source; **Whoop** is a second source when subscribed.
- **Typed score (v1 hybrid):** if nothing synced, the athlete may **type** the number off their wearable app (`entryMethod: "typed"`). The field is tagged with its `source`/`scale` per `WearableScore`.
- **Manual fallback:** if there is no score at all, the **one-tap tier alone** gates the day. The optional-score section stays collapsed and ignorable.

### 2.3 How the chosen/derived tier maps to the shown session

The engine runs `(ReadinessEntry, ReadinessPrefs) → computedTier` locally (no LLM call). That `computedTier` selects which variant of each `Block` the runner pre-loads:

- **GREEN** → the session runs **as authored** (the `readinessGate` baseline): full strict/skill work, planned MetCon, full mobility + wellness.
- **AMBER** → each block is swapped for its `variants.amber` where present (trim skill volume, cut MetCon ~30–50% / drop to Zone 2). Blocks without an amber variant run as-is.
- **RED** → blocks marked `variants.red: "skip"` drop out; the session **collapses to mobility + the meditation block** — **never zero** ([`training-system.md`](./training-system.md) §5.2). On RED a true full rest day is also an explicit, offered choice.

The home card and runner immediately reflect the new tier color and the swapped blocks.

### 2.4 "Still calibrating" — the first ~14 days

During the first `swc.bootstrapDays` (~14) days there is **no personal HRV baseline**. The app:

- shows a **"still calibrating (day N/14): leaning on your tap"** note on the home card and the check-in,
- **trusts the subjective tap over any wearable number** (the engine's `engineNotes` says so), and
- never presents a derived tier as authoritative during this window.

### 2.5 Manual override always wins

Whatever the wearable says, the athlete's tap (and any free-text override like "wrecked — brutal work week") is the manual signal and **wins** — it can force AMBER/RED regardless of an in-band score. This is true at check-in *and* via the on-the-spot re-pick in the runner (§3.5).

**Acceptance criteria**

- [ ] The check-in is satisfiable with **exactly one tap** (GREEN/AMBER/RED); no further input is required.
- [ ] The optional score section is collapsed by default and never blocks completing the check-in.
- [ ] A typed score is stored with `entryMethod: "typed"` and the correct `source`/`scale`; a synced score (later) with `entryMethod: "synced"`.
- [ ] The check-in writes a `ReadinessEntry` to the local store (IndexedDB) and computes `computedTier` via the **offline** engine — no network request.
- [ ] `computedTier` correctly selects GREEN = authored, AMBER = `variants.amber`, RED = `variants.red`/collapse-to-mobility+meditation, and the home card + runner reflect it immediately.
- [ ] A manual tap or free-text override **always** beats a conflicting wearable score (override wins).
- [ ] During days 1–`bootstrapDays`, the "still calibrating" message is shown and the subjective tap is trusted over any score.
- [ ] On RED, a "take a true rest day" option is offered alongside the wellness/mobility session.

---

## 3. Session Runner — full-screen, blocks in order

START opens the **full-screen Session Runner**, which walks the session's `blocks` **in order**. The **Screen Wake Lock** engages on entry and is held for the whole session ([`architecture.md`](./architecture.md) §4); the screen never sleeps mid-WOD.

The runner is a stepper: one block fills the screen at a time, with a slim progress rail and Prev/Next. Each `Block["type"]` has its own panel.

```
┌─────────────────────────────────┐
│ ●━━━●━━━○──○──○──○──○   2 / 7    │   ← block progress rail
│ ● GREEN          ⟳ re-pick tier │   ← tier color + on-the-spot re-pick (§3.5)
│─────────────────────────────────│
│                                 │
│         [ block panel ]         │   ← warmup / strength / skill /
│                                 │     conditioning / mobility / meditation
│                                 │
│─────────────────────────────────│
│   ◀ Prev          Next ▶        │
└─────────────────────────────────┘
```

### 3.1 Warm-up — a checklist

`WarmupBlock` renders its `items` as a tick-list (the temperature-raising ramp, dynamic only). Each item shows its movement, reps **or** `durationSec`, and any note. The athlete taps items done; the block advances when ready (the checklist is guidance, never a hard gate).

```
│ Temperature-raising ramp · ~13m │
│  ☑ Easy row            3:00     │
│  ☑ Scap pull-ups       ×10      │
│  ☐ Wall handstand hold 0:30     │
│  ☐ Band press warm-up  ×15      │
```

### 3.2 Strength & gymnastics skill — quick inline set logging

`StrengthBlock` / `GymnasticsSkillBlock` show sets × reps, the `LoadPrescription` (rendered in **lb + kg**, §7), `tempo`/`rir`/`restSec`, and `cues`/`qualityNote`. Each set is logged inline with the fewest taps possible — a row per set with a big **✓** that captures reps (and load/RIR/clean where relevant) into a `BlockResult.setsCompleted` entry.

```
│ Seated DB strict press · 4×8–10│
│ Load: 50 lb / 22.5 kg · RIR 2  │   ← both units, §7
│ Tempo 31X1 · rest 0:90         │
│                                 │
│  Set 1   10 reps  50/22.5  ✓   │   ← tap ✓ logs the set
│  Set 2    9 reps  50/22.5  ✓   │
│  Set 3   [  ] reps [   ]    ✓  │   ← inline edit, pre-filled with target
│  Set 4    —                    │
│                                 │
│  ⏱ rest 0:74…                   │   ← optional inter-set rest timer
```

- A short optional **rest timer** can be started between sets; it is a convenience, not the takeover timer (§4).
- Reps/load are pre-filled with the prescription so a "did exactly as written" set is a single ✓ tap.
- A per-block quick **felt 1–5** and an optional `PainFlag` are reachable but never mandatory.

### 3.3 Conditioning — the timer TAKES OVER the screen

When the runner reaches a `ConditioningBlock`, the **WOD timer takes over the full screen** (§4). The block's `TimerConfig` drives the FSM. Nothing else competes for the screen during the piece; on stop, the result is captured and the runner returns to the stepper to advance.

### 3.4 Mobility & meditation

- `MobilityBlock` renders `items` as held positions with a per-item countdown, honoring `sides` (per-side holds run **twice**, prompting a side switch), and showing any `loadNote` (e.g. "light load, full ROM"). See §3.6.
- `MeditationBlock` is the interval-bell + optional paced-breathing surface (§5).

### 3.5 On-the-spot tier re-pick (override always wins)

A persistent **⟳ re-pick tier** control sits in the runner header. One tap opens the same 🟢/🟡/🔴 chooser as §2; choosing a tier **re-loads the remaining blocks** at that tier's variant immediately (e.g. dropping to RED collapses what's left to mobility + meditation). Already-completed blocks are untouched. The new tier is recorded as `WorkoutLog.tierUsed`. This is the human override, mid-session.

### 3.6 Per-side holds (mobility detail)

```
│ Hip & hamstring · loaded end-range │
│  Couch stretch   ← LEFT    0:90 ⏱ │   ← sides:2 → runs L then R
│  Couch stretch   → RIGHT   0:90   │
│  90/90 hip switch  both    1:00   │
│  Jefferson curl    light · 5 slow │   ← loadNote shown verbatim
```

**Acceptance criteria**

- [ ] The runner walks `Session.blocks` **strictly in order**, one block per full screen, with a visible progress rail.
- [ ] **Screen Wake Lock engages on entry and is held until the session ends or is exited**; it re-acquires after an OS-forced release (e.g. tab regains focus).
- [ ] Warm-up renders an item checklist; ticking items is optional and never blocks advancing.
- [ ] Strength/skill sets log inline with a single ✓ for an as-prescribed set; reps/load/RIR/clean persist to `BlockResult.setsCompleted`.
- [ ] All loads in the runner render in **both lb and kg** (§7).
- [ ] Reaching a conditioning block hands the **full screen to the timer** (§4); no other UI competes.
- [ ] Mobility honors `sides` (per-side holds run twice with a side prompt) and shows `loadNote` verbatim.
- [ ] The **⟳ re-pick tier** control is present on every block and re-loads the remaining blocks at the chosen tier immediately, leaving completed blocks intact, and updates `tierUsed`.
- [ ] Every interaction writes to the local store as it happens; nothing blocks on the network.

---

## 4. The WOD timer — behaviors per `TimerConfig` type

The timer is the FSM (`countdown → work → rest → round → done`) driven by the block's `TimerConfig` ([`data-model.md`](./data-model.md) §4.4) — never hand-coded per workout. It owns the full screen.

**Universal behaviors (all timer types):**

- A **huge countdown** is the dominant element; the **current movement + reps** sit in oversized type beneath it.
- A **lead-in count** of `cues.countdownSec` (default 3) precedes work, with a beep per second.
- On every boundary (start / round / work↔rest / done), the timer fires a **LOUD beep** (`cues.loudCue`, Web Audio) **and phone vibration** (`cues.haptics`, Vibration API) — phone-driven for now; native Watch haptics are deferred ([`architecture.md`](./architecture.md) §2a).
- The **screen wake-lock** is held (`cues.wakeLock`).
- Rounds **auto-advance**; no tap needed to move between rounds/intervals.
- A big **STOP / DONE** ends the piece and triggers **result capture** per `scoreType`.
- If `cues` is omitted, the runner applies the athlete's default `{ countdownSec: 3, loudCue: true, haptics: true, wakeLock: true }`.

```
┌─────────────────────────────────┐
│  AMRAP 8:00            ● GREEN   │
│                                 │
│            04:12                │   ← HUGE countdown, fills the screen
│                                 │
│   ─────────────────────────     │
│   ROW            12 cal         │   ← current movement + reps, oversized
│   DB THRUSTER     9  50/22.5    │     (loads in lb/kg, §7)
│   ─────────────────────────     │
│   round 6 · tap to bank a round │
│                                 │
│  ┌───────────────────────────┐  │
│  │           STOP            │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Per-type behavior:**

| `TimerConfig.type` | Counts | Boundary cues | Auto-advance | Result captured on stop |
|---|---|---|---|---|
| `amrap` | counts **down** from `durationSec` | beep+buzz at start and at 0:00 (done); optional per-round buzz when athlete banks a round | n/a (single window) | `rounds` + `reps` (`scoreType: "rounds-reps"`) |
| `for-time` | counts **up** to `capSec` (shows cap) | beep+buzz at start, at each `rounds` boundary if tracked, and at the cap | rounds tick as completed | `timeSec` (or "capped") (`scoreType: "time"`) |
| `emom` | counts **down** each `intervalSec`, repeating `rounds` | beep+buzz at the top of **every** interval; distinct "rest/transition" tone when work for the interval is done | auto-advances to the next minute/slot; rotates `slots[]` movement | completed intervals / `reps` |
| `intervals` | alternates `workSec` / `restSec` for `rounds` | beep+buzz at each work→rest and rest→work flip | auto-advances through all rounds | rounds completed / per-interval result |
| `tabata` | preset `20s` work / `10s` rest × `8` | beep+buzz at each 20↔10 flip and at the final round | auto-advances 8 rounds | rounds / reps per round |

**Result capture on stop** writes a `BlockResult.score` shaped by `scoreType` (`rounds-reps` → `{rounds, reps}`; `time` → `{timeSec}`; etc.), pre-filled from what the FSM tracked, with a quick confirm/edit. A per-block **felt 1–5** is offered.

**Acceptance criteria**

- [ ] The timer is driven entirely by `TimerConfig`; the same component runs all five types with no per-WOD code.
- [ ] The countdown is the largest on-screen element; current movement + reps are in oversized type beneath it.
- [ ] A `cues.countdownSec` lead-in (default 3) precedes work with per-second beeps.
- [ ] On **every** boundary, a loud Web Audio beep **and** a phone vibration fire when `loudCue`/`haptics` are true.
- [ ] Cues respect explicit `cues`; when `cues` is omitted, the default `{3,true,true,true}` applies.
- [ ] Rounds/intervals **auto-advance** without a tap; `emom` rotates `slots[]`; `tabata` runs 20/10×8.
- [ ] `for-time` shows and enforces the `capSec`; a capped piece is recorded as capped.
- [ ] STOP captures a `BlockResult.score` matching the block's `scoreType`, pre-filled from the FSM and editable.
- [ ] Audio + haptics fire correctly with the screen on and the phone in a pocket; the wake-lock holds throughout.

---

## 5. Meditation block — interval bell + optional paced breathing

The `MeditationBlock` ([`data-model.md`](./data-model.md) §4.5) is the daily wellness block — **first-class programming and the default RED-day session** ([`training-system.md`](./training-system.md) §6). **Unguided by default.** It composes two independent mechanisms; either or both may be present.

### 5.1 Interval bell (`BellConfig`)

Set a **total `durationMin`** and a **bell `intervalMin` (1–5 min)**; a chime rings every N minutes, with optional `startBell` / `endBell` and optional `haptics`. This is a Zen/Insight-timer-style setup. The bell can run **alone** (a silent sit with periodic chimes).

### 5.2 Optional paced breathing (`PacedBreathing`)

An optional on-screen pacer at **~6 breaths/min** (0.1 Hz resonance), with explicit `inhaleSec` / `exhaleSec` (exhale ≥ inhale) and an optional hold, rendered as the chosen `visual` (`expanding-orb` / `rising-bar` / `wave` / `none`). The athlete can **follow it or ignore it** — it is a guide, not a gate, and can run alone or alongside the bell.

```
┌─────────────────────────────────┐
│  Wellness · 10:00        ● any   │
│                                 │
│            07:42                │   ← remaining sit time
│                                 │
│            ╭───────╮            │
│           (  inhale )           │   ← expanding-orb pacer, 6 bpm
│            ╰───────╯              │     (4s in / 6s out) — optional
│                                 │
│   next bell in 0:18  · every 2m │   ← interval bell
│                                 │
│  [ pacer: orb ▾ ]  [ bell ▾ ]   │   ← quick toggles; either can be off
│  ┌──────────┐   ┌────────────┐  │
│  │   PAUSE  │   │   DONE     │  │
│  └──────────┘   └────────────┘  │
└─────────────────────────────────┘
```

- Defaults are **unguided**: no voice. If a `guidedUrl` is present it is offered as an optional link, never auto-played.
- An optional `script` (e.g. breathing instruction) is shown as quiet text.
- The breathing pacer is **fully ignorable** — a user who just wants the bell sees only the timer + chimes.

**Acceptance criteria**

- [ ] A bell-only block runs a silent sit of `durationMin` with a chime every `intervalMin`, honoring `startBell`/`endBell` and optional `haptics`.
- [ ] `intervalMin` is constrained to 1–5.
- [ ] A breathing-only block runs the pacer at `breathsPerMin` with the configured `inhaleSec`/`exhaleSec` (and holds) in the chosen `visual`.
- [ ] A block with both shows the pacer **and** chimes on the bell interval simultaneously.
- [ ] The block is **unguided by default**; `guidedUrl` is only offered as a link and never auto-plays.
- [ ] The breathing pacer can be toggled off; the user can complete the sit on the bell alone.
- [ ] On RED, this block is offered as the session (with a true-rest-day alternative); it is never forced.
- [ ] Completion writes a `BlockResult` with `durationSec`.

---

## 6. Post-session logging — quick "done + how it felt"

After the last block, a **low-friction wrap-up** captures *done*, an overall **how-it-felt** rating, and the key timer/strength results — then serializes the day's `WorkoutLog` ([`data-model.md`](./data-model.md) §7). Everything was already written to **IndexedDB** as the session ran (§9); this screen is a confirm + a single felt rating, not a data-entry grind.

```
┌─────────────────────────────────┐
│  Nice work.  58:00 · GREEN      │
│                                 │
│  How did it feel overall?       │
│   🙂1  🙂2  😐3  😕4  😣5        │   ← feltOverall 1–5, one tap
│                                 │
│  Captured automatically:        │
│   • DB press  4×8–10 logged     │
│   • AMRAP  6 + 8                │   ← from the timer (§4)
│   • Mobility + 10-min sit ✓     │
│                                 │
│  ▸ Add a note / flag a tweak    │   ← optional notes / PainFlag
│                                 │
│  ┌───────────────────────────┐  │
│  │      SAVE TO HISTORY      │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

- **`feltOverall` (1–5)** is the one near-mandatory tap; everything else is pre-filled from per-block results.
- Optional: a free-text `notes`, a `PainFlag` (joint + severity → the AI auto-cuts the offending volume on its next pass), or a `benchmarkPR`.
- **Save** finalizes the `WorkoutLog` in the local store. The file is later committed to `history/logs/` for the AI to read on its next `/replan` (the exact write-back path — direct file write vs. a Claude Code skill ingest of an in-app export — is an [`architecture.md`](./architecture.md) §10 open question; the UX is the same regardless).

**Acceptance criteria**

- [ ] The wrap-up is completable with a single tap (`feltOverall`); all other fields are optional and pre-filled.
- [ ] Per-block results captured during the session (sets, timer score, durations) appear pre-filled and editable.
- [ ] Saving writes a complete, schema-valid `WorkoutLog` to IndexedDB with **no network dependency**.
- [ ] An optional `PainFlag` (joint + severity 1–5) and free-text `notes` can be attached.
- [ ] `tierUsed` reflects any mid-session tier re-pick (§3.5).
- [ ] The saved log is queued for serialization to `history/logs/` (write-back mechanism per architecture §10); a failed/absent commit never loses the local record.

---

## 7. Display — both units, responsive phone ↔ iPad board

### 7.1 Both lb + kg, everywhere a load appears

Loads and bodyweights are stored canonically in **kg** and rendered in **both units** at display time, leading with `units.primary` and showing the secondary alongside when `units.showBoth` is true (e.g. `50 lb / 22.5 kg`). The athlete never converts mid-session. Display rounding respects `units.loadRoundingKg`.

### 7.2 Responsive: in-hand phone ↔ propped iPad gym board

The **same web build** and the **same `Session` objects** render at two sizes ([`architecture.md`](./architecture.md) §4):

- **Phone, in-hand / in-pocket** — the primary interactive surface: check-in, START, the runner, logging. Touch targets sized for sweaty hands.
- **Old iPad, propped as a gym display** — the board view at `/board/today`: same data, **big type, high contrast**, legible across the room. The timer's huge countdown and the current movement + reps are the hero elements at distance.

```
  PHONE (in-hand)              iPad BOARD (across the room)
┌───────────────┐        ┌───────────────────────────────────┐
│ ● GREEN       │        │   AMRAP 8:00            04:12      │
│ Block A · D2  │        │                                   │
│ ~58m · 7 blk  │        │   ROW            12               │
│ [   START   ] │        │   DB THRUSTER     9   50 / 22.5    │
│ 🟢 🟡 🔴      │        │   round 6                         │
└───────────────┘        └───────────────────────────────────┘
```

**Acceptance criteria**

- [ ] Every load/bodyweight renders in both lb and kg (leading with `units.primary`, secondary shown when `showBoth`), with no manual conversion anywhere.
- [ ] Displayed loads honor `units.loadRoundingKg`.
- [ ] The layout is legible in-hand on a phone (arm's length) **and** at a distance on a propped iPad; the timer's countdown and current movement scale up to be the hero elements on the board.
- [ ] `/board/today` renders the same `Session` objects as the phone — the two cannot drift.
- [ ] High-contrast rendering remains legible in a bright/garage-gym setting.

---

## 8. Chalkboard / print view — later, low priority

A **chalkboard/print surface** renders the same `Session` objects to a whiteboard-style card and (eventually) a PDF/PNG. The responsive **board view** (`/board/today`, §7) already covers the v1 "big display" need; a dedicated **print/PDF export** is **deprioritized to later** ([`architecture.md`](./architecture.md) §9, §2 print row). It is mentioned here for completeness and intentionally not over-specified: same data, one more renderer, no second authoring system.

**Acceptance criteria**

- [ ] The board view at `/board/today` exists in v1 and is the large-display surface.
- [ ] A dedicated PDF/PNG print export is explicitly out of scope for v1 and, when built, reads the same `Session` objects (no new authoring path).

---

## 9. Offline-always guarantees

Everything in §§1–7 works with **zero network**, every time. This is non-negotiable ([`architecture.md`](./architecture.md) §1).

- **Cached for offline:** today's `Session` plus the next ~14 days are cached (PWA service worker); the app shell, the timer, and the engine are all local.
- **Local-first writes:** `ReadinessEntry`, inline set logs, timer results, and the `WorkoutLog` are written to **IndexedDB (Dexie)** as they happen. No write waits on a round-trip.
- **Deterministic, offline readiness:** the GREEN/AMBER/RED engine is a pure local function — START is instant with no LLM call ([`architecture.md`](./architecture.md) §8).
- **Crash/reload safety:** a **mid-session reload loses nothing** — on relaunch the runner restores the in-progress session: the current block index, completed sets, timer elapsed/round state, and the readiness tier are all rehydrated from the local store.

**Acceptance criteria**

- [ ] With the network fully disabled, §§1–7 (home, check-in, runner, timer, meditation, logging, both-unit display) all function end to end.
- [ ] Today + the next ~14 days of sessions are available offline.
- [ ] All check-in, set-log, timer, and workout-log writes persist to IndexedDB without a network call.
- [ ] A reload (or crash) **mid-session** restores block position, logged sets, timer state, and the active tier with no data loss.
- [ ] The readiness tier is computed locally with zero network dependency.

---

## 10. End-to-end happy path — the 6am walkthrough

> It's 6am. Box wifi is bad. The phone is in hand.

1. **Open the app.** The home card (§1) renders instantly from the local store: *"Block A · Day 2 — Press Emphasis + Sprinty Couplet, ~58 min,"* with a green accent from yesterday's plan. No network.
2. **One tap to confirm feel.** Slept fine → tap **🟢 GREEN** (§2). A wearable score field is there but ignorable; nothing synced, so the tap alone gates the day. (If it were day 6, a *"still calibrating"* note would remind the athlete the tap is what's trusted.) The engine computes `computedTier = GREEN` locally; the card stays green and the session loads as authored.
3. **Hit START** (§1). The full-screen runner opens; the **screen wake-lock engages** (§3).
4. **Warm-up** (§3.1): tick through the 13-minute temperature-raising ramp checklist.
5. **Strict skill + strength** (§3.2): wall-HSPU negatives and seated DB press, **50 lb / 22.5 kg** shown in both units; each set logged with a single ✓ as prescribed, with an optional rest timer between sets.
6. **Conditioning** (§3.3 → §4): the **timer takes over the screen** — *AMRAP 8:00*. A 3-2-1 lead-in beeps, the huge countdown runs, ROW 12 / DB THRUSTER 9 sit in oversized type, loud beeps + phone buzz mark each round. On **STOP**, the result *6 rounds + 8 reps* is captured.
7. **Mobility** (§3.4, §3.6): per-side hip/hamstring holds count down, prompting a left→right switch.
8. **Meditation** (§5): a 10-minute sit — the expanding-orb pacer breathes at 6/min while a chime lands every 2 minutes. (On a RED morning, *this* would have been the whole session — offered, not forced.)
9. **Wrap up** (§6): *"How did it feel?"* → tap **2**. The DB-press sets, the AMRAP score, and the mobility/sit durations are already filled. **Save to history** writes the `WorkoutLog` to IndexedDB.
10. **Mid-session reload, anytime:** had the phone reloaded during the AMRAP, the runner would have restored the block position, logged sets, timer state, and the GREEN tier — **nothing lost** (§9).

The whole loop — open, one tap, START, train, log — ran **fully offline**, instant, with both units on every load and the human always one tap from overriding the tier.

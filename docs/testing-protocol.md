# Testing Protocol — the Week 1–2 baseline block

*This is the **gentle calibration block** that turns the program's placeholder gates into real numbers.
Until you run it, the progression rungs in [`training-system.md`](training-system.md) §7 and the
readiness SWC band in §5 are **guesses**. This block replaces the guesses with measured starting points —
**without crushing a re-onboarding athlete.***

This doc is **forkable and generic**: it is written for "you" / "the athlete" so anyone can clone the
repo and run the same block. Where it helps, it uses the running example — a fast-twitch,
lower-body-dominant masters CrossFitter re-onboarding conditioning, chasing a strict HSPU and a strict
ring muscle-up — but every number here is illustrative. Swap in your own and the logic holds.

**Companion docs:**
[`training-system.md`](training-system.md) is the coach (this block sets *its* gates);
[`science-foundations.md`](science-foundations.md) is the *why* behind every test choice;
[`data-model.md`](data-model.md) is where the results are *stored* (`benchmarks`, `benchmarkPRs`);
[`functional-design.md`](functional-design.md) is how the app *captures and re-tests* them;
[`nutrition.md`](nutrition.md) is fueling around the harder test days;
[`decisions.md`](decisions.md) is the *log of athlete choices* this block implements.
The guardrails this block obeys live in [`../CLAUDE.md`](../CLAUDE.md).

---

## 0. Principles — why testing this way, this gently

1. **The block must not become the injury.** A re-onboarding masters athlete with weeks of sporadic
   training is at peak risk in week 1, not week 6. Tendons adapt on a ~12-week clock (see
   [`science-foundations.md`](science-foundations.md) §5); a true 1RM or a max-effort benchmark in
   week 1 is exactly the spike the whole program is built to avoid. **We never take a true 1RM here, and
   we never test to true failure on the tissues we're trying to protect.**

2. **Estimate, don't max.** Strength is captured as a **conservative rep-max → estimated 1RM**, not a
   one-rep grind. The estimate is plenty accurate to set starting loads and ratios, and it costs a
   fraction of the fatigue and risk.

3. **Test fresh, test early, test rested.** Every marker is measured **after the standard 12–15 min ramp**
   (§1), on a **GREEN or high-AMBER day only**, with the test placed *first* in the session while the CNS
   and tissues are fresh. **Never test on a RED day** — reschedule the marker, don't push through.

4. **Interleave, don't stack.** The two weeks below thread the tests *into* normal early training so no
   single day is brutal. Pressing and pulling maxes never share a 24-hour window; ROM and conditioning
   ride the easy days.

5. **One conditioning anchor, kept sub-maximal.** Conditioning is re-onboarded over 4–8 weeks
   ([`training-system.md`](training-system.md) §3.5). The benchmark here is a **gentle anchor** — a
   capped sprint set *or* a deliberately sub-maximal row — not a Grace/Fran for-time effort. We are
   marking a starting line, not racing it.

6. **Honest gaps over invented numbers.** If a marker can't be measured safely or cleanly (pain, a missed
   GREEN day, equipment), **record it as "deferred," not a fabricated value.** A placeholder gate is
   better than a wrong number. (Mirrors the open-calibration rule in [`../CLAUDE.md`](../CLAUDE.md).)

7. **Spine caution is built in.** With any structural spine asymmetry or back history, **nothing in this block
   loads end-range spinal flexion.** The only spine-relevant tests are **unloaded ROM reaches**. See §6.

---

## 1. The warm-up — the standard 12–15 min ramp (mandatory before every test)

Identical to the session ramp in [`training-system.md`](training-system.md) §4 — testing does not get a
special warm-up, it gets the *normal* one, done well. **Dynamic only; no static holds >30–60 s** before a
strength or skill test (long holds cost ~4–7.5% strength — that would corrupt the very number you're
trying to measure).

```
[0:00–0:03]  General: bike or row, easy → moderate, to raise core temperature
[0:03–0:08]  Dynamic mobility: leg swings, hip openers, banded scap/shoulder prep,
             thoracic rotations; WRIST PREP if a false-grip test is coming
[0:08–0:12]  Movement-specific ramp: for the press, empty bar/light DB → ~40% → ~60%
             → ~75% of the expected working load, low reps, crisp
[0:12–0:15]  One or two "primer" reps at the first test load; confirm it feels easy
```

**ROM markers are measured AFTER this ramp, not cold** — you want *usable, warm* range, the range you'll
actually train in, not a cold worst-case. The one exception is noted in §3 (re-test the same way every
time, warm).

> Caffeine note: a ramp is not a reason to caffeinate. Reserve the ~3 mg/kg dose for the genuinely hard
> GREEN test days (the press estimate, the conditioning anchor) per [`training-system.md`](training-system.md)
> §4 — AM-only, and skip it if it's an easy ROM/mobility day.

---

## 2. The strength & skill markers — order, exact test, and how to record

**Why this order:** highest-CNS / most-fatiguing first, and never two competing maxes in one day. Across
the two-week schedule (§5) these land on separate days. Within a single test day, follow the order listed.

### 2.1 Strict press — a rep-max → **estimated** 1RM (never a true 1RM early)

- **Why estimate:** a true 1RM in week 1 is the highest-risk, lowest-value option for a re-onboarding
  masters lifter. A clean rep-max gives an estimate accurate enough to set every pressing load and the
  HSPU ratio, at far lower CNS and shoulder cost.
- **The test:**
  1. Ramp as in §1. Pick a load you're confident you can press for **about 5–8 clean strict reps** (a
     true ~75–80% feel). Strict = no leg drive, no layback beyond a braced neutral trunk.
  2. Do **one set, stopping at ~2 reps in reserve (RIR)** — i.e. stop when you're sure you could only do
     ~2 more clean reps. **Do not grind to failure.** If you blow past 10 reps, the load was too light;
     rest 5+ min, add load, and take *one* more set (this is the only marker you may re-attempt same-day,
     and only once).
  3. Record the **load × reps** actually achieved.
- **Estimate the 1RM (Epley):** `est1RM = load × (1 + reps/30)`.
  *Worked example:* 60 kg (132 lb) × 6 clean reps → `60 × (1 + 6/30) = 72 kg` ≈ **159 lb estimated**.
  Keep reps **≤ ~8** — the formula drifts high above that.
- **Record:** `strictPress1RM` (the *estimated* value) plus the raw `strictPressRepMax` ("60kg×6") in the
  profile `benchmarks` map ([`data-model.md`](data-model.md)). Note "estimated, rep-max derived" so future
  you knows it wasn't a true single.
- **Feeds:** the HSPU gate (§7) and starting pressing loads.

### 2.2 Max strict pull-ups — dead-hang, no kip

- **The test:** after the ramp (include a couple of sub-max hangs/pulls), do **one set of strict
  dead-hang pull-ups to a clean, controlled max** — full hang at the bottom, chin clearly over the bar,
  **no kip, no swing.** Stop the instant form breaks or a rep needs a kip; that rep doesn't count. This is
  one of the few "to honest max" tests we allow because it's bodyweight and self-limiting — but **stop at
  form failure, not muscular collapse**, and don't do forced/assisted extra reps.
- **Record:** `strictPullUpsMax` (integer). Note bodyweight on the day (pull-up capacity is a ratio).
- **Feeds:** the muscle-up gate (§7.2 of [`training-system.md`](training-system.md) wants ~8–10 strict).

### 2.3 Max strict ring dips — full lockout, controlled

- **The test:** rings at a height you can reach without a big jump. Support hold at the top, **lower under
  control to rings-at-armpit depth, press to full lockout.** One set to a **clean controlled max** — stop
  at form breakdown (shoulders shrugging up, loss of ring control, kip), not at failure. Rings are
  shoulder-sensitive; if the shoulder complains, stop and record what was clean.
- **Record:** `strictRingDipsMax` (integer).
- **Feeds:** the muscle-up gate (wants ~5–10 strict ring dips) and pressing/HSPU support.

### 2.4 False-grip hang time — the muscle-up rate-limiter

- **Why it matters most:** the false grip is *the* limiter for the strict ring MU
  ([`training-system.md`](training-system.md) §7.2). If it's only a few seconds, that number alone tells
  you the muscle-up is a tissue-prep project before it's a strength project.
- **The test:** set rings/bar at hang height. Establish a **true false grip** (wrist rolled over the ring
  so the heel of the hand is on top, ring across the base of the palm). Hang with arms straight and
  **time the hold until the false grip breaks** (wrist slips back to a normal hang) — not until your grip
  gives out generally. One quality attempt; **do not** rep it out for time — false-grip volume is the
  dominant cause of medial-elbow/wrist pain (see [`science-foundations.md`](science-foundations.md) §6).
- **Record:** `falseGripHangSec` (seconds). A few seconds is **normal and fine** — it just sets the
  starting rung.
- **Feeds:** the MU gate's "~10 s+ false-grip hang" threshold and the false-grip volume ramp (§7).

> **Pain rule for §2.2–2.4:** any wrist/elbow/shoulder pain (not effort — *pain*) ends the test
> immediately. Record what was clean, flag the joint, and the planner auto-trims false-grip / kipping /
> eccentric volume per [`training-system.md`](training-system.md) §8.

---

## 3. The ROM markers — measured warm, recorded simply

ROM is checked **at this block and at each deload re-test** — periodic, not a daily chore
([`training-system.md`](training-system.md) §7.3). Measure all four the **same way every time** (same
warm-up state, same reference points) so the re-test is comparable. Sold as *"moves and feels better,"*
**not** "less soreness."

| Marker | Exact test | Record as |
|---|---|---|
| **Forward fold / toe-touch** | Stand, feet together, knees straight, hinge and reach down slowly. Measure fingertip-to-floor distance (cm). Negative if you reach past the toes (use a step/sit-and-reach box to get below the feet). | `romToeTouchCm` (e.g. `−2` = 2 cm past toes; `+15` = fingertips 15 cm above floor) |
| **Overhead / shoulder flexion** | Back to a wall, low back flat (no rib flare), arms straight, raise overhead and try to touch the wall keeping elbows straight and lumbar flat. Score: full clean contact / contact-with-effort / how far short (cm). *Co-limiter for HSPU + press — track it closely.* | `romOverhead` (e.g. `"contact w/ effort, slight rib flare"` or a cm gap) |
| **Ankle dorsiflexion (knee-to-wall)** | Foot pointing at a wall, knee drives forward to touch the wall, heel stays down. Slide the foot back to the max distance where the knee still touches with the heel down. Measure toe-to-wall (cm). **Test both sides** — note L/R difference (relevant to the asymmetry goal). | `romAnkleKTWcm` (e.g. `"L 9 / R 11"`) |
| **Hip marker** | Deep-squat hold: heels-down depth and comfort (full/partial, easy/forced). Optionally 90/90 hip internal-rotation feel. | `romHipSquat` (e.g. `"below parallel, heels down, mild groin tension"`) |

- **Record:** the four `rom*` keys in the profile `benchmarks` map.
- **No spinal loading.** The toe-touch is an **unloaded reach** for measurement only — it is **not** a
  Jefferson curl and carries **no load**. See §6.
- **Expectation-setting:** noticeably looser in 2–4 weeks; *measured* change by ~6–12 weeks; then
  maintenance.

---

## 4. The conditioning anchor — ONE gentle benchmark, kept sub-maximal

Pick **one** anchor (the example athlete, fast-twitch and sprint-loving, suits the sprint option; a
machine option is friendlier to a detrained engine and joints). **Either way it is sub-maximal** — a
controlled effort to mark a baseline, **not** a for-time race. Do it on a GREEN day, after the ramp, and
**not** in the same session as a strength max.

- **Option A — capped short sprint set (fast-twitch friendly):**
  6 × 10-second hard-but-controlled efforts (hill, bike, or row), **full recovery** (~90 s+) between, at
  a perceived **~85–90% effort, not all-out.** Record best and average effort feel + the modality. The
  point is to anchor power/RPE, not to redline.
  `condSprint` (e.g. `"6×10s bike, avg RPE 8, felt smooth"`).

- **Option B — sub-maximal 2k row:**
  Row 2k at a **conversational-hard, controlled pace — RPE ~7/10, deliberately NOT a PR attempt.**
  Record time *and* the RPE so the re-test compares like-for-like (a faster time at the same RPE = real
  aerobic return). `cond2kRowSubmax` (e.g. `"8:10 @ RPE 7"`).

- **Either way:** record the modality, the result, **and the RPE/effort cap**, so future re-tests are
  honest comparisons rather than a creeping max. This anchors the conditioning re-onboard ramp in
  [`training-system.md`](training-system.md) §3.5 — early weeks bias to the fast-twitch end and let
  Zone-2 volume accumulate slowly.

> Why so gentle: a detrained-but-talented engine returns fast, but tissue and aerobic base need the ramp.
> Crushing a true 2k or a Grace in week 1 buys a number you don't need and a week of soreness you can't
> afford. The anchor exists to *start* the ramp, not to test its ceiling.

---

## 5. The 2-week schedule — interleaved so no day is brutal

This threads the tests into normal early training (Block A, pressing emphasis, at the **low end** of every
volume target — see [`training-system.md`](training-system.md) §2.1 week 1–2). **Tests are placed first,
fresh, on GREEN days; if a test day comes up AMBER, do the easy work and slide the test to the next GREEN
day.** During this window the readiness app shows **"still calibrating"** (no personal HRV baseline yet —
§5 of [`training-system.md`](training-system.md)), so lean on the subjective one-tap check.

**Week 1 — accumulate the upper-body & ROM markers (no two maxes adjacent):**

| Day | Readiness needed | Session |
|---|---|---|
| 1 (Mon) | GREEN | Ramp → **TEST: strict press rep-max → est 1RM** (§2.1) → light chest/delt accessory (low volume) → **M block + ROM: toe-touch & overhead** (§3) |
| 2 (Tue) | any | Easy: ramp → light strict pull *volume* (grease-the-groove, not a test) → mobility-heavy **M** → **ROM: ankle KTW & hip** (§3) |
| 3 (Wed) | GREEN | Ramp → **TEST: max strict pull-ups** (§2.2) → **TEST: max strict ring dips** (§2.3) → light back accessory → **M** |
| 4 (Thu) | any | Easy: ramp → unilateral/anti-rotation + light leg maintenance → **M** (full rest day is fine if sore) |
| 5 (Fri) | GREEN | Ramp → **TEST: conditioning anchor** (§4, sub-maximal) → short mobility → **M** |

**Week 2 — the tendon-sensitive marker, a re-check, and roll into normal programming:**

| Day | Readiness needed | Session |
|---|---|---|
| 1 (Mon) | GREEN | Ramp → **TEST: false-grip hang time** (§2.4, single quality attempt) → light false-grip rows (low volume) → **M** |
| 2 (Tue) | any | Easy: ramp → mobility-heavy **M** (overhead/t-spine focus) → optional **re-measure any ROM marker** that felt off in week 1 |
| 3 (Wed) | GREEN | Normal Block A pressing day (loads now set from the §2.1 estimate) → H chest/delts → **M** |
| 4 (Thu) | any | Easy: H back/lats + unilateral/anti-rotation → **M** |
| 5 (Fri) | GREEN | Normal Block A integration day → short polarized conditioning (still sub-maximal) → **M** |

Notes:
- **The two strength maxes (press Mon, pull/dip Wed) are 48 h apart**; the false-grip hang (the most
  tendon-sensitive marker) gets its **own fresh day** at the start of week 2.
- **Any easy day can become a true rest day** if you're sore or AMBER/RED — the M block is the default
  offer, never a mandate ([`training-system.md`](training-system.md) §5.2).
- On a **2-day week** (the busy-week floor), compress to: Day 1 = ramp → press estimate → light accessory
  → M; Day 2 = ramp → pull-ups + ring dips → M. Defer false-grip, ROM, and the conditioning anchor to the
  following week. **Don't cram all markers into a thin week.**
- By the end of week 2 you also have ~10–14 days of morning HRV logged, which begins to seed the SWC band
  (§8).

---

## 6. Spine-cautious notes (read before any spinal-loading test)

Some athletes have a structural spine asymmetry (for example asymptomatic scoliosis) or a low-back
history. The rule is simple: *if you have any structural spine asymmetry or low-back
history,* apply the following — and if unsure, get the cheap insurance of a physio movement screen before
loading end-range flexion ([`training-system.md`](training-system.md) §6).

- **No loaded end-range spinal flexion in this block, full stop.** The toe-touch (§3) is an **unloaded
  reach measured for ROM only** — never add load to "test" it, and never turn it into a Jefferson curl
  here.
- **Capture the asymmetry as data.** Test **both sides** on the ankle knee-to-wall and note any obvious
  L/R difference in the overhead and hip markers. These L/R deltas feed the **unilateral + anti-rotation**
  emphasis that is corrective programming, not garnish ([`training-system.md`](training-system.md) §6).
- **Midline is tested as anti-extension/anti-rotation later, not loaded flexion now.** No max sit-up
  tests, no loaded spinal-flexion benchmarks.
- **Flag, don't diagnose.** If a reach or hold reproduces *pain* (not stretch), stop and note it; that's a
  physio conversation, not a number to chase.

---

## 7. How the results set the gates

The whole point of the block: convert placeholders into live gates the AI plans against.

### 7.1 Strict HSPU gate (from §2.1 press + §3 overhead ROM)

- The strict-press **estimated 1RM** sets the pressing loads and the HSPU ratio benchmark: a practical
  HSPU gateway is roughly **0.65–0.75× bodyweight strict press**
  ([`training-system.md`](training-system.md) §7.1). Compare your estimate to that band to know how far
  the press has to travel.
- The **overhead/shoulder-flexion** marker is the **co-limiter** — a low score here means overhead/t-spine
  ROM is *the* HSPU program for a while, which is exactly why it sits first in the daily M block.
- These two numbers select the starting **HSPU rung** (Phase 1/2/3 in §7.1) and the load on the pike /
  deficit / negative progressions.

### 7.2 Strict ring muscle-up gate (from §2.2–2.4)

The MU gate ([`training-system.md`](training-system.md) §7.2) wants, before any transition work:
~8–10 strict dead-hang pull-ups, ~5–10 strict ring dips, and a solid **10 s+ false-grip hang.**

- **`strictPullUpsMax` and `strictRingDipsMax`** tell you which of those are already owned and which are
  the program.
- **`falseGripHangSec`** is the rate-limiter: if it's well under 10 s, **the false-grip ramp (build toward
  ~30–45 s of total hang time before high-volume false-grip pulling) IS the muscle-up program** — at
  ≤~10%/week tendon-volume growth. A few seconds at baseline is normal; it just sets the rung on the
  assistance ladder.

### 7.3 ROM gates (from §3)

The four `rom*` markers become the **re-test comparison points** logged at each deload (§8). They are not
daily gates; they're the periodic check that the loaded end-range mobility work is actually moving range,
and they tune which area (overhead → hips → hamstrings → ankles) gets emphasis in the M block.

### 7.4 Conditioning anchor (from §4)

The anchor result + **its RPE cap** sets the starting point for the polarized re-onboard ramp. Re-tests
compare *at the same RPE* — a faster time / higher power at the same effort is the real aerobic-return
signal, without ever needing an all-out re-test early.

### 7.5 Where the numbers live

All baselines write to the profile `benchmarks` map (`Record<string, string | number>`,
[`data-model.md`](data-model.md)); re-tests and PRs are logged as `benchmarkPRs` on the relevant workout
log. The AI reads these to fire `advancementCriteria` and to re-weight volume — see
[`functional-design.md`](functional-design.md) for the capture/re-test UX.

---

## 8. Re-testing cadence & the SWC band

- **Roughly monthly + every deload (~every 4–6 weeks).** Re-run the **gate-relevant** markers at each
  ~6-week block deload (week 6 in [`training-system.md`](training-system.md) §2.1): re-estimate the press
  rep-max, re-check max strict pull-ups / ring dips, the false-grip hang, and the four ROM markers. This is
  the self-correcting loop — **gates owned → advance the rung; gates stalled → repeat or regress**
  ([`training-system.md`](training-system.md) §8).
- **Re-test on a GREEN deload day, fresh, after the standard ramp, the same way every time.** A re-test
  that isn't comparable isn't a re-test.
- **The conditioning anchor** re-tests on the same monthly cadence, still at its **capped RPE** — never
  drift it into a true max.
- **HRV SWC band:** the ~14 days of morning HRV logged across this block seed the **personal SWC band**
  (7-day rolling lnRMSSD within **mean ± 0.5 × SD**, [`training-system.md`](training-system.md) §5.1).
  During the block the app says **"still calibrating"** and leans on the subjective one-tap check; once
  ~14 days exist, the deterministic engine starts gating on the band. **Re-baseline the band every 4–6
  weeks** as the parasympathetic baseline shifts during re-onboarding — the same cadence as the gate
  re-tests, so calibration happens in one pass.

---

## 9. One-paragraph version

The first two weeks measure where you actually are — **gently.** You warm up the normal way, then on
fresh GREEN days you take a *conservative rep-max* on the strict press (and turn it into an estimated
1RM — never a true single this early), an honest max set of strict pull-ups and strict ring dips, a single
quality false-grip hang (the muscle-up's real gatekeeper), four simple range-of-motion checks, and **one
deliberately sub-maximal** conditioning anchor. The tests are spread across the fortnight so no day is
brutal — the two strength maxes sit 48 hours apart, ROM and conditioning ride the easy days, and any easy
day can just be rest. Nothing loads your spine. Those numbers replace the placeholder gates for your
handstand-push-up and muscle-up progressions, anchor your conditioning ramp, and — together with two weeks
of morning HRV — seed your personal readiness band. Then you re-test the same way roughly monthly, at each
deload, so the program keeps correcting itself from real data instead of guesses.

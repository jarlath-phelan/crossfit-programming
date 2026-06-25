# Training System — How the Program Works

*Coach-facing reference. This is the **coach**: it explains the logic the AI planner and the human
follow — the philosophy, the periodization model, the weekly templates, how a single session is built,
the daily readiness rules, the progression gates, the mobility markers, and how the whole thing keeps
re-planning itself.*

This doc is **forkable and generic**. It is written for "the athlete" / "you" so anyone can clone the
repo and adapt it. The illustrative case running through it — a fast-twitch, lower-body-dominant masters
CrossFitter re-onboarding conditioning, chasing strict HSPU and a strict ring muscle-up while building an
upper-body physique — is just that: an example that makes the rails concrete. Swap in your own profile
and the same logic holds.

**Companion docs:**
[`science-foundations.md`](science-foundations.md) is the *why* (the evidence behind every rail here);
[`architecture.md`](architecture.md) is the *software*; [`data-model.md`](data-model.md) is the *schemas*;
[`functional-design.md`](functional-design.md) is the *app UX*; [`nutrition.md`](nutrition.md) is *fueling*;
[`decisions.md`](decisions.md) is the *log of athlete choices*; and
[`testing-protocol.md`](testing-protocol.md) is the *Week 1–2 gentle baseline block*.
The guardrails this doc must obey live in [`CLAUDE.md`](CLAUDE.md).

---

## 1. Philosophy — the rules everything else obeys

1. **No peaking, ever.** You train for life, not a date. We run **continuous rolling ~6-week emphasis
   blocks**, not competition periodization. Training builds the same strength and muscle regardless of
   the calendar, so there is nothing to peak — only consistent, progressive exposure biased toward the
   goals.

2. **Tendons are the governor — not muscle, not lungs, not motivation.** In a masters athlete (late 30s+)
   muscle protein synthesis and hypertrophy potential are essentially young-adult level, but collagen
   turnover declines from the mid-30s and **tendons adapt on a ~12-week clock while muscle and neural
   gains arrive in days to weeks.** Strength *will* outpace tissue tolerance. Every new upper-body
   gymnastics load is ramped slowly (**≤~10%/week**), with heavy-slow tempo and eccentric overload doing
   double duty as strength *and* tissue-resilience work. The shoulder is the #1 CrossFit injury site and
   the target skills (HSPU, ring MU, kipping) are top mechanisms — so we **build strict before kipping**
   and cap kipping volume.

3. **Same reps, two goals.** The physique goals (bigger chest, fuller delts, thicker upper back/lats,
   visible strong midline) and the skill goals (strict HSPU, strict ring MU) are built from the *same*
   pressing and pulling work. We program one block of work and count it twice. This is the single
   highest-leverage decision in the system: delts feed the HSPU, lats feed the muscle-up, and both build
   the V-taper.

4. **Legs and conditioning are MAINTAINED, not built.** A lower-body-dominant, fast-twitch athlete is
   already strong and fast; this one explicitly does not want more leg size. Legs run at **maintenance
   (~6–9 hard sets/week)**; conditioning is *preserved and gently re-onboarded*, not chased. This frees
   recovery for the upper body we actually want to grow.

5. **Sustainability beats intensity.** Sessions are **45–60 minutes, unhurried** — there is room to
   train *and* socialize, not a go-go-go stopwatch grind. A session must never leave you wrecked for
   work the next day. This athlete gets **very sore** and protects recovery, so the week **undulates
   hard/easy** and we **never stack back-to-back MetCons** on sore days. Consistency over years is the
   product; a heroic week that costs three is a loss.

6. **Recovery is first-class programming.** The ~20-minute breathing + mobility block is real training,
   not a cooldown. It is protected on busy weeks like a strength session, and it is the **default**
   RED-day session — *offered*, never forced (see §5).

7. **Science-based, not over-optimized.** Caffeine, collagen, and HRV gating are used *strategically*
   (hard days, situationally, cycled), not religiously. The effects of meditation and HRV-gating are
   framed honestly as modest consistency and injury-risk levers, not magic. See
   [`science-foundations.md`](science-foundations.md).

---

## 2. Periodization model

### 2.1 Macro shape — rolling ~6-week emphasis blocks

Instead of phases that build to a peak, the program cycles **~6-week blocks**. Every block carries the
*same* permanent priority hierarchy but rotates which limiter gets the slight extra emphasis, and ends
with a planned light week.

**Permanent priority hierarchy (every block, in order):**

1. Strict gymnastics strength — strict HSPU & strict ring-MU progressions
2. Upper-body hypertrophy — chest, delts, lats/upper back, visible/strong midline
3. Hip / hamstring / overhead ROM (a daily training target, not a cooldown)
4. Conditioning **maintenance** (re-onboarded over the first 4–8 weeks; polarized — see §3.5)
5. Lower-body strength at **maintenance only**

**The ~6-week block shape:**

| Week | Intent | What happens |
|---|---|---|
| 1–2 | Re-introduce / accumulate | Conservative loads, establish the RIR (reps-in-reserve) feel, volume at the low end of target |
| 3–4 | Progress | Add ~1–2 hard sets/muscle/week toward the 12–18 target; add load / deficit / tempo to skill work (still ≤~10%/wk gymnastics volume growth) |
| 5 | Highest block volume/intensity | Still sub-maximal (1–3 RIR), highest accumulated volume |
| 6 | **Deload** (autoregulated) | Cut to top sets only, drop conditioning to Zone 2, keep skill at low volume, protect the recovery block. **Re-test the gates (§7) at the end of this week.** |

Deloads are a **fatigue-management** tool, not a peaking tool. Plan one roughly every 4–6 weeks, but
pull it earlier if AMBER/RED days are accumulating.

### 2.2 Rotating emphasis

Each block leans slightly harder on one limiter while maintaining the others:

| Block | Primary emphasis | Maintained |
|---|---|---|
| **A** | **Pressing** — HSPU (pike → deficit → negatives), DB/overhead press, ring dips | Pulling, mobility, conditioning |
| **B** | **Pulling** — strict/weighted pull-ups, false-grip rows, MU transition negatives | Pressing, mobility, conditioning |
| **C** | **Integration** — full strict skill attempts, press + pull combined, more midline + conditioning re-load | All, conditioning slightly raised |

Rotate A → B → C → A. Because pressing and pulling both feed chest/back hypertrophy, **physique gains
accrue continuously regardless of which skill is emphasized.**

### 2.3 Why this fits the goals

- Hypertrophy and strict-strength reward **time-under-program and progressive weekly volume**, which
  rolling blocks deliver without taper math.
- The re-test at each deload converts the program into a **self-correcting loop**: gates passed →
  advance the progression; gates stalled → repeat or regress the rung. This is the hook the AI uses to
  re-plan (§8).

---

## 3. Weekly templates — flexible 2 / 3 / 4 / 5 / 6 days

The athlete's preference is **5 days/week** of 45–60 min unhurried sessions, with the week **undulating
hard → easy** (a hard strict-skill/strength day is followed by a lighter strength-and-mobility day). The
day count flexes with life; the templates below are the menu, and the planner picks the row that matches
the realistic day-count for the week.

**Session "ingredients":**

| Code | Meaning |
|---|---|
| **S** | Strict skill/strength (HSPU + MU progressions) — the protected priority |
| **H** | Hypertrophy accessory (chest, delts, lats/upper back, midline) — includes **unilateral + anti-rotation** work |
| **C** | Conditioning — polarized: sprints/hills *or* Zone-2 base; all modalities (run, row, bike, ski) |
| **M** | Mobility + ~20-min breathing/wellness block (daily, first-class) |
| **L** | Lower-body maintenance (low volume) |

### 3.1 The undulating hard/easy default (5 days)

This is the **target week**. Note the deliberate rhythm: no two MetCon-style conditioning hits land
back-to-back, and every hard-CNS skill day is followed by something the body can absorb while sore.

| Day | Type | Composition |
|---|---|---|
| 1 (Mon) | **Hard** | Ramp → **S press** (fresh CNS) → **H chest/delts/midline** → **M** |
| 2 (Tue) | Easy | Ramp → light **S pull volume** / grease-the-groove → mobility-heavy **M** + extended overhead/t-spine |
| 3 (Wed) | **Hard** | Ramp → **S pull** → **H back/lats/midline** → short quality **C** (sprinty or machine intervals) → **M** |
| 4 (Thu) | Easy | Ramp → **H** unilateral + anti-rotation focus + light **L** maintenance → **M** |
| 5 (Fri) | **Hard** | Ramp → **S integration** (press + pull, lower volume) → polarized **C** (sprints/hills *or* Zone-2 base) → **M** |

*Hard days carry the high-CNS strict work and the one conditioning hit; easy days bank skill volume,
hypertrophy accessories, unilateral/anti-rotation correction, and mobility. The two conditioning touches
(Day 3, Day 5) are separated by a day, and the heaviest pressing (Day 1) and pulling (Day 3) never share
a 24-hour window.*

### 3.2 Graceful-degradation rule — when days get cut, decide in this order

1. **Protect first:** strict skill (S) at **2×/week** + the daily M block.
2. **Shed first:** accessory hypertrophy *volume* (H), then conditioning *volume* (keep 1–2 short quality
   pieces), then lower-body (L) — legs are already maintained and tolerate low frequency.
3. **Never cut:** the M block. On a zero-capacity day it *becomes* the session (RED default, §5).

> The research that licenses this: **strength is maintained on as little as 1–2 sessions/week**, and
> **total weekly volume (not frequency) is the primary hypertrophy driver**. So a thin week loses very
> little if the few sessions still hit the protected stimuli. See
> [`science-foundations.md`](science-foundations.md) §7.

### 3.3 The 2-day minimum-week rule (the floor)

On a genuinely busy week, **two days is the floor, and it is enough to hold everything that matters** —
*if* those two days are full-body and prioritized correctly. Do **not** try to touch every goal; protect
the goal *stimuli* and let the rest coast:

| Day | Type | Composition |
|---|---|---|
| 1 | Full-body, skill-led | Ramp → **S press emphasis** (heaviest protected window) → **H chest/delts** → **M** |
| 2 | Full-body, skill-led | Ramp → **S pull emphasis** + false-grip → **H back/lats + one unilateral/anti-rotation piece** → **one short quality C hit** (sprint or 5–8 min interval) → **M** |

Rationale, grounded in the evidence:

- **Both strict skills get one exposure each** (press Day 1, pull Day 2) — strict strength holds at
  1–2×/week.
- **Weekly hypertrophy volume is consolidated**, not spread — fine, because volume drives the
  adaptation and you can do more sets per session when you only train twice.
- **One short conditioning hit** maintains the engine without a recovery tax.
- **Mobility/wellness rides every session** and is the fallback if even a second day evaporates.

A 2-day week costs almost nothing long-term, because the readiness gate (§5) guarantees the hard work
lands on days the body can actually absorb it.

### 3.4 3 / 4 / 6-day templates

**3-day week**

| Day | Composition |
|---|---|
| 1 | Ramp → **S (press emphasis)** → **H chest/back** → short **C** (machine intervals) → **M** |
| 2 | Ramp → **S (pull emphasis)** → **H back/midline + unilateral/anti-rotation** → **M** |
| 3 | Ramp → mixed strict skill → short sprinty **C** → light **L** → **M** |

**4-day week**

| Day | Composition |
|---|---|
| 1 | Ramp → **S press** → **H chest/delts/midline** → **M** |
| 2 | Ramp → **S pull** → **H back/lats/midline** → short **C** (machine or sprint) → **M** |
| 3 | Ramp → conditioning focus (polarized) + light **L** maintenance → **M** |
| 4 | Ramp → **S integration** (press + pull, lower volume) → **H unilateral/anti-rotation** → **M** |

**6-day week — when capacity is high**

Add the 6th day as **low-CNS volume that does not compete for recovery**: grease-the-groove submaximal
pulls / false-grip work, ring support holds, Zone-2 machine aerobic base, and extra loaded mobility.
**Never** a second hard-CNS skill day inside the same 48 h. Keep M daily.

| Day | Composition |
|---|---|
| 1 | **S press** + H chest/midline + **M** |
| 2 | **S pull** + H back/lats + short **C** + **M** |
| 3 | Conditioning (polarized: sprints/hills) + light **L** + **M** |
| 4 | **S integration** + H delts/midline + unilateral/anti-rotation + **M** |
| 5 | Skill *volume* (grease-the-groove pulls, false-grip hangs, ring support) + extended loaded mobility + **M** |
| 6 | Low-CNS Zone-2 aerobic base + grease-the-groove pulls/false-grip + loaded mobility + **M** |

### 3.5 Conditioning — the polarized model

Conditioning is **polarized**: most sessions are either **short, sharp, high-quality** (sprints, hill
sprints, short hard intervals — playing to fast-twitch strength) **or** **easy Zone-2 aerobic base**;
little time is spent grinding the lactic middle. A **~10-mile road-race running capacity is kept
*available* year-round** — capacity, not speed, and never peaked.

- **All modalities are in play:** running, hill sprints, rower, assault/echo bike, ski-erg. The planner
  rotates them to spread joint stress; **running carries the most impact and the most aerobic↔strength
  interference**, so early in re-onboarding it is the *least* used and machines (bike/row/ski) carry the
  base.
- **Gentle 4–8 week re-onboard.** A detrained-but-talented engine returns fast; tissue and aerobic base
  need the ramp. Bias the *early* weeks toward the fast-twitch strengths (short sprints/intervals) and
  let Zone-2 volume accumulate slowly. Don't crush Grace/Fran-type intensity in the first month — ramp
  it over 4–8 weeks.
- **No back-to-back MetCons** on sore days; conditioning touches are spaced across the undulating week.
- **Resistance before endurance** within any session that has both (see §4).

---

## 4. Anatomy of a single session

Total ~45–60 min of training (unhurried, with room to socialize), plus the ~20-min M block (post-session
or evening). The order is fixed because each placement is doing a specific job.

```
[pre]        CAFFEINE TIMING (cycled, situational): ~3 mg/kg (~285 mg, the FULL dose)
             45–60 min PRE, AM-ONLY, ONLY on hard GREEN strength/skill or sprint days.
             Cycle it (not every day). Titrate DOWN if sleep quality suffers — sleep is
             the main recovery limiter here. Skip on deload / RED / low-recovery days.

[0:00–0:15]  RAMP-UP — mandatory, 12–15 min, active & temperature-raising
             • General: bike/row 2–3 min to raise core temp
             • Dynamic mobility: leg swings, hip openers, banded scap/shoulder prep,
               wrist prep (especially before false-grip days)
             • Movement-specific ramp sets: empty → 40% → 60% → 75% → working load
             • DYNAMIC ONLY. No static holds >30–60 s here (they cost power).

[work block] PRIORITY 1 — STRICT SKILL / STRENGTH (fresh CNS)
             • HSPU rung AND/OR MU rung, per block emphasis
             • Heavy-slow tempo (3–4 s eccentric) and/or eccentric negatives
             • Quality reps, 1–3 RIR, NEVER grind to failure on skill
             • This is the protected, injury-sensitive window.

[work block] PRIORITY 2 — HYPERTROPHY ACCESSORY (count the sets)
             • Chest / delts / lats-upper-back / midline, 6–15 reps, 1–3 RIR
             • UNILATERAL + ANTI-ROTATION woven in to correct L/R asymmetry
               (single-arm DB press/row, split-stance work, Pallof, suitcase carries,
               offset loading) — corrective, not optional
             • Shoulder-sparing tools: ring dips, weighted pull-ups, DB incline,
               slow eccentrics, ab-wheel/fallouts, loaded carries
             • Conservative midline flexion only (see §6 on spinal loading)

[work block] CONDITIONING — lift-before-MetCon order preserved (only on days with C)
             • Polarized: short sprints/hills/intervals OR easy Zone-2 base
             • Re-onboarding: machine-biased (bike/row/ski); running used least early
             • No back-to-back MetCons across days

[post/eve]   ~20-MIN M BLOCK — first-class, non-negotiable
             • 5–10 min paced breathing @ ~6 breaths/min (resonance frequency)
             • Mobility priorities (big daily footprint): OVERHEAD / T-SPINE first
               (pays off 3 ways — ROM + HSPU + press), then HIPS, HAMSTRINGS, ANKLES
             • Light, full-ROM LOADED end-range work (not just passive stretching)
             • Conservative spinal loading — see §6
             • This is also the DEFAULT RED-day session (offered, not forced).
             • Main breathing dose belongs later (away from the training sympathetic
               spike), so the next-day HRV/sleep benefit actually registers.
```

**Three placement rules that drive the order:**

- **High-CNS strict work goes early, fresh, after the ramp** — best adaptation, lowest injury risk.
- **Long static holds (>60 s) are banished from the pre-lift warm-up** (they cost ~4–7.5% strength) and
  parked in the post-session / evening M block, where they also serve ROM best.
- **Resistance before endurance** preserves dynamic strength; the only interference cost (explosive
  power) lands on a quality no longer chased.

---

## 5. Readiness autoregulation — green / amber / red

The day-of decision is a **deterministic rule** in `library/autoregulation/`, not an LLM judgment. The
planner schedules *across* days; the rule engine *gates* on the day. See
[`science-foundations.md`](science-foundations.md) §3 for the evidence and
[`data-model.md`](data-model.md) / [`architecture.md`](architecture.md) for where it runs.

### 5.1 The engine

- **Build your own SWC band.** Run a 14-day familiarization at re-onboarding. During this window there
  is **no personal baseline yet** — the app says "still calibrating" and leans on subjective input. Log
  morning HRV (Apple Watch Ultra 2 → **Bevel**; **Whoop** overnight HRV when available). Compute a
  personal baseline mean and SD. **GREEN band = 7-day rolling lnRMSSD within mean ± 0.5×SD.** Use *your*
  data — masters parasympathetic baselines differ from population norms.
- **Hybrid daily gate, in priority order:** (a) wearable HRV trend vs the band, **and** (b) a quick
  subjective check-in (one-tap overall feel, optional detail), with (c) a **manual override** that can
  force AMBER/RED regardless of the band. **Subjective measures out-predict HRV, so self-report wins —
  manual override always wins.**
- **Watch direction, not a single number.** A multi-day downward trend or rising HRV variability (CV) is
  the back-off trigger. A suddenly *very high* HRV after hard weeks can mean parasympathetic saturation /
  overreaching, not great recovery. A wearable "recovery %" is one directional input, never gospel.
- **Re-baseline the SWC every 4–6 weeks** as conditioning returns.

### 5.2 The traffic-light rules

Scale **intensity & high-CNS work first, then volume, then modality.** On GREEN/AMBER we never go to
zero. **On RED, a true full rest day is allowed** — wellness is the *default offer*, not a mandate.

| Tier | Trigger | Strict skill (P1) | Hypertrophy (P2) | Conditioning | Mobility / Wellness |
|---|---|---|---|---|---|
| **GREEN** | Rolling HRV in/above band, stable CV, feels good | Full — heaviest loads, deficit/negatives, full attempts, fresh & early. Caffeine OK. | Full target volume, 1–3 RIR | Planned hard / sprinty / polarized work | Full daily M |
| **AMBER** | Lower edge of band, rising CV, moderate fatigue, or moderate subjective | **Keep it** (low-fatigue, high-priority) but trim volume ~30–50%; no max-effort negatives; no rushed reps | Drop to top sets / ~30–50% volume cut | Zone 2 / lighter loads; **skip max-effort sprints** | Full daily M |
| **RED** | Below band 1+ days, downtrend, OR manual "exhausted / brutal week" override | **Swap out** — no heavy/eccentric CNS load | None, or light scap/cuff prehab only | None, or easy aerobic flush | **The ~20-min breathing + hip/hamstring mobility block is OFFERED as the session — but a true full rest day is a valid choice. Don't force activity.** |

**Skill-specific guardrails:**

- Strict HSPU and MU work (CNS- *and* tendon-demanding) is programmed on **GREEN / early-AMBER only**,
  placed first.
- **Eccentric / negative work is the first thing trimmed on a non-green day** — it's the most
  tissue-damaging and masters tissue recovers slower. Trim eccentrics before you trim conditioning.

### 5.3 Class-advisory integration

Training is mostly AM, sometimes PM, and the local box runs classes
**Mon–Fri at 6:30am, ~9:30am (occasional), 12pm, 4:30pm, 5:45pm**. The system **advises whether a given
class fits the day's plan** rather than blindly subbing it in:

- If the day calls for **protected strict-skill/strength (P1)** or a **hard sprint piece**, a generic
  class MetCon may not fit — flag the conflict and suggest doing the strict work first / treating the
  class as the day's conditioning, or training solo.
- If the day is a **conditioning or easy day** and a class WOD aligns (or can be lightly scaled to the
  polarized intent and "no back-to-back MetCon" rule), the system can **recommend a specific class time**
  that fits the schedule and readiness tier.
- On **AMBER/RED**, advise *against* a high-intensity class and offer the scaled session or wellness
  block instead.

The principle: the class is a *resource the planner reasons about*, not a substitute for the plan. See
[`functional-design.md`](functional-design.md) for how this surfaces in the app.

---

## 6. Tendon, masters & spine safeguards (woven through every block)

- **Progress new upper-body gymnastics volume ≤~10%/week**, even when it feels easy — strength outpaces
  tendon readiness.
- **Heavy-slow resistance (3–4 s tempo) + eccentric overload** is the primary strength engine for
  pressing/pulling/dips. It builds the chest/delts/lats you want *and* the tendon stiffness to tolerate
  MU/HSPU — judged over 12+ week horizons.
- **Strict before kipping; cap kipping volume.** The shoulder is the dominant injury site.
- **Scapular + eccentric external-rotation cuff prehab, 2×/week** — banded ER with slow eccentrics,
  prone Y/T/W, serratus / wall-slide upward rotation. Targets the exact age-related risk factors (GIRD,
  weak external rotators, scapular dyskinesis). **This is not optional accessory fluff.**
- **Unilateral + anti-rotation as correction, not garnish.** With a noticeable L/R imbalance, single-arm
  pressing/rowing, split-stance and offset loading, Pallof presses, and suitcase carries train the
  weaker side up to the stronger and build a midline that resists rotation. Train the **weaker side
  first** and **match its reps on the strong side** (don't let the strong side run away).
- **Conservative spinal loading (spine-cautious).** ROM and a strong midline are goals, but **spinal
  flexion under load is approached cautiously**: favor **light, controlled, full-ROM end-range** work
  over heavy loaded flexion. Introduce loaded end-range spinal flexion (e.g. Jefferson curl) **only**
  after confirming no relevant low-back history, start essentially unloaded, and progress load slowly.
  **Optional physio screen note:** with structural spine asymmetry, a movement screen with a physio
  before adding meaningful loaded end-range flexion is a reasonable, cheap insurance step — flag it,
  don't mandate it. Build the midline mostly from **anti-extension / anti-rotation** (below), which carry
  the asymmetry benefit without the loaded-flexion risk.
- **False-grip is ramped:** build to ~30–45 s of total hang time before high-volume false-grip pulling.
  Early wrist/elbow pain = back off volume, do not push through. Wrist mobility goes into the M block.
- **Collagen pre-load (optional, cheap):** 15 g gelatin / hydrolyzed collagen + ~50 mg vitamin C (or OJ)
  ~30–60 min before gymnastics/tendon days — roughly doubles collagen-synthesis markers in middle-aged
  adults. See [`nutrition.md`](nutrition.md).
- **Conditioning re-onboarding:** machine-biased (bike/row/ski) for 4–8 weeks to spare joints; ramp
  Grace/Fran intensity gradually. Sprinty fast-twitch capacity returns fast; tissue and aerobic base
  need the ramp.

---

## 7. Progression tracking & gates

Advancement is triggered by **ownership** — roughly **5 clean, controlled reps** or a hold standard —
**not by calendar dates**. Long levers (tall athletes) make pressing/pulling skill genuinely slower, so
dates mislead. Re-test at each deload. **Tendons first, no rush — longevity over speed.**

> The baseline numbers below are **placeholders until measured** in the Week 1–2 testing block. Do not
> fabricate them — see [`testing-protocol.md`](testing-protocol.md) and the open calibration items in
> [`CLAUDE.md`](CLAUDE.md).

### 7.1 Strict HSPU pathway — *limiter: overhead strength + overhead ROM*

Establish the strict-press benchmark first. A practical HSPU gateway is roughly **0.65–0.75× BW strict
press**; a bodyweight strict press is the elite/long-term horizon (long levers make it harder — favoring
top-heavy mass improves the ratio). **Overhead mobility (t-spine + shoulder flexion) is a co-limiter** —
which is exactly why overhead/t-spine ROM sits first in the daily M block (it pays off three ways: ROM,
HSPU, press).

| Phase | Rungs (advance when ~5 clean controlled reps owned) |
|---|---|
| 1 | Box pike push-ups 3–5×5 + DB strict press + 30–45 s wall handstand holds (shoulder/scap control) |
| 2 | Wall pike → **deficit** pike 3–5×3 (≥2-inch deficit) + hollow-body/midline |
| 3 | **Wall HSPU eccentric negatives** (3–5 s lower) 3–5×3 — the highest-yield bridge to the first rep |
| Test | Re-test strict HSPU ~wk 8–16 |

### 7.2 Strict ring muscle-up pathway — *limiter: false grip*

A 4–6 month project layered on top of re-onboarding. **The false-grip hang is the rate-limiter** — if a
solid false grip isn't there, that *is* the program. **Gates before any transition work:** ~8–10 strict
dead-hang pull-ups, 3–5 chest-to-sternum pull-ups, 5–10 strict ring dips, a solid **10 s+ false-grip
hang**, false-grip ring rows to lower chest. If short on any, those are the program.

Assistance ladder (easiest → hardest):

1. False-grip hangs / rows
2. Banded / foot-assisted transitions
3. Jumping MU into slow eccentric
4. Low-ring feet-on-ground strict reps
5. Full strict

- **Engine:** grease-the-groove submaximal pulling 2–3×/week (~40–60% of max reps, never to failure) +
  weekly **false-grip eccentrics and 3–5 s MU negatives** (low volume, 4–6 quality reps — high tendon
  stress).

### 7.3 Mobility / ROM markers (periodic re-test, not continuous logging)

ROM is checked at the **testing block and at each deload re-test** — periodic, not a daily chore.

- Forward fold / toe-touch reach (sit-and-reach)
- Overhead test (shoulder flexion / wall-test)
- Ankle dorsiflexion (knee-to-wall)
- Deep-squat hold comfort & depth; 90/90 hip internal-rotation

**Expectation-setting:** noticeably looser in 2–4 weeks; measured ROM change by ~6–12 weeks; then
**maintenance** (~2–3×/week floor keeps gains — they hold for weeks but slowly regress). Sold as *"feels
and moves better,"* **not** "less soreness" — stretching does not reduce DOMS.

### 7.4 Physique / midline

- Track by **mirror and performance — ignore the scale** (ab visibility is largely a leanness function).
- Weekly hard-set audit: **chest 12–18, back/pulling 12–18, legs ≤6–9.**
- Midline built as **trained, overloaded** anti-extension (ab-wheel/fallout, RKC plank, deficit hollow)
  and **anti-rotation** (Pallof, suitcase carries, offset loading) — **not** high-rep sit-ups, and with
  conservative loaded flexion (§6).

---

## 8. How the system keeps evolving

The AI coach re-plans on three nested loops, and **leaves past sessions immutable** — it only rewrites
today-forward in `generated/` (see [`CLAUDE.md`](CLAUDE.md) and [`architecture.md`](architecture.md)).

**Daily loop — readiness gate.** Ingest overnight HRV trend vs the SWC band + the subjective check + any
manual override → the deterministic engine emits GREEN/AMBER/RED and the day's session per §5. The system
*proposes*; the athlete can always override down (and on RED, choose true rest). It logs RIR, completed
sets, and a quick "how it felt." It also runs the **class-advisory** (§5.3) for the day.

**~6-week loop — block rollover.** At each deload, review:
- **(a) Gate re-tests** — HSPU/MU benchmarks, ROM markers.
- **(b) Volume tolerance** — did chest/back actually hit 12–18 sets at ≤3 RIR without AMBER spikes?
- **(c) Adherence pattern** — how many days/week realistically happened (and was the 2-day floor hit on
  thin weeks?).

Then advance / repeat / regress each progression rung on **ownership** (~5 clean controlled reps), rotate
the A → B → C emphasis, and reset volume targets. Advancement is demonstrated capacity, **not the
calendar.**

**4–6 week loop — recalibration.** Re-baseline the SWC from fresh wearable data (parasympathetic baseline
shifts during re-onboarding), re-check the protein / physique trend, and re-tune volume targets and the
conditioning ramp as MetCon capacity returns.

**Data the coach reviews:** morning lnRMSSD trend + CV; subjective scores + overrides; logged
sets/loads/RIR + "how it felt"; gate re-test results; ROM markers; the mirror/performance trend; actual
days/week; and **flagged pain** (wrist/elbow/shoulder → auto-cut false-grip / kipping / eccentric
volume).

**Transparency principle:** the system *proposes*, the athlete *can override*, and it *explains* — e.g.
*"HRV down 2 days + you flagged a brutal work week → today's session is offered as the ~20-min breathing +
mobility block, or take a full rest day; we'll bank the HSPU negatives for tomorrow if you're green."* A
wearable's recovery % is one directional input among several, never gospel.

---

## 9. One-paragraph version for the athlete

You train 45–60 minutes, mostly mornings, at a pace that leaves room to actually enjoy the gym — and the
week breathes: hard days alternate with easier strength-and-mobility days, and we never stack two
MetCons when you're sore. Your strict handstand-push-up and muscle-up work goes *first, while you're
fresh* — that's where both the real progress and the injury risk live, so we go slow on tissue even when
it feels easy (false grip is the muscle-up gate; overhead strength and shoulder ROM are the HSPU gate).
The same pressing and pulling that earn those skills build your chest, shoulders, and back, and we add
single-arm and anti-rotation work to even out your left/right. Your legs and engine are already strong;
we *maintain* them — conditioning stays polarized (short sprints and hills plus an easy aerobic base,
your 10-miler always in reach) and re-onboards gently. Mobility is real training every day — overhead and
t-spine first, then hips, hamstrings, ankles — with light loaded end-range work and a cautious approach to
loading your spine. On busy weeks two good full-body days hold everything that matters; on bad days the
system offers you 20 minutes of breathing and mobility, or simply tells you to rest — and you always have
the final say. Nothing here is about a PR or a date. It's about moving better, looking the way you want,
and still doing all of it decades from now.
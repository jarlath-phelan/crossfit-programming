# Programming Guidelines — Time-Budgeting & Mobility Placement

*Coach-facing reference, generic and forkable. This doc resolves two recurring planning questions
the rails depend on but don't fully specify: (A) **how much of a session slot is actually usable
working time**, so the planner budgets blocks to a realistic number instead of the wall-clock
fantasy; and (B) **where mobility belongs in a session/day and what to honestly expect from it.***

It is written for "the athlete" / "you" so anyone can fork it. The illustrative case — a masters
CrossFitter on 45–60 min unhurried sessions — is just an example; the numbers generalize.

**Companion docs:** [`science-foundations.md`](science-foundations.md) is the evidence base (this doc
extends its §2 and §6 on stretching/mobility and adds the time-budgeting evidence the system docs
assume); [`training-system.md`](training-system.md) §4 defines the single-session anatomy this doc
budgets, and §5/§3 define the readiness tiers and weekly templates referenced below. The rails live
in [`CLAUDE.md`](CLAUDE.md) (esp. rails 4, 8, 9).

---

## Topic A — Session time-budgeting: wall-clock vs working time

### The core problem

A "60-minute session" is not 60 minutes of training. A meaningful slice is consumed by arrival,
the coach brief (in a class), equipment gathering and setup, demonstration/scaling decisions, ramp
warm-up, and the **transitions between pieces**. If the planner budgets blocks against the
wall-clock number, every session runs long, the cooldown/mobility block (rail 9) gets cut first, and
the "unhurried, room-to-socialize" intent (rail 4) collapses into a stopwatch grind. The fix is to
**budget every block against the *working* number, not the slot.**

### How a class actually splits

CrossFit's own coaching material treats the class as a *scripted timeline*, not an open hour. A
class plan is expected to include "a whiteboard script (workout education), scaling options,
equipment organization, timeline, general warm-up, specific warm-up, and cool-down" — i.e. setup and
briefing are explicitly *planned-for* overhead, not slack ([CrossFit, "What Is a CrossFit Workout?",
GOWOD](https://www.gowod.app/blog/what-is-a-crossfit-workout); [CrossFit L1 coaching
resources](https://www.crossfit.com/certificate-courses/level-1)). The class is built to fit "warmup,
movement instruction and standards, set up and workout" inside the hour, which means a real chunk of
the hour is *not* the workout.

A widely-cited practitioner breakdown of a 60-min class puts **program overview + warm-up at ~15 min
and the workout itself (start to finish) at ~40 min**, leaving ~5 min for transitions/setup
([Paragon Training Methods, Strength/MetCon](https://paragontrainingmethods.com/paragon-strength-metcon/)).
Note that the "~40 min workout" *itself* contains piece-to-piece transitions and the metcon's own
internal rest — it is not 40 min of unbroken effort. CrossFit's briefing guidance reinforces that a
good brief is **a time-saver, not a time-sink**: when athletes know how to set up, how many rounds,
the target stimulus, and the expected duration before the clock starts, it "prevents wasting precious
minutes" mid-piece ([CrossFit, "Why Having a Briefing Plan Can Dictate the Success of Your Class"](https://www.crossfit.com/pro-coach/crossfit-coaching-briefing-plan)).

Putting these together, a defensible class anatomy is:

| Slot phase | Class (coached) | What it is | Working time? |
|---|---|---|---|
| Arrival / brief / whiteboard | ~3–8 min | Greeting, workout education, scaling, stimulus target | **No** |
| General + specific warm-up (ramp) | ~10–15 min | Pulse-raise, mobility, movement-specific ramp sets | **Partly** (it's training, but not the target stimulus) |
| Equipment setup + demo | ~2–5 min | Loading bars, laying out stations, movement demo | **No** |
| Strength / skill | ~10–20 min | The protected priority work | **Yes** |
| Transition to metcon | ~2–4 min | Re-set equipment, re-brief, clock reset | **No** |
| MetCon / conditioning | ~8–25 min | The conditioning stimulus (contains internal rest) | **Mostly** |
| Cooldown / mobility | ~0–10 min | Often first to be cut when the slot overruns | **Yes (if it survives)** |

### The overhead figure — confirming the repo placeholder

The repo currently assumes **~20–25% overhead** as a placeholder. **The evidence supports keeping
that figure for a *coached class*, and lowering it for *solo* training.**

- **Coached class:** Of a 60-min slot, roughly **12–18 min is non-working overhead** (brief +
  setup + demos + the no-work portion of transitions) before you even count the ramp. That is
  ~**20–30%** pure overhead, landing the repo's 20–25% placeholder at the *optimistic* end —
  realistic for a well-run box with a tight brief, generous for a chatty class with long station
  changes. **Confirm 20–25% as the planning default for a coached class; use 25–30% for a
  movement-heavy class with many station changes or a long whiteboard.**
- **Solo training** (the athlete's usual mode for protected strict-skill days, per
  [`training-system.md`](training-system.md) §5.3): there is **no coach brief, no group
  demonstration, no scaling discussion, and no waiting on a heat** — the single largest overhead
  buckets disappear. But you still gather and set up your own equipment between parts, and you have
  *no coach pacing the clock*, so self-managed transitions can quietly bloat. Net: solo overhead is
  **lower but not zero — budget ~10–15%**, dominated by equipment changes rather than talk. Solo
  athletes also control their space, so they can **pre-arrange equipment to improve session flow and
  save time** ([Samson Equipment, "Mastering Solo Training"](https://www.samsonequipment.com/blog/mastering-the-art-of-solo-training/)) —
  a lever a class athlete doesn't have.

**Important nuance:** the **ramp warm-up is overhead against the *target stimulus* but is itself
non-negotiable training** (rail 8; [`science-foundations.md`](science-foundations.md) §1 — the morning
power deficit is erased in the ramp, not the workout). So this doc separates two numbers: *pure
overhead* (brief/setup/transition — genuinely lost time, minimize it) and the *ramp* (protected, ~12–15
min, never cut). The working-minutes table below reserves both.

### Recommended working-minutes table

Reserve the ramp (rail 8) and pure overhead off the top, then budget the remainder to the work
blocks. "Working minutes" = strength/skill + conditioning + cooldown mobility (the part that produces
the target adaptation), *after* the ramp.

| Slot | Ramp (protected) | Pure overhead — class (~20–25%) | Working min — **class** | Pure overhead — solo (~10–15%) | Working min — **solo** |
|---|---|---|---|---|---|
| **30 min** | 8–10 | ~6–7 | **~13–16** | ~3–4 | **~17–19** |
| **45 min** | 12–13 | ~9–11 | **~22–25** | ~5–7 | **~26–28** |
| **60 min** | 12–15 | ~12–15 | **~32–36** | ~7–9 | **~38–41** |
| **75 min** | 13–15 | ~15–18 | **~43–47** | ~8–11 | **~50–53** |

Read it as: *on a coached 60-min slot, plan ~32–36 minutes of actual work; solo, ~38–41.* The 30-min
slot is the cautionary one — after a compressed ramp and overhead, a class leaves only ~13–16 working
minutes, which is why a 30-min session should run **one stimulus, not three** (see "what to cut").

### Per-block budget guide (the working minutes, allocated)

Within the working minutes, follow the session anatomy in [`training-system.md`](training-system.md)
§4 (skill/strength first while fresh → hypertrophy accessory → conditioning → cooldown mobility).
A workable default split of *working time* (excludes ramp + overhead):

| Block | Share of working time | 45-min solo (~27 min) | 60-min solo (~40 min) |
|---|---|---|---|
| Strict skill / strength (P1, fresh) | ~40–50% | ~12–14 min | ~18–20 min |
| Hypertrophy accessory (P2) | ~25–35% | ~7–9 min | ~12–14 min |
| Conditioning (only on C-days) | ~20–30% | ~6–8 min | ~8–12 min |
| Cooldown mobility (in-session touch) | ~10% | ~2–3 min | ~3–4 min |

The full ~20-min breathing+mobility block (rail 11) lives **post-session or evening**, *outside* this
table — don't try to fit the whole wellness block inside the slot (see Topic B on placement).

### Practical guidance

- **Budget to the working number, never the slot.** Write each block's target reps/sets against the
  table above. If the plan only fits when you assume 60 working minutes out of a 60-min slot, it
  doesn't fit.
- **Minimize station changes; group shared-equipment work.** Every transition is pure overhead and a
  pacing leak. Order the session so consecutive pieces share equipment (e.g. keep the rings up for
  dips → rows → MU work; keep the barbell loaded across pressing variations). Couplets/triplets that
  reuse one or two implements beat circuits that send you across the gym.
- **Solo: pre-set the space.** Lay out every implement you'll need before the ramp so transitions are
  walk-overs, not setup sessions ([Samson](https://www.samsonequipment.com/blog/mastering-the-art-of-solo-training/)).
  This is the solo athlete's biggest time lever and the reason solo overhead is ~10–15% not ~25%.
- **Tight self-brief.** Solo, replace the coach's whiteboard with a 30-second self-brief: rounds,
  target stimulus, expected duration, scaling line. A briefing is a time-saver
  ([CrossFit](https://www.crossfit.com/pro-coach/crossfit-coaching-briefing-plan)) — skipping it
  *costs* mid-piece minutes deciding on the fly.
- **What to cut first when setup runs long (in order):**
  1. **Conditioning volume** before skill quality — strict-skill is the protected priority (rail 4,
     [`training-system.md`](training-system.md) §3.2). Cut metcon rounds/time before cutting P1.
  2. **Hypertrophy accessory volume** — weekly *volume* drives hypertrophy, so a trimmed single
     session costs little ([`science-foundations.md`](science-foundations.md) §7).
  3. **Never cut the ramp** (rail 8) and **never silently delete the post-session mobility block**
     (rail 9) — if the slot is gone, the mobility block moves to the evening, it doesn't vanish.
  4. On a true 30-min crunch: run **one stimulus only** — the fresh strict-skill priority plus a
     2-minute cooldown touch — and bank conditioning/accessory for the next day.

### What this means for the program

Keep **20–25% as the coached-class overhead default** (the placeholder is correct; use 25–30% for
station-heavy classes), and adopt **~10–15% for solo sessions**, where the brief/demo/heat overhead
disappears but equipment changes remain. Plan every block to the **working-minutes table** above, not
the slot. The 20-min wellness block lives outside the slot. This protects rail 4 (unhurried, never
wrecked) and rail 9 (mobility survives) by construction: if the math only works at 100% slot
utilization, the plan is overstuffed.

### Uncertainties

- The minute figures are **practitioner/coaching estimates**, not RCT data — there is no peer-reviewed
  time-and-motion study of CrossFit class flow that this doc could find. Treat the table as a
  calibratable default: log a few real sessions (actual ramp end, first working set, last working set,
  block transitions) and adjust the overhead % to *your* gym and *your* solo habits.
- Overhead is highly box- and athlete-specific: a 6-person class with a tight coach and a solo athlete
  with a pre-set garage gym are at opposite ends. The class-vs-solo split is the robust finding; the
  exact percentages are tunable.
- "Working time" deliberately counts the ramp as protected-but-separate. A program that treats the
  ramp as optional would show more nominal working minutes — but would be violating rail 8.

---

## Topic B — Mobility / stretching: timing, and does *post*-workout mobility help?

This topic extends [`science-foundations.md`](science-foundations.md) §2 (the honest stretching
section) and §6 (mobility methods) with the specific *timing* question. The short version: **mobility
earns durable ROM and movement quality; it does *not* earn recovery or soreness relief; and *when* you
place it matters mostly for protecting strength, not for the ROM gain itself.**

### 1. Pre-workout static stretching and acute strength/power

Long static holds immediately before strength/power work transiently impair output, and the effect is
**dose-dependent on hold duration**:

- The anchor meta-analysis (104 studies) found acute static stretching reduced **strength −5.4%
  (95% CI −6.6 to −4.2), power −1.9%, explosive −2.0%** (Simic et al., *Scand J Med Sci Sports*,
  2013; [PubMed 22316148](https://pubmed.ncbi.nlm.nih.gov/22316148/)).
- The effect is concentrated in **longer holds**: a more recent multilevel meta-analysis confirms a
  dose–response stretch-induced force deficit, with the pronounced effects driven by **bouts ≥60 s**;
  holds **<30–45 s show no meaningful strength decrease** ([Revisiting the stretch-induced force
  deficit, 2024; PMC11336295](https://pmc.ncbi.nlm.nih.gov/articles/PMC11336295/)). So a short
  (≤30–60 s) targeted hold inside a full warm-up is essentially harmless; a 2-minute hamstring hold
  before heavy pulling is not.
- **Dynamic beats static (and beats nothing) for priming.** A RAMP-style dynamic warm-up produced
  **significantly better sprint and jump performance** than static stretching (d ≈ 0.41) and than no
  warm-up (d ≈ 0.52), while static stretching was no better than control ([RAMP warm-up RCT,
  *Frontiers Physiol.* 2025; PMC12234454](https://pmc.ncbi.nlm.nih.gov/articles/PMC12234454/)).
  Dynamic stretching gives small-but-real improvements in single and repeated sprints versus static
  or no warm-up.

**Implication:** keep long static/PNF holds out of the immediate pre-lift window (rail 8); use the
dynamic, temperature-raising ramp. Short targeted holds for a specific blocking restriction (e.g. a
brief ankle or overhead hold) are fine inside the ramp.

### 2. Does mobility chronically improve ROM — and by what mechanism?

Yes, chronic stretching/mobility reliably improves ROM — but the **mechanism is mostly neural
(increased stretch tolerance), not the muscle getting longer**:

- A 2025 systematic review + meta-regression on the mechanisms of ROM change found that chronic
  static stretching improved ROM via **decreased passive stiffness and increased stretch tolerance
  (max tolerable passive torque)** — and **neither acute nor chronic stretching altered fascicle
  length** (i.e. the muscle is not architecturally lengthening) (*Sports Medicine*, 2025;
  [PMC12152101](https://pmc.ncbi.nlm.nih.gov/articles/PMC12152101/);
  [muscle-architecture meta, PMC10271914](https://pmc.ncbi.nlm.nih.gov/articles/PMC10271914/)). Most
  early "tightness" is the nervous system guarding end range, not short tissue.
- This is why **loaded, full-ROM work is at least as effective as passive stretching** for ROM and
  adds usable strength through range: full-ROM resistance training produces ROM gains *equal to
  stretching* with no moderating effect of age/sex (Afonso/Behm et al., *Sports Medicine*, 2023 —
  see [`science-foundations.md`](science-foundations.md) §6). Gains are **specific to the ranges
  actually loaded**, so the movement must reach true end range.
- For one tissue — the **hamstrings — long-length eccentrics add a genuine structural adaptation
  stretching doesn't**: training at long muscle length lengthened biceps femoris fascicles ~9% and
  built eccentric strength/resilience ([`science-foundations.md`](science-foundations.md) §6). That
  is the exception that proves the rule: *load at end range* does more than passive hold.

**Does timing (post-workout-when-warm vs separate session) change the ROM gain?** The evidence says
**no, not materially.** Chronic ROM adaptation is driven by *cumulative exposure* (frequency + reaching
true end range), and the effective dose is small — most of the benefit is captured around **~4 min per
session and ~10 min/week per muscle group**, with frequency mattering more than long single holds
([`science-foundations.md`](science-foundations.md) §6). Tissue *is* warmer and more compliant
post-workout, which can make end range more comfortable to reach, but no study shows the post-workout
*timing* produces a larger durable ROM gain than a separate session. **Pick the slot you'll actually
adhere to** — adherence is the real moderator.

### 3. Does post-workout mobility help recovery / reduce DOMS / prevent injury?

**Recovery / DOMS: honestly, no.** This is the section to be straight about.

- The **Cochrane review** (Herbert et al., CD004577; 12 studies including a 2377-person field trial)
  found stretching — before, after, or both — produces **no clinically important reduction in DOMS**:
  the average effect was **~1 point on a 100-point soreness scale at 24/48/72 h**, which the authors
  treat as clinically insignificant ([Cochrane CD004577](https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD004577.pub3/abstract);
  [plain-language summary](https://www.cochrane.org/evidence/CD004577_stretching-prevent-or-reduce-muscle-soreness-after-exercise)).
- Later meta-analyses agree: **no effect of post-exercise stretching on 24/48/72 h DOMS vs passive
  recovery**, and post-exercise stretching does not meaningfully improve strength, performance, or
  pain-threshold recovery ([*Front. Physiol.* 2021, post-exercise stretching meta;
  PMC8133317](https://pmc.ncbi.nlm.nih.gov/articles/PMC8133317/)). For actually blunting soreness,
  *other* tools (active recovery, massage, immersion/contrast, compression, sleep, load management)
  have small-to-moderate effects where stretching has none ([recovery-techniques meta, PMC5932411](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5932411/)).
- **Injury prevention:** weak and mixed. Some consensus work suggests static stretching may *slightly*
  reduce muscle-specific injuries, but the effect is small and possibly offset by other joint risks —
  this is not a strong evidence-based reason to program mobility. The injury-relevant payoff of the
  program's mobility work is better framed as **building strength and control through end range**
  (loaded full-ROM work), not as passive stretching reducing injury.

**The honest framing (already adopted in [`science-foundations.md`](science-foundations.md) §2):** sell
mobility as **"moves better / feels better / owns more range,"** *not* as "less sore" or "recovers
faster." Real recovery comes from sleep, load management, and protein — not stretching.

### 4. Loaded / end-range / eccentric work vs passive static stretching

For **durable, usable** ROM, loaded end-range and eccentric work is the better tool and matches
passive stretching on ROM while adding strength:

- Low-load eccentric protocols match static stretching on flexibility gains while **also building
  strength through the lengthened range** ([low-load eccentric vs static stretch, hamstrings;
  PMC11881989](https://pmc.ncbi.nlm.nih.gov/articles/PMC11881989/); [eccentric strength training &
  flexibility review, *Front. Physiol.* 2022](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2022.873370/full)).
- **End-range strengthening** specifically closes the gap between *passive* and *active* flexibility —
  it teaches the nervous system to produce force where it currently braces, which is exactly the
  limiter for a strong, tight, lower-body-dominant athlete
  ([`science-foundations.md`](science-foundations.md) §6).

So the program's mobility *driver* is light, deep-range loaded work (cossack/ATG split squats, slow
light RDLs, overhead/t-spine loaded end-range); passive static holds are a low-cost *supplement* for
adherence, not the main lever. (Mind rail 7 on any loaded end-range *spinal flexion* — keep it light,
earned, and physio-screened.)

### 5. Net recommendation — when to place mobility

| Window | Put here | Why |
|---|---|---|
| **Pre-session ramp** (rail 8) | Dynamic mobility, foam rolling, movement-specific ramp sets, short (≤30–60 s) targeted holds only | Primes performance; long static holds here cost up to 4–7.5% strength (Simic; >60 s deficit) |
| **In-session cooldown** (~2–4 min) | A brief loaded end-range touch on the day's priority area | Tissue is warm; low cost; *not* the main dose |
| **Post-session or evening** (the ~20-min block, rail 11) | The real mobility + paced-breathing dose: overhead/t-spine → hips → hamstrings → ankles, light loaded end-range | Away from the sympathetic spike, so the breathing's next-day HRV/sleep benefit registers ([`science-foundations.md`](science-foundations.md) §2); ROM gain doesn't need the post-WOD slot specifically |
| **Separate / daily floor** | A short static floor routine (~30 s holds), ~10 min/week per area | Frequency drives ROM more than long holds; pick the slot you'll adhere to |

**What to expect:** noticeably looser in **2–4 weeks**, measured ROM change by **~6–12 weeks**, then a
permanent low-dose maintenance habit (gains hold for weeks but slowly regress;
[`science-foundations.md`](science-foundations.md) §6). Expect **better range and movement quality —
not less soreness and not faster recovery.**

### What this means for the program

This confirms and operationalizes the rails: keep long static holds **out of the pre-lift ramp** (rail
8); make **loaded, full-ROM end-range work the primary mobility driver** (rail 9), with passive static
holds a cheap adherence supplement; and anchor the **~20-min mobility + paced-breathing block
post-session or in the evening** (rail 11), where the breathing's sleep/HRV payoff lands. Place a small
warm-tissue mobility touch in the in-session cooldown if the working-minutes budget allows (Topic A),
but the main dose lives outside the slot. **Stop selling mobility as recovery/soreness relief** — sell
it as durable range and movement quality, with sleep and load management doing the recovery work.

### Uncertainties

- Most ROM and stretching data come from general/untrained populations; magnitudes are likely smaller
  and slower for a long-trained athlete near a structural ceiling (consistent with
  [`science-foundations.md`](science-foundations.md) §6 caveats).
- The "timing doesn't change the ROM gain" conclusion is an **inference from mechanism + dose-response
  data**, not from a head-to-head RCT of *post-workout vs separate-session* mobility for chronic ROM —
  no such direct trial was found. The mechanism (cumulative exposure + stretch tolerance) makes it the
  defensible default, but it's an extrapolation, not a settled trial result.
- How much of any individual's tightness is neural guarding vs genuine tissue architecture is unknown
  without assessment — which is why the program tracks ROM markers periodically rather than assuming a
  cause.

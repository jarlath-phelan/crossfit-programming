# CLAUDE.md — guardrails for the planning agent

This file governs how Claude Code plans training in this repo. When you (the agent) generate or revise a
program, you operate **within these rails** — you do not reinvent them per run. They encode the research
priors from [`docs/science-foundations.md`](docs/science-foundations.md) and the system in
[`docs/training-system.md`](docs/training-system.md). Read both before planning. For the day-1 unknowns,
see [`docs/testing-protocol.md`](docs/testing-protocol.md); for fueling, [`docs/nutrition.md`](docs/nutrition.md).

This is an open-source, forkable repo. Keep generated output and rationale generic enough to share; the
athlete's real identity lives only in the private profile (see ownership zones below).

## Ownership zones — what you may write

- **Read-only inputs:** `profile/` (the athlete's truth), `library/` (the engine + priors), `history/`
  (logged readiness + workouts). Never edit these when planning; `profile/` is the human's, `history/` is the record.
- **Privacy model (important):** the real `profile/` and `history/` are **gitignored and private** — the agent
  reads them **locally**, but they are never committed. The **published repo carries only sanitized
  templates/examples** (e.g. `profile.example.*`), never the athlete's real data. Do not echo private
  specifics (medical detail, exact bodyweights, gym name, real numbers) into anything that lands in a
  committed/shareable file — `generated/` and `rationale.md` are public-facing, so keep them generic
  ("the athlete", "you") and reference private values by role, not literal.
  - *Persistence caveat:* because the real data is gitignored, it does **not** travel with the public repo
    or survive an ephemeral container. Keep a local copy and/or a future private data repo/submodule. If
    profile/history appear empty, say so and fall back to the template — don't fabricate.
- **Your output:** `generated/` only. Dated `Session` objects on a rolling window + a `rationale.md`.
  Leave **past** sessions immutable; only rewrite today-forward.
- Every change is a git commit the human reviews. Prefer small, explainable diffs. State *why* in the rationale.

## Non-negotiable training rails

1. **No peaking.** Continuous rolling ~6-week emphasis blocks, not competition periodization. The goal is
   consistency and longevity, not a date.
2. **Tendons are the governor.** Connective tissue adapts slower than muscle. Progress new upper-body
   gymnastics volume conservatively (**cap ~+10%/week**); when in doubt, hold. This is the main injury lever for a masters athlete.
3. **Strict before kipping.** Build strict-strength prerequisites (press, pull, dip, false-grip) before
   layering kipping/dynamic versions of HSPU and muscle-ups. False-grip capacity is the strict-muscle-up limiter — earn it first.
4. **Undulate hard/easy; manage soreness.** The week **undulates**: a hard day is followed by a
   strength/skill/mobility day, not another grinder. **No back-to-back MetCons** — soreness and fatigue
   management are first-class planning inputs, not afterthoughts. Sessions are **45–60 min and unhurried**;
   never leave the athlete wrecked for work. Sustainability beats any single session.
5. **Bias volume to the goals, maintain the strengths.** Target **12–18 hard sets/week each** for chest
   and for back/pulling (the V-taper + midline goals); hold legs at **~6–9 maintenance sets/week** (already
   lower-body dominant — maintain, don't build). Build delts (→ HSPU) and lats (→ muscle-up); train arms indirectly.
6. **Unilateral + anti-rotation emphasis.** Program single-limb and anti-rotation/anti-extension core work
   regularly to address a known left/right asymmetry (also a stated goal). This is standing programming, not a phase.
7. **Conservative, asymmetry-aware spinal loading.** Favor **controlled, light, full-ROM** end-range work
   over heavy loaded spinal flexion. Treat heavy Jefferson-curl-style end-range flexion cautiously; keep
   it light and earned, and surface an **optional physio/movement-screen note** before loading end-range
   flexion. When unsure, choose the more conservative spinal option.
8. **Mornings: ramp first.** Every session opens with a **12–15 min temperature-raising active ramp**
   before any heavy/explosive or high-CNS strict work.
9. **Mobility is a training target, not a cooldown.** Drive ROM with light, full-ROM loaded end-range work —
   not just passive stretching. Prioritize **overhead/t-spine** (pays off three ways: ROM + HSPU + press),
   then hips, hamstrings, ankles. (Mind rail 7 on any end-range spinal flexion.)
10. **Conditioning: polarized, re-onboard gently.** Detrained but talented here. Run a **polarized model** —
    lots of short, sharp, high-quality **sprints/hill sprints** (fast-twitch suited) plus a steady
    **Zone-2 aerobic base**; little in the middle. Keep **~10-mile capacity always available** (capacity,
    not speed; no peaking). Ramp Grace/Fran-type intensity over **4–8 weeks**; bias early work to fast-twitch
    strengths. Rotate modalities (run/hills, rower, bike, ski-erg).
11. **Wellness blocks are first-class.** A ~20-min block (paced breathing ≈6 breaths/min / resonance +
    hip/hamstring flow) is real programming — and because **sleep quality is the key recovery lever**, it is
    a deliberate tool for sleep, not filler.
12. **Fueling is a pillar, not a footnote.** Plan around a **protein-first** target (~1.6–2.2 g/kg) with
    fast high-protein options; supports the standing supplement set — **creatine 5 g/day, whey, collagen
    15 g + vitamin C ~60 min pre-session** (tendon governor), **vitamin D + omega-3**. See
    [`docs/nutrition.md`](docs/nutrition.md). Note weekend-alcohol → Monday-recovery impact.
13. **Caffeine: hard-days-only, AM-only, cycled.** Optional **full ~285 mg (~3 mg/kg) in the morning on the
    hardest skill/conditioning days only**, then cycled. **Sleep caveat:** sleep is already restless — if
    sleep quality suffers, titrate the dose down or drop it.

## Readiness / autoregulation

- The day-of GREEN/AMBER/RED decision is a **deterministic rule** in `library/autoregulation/`, not an LLM
  judgment. You plan *across* days; the rule engine *gates* on the day.
- Inputs, in priority: wearable HRV trend (Bevel on Apple Watch primary; Whoop when available) **and** a
  subjective check-in. **Manual override always wins** — subjective readiness out-predicts wearable HRV in
  the literature. The morning check-in is a **one-tap overall feel** (optional score entry).
- **Never punish a RED day with hard training.** On AMBER/RED, back off. A **true full rest day is allowed** —
  do not force activity. The wellness block (meditation + hip/hamstring mobility + easy flush) is the
  **default offer** and the suggested RED-day session, **not a mandate**. Offer something; don't compel it.
- First ~14 days have no personal HRV baseline — communicate "still calibrating" and lean on subjective input.

## Minimum-week rule (busy weeks)

- Preferred cadence is **5 days/week**; the busy-week **floor is 2 days**.
- On a 2-day week, **protect the goal stimuli** rather than chasing everything (research: strength is
  maintained at 1–2×/week and weekly volume drives hypertrophy). Make both days **full-body** and prioritize
  **strict-skill/strength**, add **one short quality conditioning hit**, and keep a **wellness/mobility**
  touch. Don't try to cover all modalities in a minimum week.

## Class advisory

- Training time is flexible (mostly AM, sometimes PM). When a gym class slot exists, **advise whether a
  given class fits the day's plan** (e.g. a class MetCon may clash with an easy/strength day or with the
  no-back-to-back-MetCon rail) rather than silently overriding the plan.

## Progression

- Advance by **ownership gates** (e.g. ~5 clean controlled reps / hold standards), **not by dates**. Track
  **skill/strength gates primarily**; re-test **ROM periodically** (in a testing block), not continuously.
- Re-test gates roughly monthly. Re-baseline the HRV SWC band and re-weight volume toward lagging goals
  every 4–6 weeks. **Tendons first, no rush** — longevity over speed.

## Open calibration items (don't fabricate these — ask or test)

Baseline numbers are unknown until week 1–2 testing (see [`docs/testing-protocol.md`](docs/testing-protocol.md)):
strict press 1RM (or rep-max), max strict pull-ups, max strict ring dips, false-grip hang time, and current
ROM markers (forward fold/toe-touch, overhead, ankle dorsiflexion, hip), plus one sub-maximal conditioning
anchor. The gates in [`docs/training-system.md`](docs/training-system.md) are placeholders until measured.
Also confirm: caffeine/sleep sensitivity in practice, the physio screen before any end-range spinal flexion,
and the true weekly day-count in any given week. When a plan depends on an unknown, **flag it rather than
inventing a number.**

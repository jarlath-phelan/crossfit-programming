# Decisions — the log of why this program is built the way it is

*This is the **decision log** (a lightweight set of ADRs — "Architecture Decision Records", here covering
training as well as software). Every meaningful choice baked into this repo — from the periodization model
to the protein target to the license — was a deliberate call made during an athlete interview. This file
records **the choice, the one-line reason, and a "revisit when" trigger** so future-you (and anyone who
forks this) can see the reasoning instead of guessing, and can change a decision on purpose rather than by
accident.*

This doc is **forkable and generic**. It is written for "the athlete" / "you" so anyone can clone the repo
and re-decide. The running example throughout — a 39-year-old, fast-twitch, lower-body-dominant masters
CrossFitter, re-onboarding conditioning after a detraining gap, chasing a strict HSPU and a strict ring
muscle-up while building an upper-body physique — is just an example that makes each decision concrete. The
**private specifics** of that athlete (exact loads, spinal-curvature details, gym name) live only in the
gitignored `profile/`, never here. Where a decision depends on a number we haven't measured yet, it is
flagged as **pending Week 1–2 testing** rather than invented.

**Companion docs:**
[`training-system.md`](training-system.md) is the *coach* (the logic these decisions configure);
[`science-foundations.md`](science-foundations.md) is the *why* in depth (the evidence behind the calls);
[`architecture.md`](architecture.md) is the *software*; [`data-model.md`](data-model.md) is the *schemas*;
[`functional-design.md`](functional-design.md) is the *app UX*; [`nutrition.md`](nutrition.md) is *fueling*;
[`testing-protocol.md`](testing-protocol.md) is the *Week 1–2 baseline block* that resolves the pending items.
The guardrails these decisions had to satisfy live in [`../CLAUDE.md`](../CLAUDE.md).

**How to read an entry.** Each decision is: **Decision** (what we chose) · **Why** (one line) · **Revisit
when** (the trigger that should make you reopen it). Decisions captured **2026-06-25** unless noted. A few
have no "revisit when" because they are stable design priors, not tunable knobs.

---

## 1. Training structure

**1.1 — No peaking; continuous rolling ~6-week emphasis blocks.**
Decision: program in undulating ~6-week emphasis blocks that roll indefinitely, never building toward a
competition date. Why: the goal is consistency, longevity, and confidence — not a podium — so peaking risk
and taper cost buy nothing here. Revisit when: the athlete actually signs up for a dated competition and
*wants* to peak (this is a guardrail in [`../CLAUDE.md`](../CLAUDE.md), so changing it is a deliberate act).

**1.2 — 5 sessions/week, 45–60 min, unhurried.**
Decision: default to 5 days/week, 45–60 minutes each, deliberately *not* rushed. Why: the athlete wants room
to train *and* socialize at the box; an unhurried session he looks forward to beats a crammed one he skips.
Revisit when: available time per session changes, or adherence data shows sessions routinely running long/short.

**1.3 — The week undulates hard/easy; no back-to-back MetCons.**
Decision: alternate higher-stress days (intensity/conditioning) with lower-stress days (strength/skill/mobility);
never stack two hard conditioning days, especially on a sore day. Why: this athlete gets very sore and protects
recovery; spacing the stress is what makes 5 days/week sustainable. Revisit when: recovery markers (soreness
logs, HRV trend) show he tolerates tighter spacing — or the opposite, and we need more easy days.

**1.4 — Busy-week floor is 2 days; protect the goal stimuli.**
Decision: on a 2-day week, run two full-body sessions that prioritize strict-skill/strength plus one short
quality conditioning hit and a wellness/mobility block — and *don't chase everything*. Why: strength is
maintained at 1–2×/week and weekly volume (not frequency) drives hypertrophy, so a 2-day week can hold the
line if it spends its budget on the goals (see [`science-foundations.md`](science-foundations.md) and
[`training-system.md`](training-system.md)). Revisit when: the true weekly day-count floor turns out to be
different in practice (this is partly an **open calibration item** — confirm the real floor).

**1.5 — Mornings open with a 12–15 min active ramp.**
Decision: every session begins with a temperature-raising active ramp before any heavy, explosive, or
high-CNS strict work. Why: morning tissue is cold and stiff; a proper ramp is the cheapest injury-prevention
and performance lever for a masters athlete training AM. Revisit when: never as a default (it's a guardrail) —
only the *content* of the ramp evolves with ROM re-tests.

---

## 2. Conditioning / running

**2.1 — Polarized conditioning model: lots of short-sharp + a Zone-2 base.**
Decision: bias conditioning to high-quality sprint/power work plus easy steady aerobic volume, with little
time in the "grey zone" middle. Why: the athlete asked for "whatever's optimal," is fast-twitch by nature,
and polarized distribution is the well-supported way to build an aerobic base without blunting power. Revisit
when: a goal changes (e.g. he decides he wants to race *fast*, not just finish), or threshold work becomes a
specific need.

**2.2 — Keep 10-mile road-race capacity always available (capacity, not speed).**
Decision: maintain the ability to complete a ~10-mile run year-round via the Zone-2 base, without ever
specifically peaking for it. Why: he runs it roughly annually and wants it "doable" on demand — capacity is a
maintainable trait, race-speed is not worth the peaking cost (ties to **1.1 no peaking**). Revisit when: he
sets an actual finish-time goal, which would re-introduce some tempo/threshold work.

**2.3 — Re-onboard conditioning gently over 4–8 weeks; bias early work fast-twitch.**
Decision: ramp Grace/Fran-type intensity in over 4–8 weeks rather than testing hard early; lead with his
sprint/power strengths. Why: he's detrained but genuinely talented here — re-onboarding gently avoids the
classic "crush week 1, get hurt or burn out" failure, and starting with strengths builds confidence. Revisit
when: the Week 1–2 light benchmark and the first few weeks of logs show he can absorb more.

**2.4 — Use the full modality menu (run/hills, rower, bike, ski-erg).**
Decision: rotate across running, hill sprints, rower, assault/echo bike, and ski-erg. Why: he enjoys all of
them; variety sustains adherence and spreads connective-tissue load instead of hammering one pattern. Revisit
when: a niggle (e.g. knees) makes a specific modality unwise for a block.

---

## 3. Strength / physique

**3.1 — Bias upper-body volume to the goals; maintain legs.**
Decision: target 12–18 hard sets/week each for chest and for back/pulling; hold legs at ~6–9 maintenance
sets/week. Why: he is already lower-body dominant and wants a V-taper plus strong midline — so build where the
goal and the deficit are, and merely *defend* the leg strength he already owns. Revisit when: the monthly
re-baseline shows chest/back volume is too much (recovery cost) or too little (no progress), or leg strength
starts slipping below maintenance.

**3.2 — Physique emphasis: chest, shoulders/delts, upper back/lats, core; arms indirect.**
Decision: program directly for chest, delts, lats/upper back, and midline; let arms grow from the compound
pulling/pressing. Why: this is the athlete's stated aesthetic goal *and* it doubles as skill work — delts feed
HSPU, lats feed the muscle-up. Revisit when: aesthetic priorities change, or a re-test shows arms are a
limiter for a target skill.

**3.3 — Maintain, don't build, lower-body strength.**
Decision: keep squatting/hinging at a maintenance dose, not a progressive-overload focus. Why: lower body is
already his strength and the program's bottleneck is upstairs; spending recovery on legs would tax the upper
goals. Revisit when: lower-body strength regresses, or his goals shift toward a leg-dominant target.

**3.4 — Unilateral + anti-rotation emphasis.**
Decision: weave single-limb and anti-rotation work through the strength and accessory slots. Why: it addresses
a known left/right asymmetry (also an explicit athlete goal) and builds a more robust, balanced midline. Revisit
when: re-tests show the asymmetry has closed enough to de-emphasize, or a new imbalance appears.

---

## 4. Mobility

**4.1 — Mobility is a primary training target, not a cooldown.**
Decision: drive ROM with light, full-ROM *loaded* end-range work, not just passive stretching, and give it real
daily time. Why: the athlete loves mobility, wants lots of it, and is tight in ways that gate his goals — loaded
end-range builds usable, controllable range. Revisit when: ROM re-tests plateau and a different modality (e.g.
PNF, more frequency) is worth trying.

**4.2 — Prioritize overhead / t-spine first, then hips, hamstrings, ankles.**
Decision: spend the most mobility budget on overhead and thoracic-spine range. Why: it pays off three ways at
once — general ROM, HSPU position, and a stronger overhead press — so it's the highest-leverage area. Revisit
when: the overhead/t-spine re-test reaches a "good enough" gate and hips/hamstrings/ankles become the limiter.

**4.3 — Conservative spinal loading; controlled/light end-range over heavy loaded flexion.**
Decision: favor controlled, lightly loaded end-range spinal work; treat heavy loaded end-range flexion (e.g. a
loaded Jefferson curl) as something to approach cautiously, behind a screen. Why: the athlete has a spinal
consideration that is asymptomatic and unrestricted but warrants respect — the upside of heavy end-range flexion
doesn't justify the risk here. Revisit when: a movement screen (optionally with a physio) explicitly clears
heavier end-range loading, or symptoms ever appear (then back off immediately). **Pending:** confirm low-back
history before loading end-range flexion (open calibration item, see [`../CLAUDE.md`](../CLAUDE.md)).

---

## 5. Skills

**5.1 — Strict before kipping.**
Decision: build strict-strength prerequisites (press, pull, dip, false grip) before layering kipping/dynamic
HSPU and muscle-ups. Why: strict strength is the durable base; kipping onto an unprepared shoulder/elbow is how
masters athletes get hurt. Revisit when: never as a default (guardrail) — only which strict gate is "next"
changes as gates are met.

**5.2 — Headline skill goals: strict HSPU and a strict ring muscle-up.**
Decision: make strict HSPU and a strict ring MU the two north-star skills the blocks orient around. Why: they
are the athlete's stated aspirations and they align with the physique emphasis (delts/lats), so skill and
aesthetic work reinforce each other. Revisit when: a skill is *owned*, at which point a new north-star is chosen.

**5.3 — False-grip strength is the muscle-up's rate-limiter; treat it as a tendon-paced project.**
Decision: program false-grip hang/holds patiently as the gating element for the strict MU, progressing
conservatively. Why: the athlete can currently hold a false grip only a few seconds — it's the explicit limiter,
and grip/elbow connective tissue adapts slowly. Revisit when: false-grip hang time (a Week 1–2 baseline) reaches
its gate in [`training-system.md`](training-system.md) §7. **Pending:** the false-grip hang baseline is unmeasured.

**5.4 — Cap new upper-body gymnastics volume at ~+10%/week.**
Decision: grow upper-body gymnastics volume slowly, ~+10%/week, and hold when in doubt. Why: tendons are the
governor — connective tissue lags muscle, and this is the single biggest injury lever for a masters athlete.
Revisit when: never as a default (guardrail); the *absolute* numbers update once baseline gymnastics volume is
measured.

---

## 6. Recovery / readiness

**6.1 — Deterministic GREEN/AMBER/RED rule engine, not an LLM judgment.**
Decision: the day-of readiness tier is computed by a fixed offline rule in `library/autoregulation/`; the agent
plans *across* days, the engine *gates* the day. Why: a 6am gating decision must be instant, offline, explainable,
and reproducible — a deterministic rule is all three; an LLM call is none. Revisit when: the rule itself needs
re-tuning (e.g. after re-baselining the SWC band), but the *deterministic* nature is a fixed design prior.

**6.2 — Manual override always wins.**
Decision: a subjective check-in can override the wearable-derived tier in either direction. Why: subjective
readiness out-predicts wearable HRV in the literature, and the athlete knows things the watch doesn't. Revisit
when: never as a default (guardrail); it is a core principle.

**6.3 — Readiness inputs in priority: Bevel (Apple Watch) → Whoop → manual.**
Decision: use Bevel (on the Apple Watch) as the primary HRV source, Whoop as a second source when
re-subscribed, and a manual G/A/R tap as the always-available fallback. Why: it matches the hardware the
athlete actually has now, with graceful degradation when nothing synced. Revisit when: the Whoop subscription
is live (then wire its API — see open items), or the hardware mix changes.

**6.4 — Morning check-in is one tap; score entry optional.**
Decision: the default check-in is a single "overall feel" tap, with optional manual score entry if a wearable
synced. Why: friction kills daily logging at 6am — one tap gets done; a form doesn't. Revisit when: usage shows
the one-tap signal is too coarse to drive good gating.

**6.5 — First 14 days are "still calibrating."**
Decision: for the first ~14 days, communicate that there's no personal HRV baseline yet and lean on subjective
input. Why: HRV gating is meaningless without a personal baseline band; saying so is more honest than faking
precision. Revisit when: 14 days of data exist and the SWC band can be computed.

**6.6 — Never zero on RED; but a true rest day is allowed.**
Decision: RED defaults to meditation + hip/hamstring mobility + an easy flush (always *something*), but on a
genuine back-off day a full rest day is permitted — wellness is the default *offer*, not a mandate. Why: doing
*something* gentle aids recovery and adherence, yet forcing activity on a wrecked athlete is counterproductive.
Revisit when: never as a default (the "never zero" floor is a guardrail); the rest-day allowance is the human's
call to make.

**6.7 — Wellness blocks are first-class programming.**
Decision: a daily ~20-min block (paced breathing ≈6 breaths/min / resonance + hip/hamstring flow) is real
programming and the default RED-day session. Why: for this athlete, sleep *quality* is the main recovery
limiter, and resonance breathing is a low-cost, evidence-supported lever on it. Revisit when: never as a default
(guardrail); content evolves with what actually helps his sleep.

---

## 7. Chronotype / caffeine / sleep

**7.1 — Train mostly AM; PM is fine when it suits.**
Decision: default to morning sessions but allow PM without penalty. Why: the athlete is an in-between
chronotype with no strong evening performance drop, so timing can flex to life. **Pending:** chronotype is a
stated self-assessment, not yet validated — confirm over the first weeks. Revisit when: logs show a consistent
AM-vs-PM performance or adherence difference.

**7.2 — Caffeine: ~285 mg (3 mg/kg) on hard days only, AM-only, cycled.**
Decision: dose caffeine pre-session on the hardest skill/intensity days only, in the morning, and cycle it
(not every day). Why: it's an effective ergogenic where it matters, and restricting it to AM/hard days protects
sleep and preserves its effect by avoiding tolerance. Revisit when: sleep quality suffers — then titrate the
dose down (this is the explicit instruction). **Pending:** the exact mg derives from bodyweight (private) and
caffeine/sleep sensitivity, both to confirm.

**7.3 — Lean on wellness/breathing for sleep; watch caffeine timing.**
Decision: treat sleep quality as the #1 recovery limiter and address it primarily through the wellness block
and caffeine timing rather than supplements first. Why: the athlete sleeps 7–9h but restless — duration is fine,
quality is the lever, and breathing/timing are the cheapest interventions. Revisit when: sleep stays poor
despite these, at which point investigate further (environment, screening).

---

## 8. Nutrition

**8.1 — Protein-first; eyeball the rest.**
Decision: set a clear daily protein target (~1.6–2.2 g/kg) and give simple fueling principles for everything
else — no obsessive macro logging. Why: the athlete explicitly doesn't want to log everything; protein is the
macro that most moves recomposition and recovery, so anchor on it and keep the rest principle-based. Revisit
when: progress stalls and a short period of tighter tracking would diagnose why. See [`nutrition.md`](nutrition.md).

**8.2 — Ignore the scale; judge by mirror and performance.**
Decision: track progress by physique and performance, not bodyweight. Why: with simultaneous slow recomp the
scale is noisy and misleading; the athlete's goals are aesthetic and performance-based anyway. Revisit when: a
specific weight-class or health reason makes scale weight relevant.

**8.3 — Bias toward fast, high-protein options.**
Decision: default food guidance to quick high-protein choices alongside home cooking. Why: the athlete mixes
cooking with convenience and a high protein target is easier to hit with low-friction options. Revisit when:
his cooking/convenience balance changes.

**8.4 — Flag the Monday-after-alcohol recovery cost.**
Decision: note that weekend social drinking can blunt early-week recovery and plan Mondays accordingly. Why:
the athlete drinks socially mostly on weekends; surfacing the recovery impact lets autoregulation expect a
possible Monday dip rather than be surprised by it. Revisit when: his drinking pattern changes.

---

## 9. Supplements

**9.1 — Creatine monohydrate, 5 g/day.**
Decision: recommend 5 g/day creatine, daily. Why: it's the most evidence-backed performance/lean-mass
supplement and is safe and cheap. Revisit when: never on efficacy grounds; only if the athlete chooses to stop.

**9.2 — Whey protein to hit the target.**
Decision: use whey as a convenient tool to reach the daily protein number, not as a requirement. Why: it's the
fastest way to close a protein gap on busy days — a means to **8.1**, not a separate goal. Revisit when: protein
target is consistently met from food alone.

**9.3 — Collagen 15 g + vitamin C, ~60 min pre-session.**
Decision: take ~15 g collagen with vitamin C roughly an hour before training. Why: it's the nutritional arm of
the **tendon-is-the-governor** rail — timed pre-load is the protocol with the most support for connective-tissue
synthesis. Revisit when: the evidence base shifts, or tendon tolerance is no longer a limiter. See
[`science-foundations.md`](science-foundations.md).

**9.4 — Vitamin D + omega-3 for recovery/sleep.**
Decision: suggest vitamin D and omega-3 as general recovery/sleep support. Why: both are commonly low and
plausibly help recovery and sleep at low cost/risk. Revisit when: bloodwork (vitamin D especially) would let
the dose be set on data rather than a default. **Pending:** doses are generic until/if labs inform them.

**Overall supplements note:** the athlete currently takes none and is open to suggestions — so these are
*proposals to trial*, introduced one at a time, not a stack to start at once.

---

## 10. App / UX

**10.1 — Show both lb and kg everywhere.**
Decision: display loads in both pounds and kilograms. Why: the athlete thinks partly in each, and dual units
remove mental math at the bar with near-zero cost. Revisit when: a forker wants a single-unit preference toggle.

**10.2 — Meditation block: interval bell + optional paced-breathing visual.**
Decision: ship an interval-bell meditation (set total duration + a 1–5 min bell interval) plus an optional
~6 breaths/min paced-breathing visual; unguided by default, with an occasional external link. Why: the athlete
wants minimal, unguided structure that supports resonance breathing — the wellness-block tool, kept simple.
Revisit when: usage shows he wants guided content built in. See [`functional-design.md`](functional-design.md).

**10.3 — WOD timer: AMRAP/EMOM/intervals/for-time/Tabata, loud beeps + vibration, wake-lock.**
Decision: build a full-feature WOD timer covering the common CrossFit formats, with loud audio, vibration, and
a screen wake-lock. Why: it's the highest-frequency in-session surface — it must be unmissable across the gym
and never sleep mid-workout. Revisit when: a format he uses isn't covered.

**10.4 — Logging is "done + how it felt" + the key result.**
Decision: keep logging to a quick completion tap, a subjective feel, and the timer/key result. Why: low-friction
logging is logging that actually happens — and "how it felt" feeds autoregulation. Revisit when: he wants richer
per-set logging for a specific analysis.

**10.5 — Device roles: iPhone in-hand, old iPad as the gym display, Watch via phone haptics.**
Decision: target the iPhone as the primary device, repurpose an old iPad as a dedicated large gym display (the
runner must look good big), and drive Watch haptics from the phone for now. Why: it matches the hardware the
athlete already owns and the way he'll actually use it in the gym. Revisit when: a native Watch app is built
(see open items).

**10.6 — Print/PDF is low priority.**
Decision: defer the printable/chalkboard PDF path. Why: it's a real design goal (one source, two renderers) but
not a daily need — the screen comes first. Revisit when: the app surface is solid and a printed program is wanted.

---

## 11. Architecture / product

**11.1 — Local-first PWA now; hosted version later.**
Decision: ship a local-first, offline-always PWA driven by Claude Code now; a hosted multi-user version is
explicitly later. Why: the daily-use surface (timer, today's WOD, readiness, logging) must work offline at 6am
and can ship in days; hosting is scope the v1 doesn't need. Revisit when: more than one athlete needs it, or
cross-device sync becomes a real requirement (see open items). See [`architecture.md`](architecture.md).

**11.2 — Stack: Next.js + TypeScript + Zod, Dexie/IndexedDB, deterministic autoreg engine, Claude Code skills.**
Decision: keep the chosen stack — typed Zod source of truth, local IndexedDB via Dexie, an offline rule engine,
and Claude Code skills as the re-planning loop. Why: it delivers the "one source of truth, two renderers,
AI-proposes/human-decides" principles with minimal moving parts. Revisit when: a principle in
[`architecture.md`](architecture.md) §1 would be better served by a different tool.

**11.3 — The AI edits files; every plan change is a reviewable git diff.**
Decision: Claude Code writes only to `generated/` and leaves a `rationale.md`; the human reviews each commit.
Why: it keeps the human in control, makes every change explainable, and leaves an audit trail. Revisit when:
never as a default (it's a core principle and a guardrail).

**11.4 — Native Watch app and wearable APIs are deferred.**
Decision: phone-driven Watch haptics now; a native watchOS app and direct wearable APIs (e.g. Whoop) come later.
Why: v1 ships the daily surface first; native wrappers and integrations are additive, not blocking. Revisit
when: the daily loop is stable and a wearable API or native Watch app earns its complexity (see open items).

---

## 12. Privacy

**12.1 — Real profile and history are gitignored; publish a sanitized template only.**
Decision: keep the athlete's real `profile/` and `history/` out of git; publish only a scrubbed
template/example. Why: the repo is public and forkable but the athlete's data is private — the engine should be
shareable without leaking personal specifics. Revisit when: never as a default; the *mechanism* for persisting
private data is an open item below.

**12.2 — Scrub the previously-pushed real profile from git history and force-push.**
Decision: remove the real profile from existing git history and force-push the cleaned history (athlete
approved). Why: gitignoring going forward doesn't help data already committed — it has to be expunged. Revisit
when: done and verified; then this is closed. **Caveat to surface:** force-pushing rewrites history for any
existing clones/forks.

**12.3 — Refer to the athlete generically in all published docs.**
Decision: every published doc uses "the athlete"/"you" and omits private specifics (exact loads, spinal-curvature
details, gym name); private values live only in the gitignored profile. Why: forkability + privacy — the logic
travels, the person doesn't. Revisit when: never as a default (this is the rule this whole doc set follows).

---

## 13. License

**13.1 — MIT.**
Decision: license the repo MIT. Why: it's the simplest, most permissive choice — maximally forkable, minimal
friction for anyone who wants to build on it, matching the open-source intent. Revisit when: a future need (e.g.
a hosted commercial version, or a desire for share-alike) argues for a different license. See
[`../LICENSE`](../LICENSE).

---

## 14. Progress tracking / patience

**14.1 — Advance by ownership gates, not dates.**
Decision: progress movements when ownership criteria are met (e.g. ~5 clean controlled reps / hold standards),
not on a calendar. Why: it ties load to demonstrated capacity, which is safer and more honest than
date-based progression — especially with the tendon governor. Revisit when: never as a default (guardrail); the
*gate values* update after Week 1–2 testing.

**14.2 — Track skill/strength gates primarily; ROM by periodic re-test; no mandatory photos.**
Decision: make skill/strength gates the primary progress signal, re-test ROM in a periodic block (not
continuously), and don't require progress photos. Why: it matches what the athlete cares about and keeps daily
friction low; continuous ROM testing is noise, periodic is signal. Revisit when: he *wants* photos, or ROM needs
tighter monitoring during a mobility push.

**14.3 — Tendons first, no rush — longevity over speed.**
Decision: bias every progression-rate decision toward caution. Why: the whole program is built for a long
healthy training life, not fast PRs; under-reaching slightly is cheap, an injury is expensive. Revisit when:
never as a default (it's the program's governing temperament).

---

## 15. Open items / to revisit

These are **deliberately unresolved** — either pending measurement, or scoped out of v1 on purpose. They are
collected here so nothing important hides in a sub-section.

**Pending Week 1–2 testing** (see [`testing-protocol.md`](testing-protocol.md) — these resolve the placeholder
gates in [`training-system.md`](training-system.md) §7 and the readiness SWC band in §5):
- Strict press 1RM (or rep-max).
- Max strict (dead-hang) pull-ups.
- Max strict ring dips.
- False-grip hang time — the **muscle-up rate-limiter** (decision **5.3**).
- ROM markers: forward fold / toe-touch, overhead test, ankle dorsiflexion, hip.
- One light conditioning benchmark (e.g. a short sprint or 2k row), kept sub-maximal, to anchor re-onboarding.

**Pending confirmation (don't fabricate — ask or screen):**
- True weekly day-count floor (decision **1.4** assumes 2).
- Chronotype self-assessment validated against actual AM/PM performance (decision **7.1**).
- Caffeine/sleep sensitivity, to titrate the dose (decision **7.2**).
- Low-back history, before any heavier end-range spinal loading (decision **4.3**).
- Baseline upper-body gymnastics volume, to anchor the ~+10%/week cap in absolute terms (decision **5.4**).
- Vitamin D status (and other labs), to move supplement doses off generic defaults (decision **9.4**).

**Scoped out of v1 / to revisit later:**
- **Private-data persistence.** Gitignored data won't persist in the public repo *or* an ephemeral container.
  Recommend a local copy and/or a future **private data repo or git submodule** so the profile/history survive
  (open follow-up to decision **12.1**).
- **Whoop API integration.** Wire it once the subscription is live (follow-up to decision **6.3 / 11.4**).
- **Native watchOS app.** Currently phone-driven haptics; native app timing TBD (decision **11.4 / 10.5**).
- **Hosted / multi-user version.** Local-first now; revisit if more than one athlete needs it (decision **11.1**).
- **Print/PDF (chalkboard) renderer.** Deferred until the app surface is solid (decision **10.6**).

---

*When you change a decision, change it **here first** — edit the entry, note the new date, and then update the
docs it touches. This log is the memory of *why*; keep it current and the rest of the system stays explainable.*

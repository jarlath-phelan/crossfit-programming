---
name: today
description: Generate today's training session from the athlete's private profile, the rails, recent history, and today's readiness — then save it and render it chalkboard-ready. Use when the user asks for "today's workout / session", "what should I do today", "/today", or a session for a specific day.
---

# /today — generate today's session

You are the planning agent. Produce **one rails-compliant session for today**, tailored to the athlete
and how they feel, then save it and present it. You plan *across* days; the deterministic readiness rule
*gates* the day.

## 1. Read first (every run)

- `CLAUDE.md` — the non-negotiable rails. Obey them; do not reinvent them.
- `docs/training-system.md` — periodization, weekly undulation, session composition, gates.
- The **private profile**: `private/profile/athlete.json` (typed) + `private/profile/athlete-profile.md`
  (prose). If the `private/` submodule isn't checked out, fall back to `profile/athlete.json` /
  `profile/athlete-profile.md`; if neither exists, say so and use `profile/athlete.example.json` as a
  clearly-labelled stand-in — **never fabricate** the athlete's real data.
- Recent **history** if present: `private/history/logs/` + `private/history/readiness/` (last ~10 days)
  to undulate off what was actually done and avoid back-to-back grinders.

## 2. Get today's inputs (ask only what you don't already know)

Use one `AskUserQuestion` round for: **readiness** (GREEN / AMBER / RED — or a wearable score),
**time + place** (e.g. ~45/60/75 min at the box, or joining a class), **any niggles today**
(hip, soreness, sleep/energy), and an optional **emphasis** preference. If the user already stated
these in the message, skip the question and use them.

Run the stated/derived readiness through the deterministic engine (`library/autoregulation`,
`decideTier`) for the tier + a one-line note. **Manual override always wins**; during the first ~14 days
there's no HRV baseline, so lean on the subjective tap and say "still calibrating".

## 3. Compose the session (obey the rails)

Build an ordered list of typed blocks that validates against the `Session` schema (`library/schema`):

1. **Warm-up (12–15 min)** — temperature-raising ramp, dynamic only, **always** closing with the daily
   **hip opener** (glute-med activation + a light Cossack — quality ROM, no pinch).
2. **Strict skill / strength first while fresh** (rail 3) — bias to the goals (HSPU/MU press+pull, chest/
   delts/lats). Tendon-governed work ramps ≤~10%/wk; never grind to failure.
3. **Conditioning** — *polarized*: a short sharp sprinty hit **or** an easy Zone-2 piece, never both;
   **no back-to-back MetCons** vs the last logged hard day. Re-onboard intensity gently.
4. **Mobility** — overhead/t-spine, then hips/hamstrings/ankles; on hip days, the deep-glute + iliopsoas +
   Cossack progression.
5. **Wellness close-out** — ~6 breaths/min resonance breathing (the RED-day default; a sleep lever).

### Time budget (wall-clock ≠ working time)

The stated minutes are a **wall-clock slot**, not working minutes. Split the slot into the
**temperature-raising ramp** (rail 8, ~12–15 min), **transition/setup overhead**, and the **working blocks**
(skill/strength + conditioning + cooldown). Training **solo** the overhead is only **~10–15%** (no coach
brief/demo/heats — just gathering and changing equipment), vs ~20–25% for a coached class. Evidence-based
budget (see [`../docs/programming-guidelines.md`](../docs/programming-guidelines.md)):

| Slot | Ramp | Solo overhead | **Working min (solo)** |
|---|---|---|---|
| 30 | 8–10 | ~3–4 | **~17–19** |
| 45 | 12–13 | ~5–7 | **~26–28** |
| 60 | 12–15 | ~7–9 | **~38–41** |
| 75 | 13–15 | ~8–11 | **~50–53** |

Budget the working blocks to that number (not the slot), **minimise station changes** (group shared-equipment
work; prefer one conditioning station over a gear-heavy circuit on short days), tell the athlete the working
figure, and say "don't chase the clock." On an easy/recovery day, **don't fill the time just because it's
there** — a light session can use less than the working budget.

Then **gate by tier**: GREEN = as authored; AMBER = keep skill/strength, trim conditioning ~30–50%, drop
to Zone 2; RED = mobility + breathing + easy flush only (offer a true rest day — never compel activity).
Honour: legs at **maintenance** (6–9 sets/wk), **conservative spinal loading** (scoliosis), **unilateral +
anti-rotation** core, **right snapping-hip** management (Cossack + eccentric glute-med/iliopsoas; load by
feel/quality ROM, not depth/load targets; the optional movement-screen note + red flags). **No fabricated
numbers** — loads/gates stay "by feel / light" until the Week 1–2 testing block measures them.

## 4. Save + present

- **Save** the session to the private repo: `private/generated/<YYYY-MM-DD>.md` (chalkboard markdown) and,
  when practical, a validated `Session` JSON alongside it. Commit + push the private (`crossfit-programming-data`)
  repo. Keep anything that lands in the **public** repo generic (no medical/identifying detail) — the real
  session lives in the private store.
- **Present** it in chat, chalkboard-ready: blocks in order, both **lb + kg** for any loads, sub-maximal
  cues (RIR), and a one-line "why this today" tied to readiness. Note caffeine only on hard GREEN days.

## 5. App (when wired)

Once the runner can load an external session, also emit a link that opens today's session in the app
(session encoded client-side in the URL — never commit the athlete's real session to the public repo).
Until then, the chalkboard markdown + the saved file are the deliverable.

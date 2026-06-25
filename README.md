# Open Programming

> An open-source, forkable system for **adaptive CrossFit + wellness programming** — built so one
> human-authored source of truth compiles to both a printable whiteboard program and an offline-first
> app, and a Claude Code agent continuously re-plans it against your logged history and daily readiness.

This started as one athlete's personal programming. It's built to be **yours too**: fork it, edit your
profile, and let Claude Code generate a program tuned to *your* goals, schedule, equipment, and how
you feel on a given morning.

It is **CrossFit for wellness, longevity, and confidence** — not competition. The defaults bias toward
feeling good, moving well, getting strong, and looking good, rather than chasing PRs or peaking for a date.

---

## What it does

- **One source of truth → two renderers.** Your profile + a movement library compile to *both* the
  app and a printable/chalkboard WOD. They can never drift.
- **Show up, hit START.** A full-screen workout runner with a built-in timer (AMRAP / EMOM /
  intervals / for-time / Tabata) that takes over the screen, with audio + haptic cues and screen wake-lock.
- **Respects how you feel.** A daily readiness check — from a wearable (Apple Watch via Bevel, Whoop)
  or a one-tap **green / amber / red** — adjusts the day's session. The human override always wins.
- **Wellness is first-class.** Mobility work and a 20-minute meditation block (with an embedded
  interval-bell timer) are part of the program, not an afterthought.
- **Continuously evolving.** A Claude Code agent rewrites the next 1–2 weeks on a rolling cadence based
  on what you logged — every change is a reviewable git commit, not a black box.
- **Evidence-based, not over-optimized.** Choices trace to the research in
  [`docs/science-foundations.md`](docs/science-foundations.md); the honest uncertainties are flagged too.

---

## Repository map

Three ownership zones — **your data**, **the shared engine**, **the AI's generated plan**:

```
profile/      YOUR truth — the only thing you must edit to make this yours
              (athlete, goals, equipment, readiness preferences)
library/      the shared engine — schemas, movement library, templates, autoregulation rules
generated/    the AI's plan — dated sessions the agent writes, you review via git diff (the app reads, never writes)
history/      the feedback loop — your daily readiness entries and workout logs
app/          the offline-first PWA (workout runner + timer)   [Phase 1]
docs/         the design: how it thinks and how it's built
ROADMAP.md    phased build plan from here to the full vision
CLAUDE.md     guardrails + research priors the planning agent must obey
```

### Documentation

| Doc | What it is |
|---|---|
| [`docs/training-system.md`](docs/training-system.md) | The **coach** — philosophy, periodization, weekly templates, readiness rules, progression gates |
| [`docs/architecture.md`](docs/architecture.md) | The **software** — tech stack, the "hit START" experience, repo layout, how the AI re-plans |
| [`docs/data-model.md`](docs/data-model.md) | The **schema** — every entity, with field tables and JSON examples |
| [`docs/functional-design.md`](docs/functional-design.md) | The **app UX** — screen-by-screen: the runner, the WOD timer, the meditation bell, the check-in |
| [`docs/science-foundations.md`](docs/science-foundations.md) | The **why** — the evidence basis, with citations and uncertainties |
| [`docs/nutrition.md`](docs/nutrition.md) | The **fueling** — protein-first guidance + an evidence-based supplement protocol |
| [`docs/testing-protocol.md`](docs/testing-protocol.md) | The **baselines** — a gentle Week 1–2 block that turns the progression gates into real numbers |
| [`docs/decisions.md`](docs/decisions.md) | The **decision log** — every design choice and its rationale, with "revisit when" triggers |
| [`ROADMAP.md`](ROADMAP.md) | The **plan** — phased, each phase ships something usable on its own |

### Reading the docs as a site

The docs are also published as a clean, paginated, searchable site (MkDocs Material) at
**https://jarlath-phelan.github.io/crossfit-programming/** — easier on the eyes than scrolling raw
markdown. It deploys automatically via `.github/workflows/docs.yml`. One-time repo setup to switch it on:

1. **Settings → Actions → General → Workflow permissions →** "Read and write permissions".
2. Re-run the **Docs site** workflow (Actions tab) so it publishes the `gh-pages` branch.
3. **Settings → Pages → Source:** "Deploy from a branch" → branch **`gh-pages`** / `(root)`.

To preview locally: `pip install -r requirements-docs.txt && mkdocs serve` → open `http://localhost:8000`.

---

## Make it yours (the fork promise)

You don't need to be a developer. The intended flow:

1. **Fork** this repo and open it in [Claude Code](https://claude.com/claude-code) (CLI, desktop, or web).
2. Run **`/onboard`** — the agent interviews you and writes your `profile/`.
3. Run **`/replan`** — the agent reads your profile + the library and writes your first 1–2 weeks into `generated/`.
4. Open the app (or print the WOD) and **train**. Log how it went; run `/today` each morning to respect your readiness.

> The `/onboard`, `/replan`, `/today`, and `/deload` skills and the app are being built per the
> [roadmap](ROADMAP.md). Today the repo contains the full design and the foundational structure;
> see **Status** below.

---

## Status

This repo is in **Phase 0 — planning complete, build next**. What exists today:

- ✅ **Research-backed design**, finalized through a full interview: training system, software architecture,
  data model, app UX (functional design), nutrition, a Week 1–2 testing protocol, the evidence base, and a
  decision log — all in `docs/`.
- ✅ The **three-zone forkable structure** (`profile/` · `library/` · `generated/` + `history/`) with the
  privacy model in place: real data is git-ignored; only sanitized templates are published.
- ✅ **Agent guardrails** and research priors (`CLAUDE.md`); **MIT** licensed.
- ✅ A **thin but working app slice** — Home card (today's session + one-tap readiness tier) and a
  full-screen **Session Runner** with a pure WOD-timer FSM (`lib/timer/`), conditioning takeover
  (huge countdown + beep/haptics/wake-lock), per-side mobility, and an unguided meditation block
  (interval bell + ~6 breaths/min pacer). PWA-lite + Vercel-import-ready (just connect the repo).
- ⏳ Next (Phase 0 → 1): encode the Zod schemas + profile as typed data, the deterministic autoregulation
  engine, the Claude Code planning skills (`/onboard`, `/replan`, `/today`, `/deload`), and the PWA workout
  runner + timer. See [`ROADMAP.md`](ROADMAP.md).

---

## Built to be shared

If you fork it and build your own programming on top of it, that's exactly the point. Contributions that
keep the **engine** general and forkable — while your `profile/` and `generated/` stay personal — are welcome.

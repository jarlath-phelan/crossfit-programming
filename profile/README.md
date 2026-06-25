# `profile/` — your truth

This is the **only zone you must edit to make this repo yours**. Everything else (the engine in `library/`,
the plan in `generated/`) is derived from what's here plus how you train.

## Privacy model (this repo is public)

Your real profile holds personal/health data, so it is **git-ignored** and never committed:

- **`athlete-profile.example.md`** — the public **template** (tracked). Start here.
- **`athlete-profile.md`** — your **real** profile (git-ignored, stays local).

To make it yours: copy the example to `athlete-profile.md` and fill it in — or run **`/onboard`** in
Claude Code and it'll interview you and write it. Then run **`/replan`** to generate your program.

> ⚠️ Because your real profile is git-ignored, it isn't backed up by the public repo. Keep a local copy,
> or store your private data in a separate private repo/submodule for persistence
> (see [`../docs/architecture.md`](../docs/architecture.md) → Data privacy).

## Planned typed data (Phase 0, see [`../ROADMAP.md`](../ROADMAP.md))

The same facts, encoded for the app and the planning agent to consume:

```
athlete.ts           identity, physical stats, training age, athlete type
goals.ts             ranked goals + advancement criteria
equipment.ts         what your gym/box has
readiness-prefs.ts   readiness sources (Bevel/Whoop/manual), SWC settings, caffeine/wellness toggles
nutrition.ts         eating pattern, protein target, supplement list
```

These typed files follow the same public-template / git-ignored-real split.

# `generated/` — the AI's plan

**Machine-written, human-reviewed, git-tracked.** The Claude Code planning agent writes here; the app and
the chalkboard/PDF **read** from here. The app never writes to `generated/`.

```
mesocycles/   the current ~6-week emphasis block + rationale.md (why this block, what it's biasing toward)
calendar/     dated Session objects on a rolling 1–2 week window
```

How it stays current (per [`../docs/architecture.md`](../docs/architecture.md) §6):

- **`/today`** adjusts only today's session to your logged readiness.
- **`/replan`** rewrites the next 1–2 weeks from your `profile/` + `library/` + recent `history/`,
  leaving past sessions immutable.
- **`/deload`** inserts a lighter week when fatigue trends warrant it.

Every regeneration is a reviewable git commit — read the diff, revert if you disagree. Nothing here is
hand-edited as the source of truth; change `profile/` (or the library) and re-run the planner instead.

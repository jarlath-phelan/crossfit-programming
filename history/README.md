# `history/` — the feedback loop

Your record. This is what makes the program **adaptive** rather than static: the planning agent reads
trends here (weekly volume per pattern, benchmark drift, pain flags, readiness trend) to decide what to
write into `generated/` next.

```
readiness/   one ReadinessEntry per day (wearable HRV and/or subjective check-in, the resulting tier)
logs/        one WorkoutLog per completed session (what you actually did, loads, reps, RPE, notes)
```

The app appends here as you log a session and check in each morning (see the v1 write-back path in
[`../docs/architecture.md`](../docs/architecture.md) §9, open question 1). Past entries are immutable —
they're history. Schemas for both entities are in [`../docs/data-model.md`](../docs/data-model.md).

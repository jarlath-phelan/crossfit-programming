# `library/` — the shared engine

This is the **forkable machine**. Forkers inherit it and can extend it, but most won't need to edit it to
get a working program. It is the same for everyone; what makes a program *yours* lives in `profile/`.

Planned contents (built out over Phases 0–1, see [`../ROADMAP.md`](../ROADMAP.md)):

```
schema/            Zod schemas = the single contract (validates data, types the app, constrains AI output)
movements/         movement library: progressions, scaling rules, demo links
templates/         block/session archetypes (e.g. HSPU block, muscle-up block, Zone-2 conditioning)
autoregulation/    the deterministic GREEN/AMBER/RED engine — a pure, tested TS function (no LLM call)
```

The schemas here are defined once and documented in [`../docs/data-model.md`](../docs/data-model.md). The
app renders/runs from these shapes, and the planning agent must produce output that parses against them.

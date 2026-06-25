# BUILD-LOG

A running record of the autonomous build: what got built, and every non-trivial decision made
along the way (with rationale), so the work is reviewable in the morning. Newest entries on top.

The build runs on branch `claude/app-foundation`, merging to `main` when CI is green.
Scope locked with the owner: **foundation-first** (data model + autoregulation engine + tests,
thin demo UI), full-rigor quality bar, Vercel-import-ready, generic public demo content only
(the real athlete profile stays git-ignored).

---

## Decisions

### D7 — Thin runner + WOD timer + meditation slice (+ Vercel deploy)
Built the "show up, hit START, the screen takes over" demo on top of the existing
schema/engine/demo. Kept it thin but genuinely working.

- **Pure timer FSM** in `lib/timer/machine.ts` — a reducer (`initTimer`/`tickTimer`/`tick`) +
  selectors (`remainingSec`/`currentRound`/`phase`/`done`) + `isBoundary`, driven by a
  `TimerConfig`, modelling `countdown → work → rest → round → done` for all five timer types
  (amrap, for-time, emom, intervals, tabata). No browser APIs, no wall-clock reads → fully
  unit-tested (`lib/timer/machine.test.ts`, 17 tests covering every type, boundaries, countdown,
  completion). The client component owns the real clock (`performance.now()` + `setInterval`) and
  feeds elapsed deltas into the pure FSM.
- **Browser-effect helpers** `lib/audio.ts` (Web Audio beep), `lib/haptics.ts` (`navigator.vibrate`),
  `lib/wakeLock.ts` (Screen Wake Lock) — each feature-detected with a no-op SSR fallback. Not
  unit-tested (browser-only), kept dead simple.
- **App surface:** `app/page.tsx` Home card (today's demo session + tier chip + one-tap
  GREEN/AMBER/RED selector run through `decideTier` for the engine note + big START); `app/runner/page.tsx`
  full-screen runner that walks blocks in order (warmup checklist → strength/gymnastics with both
  lb+kg → conditioning timer takeover → mobility per-side holds → meditation), applies the block
  `variants` for the AMBER patch / RED skip downshift, allows re-picking the tier on the spot, and
  ends with a 1–5 "how it felt" capture.
- **Persistence:** chosen tier + "how it felt" go to **localStorage** (`lib/runner/store.ts`).
  A real IndexedDB/Dexie store is intentionally out of scope for this thin slice.
- **Today's session** is picked deterministically from `buildDemoBlock("2026-06-15").sessions[0]` —
  no `Date.now()`/`new Date()` in module scope or in the FSM.
- **PWA-lite:** `app/manifest.ts` (Next metadata route → `/manifest.webmanifest`) + `public/icon.svg`,
  wired into `app/layout.tsx` metadata. No service worker / offline cache yet.
- **Verified** with `npm run format` + full `npm run validate` (typecheck, lint, test, build) all
  green, then drove the real app with `playwright-core` against system Chromium
  (`e2e/shots.mjs`, kept out of the Vitest run under `e2e/`) — captured Home, conditioning timer
  mid-WORK, and the meditation block; **zero console errors**.

**Deploy on Vercel:** import the repo at vercel.com — framework auto-detects as Next.js, no env vars
or secrets needed. Build command `next build`, output is the standard Next runtime (no static export,
per D4), so server routes stay possible later. The app is import-ready as-is.

### D1 — Hand-rolled the Next.js scaffold instead of `create-next-app`
`create-next-app` refuses a non-empty directory (the repo already has `docs/`, `profile/`, etc.)
and runs interactively. Hand-rolling gives exact control over the structure to match
`docs/architecture.md` (`app/`, `library/`, `components/`, `lib/`). Verified the result builds.

### D2 — Stack versions
Next 15 (App Router) + React 19 + TypeScript 5.7 (strict, plus `noUncheckedIndexedAccess`,
`noUnused*`). Zod for the schema contract. Tailwind 3 (stable) with a dark high-contrast
"chalkboard" theme. Vitest + Testing Library + jsdom for tests. ESLint 8 with `eslint-config-next`
(classic `.eslintrc.json` — most reliable with Next 15) + Prettier. Chose ESLint 8 over 9 to avoid
flat-config friction with `eslint-config-next` during an unattended run.

### D3 — `mkdocs.yml` excluded from Prettier
It contains custom YAML tags (`!!python/name:material.extensions...`) that Prettier can mangle and
break the docs build. Added to `.prettierignore`.

### D4 — Vercel, not static export
Owner chose Vercel hosting. Next runs with its full runtime on Vercel, so no `output: "export"`.
Keeps the door open for later server routes (wearable webhooks, optional sync). App will be made
import-ready; the owner connects it on vercel.com in the morning (no secrets needed overnight).

### D5 — Coverage gate on the engine
`vitest.config.ts` enforces ≥95% statements / 100% functions on `library/autoregulation/**`.
The autoregulation engine is the deterministic safety-critical core; it earns the strictest bar.

### D6 — Code-generated demo over hand-written JSON
Seed content (a 6-week Block A, 5 sessions/week ≈ 30 sessions) is produced by a small generator
in `library/demo/` (`templates.ts` + `build.ts`) rather than ~30 hand-authored session JSON files.
Rationale:
- **Less error-prone.** Hand-writing 30 sessions invites drift — a misspelled movement id, a
  warmup forgotten, a missing meditation tail, a back-to-back-MetCon slip. The generator encodes
  the rails *once* (warmup-first, strict-skill-first, daily mobility + wellness tail, polarized
  conditioning, no adjacent MetCons) so every emitted session obeys them by construction.
- **Reusable.** The same `Session`/`Block`/`TimerConfig` shapes the generator emits are exactly what
  the future `/replan` skill must produce. `build.ts` is a working precursor: a deterministic,
  pure-function planner (`buildDemoBlock(startISODate)`) that takes a start date and returns
  schema-valid output — no `Date.now()`/`new Date()` with no args, so it is fully testable.
- **Testable as a contract.** `library/demo/demo.test.ts` asserts the rails structurally (every
  session warmup-first / meditation-last, strict work before conditioning, no calendar-adjacent
  MetCon-heavy days, all movement references resolve) and round-trips every entity through its Zod
  schema. The athlete demo lives in `profile/athlete.example.json` (generic, publishable).
- **Design calls noted:** (1) "MetCon-heavy" is defined as any conditioning timer *except* an easy
  Zone-2 `intervals` piece (work ≥ rest); sprint intervals (short work / long recovery) count as
  heavy. (2) The no-back-to-back check is applied to *calendar-adjacent* days only — a Fri→Mon
  weekend gap resets it. (3) The `swcBaseline` ships as `status: "calibrating"` since a fresh fork
  has no personal HRV history yet (first ~14 days), consistent with the readiness rails.

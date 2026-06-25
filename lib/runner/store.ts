/**
 * Thin localStorage store for the demo runner: the chosen readiness tier and the
 * end-of-session "how it felt" capture. A real IndexedDB/Dexie store is out of
 * scope for this thin slice (noted in BUILD-LOG D7) — localStorage is enough.
 *
 * SSR-safe: every read guards on `window`. Callers should read inside effects.
 */
import type { ReadinessEntry, ReadinessPrefs, Tier } from "@/library/schema";
import { decideTier, type TierDecision } from "@/library/autoregulation";

const TIER_KEY = "op.tier";
const FELT_PREFIX = "op.felt.";

export function loadTier(): Tier | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(TIER_KEY);
  return v === "GREEN" || v === "AMBER" || v === "RED" ? v : null;
}

export function saveTier(tier: Tier): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TIER_KEY, tier);
}

/** Persist the 1–5 "how it felt" score for a given session id. */
export function saveFelt(sessionId: string, score: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FELT_PREFIX + sessionId, String(score));
}

export function loadFelt(sessionId: string): number | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(FELT_PREFIX + sessionId);
  return v ? Number(v) : null;
}

/**
 * Run a one-tap subjective tier through the deterministic engine to get the
 * transparency note. During the demo we are "calibrating" (no HRV baseline), so
 * the engine leans on the tap — exactly the rail-7 first-14-days behaviour.
 */
export function tierDecision(tier: Tier): TierDecision {
  const prefs: ReadinessPrefs = {
    sourceOrder: ["manual"],
    swc: { metric: "lnRMSSD", bootstrapDays: 14, bandSdMultiplier: 1, rollingDays: 7 },
    subjective: {
      mode: "one-tap",
      oneTapTiers: ["GREEN", "AMBER", "RED"],
      allowOptionalScore: true,
    },
    manualOverrideWins: true,
  };
  const entry: ReadinessEntry = {
    // A fixed timestamp keeps this pure for the demo (no wall-clock read).
    date: "2026-06-15",
    recordedAt: "2026-06-15T07:00:00Z",
    subjectiveTier: tier,
    computedTier: tier,
  };
  return decideTier(entry, prefs, { calibrating: true });
}

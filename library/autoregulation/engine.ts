import type { Hrv, ReadinessEntry, ReadinessPrefs, Tier, WearableScore } from "../schema";

/**
 * The deterministic, offline autoregulation engine (docs/architecture.md §7,
 * docs/CLAUDE.md "Readiness / autoregulation"). It maps a daily ReadinessEntry to a
 * GREEN / AMBER / RED tier. This is a pure rule — never an LLM call — so the runner
 * can gate the day in-app with zero network.
 *
 * Principles encoded here:
 *  - The subjective one-tap is the primary signal: it sets the floor (the wearable
 *    can never make the day *easier* than it feels) and fully controls the downside
 *    (a RED tap → RED, even on a great HRV — "never punish a RED day").
 *  - The wearable/HRV can only add a *one-step* caution below the subjective tap
 *    (GREEN feel + tanked HRV → AMBER, not RED), because subjective readiness
 *    out-predicts wearable HRV in the literature.
 *  - A manual override always wins outright (an explicit tier, or free-text like
 *    "wrecked, busy day" → RED; a true rest day is allowed).
 *  - During the first ~N days there is no personal SWC baseline: the engine is
 *    "still calibrating" and leans entirely on the subjective tap.
 */

const ORDER: Record<Tier, number> = { GREEN: 0, AMBER: 1, RED: 2 };
const TIERS: readonly Tier[] = ["GREEN", "AMBER", "RED"];

const ord = (t: Tier): number => ORDER[t];
const fromOrd = (n: number): Tier => TIERS[Math.max(0, Math.min(2, n))] as Tier;
/** The more conservative (worse) of two tiers. */
const worse = (a: Tier, b: Tier): Tier => fromOrd(Math.max(ord(a), ord(b)));

export type TierSource = "override" | "subjective" | "calibrating" | "blended";

export interface TierDecision {
  tier: Tier;
  source: TierSource;
  /** Human-readable transparency string, suitable for ReadinessEntry.engineNotes. */
  notes: string;
  /** The tier implied by the wearable/HRV signal alone, if any was usable. */
  signalTier: Tier | null;
}

export interface DecisionContext {
  /** True during the bootstrap window (first ~`swc.bootstrapDays` days): ignore HRV. */
  calibrating?: boolean;
}

/**
 * Map an HRV reading to a tier using the athlete's SWC band.
 * Returns null when there is no usable HRV signal.
 */
export function hrvToTier(hrv: Hrv | undefined): Tier | null {
  if (!hrv) return null;
  const value = hrv.rolling7 ?? hrv.lnRmssd ?? null;
  if (hrv.swcBand && value !== null) {
    const { low, high } = hrv.swcBand;
    const width = Math.max(high - low, 0);
    if (value >= low) return "GREEN";
    // Within one band-width below the floor = caution; further below = red.
    if (value >= low - width) return "AMBER";
    return "RED";
  }
  if (typeof hrv.inBand === "boolean") return hrv.inBand ? "GREEN" : "AMBER";
  return null;
}

/**
 * Map a composite wearable score to a tier. Only the well-defined 0–100 readiness/
 * recovery scale is interpreted (rough thirds); other scales are left to HRV.
 */
export function wearableToTier(w: WearableScore | undefined): Tier | null {
  if (!w || w.scale !== "0-100") return null;
  if (w.score >= 67) return "GREEN";
  if (w.score >= 34) return "AMBER";
  return "RED";
}

/**
 * The core decision. Deterministic and side-effect-free.
 */
export function decideTier(
  entry: ReadinessEntry,
  prefs: ReadinessPrefs,
  context: DecisionContext = {},
): TierDecision {
  // 1. Manual override always wins.
  if (entry.override !== undefined) {
    if (typeof entry.override === "string") {
      return {
        tier: entry.override,
        source: "override",
        notes: `Manual override → ${entry.override} (override always wins).`,
        signalTier: null,
      };
    }
    return {
      tier: "RED",
      source: "override",
      notes: `Manual override ("${entry.override.freeText}") → RED. Back off; a true rest day is allowed.`,
      signalTier: null,
    };
  }

  const subjective = entry.subjectiveTier;
  const calibrating = context.calibrating ?? false;

  // 2. During calibration there is no trustworthy baseline: lean on the tap.
  if (calibrating) {
    return {
      tier: subjective,
      source: "calibrating",
      notes: `Still calibrating (no personal HRV baseline yet) — leaning on your subjective tap → ${subjective}.`,
      signalTier: null,
    };
  }

  // 3. Derive the wearable/HRV signal (HRV preferred, composite score as fallback).
  const signalTier = hrvToTier(entry.hrv) ?? wearableToTier(entry.wearable);

  if (signalTier === null) {
    return {
      tier: subjective,
      source: "subjective",
      notes: `No usable wearable/HRV signal — subjective tap → ${subjective}.`,
      signalTier: null,
    };
  }

  // 4. Blend. Subjective sets the floor; the wearable can pull down per policy.
  let finalTier: Tier;
  if (prefs.manualOverrideWins) {
    // Wearable limited to one step worse than the subjective tap.
    const cappedSignal = Math.min(ord(signalTier), ord(subjective) + 1);
    finalTier = fromOrd(Math.max(ord(subjective), cappedSignal));
  } else {
    finalTier = worse(subjective, signalTier);
  }

  const agreement = finalTier === subjective ? "agrees with" : "adjusts";
  return {
    tier: finalTier,
    source: "blended",
    notes: `Subjective ${subjective} + wearable/HRV ${signalTier} → ${finalTier} (subjective leads; wearable ${agreement} it).`,
    signalTier,
  };
}

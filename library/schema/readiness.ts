import { z } from "zod";
import { ISODate, Tier, Timestamp } from "./primitives";

/** Readiness data sources, in trust/fallback order (docs/data-model.md §1, §6). */
export const ReadinessSource = z.enum(["bevel", "whoop", "healthkit", "manual"]);
export type ReadinessSource = z.infer<typeof ReadinessSource>;

const hooper = z.number().int().min(1).max(7); // 1 = best, 7 = worst (Hooper)

/** Optional 4-axis subjective detail (only in hooper mode). */
export const Subjective = z.object({
  sleep: hooper,
  soreness: hooper,
  stress: hooper,
  energy: hooper,
});
export type Subjective = z.infer<typeof Subjective>;

/** Optional numeric wearable score (Bevel/Whoop), with how to read it. */
export const WearableScore = z.object({
  source: z.enum(["bevel", "whoop", "healthkit"]),
  score: z.number(),
  scale: z.enum(["0-100", "z", "ms"]),
  syncedAt: Timestamp.optional(),
  entryMethod: z.enum(["synced", "typed"]),
});
export type WearableScore = z.infer<typeof WearableScore>;

/** Optional raw HRV trend, when a source exposes lnRMSSD vs just a composite. */
export const Hrv = z.object({
  rmssd: z.number().optional(),
  lnRmssd: z.number().optional(),
  rolling7: z.number().optional(),
  swcBand: z.object({ low: z.number(), high: z.number() }).optional(),
  inBand: z.boolean().optional(),
  source: ReadinessSource.optional(),
});
export type Hrv = z.infer<typeof Hrv>;

/** Readiness-source order + SWC band config + subjective prefs (docs/data-model.md §1). */
export const ReadinessPrefs = z.object({
  sourceOrder: z.array(ReadinessSource).min(1),
  swc: z.object({
    metric: z.literal("lnRMSSD"),
    bootstrapDays: z.number().int().nonnegative(),
    bandSdMultiplier: z.number().positive(),
    rollingDays: z.number().int().positive(),
  }),
  subjective: z.object({
    mode: z.enum(["one-tap", "hooper-1-7"]),
    oneTapTiers: z.array(Tier).min(1),
    allowOptionalScore: z.boolean(),
  }),
  manualOverrideWins: z.boolean(),
});
export type ReadinessPrefs = z.infer<typeof ReadinessPrefs>;

/** One daily check-in (docs/data-model.md §6). */
export const ReadinessEntry = z.object({
  date: ISODate,
  recordedAt: Timestamp,
  subjectiveTier: Tier,
  subjectiveDetail: Subjective.optional(),
  wearable: WearableScore.optional(),
  hrv: Hrv.optional(),
  override: z.union([Tier, z.object({ freeText: z.string() })]).optional(),
  computedTier: Tier,
  engineNotes: z.string().optional(),
});
export type ReadinessEntry = z.infer<typeof ReadinessEntry>;

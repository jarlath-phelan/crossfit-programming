import { z } from "zod";
import { EquipmentId, GoalId, SupplementId, UnitPrefs, UUID, Tier } from "./primitives";
import { Goal } from "./goal";
import { NutritionPrefs } from "./nutrition";
import { Supplement } from "./nutrition";
import { ReadinessPrefs } from "./readiness";

/** Structural skews that bias programming (docs/data-model.md §1). */
export const StrengthProfile = z.object({
  lowerBodyDominant: z.boolean().optional(),
  upperPushDominant: z.boolean().optional(),
  upperPullDominant: z.boolean().optional(),
  posteriorChainStrong: z.boolean().optional(),
  asymmetryNote: z.string().optional(),
  notes: z.string().optional(),
});
export type StrengthProfile = z.infer<typeof StrengthProfile>;

/** Schedule / time envelope (docs/data-model.md §1). */
export const Constraints = z.object({
  sessionsPerWeekMin: z.number().int().nonnegative(),
  sessionsPerWeekTarget: z.number().int().positive().optional(),
  sessionsPerWeekMax: z.number().int().positive(),
  timePerSessionMin: z.number().positive(),
  unhurried: z.boolean().optional(),
  noBackToBackMetcons: z.boolean().optional(),
  hardConstraints: z.array(z.string()).optional(),
});
export type Constraints = z.infer<typeof Constraints>;

/** Caffeine / collagen / extensible protocol toggles (docs/data-model.md §1). */
export const Protocols = z
  .object({
    caffeine: z
      .object({
        use: z.boolean(),
        mgPerHardDay: z.number().optional(),
        onlyOnTiers: z.array(Tier).optional(),
        amOnly: z.boolean().optional(),
        cycle: z.boolean().optional(),
      })
      .optional(),
    collagen: z
      .object({
        use: z.boolean(),
        gramsPerDay: z.number().optional(),
        timingNote: z.string().optional(),
      })
      .optional(),
  })
  .catchall(z.unknown());
export type Protocols = z.infer<typeof Protocols>;

/** The athlete-owned truth — the top input to every plan (docs/data-model.md §1). */
export const AthleteProfile = z.object({
  id: UUID,
  name: z.string().min(1),
  age: z.number().int().positive(),
  sex: z.enum(["M", "F", "other"]),
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  targetWeightKg: z.number().positive().optional(),
  bodyfatPct: z.number().optional(),
  trainingAgeYears: z.number().nonnegative(),
  chronotype: z.enum(["AM", "PM", "neutral"]),
  fiberBias: z.enum(["fast-twitch", "slow-twitch", "mixed"]).optional(),
  units: UnitPrefs,
  strengthProfile: StrengthProfile.optional(),
  goals: z.union([z.array(Goal), z.array(GoalId)]),
  constraints: Constraints,
  equipment: z.array(EquipmentId),
  nutrition: NutritionPrefs.optional(),
  supplements: z.union([z.array(Supplement), z.array(SupplementId)]).optional(),
  protocols: Protocols.optional(),
  readinessPrefs: ReadinessPrefs,
  benchmarks: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});
export type AthleteProfile = z.infer<typeof AthleteProfile>;

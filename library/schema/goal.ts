import { z } from "zod";
import { GoalId, MovementId } from "./primitives";

/** A data-gated rung the AI tests against logged history (docs/data-model.md §2). */
export const AdvancementCriterion = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  whenMovement: MovementId,
  metric: z.enum(["reps", "load", "time", "rom", "rir", "clean-reps"]),
  comparator: z.enum([">=", ">", "==", "<=", "<"]),
  threshold: z.number(),
  overSessions: z.number().int().positive().optional(),
  thenAdvanceTo: MovementId.optional(),
});
export type AdvancementCriterion = z.infer<typeof AdvancementCriterion>;

export const GoalType = z.enum(["skill", "strength", "hypertrophy", "mobility", "wellness"]);
export type GoalType = z.infer<typeof GoalType>;

/** A ranked, weighted, data-gated objective (docs/data-model.md §2). */
export const Goal = z.object({
  id: GoalId,
  label: z.string().min(1),
  type: GoalType,
  weight: z.number().min(0).max(1),
  targetMovement: MovementId.optional(),
  advancementCriteria: z.array(AdvancementCriterion).optional(),
  metric: z.string().optional(),
  retestEveryDays: z.number().int().positive().optional(),
  notes: z.string().optional(),
});
export type Goal = z.infer<typeof Goal>;

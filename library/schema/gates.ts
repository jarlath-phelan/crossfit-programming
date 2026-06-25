import { z } from "zod";
import { GoalId, ISODate, MovementId, Timestamp } from "./primitives";

/** One tracked advancement criterion's at-a-glance state (docs/data-model.md §9). */
export const GateStatus = z.object({
  goalId: GoalId,
  criterionId: z.string().min(1),
  movement: MovementId,
  state: z.enum(["locked", "in-progress", "passed"]),
  progress: z
    .object({
      observed: z.number(),
      threshold: z.number(),
      overSessions: z.number().int().positive().optional(),
      metAt: ISODate.optional(),
    })
    .optional(),
  nextRung: MovementId.optional(),
  note: z.string().optional(),
});
export type GateStatus = z.infer<typeof GateStatus>;

/** A periodic ROM re-test marker (cadence-based, not continuous; docs/data-model.md §9). */
export const RomMarker = z.object({
  marker: z.string().min(1),
  lastTested: ISODate,
  retestEveryDays: z.number().int().positive(),
  value: z.string(),
  trend: z.enum(["improving", "holding", "regressing"]).optional(),
  nextRetestDue: ISODate.optional(),
});
export type RomMarker = z.infer<typeof RomMarker>;

/** Derived progress state read by the progress view and `/replan` (docs/data-model.md §9). */
export const GateTracker = z.object({
  updatedAt: Timestamp,
  gates: z.array(GateStatus),
  romMarkers: z.array(RomMarker).optional(),
  calibrating: z.boolean().optional(),
});
export type GateTracker = z.infer<typeof GateTracker>;

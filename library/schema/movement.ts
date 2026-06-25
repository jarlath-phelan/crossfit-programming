import { z } from "zod";
import { EquipmentId, MovementId } from "./primitives";

/** Per-tier downshift for a single movement (docs/data-model.md §3). */
export const MovementScaling = z.object({
  green: z.object({ movement: MovementId.optional(), note: z.string().optional() }),
  amber: z.object({ movement: MovementId.optional(), note: z.string().optional() }),
  red: z.object({ movement: MovementId.optional(), note: z.string().optional() }),
});
export type MovementScaling = z.infer<typeof MovementScaling>;

export const MovementCategory = z.enum([
  "strength",
  "gymnastics",
  "conditioning",
  "mobility",
  "meditation",
  "accessory",
]);
export type MovementCategory = z.infer<typeof MovementCategory>;

/** The reusable exercise catalogue entry (docs/data-model.md §3). */
export const Movement = z.object({
  id: MovementId,
  name: z.string().min(1),
  category: MovementCategory,
  pattern: z.string().optional(),
  equipment: z.array(EquipmentId),
  progressions: z.array(MovementId).optional(),
  scaling: MovementScaling.optional(),
  /** tendon-governed movements get a conservative ramp (≤~10%/wk). */
  loadsTendon: z.boolean().optional(),
  cues: z.array(z.string()).optional(),
  demoUrl: z.string().url().optional(),
});
export type Movement = z.infer<typeof Movement>;

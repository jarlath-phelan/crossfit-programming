import { z } from "zod";
import { ISODate, MovementId, SessionId, Tier, Timestamp, UUID } from "./primitives";

const felt = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]); // 1 = great, 5 = rough

/** A flagged joint → the AI auto-cuts the offending volume (docs/data-model.md §7). */
export const PainFlag = z.object({
  joint: z.enum(["wrist", "elbow", "shoulder", "lower-back", "knee", "hip", "ankle", "other"]),
  severity: felt,
  movement: MovementId.optional(),
  note: z.string().optional(),
});
export type PainFlag = z.infer<typeof PainFlag>;

export const BlockResult = z.object({
  blockId: z.string().min(1),
  type: z.enum([
    "warmup",
    "strength",
    "gymnastics",
    "conditioning",
    "mobility",
    "meditation",
    "note",
  ]),
  completed: z.boolean(),
  setsCompleted: z
    .array(
      z.object({
        reps: z.number(),
        loadKg: z.number().optional(),
        rir: z.number().optional(),
        clean: z.boolean().optional(),
      }),
    )
    .optional(),
  score: z
    .object({
      scoreType: z.enum(["rounds-reps", "time", "reps", "load", "cals"]),
      rounds: z.number().optional(),
      reps: z.number().optional(),
      timeSec: z.number().optional(),
      value: z.number().optional(),
    })
    .optional(),
  durationSec: z.number().optional(),
  felt: felt.optional(),
  scaledTier: Tier.optional(),
  note: z.string().optional(),
});
export type BlockResult = z.infer<typeof BlockResult>;

/** What actually happened — the feedback loop (docs/data-model.md §7). */
export const WorkoutLog = z.object({
  id: UUID,
  date: ISODate,
  sessionRef: SessionId,
  tierUsed: Tier,
  startedAt: Timestamp,
  completedAt: Timestamp.optional(),
  results: z.array(BlockResult),
  feltOverall: felt.optional(),
  benchmarkPRs: z
    .array(z.object({ name: z.string(), value: z.union([z.string(), z.number()]) }))
    .optional(),
  painFlags: z.array(PainFlag).optional(),
  notes: z.string().optional(),
});
export type WorkoutLog = z.infer<typeof WorkoutLog>;

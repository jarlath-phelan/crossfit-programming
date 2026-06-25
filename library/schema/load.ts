import { z } from "zod";

/**
 * LoadPrescription — how a block prescribes load. All masses in kg
 * (docs/data-model.md §4.3). Discriminated on `kind`.
 */
export const LoadPrescription = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("absolute"), kg: z.number().nonnegative() }),
  z.object({
    kind: z.literal("percent1RM"),
    pct: z.number().positive(),
    of: z.string().min(1), // benchmark key, e.g. "backSquat1RM"
  }),
  z.object({ kind: z.literal("rpe"), rpe: z.number().min(1).max(10) }),
  z.object({ kind: z.literal("rir"), rir: z.number().min(0).max(10) }),
  z.object({ kind: z.literal("bodyweight"), addedKg: z.number().optional() }),
  z.object({ kind: z.literal("band"), color: z.string().min(1) }),
]);
export type LoadPrescription = z.infer<typeof LoadPrescription>;

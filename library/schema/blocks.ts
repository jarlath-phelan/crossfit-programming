import { z } from "zod";
import { MovementId } from "./primitives";
import { LoadPrescription } from "./load";
import { MovementScaling } from "./movement";
import { TimerConfig } from "./timer";

/**
 * Block union (docs/data-model.md §4.2–§4.5). A Session is an ordered list of
 * typed Blocks; the runner walks them in order and each is both renderable and
 * runnable. Discriminated on `type`.
 */

const repsField = z.union([z.number(), z.string()]); // 8, "8–10", or "AMRAP"

/**
 * Per-tier variant overrides. A shallow patch the runner applies day-of:
 * `amber` replaces fields; `red` either patches or drops the block ("skip").
 * Modeled loosely because it is a Partial<Block> over a discriminated union.
 */
const blockVariants = z
  .object({
    amber: z.record(z.string(), z.unknown()).optional(),
    red: z.union([z.literal("skip"), z.record(z.string(), z.unknown())]).optional(),
  })
  .optional();

const base = {
  id: z.string().min(1),
  label: z.string().min(1),
  variants: blockVariants,
  scalingNote: z.string().optional(),
};

export const WarmupBlock = z.object({
  ...base,
  type: z.literal("warmup"),
  durationMin: z.number().positive(),
  items: z.array(
    z.object({
      movement: MovementId,
      reps: z.number().optional(),
      durationSec: z.number().optional(),
      note: z.string().optional(),
    }),
  ),
});

export const StrengthBlock = z.object({
  ...base,
  type: z.literal("strength"),
  movement: MovementId,
  sets: z.number().int().positive(),
  reps: repsField,
  loadPrescription: LoadPrescription,
  tempo: z.string().optional(),
  rir: z.number().optional(),
  restSec: z.number().nonnegative(),
});

export const GymnasticsSkillBlock = z.object({
  ...base,
  type: z.literal("gymnastics"),
  movement: MovementId,
  sets: z.number().int().positive(),
  reps: repsField,
  restSec: z.number().nonnegative(),
  advancementCriteriaRef: z.string().optional(),
  qualityNote: z.string().optional(),
});

export const ConditioningBlock = z.object({
  ...base,
  type: z.literal("conditioning"),
  name: z.string().min(1),
  timer: TimerConfig,
  movements: z.array(
    z.object({
      movement: MovementId,
      reps: repsField.optional(),
      load: LoadPrescription.optional(),
      scaling: MovementScaling.optional(),
    }),
  ),
  scoreType: z.enum(["rounds-reps", "time", "reps", "load", "cals"]),
});

export const MobilityBlock = z.object({
  ...base,
  type: z.literal("mobility"),
  target: z.enum(["hip", "hamstring", "shoulder", "thoracic", "ankle", "general"]),
  items: z.array(
    z.object({
      movement: MovementId,
      holdSec: z.number().nonnegative(),
      sides: z.union([z.literal(1), z.literal(2)]).optional(),
      loadNote: z.string().optional(),
    }),
  ),
});

/** Interval-bell timer for the meditation block (1–5 min chime). */
export const BellConfig = z.object({
  intervalMin: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  startBell: z.boolean(),
  endBell: z.boolean(),
  haptics: z.boolean().optional(),
});
export type BellConfig = z.infer<typeof BellConfig>;

/** Optional paced-breathing pacer (~6 breaths/min resonance). */
export const PacedBreathing = z.object({
  breathsPerMin: z.number().positive(),
  inhaleSec: z.number().positive(),
  exhaleSec: z.number().positive(),
  holdInSec: z.number().nonnegative().optional(),
  holdOutSec: z.number().nonnegative().optional(),
  visual: z.enum(["expanding-orb", "rising-bar", "wave", "none"]),
});
export type PacedBreathing = z.infer<typeof PacedBreathing>;

export const MeditationBlock = z.object({
  ...base,
  type: z.literal("meditation"),
  durationMin: z.number().positive(),
  bell: BellConfig.optional(),
  breathing: PacedBreathing.optional(),
  guidedUrl: z.string().url().nullable().optional(),
  script: z.string().optional(),
});

export const NoteBlock = z.object({
  ...base,
  type: z.literal("note"),
  markdown: z.string(),
});

export const Block = z.discriminatedUnion("type", [
  WarmupBlock,
  StrengthBlock,
  GymnasticsSkillBlock,
  ConditioningBlock,
  MobilityBlock,
  MeditationBlock,
  NoteBlock,
]);
export type Block = z.infer<typeof Block>;
export type BlockType = Block["type"];

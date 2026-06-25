import { z } from "zod";
import { MovementId } from "./primitives";

/**
 * TimerConfig — the declarative timer that drives the runner FSM
 * (docs/data-model.md §4.4). Cue behaviour is authored on the config so a
 * shared/printed WOD declares its own loud-beep + haptic intent.
 */
export const TimerCues = z.object({
  countdownSec: z.number().int().nonnegative(),
  loudCue: z.boolean(),
  haptics: z.boolean(),
  wakeLock: z.boolean(),
});
export type TimerCues = z.infer<typeof TimerCues>;

/** The runner's default cues when a TimerConfig omits its own. */
export const DEFAULT_TIMER_CUES: TimerCues = {
  countdownSec: 3,
  loudCue: true,
  haptics: true,
  wakeLock: true,
};

const emomSlot = z.object({ movement: MovementId, reps: z.number().int().nonnegative() });

export const TimerConfig = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("amrap"),
    durationSec: z.number().int().positive(),
    cues: TimerCues.optional(),
  }),
  z.object({
    type: z.literal("for-time"),
    capSec: z.number().int().positive(),
    rounds: z.number().int().positive().optional(),
    cues: TimerCues.optional(),
  }),
  z.object({
    type: z.literal("emom"),
    intervalSec: z.number().int().positive(),
    rounds: z.number().int().positive(),
    slots: z.array(emomSlot).optional(),
    cues: TimerCues.optional(),
  }),
  z.object({
    type: z.literal("intervals"),
    workSec: z.number().int().positive(),
    restSec: z.number().int().nonnegative(),
    rounds: z.number().int().positive(),
    cues: TimerCues.optional(),
  }),
  z.object({
    type: z.literal("tabata"),
    workSec: z.literal(20),
    restSec: z.literal(10),
    rounds: z.literal(8),
    cues: TimerCues.optional(),
  }),
]);
export type TimerConfig = z.infer<typeof TimerConfig>;

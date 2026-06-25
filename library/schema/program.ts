import { z } from "zod";
import { ISODate, MesocycleId } from "./primitives";
import { Session } from "./session";

/** The HRV band a block was planned against (docs/data-model.md §5.1). */
export const SwcBaseline = z.object({
  metric: z.literal("lnRMSSD"),
  meanLnRmssd: z.number(),
  sdLnRmssd: z.number().nonnegative(),
  bandLow: z.number(),
  bandHigh: z.number(),
  computedFrom: ISODate,
  status: z.enum(["calibrating", "established"]),
});
export type SwcBaseline = z.infer<typeof SwcBaseline>;

/** A rolling ~6-week emphasis block — no peaking (docs/data-model.md §5.1). */
export const Mesocycle = z.object({
  id: MesocycleId,
  startDate: ISODate,
  weeks: z.number().int().positive(),
  focus: z.string().min(1),
  maintained: z.array(z.string()).optional(),
  deloadWeek: z.number().int().positive().optional(),
  swcBaseline: SwcBaseline.optional(),
  rationaleRef: z.string().optional(),
});
export type Mesocycle = z.infer<typeof Mesocycle>;

/** Dated map of sessions; the AI writes a rolling window (docs/data-model.md §5.2). */
export const ProgramCalendar = z.object({
  sessionsByDate: z.record(ISODate, Session),
  windowStart: ISODate.optional(),
  windowEnd: ISODate.optional(),
});
export type ProgramCalendar = z.infer<typeof ProgramCalendar>;

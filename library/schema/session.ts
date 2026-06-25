import { z } from "zod";
import { ISODate, MesocycleId, SessionId, Tier } from "./primitives";
import { Block } from "./blocks";

/** A Session is one day — an ordered list of typed Blocks (docs/data-model.md §4.1). */
export const Session = z.object({
  id: SessionId,
  date: ISODate,
  title: z.string().min(1),
  mesocycleId: MesocycleId,
  /** The tier this session was authored for (the planned GREEN baseline). */
  readinessGate: Tier,
  estDurationMin: z.number().positive(),
  classFit: z.string().optional(),
  blocks: z.array(Block),
  rationale: z.string().optional(),
});
export type Session = z.infer<typeof Session>;

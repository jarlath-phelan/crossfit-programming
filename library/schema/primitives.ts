import { z } from "zod";

/**
 * Shared primitives for the data model (docs/data-model.md §0).
 * Mass is stored in kilograms everywhere; the UI converts for display.
 */

export const LB_PER_KG = 2.2046226218;
/** 96.5 kg → 212.7 lb */
export const toLb = (kg: number): number => kg * LB_PER_KG;
/** entry helper when an athlete logs in lb */
export const toKg = (lb: number): number => lb / LB_PER_KG;

/** ISO calendar date, e.g. "2026-06-25". Validated by shape, not just type. */
export const ISODate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date YYYY-MM-DD");
export type ISODate = z.infer<typeof ISODate>;

/** Full ISO-8601 timestamp. */
export const Timestamp = z.string().datetime({ offset: true });
export type Timestamp = z.infer<typeof Timestamp>;

export const Tier = z.enum(["GREEN", "AMBER", "RED"]);
export type Tier = z.infer<typeof Tier>;

/** Non-empty slug / id. Kept as a branded-ish string for readability. */
const slug = z.string().min(1);
export const MovementId = slug;
export const EquipmentId = slug;
export const GoalId = slug;
export const MesocycleId = slug;
export const SessionId = slug;
export const SupplementId = slug;
export const UUID = z.string().min(1);

/** Display-unit preferences — both lb + kg supported (docs/data-model.md §1). */
export const UnitPrefs = z.object({
  primary: z.enum(["lb", "kg"]),
  showBoth: z.boolean(),
  loadRoundingKg: z.number().positive().optional(),
});
export type UnitPrefs = z.infer<typeof UnitPrefs>;

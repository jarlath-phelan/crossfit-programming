import { z } from "zod";
import { SupplementId } from "./primitives";

/** Author-once nutrition preferences (docs/data-model.md §8.1). Protein-first, not a food log. */
export const NutritionPrefs = z.object({
  pattern: z.enum(["omnivore", "vegetarian", "vegan", "pescatarian"]),
  approach: z.enum(["protein-first", "macro-tracked", "intuitive"]),
  proteinTargetGPerKg: z.union([z.number(), z.tuple([z.number(), z.number()])]),
  cookingStyle: z.enum(["mixed-fast", "meal-prep", "convenience", "scratch"]),
  alcohol: z.enum(["none", "social-weekends", "regular"]).optional(),
  logging: z.enum(["none", "light", "full"]).optional(),
});
export type NutritionPrefs = z.infer<typeof NutritionPrefs>;

/** Resolved daily guidance card derived from prefs × bodyweight (docs/data-model.md §8.1). */
export const NutritionTarget = z.object({
  proteinGPerDay: z.tuple([z.number(), z.number()]),
  emphasis: z.array(z.string()),
  hydrationNote: z.string().optional(),
  recoveryNotes: z.array(z.string()).optional(),
  guidanceOnly: z.literal(true),
});
export type NutritionTarget = z.infer<typeof NutritionTarget>;

/** A single supplement entry (docs/data-model.md §8.2). */
export const Supplement = z.object({
  id: SupplementId,
  name: z.string().min(1),
  dose: z.string().min(1),
  timing: z.string().min(1),
  purpose: z.string().optional(),
  tiedToProtocol: z.string().optional(),
  surfaceAs: z.enum(["note-block", "card", "silent"]).optional(),
});
export type Supplement = z.infer<typeof Supplement>;

/**
 * Runner-side session helpers — picking today's demo session, applying the
 * day-of tier downshift (block `variants`), and small display formatters.
 *
 * Pure and deterministic: no `Date.now()` / `new Date()` here. The demo block is
 * built from a fixed start date so the app renders the same session every load.
 */
import type { Block, LoadPrescription, Session, Tier } from "@/library/schema";
import { toLb } from "@/library/schema";
import { buildDemoBlock } from "@/library/demo";
import { movementById } from "@/library/movements";

/** Fixed demo window start. Deterministic so "today" is stable across reloads. */
export const DEMO_START = "2026-06-15";

const DEMO = buildDemoBlock(DEMO_START);

/** All demo sessions (read-only). */
export const DEMO_SESSIONS: Session[] = DEMO.sessions;

/** Pick a session by a 0-based day counter (wraps). Defaults to day 0. */
export function pickSession(dayIndex = 0): Session {
  const n = DEMO_SESSIONS.length;
  const i = ((dayIndex % n) + n) % n;
  return DEMO_SESSIONS[i]!;
}

/** Human-readable movement name from its id (falls back to the raw id). */
export function movementName(id: string): string {
  return movementById[id]?.name ?? id;
}

/** Format a load prescription, showing BOTH lb + kg where a mass is known. */
export function formatLoad(load: LoadPrescription | undefined): string {
  if (!load) return "";
  switch (load.kind) {
    case "absolute": {
      const lb = Math.round(toLb(load.kg));
      return `${load.kg} kg / ${lb} lb`;
    }
    case "percent1RM":
      return `${load.pct}% of ${load.of}`;
    case "rpe":
      return `RPE ${load.rpe}`;
    case "rir":
      return `${load.rir} RIR`;
    case "bodyweight":
      return load.addedKg ? `bodyweight +${load.addedKg} kg` : "bodyweight";
    case "band":
      return `${load.color} band`;
  }
}

/**
 * Apply a tier's variant patch to a block. Returns the patched block, or `null`
 * when the tier drops the block (red "skip"). GREEN returns the block untouched.
 */
export function applyTier(block: Block, tier: Tier): Block | null {
  if (tier === "GREEN") return block;
  const variants = block.variants;
  if (!variants) return block;

  if (tier === "AMBER") {
    if (!variants.amber) return block;
    return { ...block, ...variants.amber } as Block;
  }

  // RED
  if (variants.red === undefined) return block;
  if (variants.red === "skip") return null;
  return { ...block, ...variants.red } as Block;
}

/** The session's blocks after the tier downshift (skipped blocks removed). */
export function tieredBlocks(session: Session, tier: Tier): Block[] {
  const out: Block[] = [];
  for (const b of session.blocks) {
    const patched = applyTier(b, tier);
    if (patched) out.push(patched);
  }
  return out;
}

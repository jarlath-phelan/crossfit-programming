"use client";

import type { Tier } from "@/library/schema";

const TIERS: Tier[] = ["GREEN", "AMBER", "RED"];

const ACTIVE: Record<Tier, string> = {
  GREEN: "bg-tier-green text-black border-tier-green",
  AMBER: "bg-tier-amber text-black border-tier-amber",
  RED: "bg-tier-red text-black border-tier-red",
};

/** A one-tap GREEN/AMBER/RED selector (large touch targets). */
export function TierPicker({ value, onChange }: { value: Tier; onChange: (t: Tier) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Readiness">
      {TIERS.map((t) => {
        const selected = t === value;
        return (
          <button
            key={t}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(t)}
            className={`rounded-xl border-2 py-4 text-base font-bold uppercase tracking-wide transition ${
              selected ? ACTIVE[t] : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

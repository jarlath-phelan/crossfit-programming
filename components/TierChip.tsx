import type { Tier } from "@/library/schema";

const STYLES: Record<Tier, string> = {
  GREEN: "bg-tier-green/20 text-tier-green border-tier-green/50",
  AMBER: "bg-tier-amber/20 text-tier-amber border-tier-amber/50",
  RED: "bg-tier-red/20 text-tier-red border-tier-red/50",
};

/** A small color chip for the current readiness tier. */
export function TierChip({ tier }: { tier: Tier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold uppercase tracking-wider ${STYLES[tier]}`}
    >
      {tier}
    </span>
  );
}

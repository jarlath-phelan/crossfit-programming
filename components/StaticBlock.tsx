"use client";

import { useState } from "react";
import type { Block } from "@/library/schema";
import { formatLoad, movementName } from "@/lib/runner/session";

/** Warmup checklist — tappable items so the athlete can tick them off. */
function WarmupView({ block }: { block: Extract<Block, { type: "warmup" }> }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <ul className="space-y-3">
      {block.items.map((it, i) => (
        <li key={i}>
          <button
            type="button"
            onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
            className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition ${
              checked[i]
                ? "border-tier-green/60 bg-tier-green/10 text-neutral-400 line-through"
                : "border-neutral-700 hover:border-neutral-500"
            }`}
          >
            <span
              className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border-2 ${
                checked[i] ? "border-tier-green bg-tier-green text-black" : "border-neutral-600"
              }`}
            >
              {checked[i] ? "✓" : ""}
            </span>
            <span className="text-lg font-semibold">
              {movementName(it.movement)}
              <span className="ml-2 text-base font-normal text-neutral-400">
                {it.reps ? `${it.reps} reps` : ""}
                {it.durationSec ? `${it.durationSec}s` : ""}
                {it.note ? ` · ${it.note}` : ""}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Strength / gymnastics — sets × reps × load with BOTH lb + kg. */
function StrengthView({ block }: { block: Extract<Block, { type: "strength" | "gymnastics" }> }) {
  const load = block.type === "strength" ? formatLoad(block.loadPrescription) : "";
  const note = block.type === "gymnastics" ? block.qualityNote : block.tempo;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 text-center">
        <p className="text-board-xl font-black">
          {block.sets} <span className="text-neutral-500">×</span> {String(block.reps)}
        </p>
        <p className="mt-1 text-xl font-semibold text-neutral-200">
          {movementName(block.movement)}
        </p>
        {load ? <p className="mt-2 text-lg font-medium text-tier-green">{load}</p> : null}
      </div>
      <p className="text-center text-sm text-neutral-400">
        Rest {block.restSec}s{note ? ` · ${note}` : ""}
      </p>
    </div>
  );
}

/** Mobility — per-side holds. */
function MobilityView({ block }: { block: Extract<Block, { type: "mobility" }> }) {
  return (
    <ul className="space-y-3">
      {block.items.map((it, i) => (
        <li
          key={i}
          className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/40 p-4"
        >
          <span className="text-lg font-semibold">
            {movementName(it.movement)}
            {it.loadNote ? (
              <span className="block text-sm font-normal text-neutral-400">{it.loadNote}</span>
            ) : null}
          </span>
          <span className="flex-shrink-0 text-right text-lg font-bold text-tier-green">
            {it.holdSec > 0 ? `${it.holdSec}s` : "reps"}
            {it.sides === 2 ? (
              <span className="block text-xs text-neutral-500">each side</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** A non-timer block view (warmup / strength / gymnastics / mobility / note). */
export function StaticBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "warmup":
      return <WarmupView block={block} />;
    case "strength":
    case "gymnastics":
      return <StrengthView block={block} />;
    case "mobility":
      return <MobilityView block={block} />;
    case "note":
      return (
        <p className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-sm leading-relaxed text-neutral-300">
          {block.markdown.replace(/\*\*/g, "")}
        </p>
      );
    default:
      return null;
  }
}

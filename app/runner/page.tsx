"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Tier } from "@/library/schema";
import { TierChip } from "@/components/TierChip";
import { TierPicker } from "@/components/TierPicker";
import { StaticBlock } from "@/components/StaticBlock";
import { ConditioningTimer } from "@/components/ConditioningTimer";
import { MeditationBlock } from "@/components/MeditationBlock";
import { pickSession, tieredBlocks } from "@/lib/runner/session";
import { loadTier, saveFelt, saveTier } from "@/lib/runner/store";

const SESSION = pickSession(0);

const BLOCK_KIND: Record<string, string> = {
  warmup: "Warm-up",
  strength: "Strength",
  gymnastics: "Gymnastics / Skill",
  conditioning: "Conditioning",
  mobility: "Mobility",
  meditation: "Wellness",
  note: "Notes",
};

/**
 * Full-screen Session Runner. Walks the chosen session's blocks in order, applying
 * the day-of tier downshift (block `variants`). Conditioning hands off to the timer
 * takeover; meditation to the bell + breathing pacer. Ends with a "how it felt"
 * capture saved to localStorage.
 */
export default function RunnerPage() {
  const [tier, setTier] = useState<Tier>("GREEN");
  const [showPicker, setShowPicker] = useState(false);
  const [step, setStep] = useState(0);
  const [felt, setFelt] = useState<number | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = loadTier();
    if (stored) setTier(stored);
  }, []);

  const blocks = useMemo(() => tieredBlocks(SESSION, tier), [tier]);

  // Clamp the step when the block count changes (a tier downshift can drop blocks).
  const safeStep = Math.min(step, blocks.length);
  const block = blocks[safeStep];
  const atEnd = safeStep >= blocks.length;

  function choose(t: Tier) {
    setTier(t);
    saveTier(t);
    setShowPicker(false);
    if (step > 0) setStep(0); // restart the walk so dropped/patched blocks apply cleanly
  }

  function next() {
    setStep((s) => Math.min(s + 1, blocks.length));
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function finish(score: number) {
    setFelt(score);
    saveFelt(SESSION.id, score);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 pb-4">
        <Link href="/" className="text-sm font-medium text-neutral-400 hover:text-neutral-200">
          ← Home
        </Link>
        <button
          type="button"
          onClick={() => setShowPicker((v) => !v)}
          aria-label="Re-pick readiness tier"
        >
          <TierChip tier={tier} />
        </button>
      </div>

      {showPicker ? (
        <div className="mb-4 space-y-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Re-pick how you feel
          </p>
          <TierPicker value={tier} onChange={choose} />
        </div>
      ) : null}

      {/* Progress */}
      {!atEnd ? (
        <div className="pb-2 text-xs font-medium uppercase tracking-widest text-neutral-500">
          Block {safeStep + 1} / {blocks.length} · {block ? BLOCK_KIND[block.type] : ""}
        </div>
      ) : null}

      {/* Body */}
      <div className="flex-1">
        {atEnd ? (
          <FeltCapture felt={felt} onFelt={finish} results={results} />
        ) : block ? (
          <section className="space-y-5">
            <h1 className="text-2xl font-bold leading-snug">{block.label}</h1>
            {block.type === "conditioning" ? (
              <ConditioningTimer
                block={block}
                onDone={(r) => {
                  setResults((prev2) => ({ ...prev2, [block.id]: r }));
                  next();
                }}
              />
            ) : block.type === "meditation" ? (
              <MeditationBlock block={block} onDone={next} />
            ) : (
              <StaticBlock block={block} />
            )}
          </section>
        ) : null}
      </div>

      {/* Bottom nav — hidden during a takeover block (it owns its own controls) */}
      {!atEnd && block && block.type !== "conditioning" && block.type !== "meditation" ? (
        <div className="flex gap-3 pt-6">
          {safeStep > 0 ? (
            <button
              type="button"
              onClick={prev}
              className="rounded-xl border-2 border-neutral-700 px-6 py-4 text-base font-bold uppercase tracking-widest text-neutral-300"
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            onClick={next}
            className="flex-1 rounded-xl bg-tier-green py-4 text-base font-extrabold uppercase tracking-widest text-black"
          >
            Next
          </button>
        </div>
      ) : null}
    </main>
  );
}

/** End-of-session "done + how it felt" 1–5 capture. */
function FeltCapture({
  felt,
  onFelt,
  results,
}: {
  felt: number | null;
  onFelt: (n: number) => void;
  results: Record<string, string>;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
      <div className="space-y-2">
        <p className="text-board-xl font-black text-tier-green">Done.</p>
        <p className="text-neutral-400">Nice work. How did it feel?</p>
      </div>

      {Object.keys(results).length > 0 ? (
        <div className="text-sm text-neutral-500">
          {Object.entries(results).map(([k, v]) => (
            <p key={k}>
              {k}: {v}
            </p>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onFelt(n)}
            aria-pressed={felt === n}
            className={`h-14 w-14 rounded-full border-2 text-xl font-bold transition ${
              felt === n
                ? "border-tier-green bg-tier-green text-black"
                : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {felt ? (
        <p className="text-sm text-tier-green" data-testid="felt-saved">
          Saved — felt {felt}/5. See you next session.
        </p>
      ) : (
        <p className="text-xs text-neutral-500">1 = wrecked · 5 = great</p>
      )}

      <Link href="/" className="text-sm font-medium text-neutral-400 hover:text-neutral-200">
        ← Back to home
      </Link>
    </div>
  );
}

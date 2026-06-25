"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Tier } from "@/library/schema";
import { TierChip } from "@/components/TierChip";
import { TierPicker } from "@/components/TierPicker";
import { pickSession } from "@/lib/runner/session";
import { loadTier, saveTier, tierDecision } from "@/lib/runner/store";

const SESSION = pickSession(0);

/**
 * Home card: today's demo session title + the current readiness tier as a color
 * chip, a one-tap GREEN/AMBER/RED selector (persisted to localStorage and run
 * through the deterministic engine for the note), and a big START → runner.
 */
export default function HomePage() {
  const [tier, setTier] = useState<Tier>("GREEN");

  useEffect(() => {
    const stored = loadTier();
    if (stored) setTier(stored);
  }, []);

  function choose(t: Tier) {
    setTier(t);
    saveTier(t);
  }

  const decision = tierDecision(tier);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-widest text-tier-green">
          Open Programming
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Today&apos;s session</h1>
      </header>

      <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold leading-snug">{SESSION.title}</h2>
          <TierChip tier={tier} />
        </div>
        <p className="text-sm text-neutral-400">
          ~{SESSION.estDurationMin} min · {SESSION.blocks.length} blocks
        </p>

        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            How do you feel today?
          </p>
          <TierPicker value={tier} onChange={choose} />
          <p className="text-xs leading-relaxed text-neutral-400" data-testid="engine-note">
            {decision.notes}
          </p>
        </div>
      </section>

      <Link
        href="/runner"
        data-testid="start"
        className="block w-full rounded-2xl bg-tier-green py-6 text-center text-2xl font-extrabold uppercase tracking-widest text-black transition active:scale-[0.99]"
      >
        Start
      </Link>

      <nav className="flex flex-col gap-2 text-sm text-neutral-500">
        <a
          className="transition hover:text-neutral-300"
          href="https://github.com/jarlath-phelan/crossfit-programming"
          target="_blank"
          rel="noreferrer"
        >
          → Source &amp; docs on GitHub
        </a>
      </nav>
    </main>
  );
}

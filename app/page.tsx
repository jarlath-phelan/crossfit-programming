import Link from "next/link";

/**
 * Placeholder home. The real home card (today's session + readiness tier + a big
 * START) lands with the runner slice; for now this confirms the shell renders and
 * links to where the demo will live.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-8 px-6 py-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-tier-green">
          Open Programming
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Show up. Hit START. The screen takes over.
        </h1>
        <p className="text-lg text-neutral-400">
          Adaptive CrossFit + wellness programming that respects how you feel. This is an early
          build — the foundation (data model + autoregulation engine) is in place; the workout
          runner and timer are coming next.
        </p>
      </header>

      <nav className="flex flex-col gap-3 text-sm">
        <Link
          className="rounded-lg border border-neutral-800 px-4 py-3 transition hover:border-tier-green"
          href="/demo"
        >
          → Demo week (coming soon)
        </Link>
        <a
          className="rounded-lg border border-neutral-800 px-4 py-3 transition hover:border-neutral-600"
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

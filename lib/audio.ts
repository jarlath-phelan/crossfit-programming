/**
 * Tiny Web Audio beep. Feature-detected and SSR-safe (a no-op when there is no
 * `window`/`AudioContext`). Deliberately dead simple — no unit tests (browser-only).
 *
 * Call `beep()` on a timer boundary. The first call must happen inside a user
 * gesture (e.g. the START tap) for the AudioContext to be allowed to make sound.
 */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

/** Resume a suspended context (mobile autoplay policy) — call from a user gesture. */
export function primeAudio(): void {
  const c = getCtx();
  if (c && c.state === "suspended") void c.resume();
}

/**
 * A short loud beep. `strong` (e.g. round/done boundary) plays a higher, longer tone.
 */
export function beep(strong = false): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "square";
  osc.frequency.value = strong ? 880 : 660;
  const now = c.currentTime;
  const dur = strong ? 0.35 : 0.18;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.4, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + dur);
}

/**
 * navigator.vibrate wrapper — feature-detected and SSR-safe. No-op where the
 * Vibration API is missing (desktop, iOS Safari). Browser-only; not unit tested.
 */
export function vibrate(pattern: number | number[] = 60): void {
  if (typeof navigator === "undefined") return;
  const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
  if (typeof nav.vibrate !== "function") return;
  try {
    nav.vibrate(pattern);
  } catch {
    // Ignore — vibration is a nice-to-have, never load-bearing.
  }
}

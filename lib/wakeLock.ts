/**
 * Screen Wake Lock helper — keeps the gym display awake for the duration of a
 * conditioning piece. Feature-detected and SSR-safe; every method is a no-op when
 * the API is unavailable. Browser-only; not unit tested.
 */
type WakeLockSentinelLike = { released: boolean; release: () => Promise<void> };

let sentinel: WakeLockSentinelLike | null = null;

interface WakeLockNavigator {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
}

/** Request a screen wake lock. Safe to call repeatedly; resolves to whether it's held. */
export async function requestWakeLock(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & WakeLockNavigator;
  if (!nav.wakeLock) return false;
  try {
    sentinel = await nav.wakeLock.request("screen");
    return true;
  } catch {
    return false;
  }
}

/** Release the wake lock if held. */
export async function releaseWakeLock(): Promise<void> {
  if (sentinel && !sentinel.released) {
    try {
      await sentinel.release();
    } catch {
      // ignore
    }
  }
  sentinel = null;
}

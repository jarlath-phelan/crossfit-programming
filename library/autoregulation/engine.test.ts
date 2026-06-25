import { describe, it, expect } from "vitest";
import type { ReadinessEntry, ReadinessPrefs } from "../schema";
import { decideTier, hrvToTier, wearableToTier } from "./engine";

const basePrefs: ReadinessPrefs = {
  sourceOrder: ["bevel", "manual"],
  swc: { metric: "lnRMSSD", bootstrapDays: 14, bandSdMultiplier: 0.5, rollingDays: 7 },
  subjective: { mode: "one-tap", oneTapTiers: ["GREEN", "AMBER", "RED"], allowOptionalScore: true },
  manualOverrideWins: true,
};

const prefs = (over: Partial<ReadinessPrefs> = {}): ReadinessPrefs => ({ ...basePrefs, ...over });

const entry = (over: Partial<ReadinessEntry>): ReadinessEntry => ({
  date: "2026-06-25",
  recordedAt: "2026-06-25T06:00:00Z",
  subjectiveTier: "GREEN",
  computedTier: "GREEN",
  ...over,
});

// SWC band: low 4.12, high 4.30, width 0.18 → AMBER zone [3.94, 4.12), RED below 3.94.
const band = { low: 4.12, high: 4.3 };

describe("hrvToTier", () => {
  it("GREEN when rolling value is in/above the band", () => {
    expect(hrvToTier({ rolling7: 4.24, swcBand: band })).toBe("GREEN");
    expect(hrvToTier({ rolling7: 4.12, swcBand: band })).toBe("GREEN");
  });
  it("AMBER within one band-width below the floor", () => {
    expect(hrvToTier({ rolling7: 4.05, swcBand: band })).toBe("AMBER");
  });
  it("RED further than a band-width below the floor", () => {
    expect(hrvToTier({ rolling7: 3.5, swcBand: band })).toBe("RED");
  });
  it("falls back to lnRmssd when rolling7 is absent", () => {
    expect(hrvToTier({ lnRmssd: 4.2, swcBand: band })).toBe("GREEN");
  });
  it("uses the inBand boolean when there is no band/value", () => {
    expect(hrvToTier({ inBand: true })).toBe("GREEN");
    expect(hrvToTier({ inBand: false })).toBe("AMBER");
  });
  it("returns null with no usable signal", () => {
    expect(hrvToTier(undefined)).toBeNull();
    expect(hrvToTier({})).toBeNull();
  });
});

describe("wearableToTier", () => {
  it("maps a 0–100 score in rough thirds", () => {
    expect(
      wearableToTier({ source: "bevel", score: 78, scale: "0-100", entryMethod: "synced" }),
    ).toBe("GREEN");
    expect(
      wearableToTier({ source: "whoop", score: 50, scale: "0-100", entryMethod: "typed" }),
    ).toBe("AMBER");
    expect(
      wearableToTier({ source: "whoop", score: 20, scale: "0-100", entryMethod: "synced" }),
    ).toBe("RED");
  });
  it("ignores non 0–100 scales and missing scores", () => {
    expect(
      wearableToTier({ source: "bevel", score: 40, scale: "ms", entryMethod: "synced" }),
    ).toBeNull();
    expect(wearableToTier(undefined)).toBeNull();
  });
});

describe("decideTier — overrides win", () => {
  it("an explicit tier override wins outright", () => {
    const d = decideTier(entry({ subjectiveTier: "GREEN", override: "AMBER" }), prefs());
    expect(d.tier).toBe("AMBER");
    expect(d.source).toBe("override");
  });
  it("a free-text override forces RED (rest allowed)", () => {
    const d = decideTier(
      entry({ subjectiveTier: "RED", override: { freeText: "wrecked, busy day" } }),
      prefs(),
    );
    expect(d.tier).toBe("RED");
    expect(d.source).toBe("override");
    expect(d.notes).toMatch(/rest day/i);
  });
});

describe("decideTier — calibration and no-signal", () => {
  it("leans on the subjective tap while calibrating, ignoring HRV", () => {
    const d = decideTier(
      entry({ subjectiveTier: "GREEN", hrv: { rolling7: 3.0, swcBand: band } }),
      prefs(),
      { calibrating: true },
    );
    expect(d.tier).toBe("GREEN");
    expect(d.source).toBe("calibrating");
    expect(d.signalTier).toBeNull();
  });
  it("uses the subjective tap when no wearable/HRV is present", () => {
    const d = decideTier(entry({ subjectiveTier: "AMBER" }), prefs());
    expect(d.tier).toBe("AMBER");
    expect(d.source).toBe("subjective");
  });
});

describe("decideTier — blend (manualOverrideWins = true)", () => {
  const cases: [
    string,
    ReadinessEntry["subjectiveTier"],
    number,
    ReadinessEntry["computedTier"],
  ][] = [
    // [name, subjective, hrv rolling7, expected]
    ["GREEN feel + tanked HRV → one-step caution AMBER", "GREEN", 3.5, "AMBER"],
    ["GREEN feel + dipping HRV → AMBER", "GREEN", 4.05, "AMBER"],
    ["GREEN feel + good HRV → GREEN", "GREEN", 4.24, "GREEN"],
    ["RED feel + great HRV → RED (subjective wins down)", "RED", 4.24, "RED"],
    ["AMBER feel + tanked HRV → RED", "AMBER", 3.5, "RED"],
    ["AMBER feel + great HRV → AMBER (no upshift)", "AMBER", 4.24, "AMBER"],
  ];
  it.each(cases)("%s", (_name, subjectiveTier, rolling7, expected) => {
    const d = decideTier(entry({ subjectiveTier, hrv: { rolling7, swcBand: band } }), prefs());
    expect(d.tier).toBe(expected);
    expect(d.source).toBe("blended");
  });

  it("falls back to the wearable composite when HRV is absent", () => {
    const d = decideTier(
      entry({
        subjectiveTier: "GREEN",
        wearable: { source: "bevel", score: 20, scale: "0-100", entryMethod: "synced" },
      }),
      prefs(),
    );
    expect(d.tier).toBe("AMBER"); // one-step caution below the GREEN tap
    expect(d.signalTier).toBe("RED");
    expect(d.notes).toMatch(/adjusts/);
  });

  it("notes agreement when the signal matches the tap", () => {
    const d = decideTier(
      entry({ subjectiveTier: "GREEN", hrv: { rolling7: 4.24, swcBand: band } }),
      prefs(),
    );
    expect(d.notes).toMatch(/agrees with/);
  });
});

describe("decideTier — blend (manualOverrideWins = false)", () => {
  it("takes the strictly more conservative of subjective and signal", () => {
    const d = decideTier(
      entry({ subjectiveTier: "GREEN", hrv: { rolling7: 3.5, swcBand: band } }),
      prefs({ manualOverrideWins: false }),
    );
    expect(d.tier).toBe("RED"); // no one-step cap when override doesn't win
  });
});

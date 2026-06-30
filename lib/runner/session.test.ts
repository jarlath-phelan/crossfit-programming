import { describe, it, expect } from "vitest";
import { Session } from "@/library/schema";
import { decodeSessionFromHash, encodeSessionToHash, formatLoad } from "./session";

const sample = Session.parse({
  id: "t",
  date: "2026-06-30",
  title: "Test — taste",
  mesocycleId: "m",
  readinessGate: "GREEN",
  estDurationMin: 45,
  blocks: [
    {
      id: "w",
      type: "warmup",
      label: "W",
      durationMin: 12,
      items: [{ movement: "row-easy", durationSec: 120 }],
    },
    {
      id: "c",
      type: "conditioning",
      label: "C",
      name: "AMRAP",
      scoreType: "rounds-reps",
      timer: { type: "amrap", durationSec: 480 },
      movements: [{ movement: "cal-row", reps: "12/10" }],
    },
  ],
});

describe("session hash round-trip", () => {
  it("encodes then decodes a session, preserving unicode (– × ≥)", () => {
    const s = Session.parse({ ...sample, title: "Taste — 12×row · ≥3 RIR" });
    const back = decodeSessionFromHash("#s=" + encodeSessionToHash(s));
    expect(back).not.toBeNull();
    expect(back?.title).toBe(s.title);
    expect(back?.blocks).toHaveLength(s.blocks.length);
  });

  it("returns null for a missing or malformed fragment", () => {
    expect(decodeSessionFromHash("")).toBeNull();
    expect(decodeSessionFromHash("#foo=bar")).toBeNull();
    expect(decodeSessionFromHash("#s=not~valid~base64~$$$")).toBeNull();
  });

  it("decodes a fragment with trailing params", () => {
    const enc = encodeSessionToHash(sample);
    expect(decodeSessionFromHash(`#s=${enc}&x=1`)?.id).toBe("t");
  });
});

describe("formatLoad shows both units", () => {
  it("renders kg + lb for an absolute load", () => {
    expect(formatLoad({ kind: "absolute", kg: 22.5 })).toBe("22.5 kg / 50 lb");
  });
});

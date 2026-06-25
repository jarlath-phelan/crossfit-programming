import { describe, it, expect } from "vitest";
import { Movement, AthleteProfile, Mesocycle, Session, type Block } from "@/library/schema";
import { MOVEMENTS, movementById } from "@/library/movements";
import athleteExample from "@/profile/athlete.example.json";
import { buildDemoBlock, addDays } from "./build";

/** Every movement id referenced anywhere inside a session, in order. */
function movementIdsInSession(session: Session): string[] {
  const ids: string[] = [];
  for (const block of session.blocks) {
    switch (block.type) {
      case "warmup":
        for (const item of block.items) ids.push(item.movement);
        break;
      case "strength":
      case "gymnastics":
        ids.push(block.movement);
        break;
      case "conditioning":
        for (const m of block.movements) ids.push(m.movement);
        break;
      case "mobility":
        for (const item of block.items) ids.push(item.movement);
        break;
      case "meditation":
      case "note":
        break;
    }
  }
  return ids;
}

/**
 * A conditioning block is "MetCon-heavy" unless it is an easy Zone-2 `intervals`
 * piece. Sprinty AMRAPs / for-time / EMOM / tabata and hard intervals all count
 * as MetCon-heavy for the no-back-to-back rail. We treat a low-density `intervals`
 * piece (long rest relative to work, i.e. restSec >= workSec) as the easy Zone-2 case.
 */
function isMetconHeavy(block: Block): boolean {
  if (block.type !== "conditioning") return false;
  const timer = block.timer;
  if (timer.type === "intervals") {
    // An easy Zone-2 base is a long-work / short-rest steady piece (work >= rest), e.g.
    // 300 s work / 60 s rest — NOT MetCon-heavy. Sprint intervals invert that (short work,
    // long recovery, e.g. 20 s / 100 s) and ARE MetCon-heavy.
    return timer.workSec < timer.restSec;
  }
  // amrap / for-time / emom / tabata are all intense conditioning → MetCon-heavy.
  return true;
}

/** True if any block in the session is a MetCon-heavy conditioning piece. */
function sessionIsMetconHeavy(session: Session): boolean {
  return session.blocks.some(isMetconHeavy);
}

describe("movement library", () => {
  it("every movement parses against Movement", () => {
    for (const m of MOVEMENTS) {
      expect(() => Movement.parse(m)).not.toThrow();
    }
  });

  it("has a sensible size (~24–32 movements)", () => {
    expect(MOVEMENTS.length).toBeGreaterThanOrEqual(24);
  });

  it("ids are unique", () => {
    const ids = MOVEMENTS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("movementById maps every id to its movement", () => {
    for (const m of MOVEMENTS) {
      expect(movementById[m.id]).toBe(m);
    }
    expect(Object.keys(movementById).length).toBe(MOVEMENTS.length);
  });

  it("every progressions reference resolves to a known movement id", () => {
    for (const m of MOVEMENTS) {
      for (const p of m.progressions ?? []) {
        expect(movementById[p], `${m.id} → progression ${p}`).toBeDefined();
      }
    }
  });

  it("every scaling.movement reference resolves to a known movement id", () => {
    for (const m of MOVEMENTS) {
      if (!m.scaling) continue;
      for (const tier of [m.scaling.green, m.scaling.amber, m.scaling.red]) {
        if (tier.movement !== undefined) {
          expect(movementById[tier.movement], `${m.id} scaling → ${tier.movement}`).toBeDefined();
        }
      }
    }
  });

  it("covers the patterns the demo needs", () => {
    const patterns = new Set(MOVEMENTS.map((m) => m.pattern));
    for (const required of [
      "vertical-press",
      "horizontal-press",
      "pull",
      "squat",
      "hinge",
      "core-anti-rotation",
      "core-anti-extension",
      "monostructural",
      "wellness-breathing",
    ]) {
      expect(patterns.has(required), `missing pattern ${required}`).toBe(true);
    }
  });
});

describe("athlete.example.json", () => {
  it("parses against AthleteProfile", () => {
    expect(() => AthleteProfile.parse(athleteExample)).not.toThrow();
  });

  it("carries only generic, publishable values", () => {
    const profile = AthleteProfile.parse(athleteExample);
    expect(profile.name).toBe("Example Athlete");
    expect(profile.id).toBe("athlete-example");
  });
});

describe("addDays", () => {
  it("adds calendar days with UTC arithmetic (no TZ drift)", () => {
    expect(addDays("2026-06-15", 0)).toBe("2026-06-15");
    expect(addDays("2026-06-15", 1)).toBe("2026-06-16");
    expect(addDays("2026-06-15", 7)).toBe("2026-06-22");
    // crosses a month boundary
    expect(addDays("2026-06-29", 5)).toBe("2026-07-04");
    // crosses a year boundary
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    // negative (used for the swc computedFrom date)
    expect(addDays("2026-06-15", -1)).toBe("2026-06-14");
  });

  it("rejects a malformed date", () => {
    expect(() => addDays("not-a-date", 1)).toThrow();
  });
});

describe("buildDemoBlock", () => {
  const { mesocycle, sessions } = buildDemoBlock("2026-06-15");

  it("returns a mesocycle that parses against Mesocycle", () => {
    expect(() => Mesocycle.parse(mesocycle)).not.toThrow();
    expect(mesocycle.weeks).toBe(6);
    expect(mesocycle.focus).toBe("pressing");
  });

  it("produces ~30 sessions, 5/week over 6 weeks", () => {
    expect(sessions.length).toBe(30);
  });

  it("every session parses against Session", () => {
    for (const s of sessions) {
      expect(() => Session.parse(s), `session ${s.id}`).not.toThrow();
    }
  });

  it("every session is GREEN-gated at baseline", () => {
    for (const s of sessions) {
      expect(s.readinessGate).toBe("GREEN");
    }
  });

  it("session dates increment by calendar day across weeks", () => {
    expect(sessions[0]?.date).toBe("2026-06-15");
    expect(sessions[4]?.date).toBe("2026-06-19"); // Fri of week 1
    expect(sessions[5]?.date).toBe("2026-06-22"); // Mon of week 2 (+7 from week 1 Mon)
    expect(sessions[sessions.length - 1]?.date).toBe(addDays("2026-06-15", 5 * 7 + 4));
    // strictly increasing
    for (let i = 1; i < sessions.length; i++) {
      expect(sessions[i]!.date > sessions[i - 1]!.date).toBe(true);
    }
  });

  it("ids are unique across the block", () => {
    const ids = sessions.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe("structural rails", () => {
    it("each session's first block is a warmup (rail 8)", () => {
      for (const s of sessions) {
        expect(s.blocks[0]?.type, `session ${s.id}`).toBe("warmup");
      }
    });

    it("each session opens with a 12–15 min temperature-raising warmup", () => {
      for (const s of sessions) {
        const w = s.blocks[0];
        expect(w?.type).toBe("warmup");
        if (w?.type === "warmup") {
          expect(w.durationMin).toBeGreaterThanOrEqual(12);
          expect(w.durationMin).toBeLessThanOrEqual(15);
        }
      }
    });

    it("each session ends with a meditation block (rail 11 — RED default)", () => {
      for (const s of sessions) {
        expect(s.blocks[s.blocks.length - 1]?.type, `session ${s.id}`).toBe("meditation");
      }
    });

    it("each session has a mobility block (rail 9)", () => {
      for (const s of sessions) {
        expect(
          s.blocks.some((b) => b.type === "mobility"),
          `session ${s.id}`,
        ).toBe(true);
      }
    });

    it("strict-skill/strength is placed first while fresh (rail 3)", () => {
      // The block right after the warmup is a strength or gymnastics block, never conditioning.
      for (const s of sessions) {
        const first = s.blocks[1];
        expect(["strength", "gymnastics"], `session ${s.id} first work block`).toContain(
          first?.type,
        );
      }
    });

    it("no two calendar-adjacent training days are both MetCon-heavy (rail 4)", () => {
      for (let i = 1; i < sessions.length; i++) {
        const prev = sessions[i - 1]!;
        const curr = sessions[i]!;
        // Only adjacent CALENDAR days can violate the rail; a weekend gap (Fri→Mon) resets it.
        const adjacent = addDays(prev.date, 1) === curr.date;
        if (!adjacent) continue;
        const bothHeavy = sessionIsMetconHeavy(prev) && sessionIsMetconHeavy(curr);
        expect(bothHeavy, `consecutive MetCon-heavy: ${prev.id} → ${curr.id}`).toBe(false);
      }
    });

    it("each meditation block carries a bell and optional breathing", () => {
      for (const s of sessions) {
        const med = s.blocks[s.blocks.length - 1];
        if (med?.type === "meditation") {
          expect(med.bell).toBeDefined();
          expect(med.breathing).toBeDefined();
        }
      }
    });

    it("every conditioning block carries a valid TimerConfig", () => {
      for (const s of sessions) {
        for (const b of s.blocks) {
          if (b.type === "conditioning") {
            expect(b.timer.type).toBeTruthy();
          }
        }
      }
    });

    it("every movement referenced in any session exists in the library", () => {
      for (const s of sessions) {
        for (const id of movementIdsInSession(s)) {
          expect(movementById[id], `session ${s.id} → unknown movement ${id}`).toBeDefined();
        }
      }
    });
  });
});

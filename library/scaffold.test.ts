import { describe, it, expect } from "vitest";

// Smoke test: confirms the Vitest + TS toolchain runs. Replaced by real suites
// as the data model and engine land.
describe("scaffold", () => {
  it("runs the test toolchain", () => {
    expect(1 + 1).toBe(2);
  });
});

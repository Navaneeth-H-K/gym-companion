import { describe, expect, it } from "vitest";
import { profileFor } from "@/lib/increments";
import { warmupCount, warmupLadder } from "@/lib/warmup";

const barbell = profileFor("barbell", "external");
const rack = profileFor("dumbbell", "external");

describe("warmupLadder", () => {
  it("builds a 3-rung ladder off the live working weight", () => {
    expect(warmupLadder(60, 3, barbell)).toEqual([
      { weightKg: 30, reps: 8 },
      { weightKg: 40, reps: 5 }, // 42 → nearest 5 = 40
      { weightKg: 50, reps: 3 }, // 51 → 50
    ]);
  });

  it("returns nothing without a working weight", () => {
    expect(warmupLadder(null, 3, barbell)).toEqual([]);
    expect(warmupLadder(0, 2, barbell)).toEqual([]);
  });

  it("drops rungs that land at or above the working weight", () => {
    // 25 kg working: 50% → 12.5 → clamped to bar (20), 75% → 18.75 → 20 = dup → collapse
    expect(warmupLadder(25, 2, barbell)).toEqual([{ weightKg: 20, reps: 8 }]);
  });

  it("collapses duplicate rungs on the dumbbell rack", () => {
    // 10 kg DB: 50% → 5, 70% → 7.5, 85% → 8.5 → nearest 7.5 = dup
    expect(warmupLadder(10, 3, rack)).toEqual([
      { weightKg: 5, reps: 8 },
      { weightKg: 7.5, reps: 5 },
    ]);
  });

  it("returns nothing for bodyweight", () => {
    expect(warmupLadder(60, 2, { kind: "none" })).toEqual([]);
  });

  it("clamps ladder count to 0..3", () => {
    expect(warmupLadder(60, 0, barbell)).toEqual([]);
    expect(warmupLadder(100, 5, barbell)).toHaveLength(3);
  });
});

describe("warmupCount", () => {
  it("uses max for the first lift of the day, min after", () => {
    expect(warmupCount({ min: 2, max: 3 }, true)).toBe(3);
    expect(warmupCount({ min: 2, max: 3 }, false)).toBe(2);
    expect(warmupCount({ min: 0, max: 1 }, false)).toBe(0);
  });
});

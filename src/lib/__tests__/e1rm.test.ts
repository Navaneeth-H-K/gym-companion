import { describe, expect, it } from "vitest";
import { detectPrs, epley, setVolumeKg, type PrHistorySet } from "@/lib/e1rm";

const working = (weightKg: number | null, reps: number): PrHistorySet => ({
  kind: "working",
  weightKg,
  reps,
});

describe("epley", () => {
  it("reps ≤ 1 return the weight", () => {
    expect(epley(100, 1)).toBe(100);
  });
  it("estimates and rounds to 0.1", () => {
    expect(epley(40, 8)).toBe(50.7); // 40 × (1 + 8/30)
  });
});

describe("detectPrs", () => {
  const history = [working(40, 8), working(40, 8), working(42.5, 6)];

  it("fires nothing on a first-ever set", () => {
    expect(detectPrs([], { weightKg: 40, reps: 8 })).toEqual([]);
  });

  it("detects e1RM PRs (strictly greater)", () => {
    const events = detectPrs(history, { weightKg: 42.5, reps: 8 });
    expect(events.some((e) => e.kind === "e1rm")).toBe(true);
    // matching the previous best exactly is not a PR
    const flat = detectPrs([working(40, 8)], { weightKg: 40, reps: 8 });
    expect(flat).toEqual([]);
  });

  it("excludes high-rep sets from e1RM but not from weight PRs", () => {
    const events = detectPrs(history, { weightKg: 45, reps: 15 });
    expect(events.some((e) => e.kind === "e1rm")).toBe(false);
    expect(events.some((e) => e.kind === "weight")).toBe(true);
  });

  it("detects reps-at-weight PRs at exact weights", () => {
    const events = detectPrs(history, { weightKg: 40, reps: 9 });
    expect(events).toContainEqual({ kind: "reps-at-weight", weightKg: 40, reps: 9, prev: 8 });
  });

  it("ignores warmups and bodyweight candidates", () => {
    const withWarmup: PrHistorySet[] = [{ kind: "warmup", weightKg: 60, reps: 5 }, working(40, 8)];
    const events = detectPrs(withWarmup, { weightKg: 50, reps: 5 });
    expect(events.some((e) => e.kind === "weight" && e.prev === 40)).toBe(true);
    expect(detectPrs(history, { weightKg: null, reps: 12 })).toEqual([]);
  });
});

describe("setVolumeKg", () => {
  it("honors the paired-dumbbell factor", () => {
    expect(setVolumeKg(20, 10, 2)).toBe(400);
    expect(setVolumeKg(60, 8, 1)).toBe(480);
  });
  it("bodyweight sets contribute no load volume", () => {
    expect(setVolumeKg(null, 15, 1)).toBe(0);
  });
});

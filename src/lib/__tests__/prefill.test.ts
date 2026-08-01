import { describe, expect, it } from "vitest";
import { lastSessionWorkingSets, lastTimeSummary, prefillFor, type HistorySet } from "@/lib/prefill";

const set = (
  sessionId: string,
  setIndex: number,
  weightKg: number | null,
  reps: number,
  ts: number,
  kind: "warmup" | "working" = "working",
  rpe: number | null = 8,
): HistorySet => ({ sessionId, setIndex, kind, weightKg, reps, rpe, ts });

describe("lastSessionWorkingSets", () => {
  it("picks only the most recent session's working sets, ordered", () => {
    const history = [
      set("a", 0, 40, 8, 100),
      set("a", 1, 40, 8, 200),
      set("b", 1, 42.5, 7, 1200),
      set("b", 0, 42.5, 8, 1100),
      set("b", 0, 20, 10, 1000, "warmup"),
    ];
    const last = lastSessionWorkingSets(history);
    expect(last.map((s) => [s.sessionId, s.setIndex])).toEqual([
      ["b", 0],
      ["b", 1],
    ]);
  });

  it("handles empty history", () => {
    expect(lastSessionWorkingSets([])).toEqual([]);
  });
});

describe("prefillFor", () => {
  const last = [set("b", 0, 42.5, 8, 1100), set("b", 1, 42.5, 7, 1200)];

  it("matches the same set index from last time (weight AND achieved reps)", () => {
    expect(prefillFor(1, last, 6)).toEqual({ weightKg: 42.5, reps: 7, fromLastTime: true });
  });

  it("falls back to the last logged set for new indexes", () => {
    expect(prefillFor(2, last, 6)).toEqual({ weightKg: 42.5, reps: 7, fromLastTime: true });
  });

  it("guided empty state on first-ever", () => {
    expect(prefillFor(0, [], 6)).toEqual({ weightKg: null, reps: 6, fromLastTime: false });
  });
});

describe("lastTimeSummary", () => {
  it("compacts a same-weight session", () => {
    const last = [
      set("b", 0, 40, 8, 1, "working", 8),
      set("b", 1, 40, 8, 2, "working", 8),
      set("b", 2, 40, 7, 3, "working", 9),
    ];
    expect(lastTimeSummary(last)).toBe("40 kg × 8, 8, 7 @ 9");
  });

  it("handles bodyweight and mixed weights", () => {
    expect(lastTimeSummary([set("b", 0, null, 12, 1, "working", null)])).toBe("BW × 12");
    expect(lastTimeSummary([set("b", 0, 40, 8, 1), set("b", 1, 35, 10, 2)])).toBe(
      "40×8, 35×10 @ 8",
    );
  });

  it("null for first-ever", () => {
    expect(lastTimeSummary([])).toBeNull();
  });
});

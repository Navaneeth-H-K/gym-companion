import { describe, expect, it } from "vitest";
import { shiftDateKey } from "@/lib/ist";
import { DAY_ORDER } from "@/lib/program";
import { computeStreak, type DoneDay } from "@/lib/streak";

/** Build DoneDays from day offsets relative to a Monday base. */
const BASE = "2026-08-03"; // Monday
const days = (...offsets: number[]): DoneDay[] =>
  offsets.map((o, i) => ({
    dateKey: shiftDateKey(BASE, o),
    dayKey: DAY_ORDER[i % 6],
  }));
const at = (offset: number) => shiftDateKey(BASE, offset);

describe("computeStreak — rolling 7-day window", () => {
  it("empty history", () => {
    const s = computeStreak([], at(0));
    expect(s.current).toBe(0);
    expect(s.freezeTokens).toBe(0);
  });

  it("one rest day per trailing 7 is free (the program's rest day)", () => {
    // Mon–Sat trained, Sun rest, Mon trained
    const s = computeStreak(days(0, 1, 2, 3, 4, 5, 7), at(7));
    expect(s.current).toBe(7);
    expect(s.best).toBe(7);
  });

  it("earns a freeze token per 6-trained-in-7 run, capped at 2", () => {
    // three perfect weeks: Mon–Sat trained, Sun rest, ×3
    const offsets = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19];
    const s = computeStreak(days(...offsets), at(20));
    expect(s.freezeTokens).toBe(2); // earned 3, capped at 2
    expect(s.current).toBe(18);
  });

  it("resting Wednesday instead of Sunday is not a miss", () => {
    // rest-Wednesday rhythm from the start: Mon, Tue, Thu, Fri, Sat, Sun
    const s = computeStreak(days(0, 1, 3, 4, 5, 6, 7, 8), at(8));
    expect(s.current).toBe(8);
    expect(s.freezeTokens).toBe(1); // 6-in-7 completed despite the Wednesday rest
  });

  it("second rest in a window spends a freeze and protects the day", () => {
    // perfect week earns a token, then rest Sun AND Mon
    const trained = [0, 1, 2, 3, 4, 5, /* 6+7 rest */ 8, 9, 10];
    const s = computeStreak(days(...trained), at(10));
    expect(s.frozenDates).toEqual([at(7)]); // Sunday was free, Monday cost the token
    expect(s.freezeTokens).toBe(0);
    expect(s.current).toBe(9); // streak survived
  });

  it("second rest with no token resets", () => {
    // only 2 trained days — no token earned — then two rests
    const s = computeStreak(days(0, 1, /* 2,3 rest */ 4), at(4));
    expect(s.current).toBe(1); // reset on day 3, rebuilt by day 4
    expect(s.best).toBe(2);
    expect(s.frozenDates).toEqual([]);
  });

  it("today incomplete is neutral", () => {
    const s = computeStreak(days(0), at(1));
    expect(s.current).toBe(1);
    expect(s.doneToday).toBe(false);
  });

  it("dedupes multiple sessions on one day", () => {
    const two: DoneDay[] = [
      { dateKey: at(0), dayKey: "push1" },
      { dateKey: at(0), dayKey: "pull1" },
    ];
    const s = computeStreak(two, at(0));
    expect(s.current).toBe(1);
    expect(s.doneToday).toBe(true);
  });

  it("tracks best across a reset", () => {
    // 4-day run, 3 rest days (reset), then 2-day run
    const s = computeStreak(days(0, 1, 2, 3, 7, 8), at(8));
    expect(s.best).toBe(4);
    expect(s.current).toBe(2);
  });

  it("accumulates the cycle ring and clears after all six", () => {
    const s = computeStreak(days(0, 1, 2, 3, 4, 5, 7), at(7));
    // 6 dayKeys completed → cleared → push1 (7th session) starts the next cycle
    expect(s.cycleDone).toEqual(["push1"]);
  });
});

import { describe, expect, it } from "vitest";
import { isRestDay, nextDayKey, todaysPlan } from "@/lib/schedule";

// 2026-08-03 is a Monday; 2026-08-02 and 2026-08-09 are Sundays.
const MON = "2026-08-03";
const TUE = "2026-08-04";
const SAT = "2026-08-08";
const SUN = "2026-08-09";

describe("isRestDay", () => {
  it("is true only on Sundays", () => {
    expect(isRestDay(SUN)).toBe(true);
    expect(isRestDay("2026-08-02")).toBe(true);
    expect(isRestDay(MON)).toBe(false);
    expect(isRestDay(SAT)).toBe(false);
  });
});

describe("nextDayKey", () => {
  it("cycles the six days", () => {
    expect(nextDayKey(null)).toBe("push1");
    expect(nextDayKey("push1")).toBe("pull1");
    expect(nextDayKey("legs2")).toBe("push1");
  });
});

describe("todaysPlan", () => {
  it("fresh install on a weekday starts at push1", () => {
    expect(todaysPlan([], MON)).toEqual({
      suggestion: "train",
      dayKey: "push1",
      doneToday: null,
    });
  });

  it("suggests the successor after a normal completion", () => {
    expect(todaysPlan([{ dateKey: MON, dayKey: "push1" }], TUE)).toEqual({
      suggestion: "train",
      dayKey: "pull1",
      doneToday: null,
    });
  });

  it("a missed day changes nothing — same successor, no penalty", () => {
    // last trained Monday (pull1), nothing Tue/Wed, now Thursday
    expect(todaysPlan([{ dateKey: MON, dayKey: "pull1" }], "2026-08-06")).toEqual({
      suggestion: "train",
      dayKey: "legs1",
      doneToday: null,
    });
  });

  it("suggests rest on Sunday, but still names the next session for Train anyway", () => {
    const plan = todaysPlan([{ dateKey: SAT, dayKey: "legs2" }], SUN);
    expect(plan).toEqual({ suggestion: "rest", dayKey: "push1", doneToday: null });
  });

  it("suggests rest on Sunday even when behind in the cycle", () => {
    const plan = todaysPlan([{ dateKey: SAT, dayKey: "pull1" }], SUN);
    expect(plan.suggestion).toBe("rest");
    expect(plan.dayKey).toBe("legs1"); // catch-up target if he trains anyway
  });

  it("does not suggest rest mid-week just because the cycle closed", () => {
    // finished legs2 on a Monday — Tuesday is a training day again
    expect(todaysPlan([{ dateKey: MON, dayKey: "legs2" }], TUE).suggestion).toBe("train");
  });

  it("reports a session already done today, Sunday included", () => {
    expect(todaysPlan([{ dateKey: SUN, dayKey: "pull1" }], SUN)).toEqual({
      suggestion: "done",
      dayKey: "legs1",
      doneToday: "pull1",
    });
  });

  it("two sessions in one day advance the cycle twice", () => {
    const plan = todaysPlan(
      [
        { dateKey: MON, dayKey: "push1" },
        { dateKey: MON, dayKey: "pull1" },
      ],
      MON,
    );
    expect(plan.doneToday).toBe("pull1");
    expect(plan.dayKey).toBe("legs1");
  });
});

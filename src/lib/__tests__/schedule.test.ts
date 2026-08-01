import { describe, expect, it } from "vitest";
import { nextDayKey, todaysPlan } from "@/lib/schedule";

describe("nextDayKey", () => {
  it("cycles the six days", () => {
    expect(nextDayKey(null)).toBe("push1");
    expect(nextDayKey("push1")).toBe("pull1");
    expect(nextDayKey("legs2")).toBe("push1");
  });
});

describe("todaysPlan (rolling cycle — weekday never matters)", () => {
  it("fresh install starts at push1", () => {
    expect(todaysPlan([], "2026-08-01")).toEqual({
      suggestion: "train",
      dayKey: "push1",
      doneToday: null,
    });
  });

  it("suggests the successor after a normal completion", () => {
    const plan = todaysPlan([{ dateKey: "2026-07-31", dayKey: "push1" }], "2026-08-01");
    expect(plan).toEqual({ suggestion: "train", dayKey: "pull1", doneToday: null });
  });

  it("a missed day changes nothing — same successor, no penalty", () => {
    const plan = todaysPlan([{ dateKey: "2026-07-29", dayKey: "pull1" }], "2026-08-01");
    expect(plan).toEqual({ suggestion: "train", dayKey: "legs1", doneToday: null });
  });

  it("suggests rest only the day right after legs2", () => {
    const history = [{ dateKey: "2026-07-31", dayKey: "legs2" as const }];
    expect(todaysPlan(history, "2026-08-01")).toEqual({
      suggestion: "rest",
      dayKey: "push1",
      doneToday: null,
    });
    // two days later the rest window has passed
    expect(todaysPlan(history, "2026-08-02")).toEqual({
      suggestion: "train",
      dayKey: "push1",
      doneToday: null,
    });
  });

  it("reports a session already done today (Sunday session included)", () => {
    // 2026-08-02 is a Sunday — sessions count the same as any day
    const plan = todaysPlan([{ dateKey: "2026-08-02", dayKey: "pull1" }], "2026-08-02");
    expect(plan).toEqual({ suggestion: "done", dayKey: "legs1", doneToday: "pull1" });
  });

  it("two sessions in one day advance the cycle twice", () => {
    const plan = todaysPlan(
      [
        { dateKey: "2026-08-01", dayKey: "push1" },
        { dateKey: "2026-08-01", dayKey: "pull1" },
      ],
      "2026-08-01",
    );
    expect(plan.doneToday).toBe("pull1");
    expect(plan.dayKey).toBe("legs1");
  });
});

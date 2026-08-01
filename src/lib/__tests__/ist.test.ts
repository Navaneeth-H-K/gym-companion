import { describe, expect, it } from "vitest";
import { diffDays, istDateKey, monthKeyOf, shiftDateKey, weekdayOf } from "@/lib/ist";

describe("ist", () => {
  it("assigns a UTC evening to the next IST day", () => {
    // 20:00 UTC = 01:30 IST the following day
    expect(istDateKey(new Date("2026-08-01T20:00:00Z"))).toBe("2026-08-02");
  });

  it("keeps an IST morning on the same day", () => {
    // 05:00 UTC = 10:30 IST
    expect(istDateKey(new Date("2026-08-01T05:00:00Z"))).toBe("2026-08-01");
  });

  it("shifts across month boundaries", () => {
    expect(shiftDateKey("2026-08-31", 1)).toBe("2026-09-01");
    expect(shiftDateKey("2026-09-01", -1)).toBe("2026-08-31");
  });

  it("computes whole-day differences", () => {
    expect(diffDays("2026-08-01", "2026-08-08")).toBe(7);
    expect(diffDays("2026-08-08", "2026-08-01")).toBe(-7);
    expect(diffDays("2026-08-01", "2026-08-01")).toBe(0);
  });

  it("knows weekdays (0 = Monday)", () => {
    expect(weekdayOf("2026-08-03")).toBe(0); // Monday
    expect(weekdayOf("2026-08-01")).toBe(5); // Saturday
    expect(weekdayOf("2026-08-02")).toBe(6); // Sunday
  });

  it("buckets months", () => {
    expect(monthKeyOf("2026-08-31")).toBe("2026-08");
  });
});

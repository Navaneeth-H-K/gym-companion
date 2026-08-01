import { describe, expect, it } from "vitest";
import { DEFAULT_INCREMENTS, nextDown, nextUp, profileFor, roundTo } from "@/lib/increments";

const barbell = profileFor("barbell", "external");
const rack = profileFor("dumbbell", "external");
const cable = profileFor("cable", "external");

describe("profiles", () => {
  it("maps equipment to profiles", () => {
    expect(barbell).toEqual({ kind: "step", stepKg: 5, minKg: 20 });
    expect(cable).toEqual({ kind: "step", stepKg: 2.5, minKg: 2.5 });
    expect(rack).toEqual({ kind: "rack", sizesKg: DEFAULT_INCREMENTS.dumbbellRackKg });
  });

  it("load type overrides equipment", () => {
    expect(profileFor("bodyweight", "bodyweight")).toEqual({ kind: "none" });
    expect(profileFor("bodyweight", "assisted").kind).toBe("step");
  });
});

describe("roundTo", () => {
  it("snaps to steps in all modes", () => {
    expect(roundTo(47.3, barbell, "nearest")).toBe(45);
    expect(roundTo(47.6, barbell, "up")).toBe(50);
    expect(roundTo(49.9, barbell, "down")).toBe(45);
  });

  it("clamps to the profile minimum", () => {
    expect(roundTo(12, barbell, "down")).toBe(20); // can't go below the bar
  });

  it("snaps to the dumbbell rack", () => {
    expect(roundTo(13.4, rack, "nearest")).toBe(12.5);
    expect(roundTo(13.4, rack, "up")).toBe(15);
    expect(roundTo(13.4, rack, "down")).toBe(12.5);
  });

  it("clamps to rack edges", () => {
    expect(roundTo(1, rack, "down")).toBe(2.5);
    expect(roundTo(99, rack, "up")).toBe(35);
  });
});

describe("nextUp / nextDown", () => {
  it("steps up", () => {
    expect(nextUp(40, barbell)).toBe(45);
    expect(nextUp(12.5, rack)).toBe(15);
  });

  it("returns null at the top of the rack", () => {
    expect(nextUp(35, rack)).toBeNull();
  });

  it("steps down and nulls below minimum", () => {
    expect(nextDown(25, barbell)).toBe(20);
    expect(nextDown(20, barbell)).toBeNull();
    expect(nextDown(2.5, rack)).toBeNull();
  });
});

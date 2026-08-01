import { describe, expect, it } from "vitest";
import { resolveExercise } from "@/lib/stations";

describe("resolveExercise precedence: swap > override > house > identity", () => {
  it("as-written exercises resolve to themselves with their station", () => {
    const r = resolveExercise("machine-chest-press");
    expect(r.performAs).toBe("machine-chest-press");
    expect(r.source).toBe("as-written");
    expect(r.station?.id).toBe("f1-chest-press");
    expect(r.houseNote).toBeUndefined();
  });

  it("house defaults redirect gym-impossible exercises", () => {
    const r = resolveExercise("pec-deck");
    expect(r.performAs).toBe("cable-fly");
    expect(r.source).toBe("house");
    expect(r.station?.id).toBe("f1-functional-trainer");
    expect(r.houseNote).toBeTruthy();
  });

  it("user override beats the house default", () => {
    const r = resolveExercise("glute-ham-raise", { performAs: "nordic-ham-curl" });
    expect(r.performAs).toBe("nordic-ham-curl");
    expect(r.source).toBe("override");
    expect(r.station?.id).toBe("f2-db-area");
  });

  it("session swap beats everything", () => {
    const r = resolveExercise("glute-ham-raise", { performAs: "nordic-ham-curl" }, "seated-leg-curl");
    expect(r.performAs).toBe("seated-leg-curl");
    expect(r.source).toBe("swap");
    expect(r.station?.id).toBe("f2-leg-curl");
  });

  it("station-only override keeps the resolved exercise", () => {
    const r = resolveExercise("bench-press", { stationId: "f1-bench-press" });
    expect(r.performAs).toBe("bench-press");
    expect(r.station?.id).toBe("f1-bench-press");
  });

  it("unknown stations resolve to null (UI shows 'location unknown')", () => {
    const r = resolveExercise("chest-supported-t-bar-row", { performAs: "chest-supported-t-bar-row" });
    expect(r.performAs).toBe("chest-supported-t-bar-row");
    expect(r.station).toBeNull();
  });
});

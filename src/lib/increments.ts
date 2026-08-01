/**
 * Weight rounding profiles — what loads physically exist at this gym.
 * Barbell math assumes 2.5 kg plate pairs (5 kg steps) from a 20 kg bar;
 * dumbbells snap to the rack's actual sizes.
 */
import type { Equipment, LoadType } from "./exercises";

export type IncrementProfile =
  | { kind: "step"; stepKg: number; minKg: number }
  | { kind: "rack"; sizesKg: number[] }
  | { kind: "none" }; // pure bodyweight — no load to round

export type IncrementSettings = {
  dumbbellRackKg: number[];
  barbellStepKg: number;
  machineStepKg: number;
  cableStepKg: number;
};

export const DEFAULT_INCREMENTS: IncrementSettings = {
  dumbbellRackKg: [2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35],
  barbellStepKg: 5,
  machineStepKg: 5,
  cableStepKg: 2.5,
};

export function profileFor(
  equipment: Equipment,
  loadType: LoadType,
  s: IncrementSettings = DEFAULT_INCREMENTS,
): IncrementProfile {
  if (loadType === "bodyweight") return { kind: "none" };
  if (loadType === "bodyweight-plus") return { kind: "step", stepKg: 2.5, minKg: 0 };
  if (loadType === "assisted") return { kind: "step", stepKg: 2.5, minKg: -60 };
  switch (equipment) {
    case "barbell":
      return { kind: "step", stepKg: s.barbellStepKg, minKg: 20 };
    case "ez-bar":
      return { kind: "step", stepKg: 2.5, minKg: 7.5 };
    case "smith":
      return { kind: "step", stepKg: s.machineStepKg, minKg: 10 };
    case "machine":
      return { kind: "step", stepKg: s.machineStepKg, minKg: 5 };
    case "cable":
      return { kind: "step", stepKg: s.cableStepKg, minKg: 2.5 };
    case "dumbbell":
      return { kind: "rack", sizesKg: s.dumbbellRackKg };
    case "bodyweight":
      return { kind: "none" };
  }
}

export function roundTo(
  kg: number,
  p: IncrementProfile,
  mode: "nearest" | "down" | "up" = "nearest",
): number {
  if (p.kind === "none") return kg;
  if (p.kind === "step") {
    const fn = mode === "down" ? Math.floor : mode === "up" ? Math.ceil : Math.round;
    const snapped = fn(kg / p.stepKg) * p.stepKg;
    return Math.max(p.minKg, round1(snapped));
  }
  const sizes = p.sizesKg;
  if (sizes.length === 0) return kg;
  if (mode === "down") {
    const below = sizes.filter((s) => s <= kg);
    return below.length ? below[below.length - 1] : sizes[0];
  }
  if (mode === "up") {
    const above = sizes.find((s) => s >= kg);
    return above ?? sizes[sizes.length - 1];
  }
  let bestSize = sizes[0];
  for (const s of sizes) if (Math.abs(s - kg) < Math.abs(bestSize - kg)) bestSize = s;
  return bestSize;
}

/** The next load up from kg, or null when the rack tops out. */
export function nextUp(kg: number, p: IncrementProfile): number | null {
  if (p.kind === "none") return null;
  if (p.kind === "step") return round1(Math.max(p.minKg, kg) + p.stepKg);
  const above = p.sizesKg.find((s) => s > kg + 1e-9);
  return above ?? null;
}

/** One step down (floored at the profile minimum / rack bottom). */
export function nextDown(kg: number, p: IncrementProfile): number | null {
  if (p.kind === "none") return null;
  if (p.kind === "step") {
    const v = round1(kg - p.stepKg);
    return v < p.minKg ? null : v;
  }
  const below = [...p.sizesKg].reverse().find((s) => s < kg - 1e-9);
  return below ?? null;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

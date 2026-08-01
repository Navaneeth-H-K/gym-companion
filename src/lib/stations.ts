/**
 * The gym itself: two floors, ~16 stations, mapped from a photo inventory.
 * `howToFind` is required — text wayfinding beats a missing photo. Photos
 * land in /public/stations/{id}.jpg as they get taken; null renders the
 * placeholder tile with a "photo pending" chip.
 *
 * HOUSE_DEFAULTS = how a program exercise is ACTUALLY performed here when
 * the written exercise doesn't exist (no pec deck, no GHD, no calf
 * machines, no T-bar). User overrides (Dexie `overrides` table) win over
 * these; session swaps win over everything.
 */
import type { ExerciseId } from "./exercises";

export type Station = {
  id: string;
  floor: 1 | 2;
  area: string;
  name: string;
  photo: string | null; // "/stations/{id}.jpg"
  howToFind: string;
};

const station = (
  id: string,
  floor: 1 | 2,
  area: string,
  name: string,
  howToFind: string,
  hasPhoto = false,
): Station => ({ id, floor, area, name, photo: hasPhoto ? `/stations/${id}.jpg` : null, howToFind });

export const STATIONS: Record<string, Station> = Object.fromEntries(
  [
    /* Floor 1 — newer Co-Fit machines, BH cardio, the cable rig */
    station("f1-chest-press", 1, "machine row", "Seated chest press", "Machine row along the wall past the cardio corner — black Co-Fit unit"),
    station("f1-lat-pulldown", 1, "machine row", "Lat pulldown (Co-Fit)", "Tall black tower in the machine row, wide bar hanging from the top pulley"),
    station("f1-functional-trainer", 1, "cable rig", "Functional trainer (dual cable)", "The big black rig center-back with the pull-up bar bridging the top — all cable work happens here"),
    station("f1-smith", 1, "free-weight corner", "Smith machine (Co-Fit)", "Back area near the red machine, guided bar with yellow branding"),
    station("f1-red-machine", 1, "free-weight corner", "Red leverage machine — ID pending", "The red plate-loaded machine on the right side; looks like a hack squat / leverage press. Confirm with a photo"),
    station("f1-bench-press", 1, "free-weight corner", "Olympic flat bench", "Gray uprights with the barbell, right side past the benches"),
    station("f1-db-area", 1, "open floor", "Dumbbells + adjustable benches", "Hex dumbbells are, realistically, everywhere on the floor; adjustable benches mid-room"),

    /* Floor 2 — Impulse free-weights room + maroon machine row + STEX cardio */
    station("f2-flat-bench", 2, "free-weights room", "Olympic flat bench (Impulse)", "Gray Impulse uprights, center of the free-weights room"),
    station("f2-incline-bench", 2, "free-weights room", "Olympic incline bench (Impulse)", "Right of the flat bench, ladder-style catches, next to the wooden bottle cubby"),
    station("f2-squat-stands", 2, "free-weights room", "Squat stands / wall rack", "Gray J-hooks against the wall — no safety catches, keep it dumpable"),
    station("f2-free-weights", 2, "free-weights room", "Bars + plates floor", "Barbells, EZ bars and plates along the mirror wall"),
    station("f2-preacher-bench", 2, "free-weights room", "Preacher curl bench", "Near the mirror, the seat with the angled arm pad — EZ bar lives nearby"),
    station("f2-power-tower", 2, "free-weights room", "Power tower (pull-up / dip / knee raise)", "Tall black frame, back-left — pull-up handles up top, forearm pads for leg raises"),
    station("f2-ab-bench", 2, "free-weights room", "Decline / ab bench", "Curved black bench, center of the room"),
    station("f2-db-area", 2, "free-weights room", "Dumbbells + benches", "Hex dumbbells along the mirror; flat and adjustable benches center"),
    station("f2-leg-extension", 2, "machine room", "Leg extension", "Maroon-seat machine row — rollers at shin height, gray shroud"),
    station("f2-leg-curl", 2, "machine room", "Seated leg curl", "Maroon-seat row, beside the leg extension"),
  ].map((s) => [s.id, s]),
);

/**
 * Where each exercise happens by default. Exercises missing here have no
 * confirmed station at this gym (the UI shows "location unknown — set it
 * in Plan" if one is ever performed as written).
 */
export const STATION_FOR: Partial<Record<ExerciseId, string>> = {
  /* push */
  "machine-chest-press": "f1-chest-press",
  "bench-press": "f2-flat-bench",
  "flat-db-press": "f1-db-area",
  "db-shoulder-press-seated": "f1-db-area",
  "db-shoulder-press-standing": "f1-db-area",
  "overhead-barbell-press": "f2-squat-stands",
  "barbell-upright-row": "f2-free-weights",
  "dumbbell-fly": "f1-db-area",
  "cable-fly": "f1-functional-trainer",
  "push-up": "f1-db-area",
  "db-lateral-raise": "f1-db-area",
  "cable-lateral-raise": "f1-functional-trainer",
  "ez-skullcrusher": "f1-db-area",
  "db-skullcrusher": "f1-db-area",
  "overhead-triceps-extension": "f1-db-area",
  "triceps-pressdown": "f1-functional-trainer",
  "triceps-kickback-cable": "f1-functional-trainer",
  dip: "f2-power-tower",
  /* pull */
  "pendlay-row": "f2-free-weights",
  "dumbbell-row": "f2-db-area",
  "barbell-row": "f2-free-weights",
  "lat-pulldown": "f1-lat-pulldown",
  "pull-up": "f2-power-tower",
  "chin-up": "f2-power-tower",
  "rope-facepull": "f1-functional-trainer",
  "reverse-cable-fly": "f1-functional-trainer",
  "cable-lat-pullover": "f1-functional-trainer",
  "db-lat-pullover": "f2-db-area",
  "cable-lat-pull-in": "f1-functional-trainer",
  "preacher-curl": "f2-preacher-bench",
  "ez-biceps-curl": "f2-free-weights",
  "db-biceps-curl": "f2-db-area",
  "standing-barbell-curl": "f2-free-weights",
  "hammer-curl": "f2-db-area",
  "incline-db-curl": "f2-db-area",
  "bayesian-cable-curl": "f1-functional-trainer",
  "barbell-shrug": "f2-free-weights",
  "db-shrug": "f2-db-area",
  /* legs */
  "romanian-deadlift": "f2-free-weights",
  deadlift: "f2-free-weights",
  "hip-thrust": "f2-flat-bench",
  "leg-press": "f1-red-machine",
  "barbell-front-squat": "f2-squat-stands",
  "barbell-back-squat": "f2-squat-stands",
  "goblet-squat": "f2-db-area",
  "db-lunge": "f2-db-area",
  "seated-leg-curl": "f2-leg-curl",
  "nordic-ham-curl": "f2-db-area",
  "leg-extension": "f2-leg-extension",
  "good-morning": "f2-squat-stands",
  "db-seated-calf-raise": "f2-db-area",
  "db-standing-calf-raise": "f2-db-area",
  "smith-calf-raise": "f1-smith",
  /* abs */
  "cable-crunch": "f1-functional-trainer",
  "decline-situp-weighted": "f2-ab-bench",
  "hanging-leg-raise": "f2-power-tower",
  "roman-chair-leg-raise": "f2-power-tower",
  "bent-knee-leg-raise": "f2-power-tower",
};

export type HouseVersion = {
  performAs: ExerciseId;
  stationId?: string;
  note: string;
};

/** Program exercises this gym can't host as written → what to do instead. */
export const HOUSE_DEFAULTS: Partial<Record<ExerciseId, HouseVersion>> = {
  "pec-deck": {
    performAs: "cable-fly",
    note: "No pec deck confirmed — cable flys on the functional trainer cover it (arguably better).",
  },
  "reverse-pec-deck": {
    performAs: "reverse-cable-fly",
    note: "No reverse pec deck confirmed — reverse cable flys on the crossover.",
  },
  "chest-supported-t-bar-row": {
    performAs: "pendlay-row",
    note: "No T-bar at this gym — Pendlay rows off the floor.",
  },
  "glute-ham-raise": {
    performAs: "seated-leg-curl",
    note: "No GHD anywhere — seated leg curls (or Nordic curls with a partner).",
  },
  "back-extension-45": {
    performAs: "good-morning",
    note: "No hyperextension bench spotted — Good Mornings, start light.",
  },
  "seated-calf-raise": {
    performAs: "db-seated-calf-raise",
    note: "No calf machines on either floor — bench + plate under toes + DBs on knees.",
  },
  "standing-calf-raise": {
    performAs: "db-standing-calf-raise",
    note: "No calf machines — DBs at your sides, toes on a plate (Smith machine works too).",
  },
  "machine-lateral-raise": {
    performAs: "cable-lateral-raise",
    note: "Lateral raise machine unconfirmed — cables give the same constant tension.",
  },
  "lying-leg-curl": {
    performAs: "seated-leg-curl",
    note: "Only the seated curl exists here.",
  },
  "leg-press-calf-press": {
    performAs: "db-standing-calf-raise",
    note: "Leg press machine ID still pending — DB calf raises until confirmed.",
  },
  "trap-bar-shrug": {
    performAs: "barbell-shrug",
    note: "No trap bar — straight bar shrugs.",
  },
};

export type OverrideLike = {
  performAs?: ExerciseId | null;
  stationId?: string | null;
};

export type ResolvedExercise = {
  /** What actually gets performed (and logged under). */
  performAs: ExerciseId;
  station: Station | null;
  /** Present when a house default redirected the program exercise. */
  houseNote?: string;
  /** "swap" | "override" | "house" | "as-written" — for UI chips. */
  source: "swap" | "override" | "house" | "as-written";
};

/** Resolution: sessionSwap ?? user override ?? house default ?? identity. */
export function resolveExercise(
  programExerciseId: ExerciseId,
  override?: OverrideLike | null,
  sessionSwap?: ExerciseId | null,
): ResolvedExercise {
  const house = HOUSE_DEFAULTS[programExerciseId];

  let performAs: ExerciseId;
  let source: ResolvedExercise["source"];
  if (sessionSwap) {
    performAs = sessionSwap;
    source = "swap";
  } else if (override?.performAs) {
    performAs = override.performAs;
    source = "override";
  } else if (house) {
    performAs = house.performAs;
    source = "house";
  } else {
    performAs = programExerciseId;
    source = "as-written";
  }

  const stationId =
    (source !== "swap" ? override?.stationId : null) ??
    (source === "house" ? house?.stationId : null) ??
    STATION_FOR[performAs] ??
    null;

  return {
    performAs,
    station: stationId ? (STATIONS[stationId] ?? null) : null,
    houseNote: source === "house" ? house?.note : undefined,
    source,
  };
}

export function floorLabel(station: Station | null): string {
  return station ? `F${station.floor}` : "?";
}

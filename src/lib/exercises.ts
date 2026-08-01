/**
 * Exercise catalog — every program main plus every substitution option.
 * Prescription data lives in program.ts; this file is the per-exercise
 * dossier: equipment (drives increment profiles), load type (drives the
 * logging UI), muscles, cues. `cues`/`setup` are optional seed content —
 * the detail sheet lets the user edit and accrete them over time.
 */

export type Equipment =
  | "barbell"
  | "ez-bar"
  | "dumbbell"
  | "machine"
  | "cable"
  | "smith"
  | "bodyweight";

export type LoadType =
  | "external" // weight is the load (stepper shown)
  | "bodyweight" // no external load (stepper hidden, "BW × reps")
  | "bodyweight-plus" // bodyweight, optionally add load (stepper optional, ≥0)
  | "assisted"; // bodyweight, optionally assisted (weight ≤ 0 = assistance)

export type Muscle =
  | "chest"
  | "front-delts"
  | "side-delts"
  | "rear-delts"
  | "lats"
  | "upper-back"
  | "traps"
  | "biceps"
  | "triceps"
  | "forearms"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "abs"
  | "lower-back";

export type ExerciseInfo = {
  name: string;
  equipment: Equipment;
  loadType: LoadType;
  /** Multiply weight×reps by this for volume (2 = a pair of dumbbells worked simultaneously). */
  volumeFactor: 1 | 2;
  /** Stack numbers on some machines aren't kilograms — label honestly. */
  unitLabel?: "kg" | "plate";
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  cues?: string[];
  setup?: string;
};

const CATALOG = {
  /* ---------------------------------------------------------------- push */
  "machine-chest-press": {
    name: "Machine Chest Press",
    equipment: "machine",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-delts", "triceps"],
    cues: ["Handles at mid-chest height", "Squeeze the chest to press, don't just push the arms", "Slow negative, no bouncing off the stack"],
  },
  "bench-press": {
    name: "Bench Press",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-delts", "triceps"],
    cues: ["Feet planted, slight arch, shoulder blades pinched", "Bar touches lower chest, press up and slightly back", "Ask for a spot near failure"],
  },
  "flat-db-press": {
    name: "Flat Dumbbell Press",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 2,
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-delts", "triceps"],
    cues: ["Kick the DBs up with your knees to start", "Elbows ~45° from torso, not flared", "Press up and slightly in"],
  },
  "db-shoulder-press-seated": {
    name: "DB Shoulder Press (Seated)",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 2,
    primaryMuscles: ["front-delts"],
    secondaryMuscles: ["side-delts", "triceps"],
    cues: ["Bench upright, feet planted", "Start at ear height, press to lockout without clanking", "Don't let the DBs drift forward"],
    setup: "Adjustable bench, most upright notch",
  },
  "db-shoulder-press-standing": {
    name: "DB Shoulder Press (Standing)",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 2,
    primaryMuscles: ["front-delts"],
    secondaryMuscles: ["side-delts", "abs"],
    cues: ["Squeeze glutes to protect the lower back", "No leg drive — that's a push press"],
  },
  "overhead-barbell-press": {
    name: "Overhead Barbell Press",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["front-delts"],
    secondaryMuscles: ["side-delts", "triceps"],
    cues: ["Bar at collarbone, elbows slightly forward", "Head through at lockout", "Brace like someone's about to poke your stomach"],
  },
  "barbell-upright-row": {
    name: "Barbell Upright Row",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["side-delts"],
    secondaryMuscles: ["traps", "biceps"],
    cues: ["Wide-ish grip, pull to lower chest, elbows lead", "Stop if shoulders pinch"],
  },
  "pec-deck": {
    name: "Pec Deck",
    equipment: "machine",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-delts"],
    cues: ["Elbows slightly bent and fixed", "Squeeze 1s at the front"],
  },
  "dumbbell-fly": {
    name: "Dumbbell Fly",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 2,
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-delts"],
    cues: ["Big arc, slight elbow bend held constant", "Stretch at the bottom, don't go past comfort", "Lighter than you think"],
  },
  "cable-fly": {
    name: "Cable Fly",
    equipment: "cable",
    loadType: "external",
    volumeFactor: 2,
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-delts"],
    cues: ["Pulleys at shoulder height, step forward into a split stance", "Hug-a-tree arc, squeeze at the midline"],
    setup: "Both pulleys at shoulder height",
  },
  "push-up": {
    name: "Push-Up",
    equipment: "bodyweight",
    loadType: "bodyweight",
    volumeFactor: 1,
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-delts", "triceps", "abs"],
    cues: ["Body one straight line", "Chest to the floor, full lockout"],
  },
  "db-lateral-raise": {
    name: "DB Lateral Raise",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 2,
    primaryMuscles: ["side-delts"],
    secondaryMuscles: ["traps"],
    cues: ["Lead with the elbows, pinkies slightly up", "Raise to shoulder height, no higher", "No swinging — drop weight before form"],
  },
  "cable-lateral-raise": {
    name: "Cable Lateral Raise",
    equipment: "cable",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["side-delts"],
    secondaryMuscles: ["traps"],
    cues: ["Pulley at the bottom, cable behind your body", "One arm at a time — constant tension beats heavy"],
    setup: "Low pulley, single D-handle",
  },
  "machine-lateral-raise": {
    name: "Machine Lateral Raise",
    equipment: "machine",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["side-delts"],
    secondaryMuscles: ["traps"],
  },
  "ez-skullcrusher": {
    name: "EZ-Bar Skullcrusher",
    equipment: "ez-bar",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    cues: ["Lower to forehead or just behind", "Elbows stay pointed at the ceiling", "Upper arms don't move"],
  },
  "db-skullcrusher": {
    name: "DB Skullcrusher",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 2,
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    cues: ["Palms facing each other", "Lower beside the ears"],
  },
  "overhead-triceps-extension": {
    name: "Overhead Triceps Extension",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    cues: ["One DB, both hands under the top plate", "Elbows close to the head", "Full stretch behind the neck"],
  },
  "triceps-pressdown": {
    name: "Triceps Pressdown",
    equipment: "cable",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    cues: ["Elbows pinned to your sides", "Full lockout, controlled return"],
    setup: "High pulley, straight bar or rope",
  },
  "triceps-kickback-cable": {
    name: "Triceps Kickback (Cable)",
    equipment: "cable",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    cues: ["Torso parallel to the floor, upper arm locked", "Squeeze hard at full extension"],
    setup: "Low pulley, single handle or no attachment",
  },
  dip: {
    name: "Dip",
    equipment: "bodyweight",
    loadType: "bodyweight-plus",
    volumeFactor: 1,
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front-delts"],
    cues: ["Lean forward for chest, upright for triceps", "Shoulder-depth or slightly below"],
  },

  /* ---------------------------------------------------------------- pull */
  "chest-supported-t-bar-row": {
    name: "Chest-Supported T-Bar Row",
    equipment: "machine",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["upper-back"],
    secondaryMuscles: ["lats", "biceps"],
  },
  "pendlay-row": {
    name: "Pendlay Row",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["upper-back"],
    secondaryMuscles: ["lats", "biceps", "lower-back"],
    cues: ["Bar starts dead on the floor every rep", "Torso parallel, pull to lower chest", "No torso heave — strict off the floor"],
  },
  "dumbbell-row": {
    name: "Dumbbell Row",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["lats"],
    secondaryMuscles: ["upper-back", "biceps"],
    cues: ["Knee and hand on a bench, flat back", "Pull to the hip, not the shoulder", "Do both sides — reps are per arm"],
  },
  "barbell-row": {
    name: "Barbell Row",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["upper-back"],
    secondaryMuscles: ["lats", "biceps", "lower-back"],
    cues: ["Hinge to ~45°, bar to belly button", "Squeeze the blades together at the top"],
  },
  "lat-pulldown": {
    name: "Lat Pulldown",
    equipment: "machine",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "upper-back"],
    cues: ["Grip just outside shoulders", "Pull to the collarbone, elbows down and back", "Control the stretch at the top"],
    setup: "Thigh pads snug",
  },
  "pull-up": {
    name: "Pull-Up",
    equipment: "bodyweight",
    loadType: "assisted",
    volumeFactor: 1,
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "upper-back"],
    cues: ["Dead hang to chin over bar", "Band or partner assist is fine — log the assistance", "Kill the swing"],
  },
  "chin-up": {
    name: "Chin-Up",
    equipment: "bodyweight",
    loadType: "assisted",
    volumeFactor: 1,
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps"],
    cues: ["Underhand, shoulder-width", "Chest to the bar, not chin to knuckles"],
  },
  "rope-facepull": {
    name: "Rope Facepull",
    equipment: "cable",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["rear-delts"],
    secondaryMuscles: ["traps", "upper-back"],
    cues: ["Pulley at face height", "Pull the rope apart, thumbs to your ears", "External rotation at the end — like a double biceps pose"],
    setup: "Rope attachment, face height",
  },
  "reverse-pec-deck": {
    name: "Reverse Pec Deck",
    equipment: "machine",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["rear-delts"],
    secondaryMuscles: ["upper-back"],
  },
  "reverse-cable-fly": {
    name: "Reverse Cable Fly",
    equipment: "cable",
    loadType: "external",
    volumeFactor: 2,
    primaryMuscles: ["rear-delts"],
    secondaryMuscles: ["upper-back"],
    cues: ["Cross the cables, pull apart at shoulder height", "Arms nearly straight, tiny weight"],
    setup: "Both pulleys at shoulder height, no handles — grip the balls",
  },
  "cable-lat-pullover": {
    name: "Cable Lat Pullover",
    equipment: "cable",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["lats"],
    secondaryMuscles: ["chest", "triceps"],
    cues: ["High pulley, hinge slightly, arms near-straight", "Sweep down to your thighs, feel the lats stretch up top"],
    setup: "High pulley, straight bar or rope",
  },
  "db-lat-pullover": {
    name: "DB Lat Pullover",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["lats"],
    secondaryMuscles: ["chest"],
    cues: ["Upper back across a flat bench, hips low", "Big stretch behind the head, pull over with the lats"],
  },
  "cable-lat-pull-in": {
    name: "Cable Lat Pull-In",
    equipment: "cable",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["lats"],
    secondaryMuscles: [],
    cues: ["Kneel side-on to a high pulley, one arm", "Drive the elbow into your hip pocket"],
    setup: "High pulley, single D-handle",
  },
  "preacher-curl": {
    name: "Preacher Curl",
    equipment: "ez-bar",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    cues: ["Armpits snug over the pad", "Full stretch at the bottom — that's the point of the bench", "No bounce out of the hole"],
  },
  "ez-biceps-curl": {
    name: "EZ-Bar Biceps Curl",
    equipment: "ez-bar",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    cues: ["Elbows pinned at your sides", "Control down for 2s — the negative builds the arm"],
  },
  "db-biceps-curl": {
    name: "DB Biceps Curl",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 2,
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    cues: ["Supinate as you curl — pinky up at the top", "No shoulder swing"],
  },
  "standing-barbell-curl": {
    name: "Standing Barbell Curl",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
  },
  "hammer-curl": {
    name: "Hammer Curl",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 2,
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    cues: ["Neutral grip the whole way", "Across the body or straight up — pick one and keep it"],
  },
  "incline-db-curl": {
    name: "Incline DB Curl",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 2,
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    cues: ["Bench ~45°, arms hanging straight down", "Huge stretch — go lighter than standing curls"],
    setup: "Adjustable bench at ~45°",
  },
  "bayesian-cable-curl": {
    name: "Bayesian Cable Curl",
    equipment: "cable",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    cues: ["Low pulley behind you, step forward", "Arm slightly behind your body — curl from the stretch", "One arm at a time"],
    setup: "Low pulley, single D-handle, face away",
  },
  "barbell-shrug": {
    name: "Barbell Shrug",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["traps"],
    secondaryMuscles: ["forearms"],
    cues: ["Straight up to your ears, 1s hold", "No rolling, no arm bend"],
  },
  "db-shrug": {
    name: "DB Shrug",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 2,
    primaryMuscles: ["traps"],
    secondaryMuscles: ["forearms"],
  },
  "trap-bar-shrug": {
    name: "Trap Bar Shrug",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["traps"],
    secondaryMuscles: ["forearms"],
  },

  /* ---------------------------------------------------------------- legs */
  "romanian-deadlift": {
    name: "Romanian Deadlift",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: ["glutes", "lower-back"],
    cues: ["Push the hips back, soft knees, bar glued to the legs", "Stop where the hamstrings scream (mid-shin-ish)", "Flat back the entire time — RPE 6-7 here is deliberate"],
  },
  deadlift: {
    name: "Deadlift",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: ["glutes", "lower-back", "traps"],
    cues: ["Bar over mid-foot, brace hard, push the floor away", "Lockout is hips through, not lean back"],
  },
  "hip-thrust": {
    name: "Hip Thrust",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings"],
    cues: ["Upper back on a bench, bar over hips (pad it)", "Chin tucked, ribs down, full squeeze at the top"],
  },
  "leg-press": {
    name: "Leg Press",
    equipment: "machine",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["quads"],
    secondaryMuscles: ["glutes"],
    cues: ["Feet mid-platform, shoulder width", "Down until thighs touch torso — never let the lower back roll off the pad", "Don't lock the knees hard"],
  },
  "barbell-front-squat": {
    name: "Barbell Front Squat",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["quads"],
    secondaryMuscles: ["glutes", "abs"],
    cues: ["Elbows high, bar on the shoulders not the wrists", "Sit straight down between the heels"],
  },
  "barbell-back-squat": {
    name: "Barbell Back Squat",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["quads"],
    secondaryMuscles: ["glutes", "hamstrings"],
    cues: ["No safety catches at this gym — keep weights you could dump forward", "Brace before every rep, break at hips and knees together"],
  },
  "goblet-squat": {
    name: "Goblet Squat",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["quads"],
    secondaryMuscles: ["glutes", "abs"],
    cues: ["DB held at the chest like a goblet", "Elbows slide inside the knees at the bottom"],
  },
  "db-lunge": {
    name: "DB Lunge",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 2,
    primaryMuscles: ["quads"],
    secondaryMuscles: ["glutes", "hamstrings"],
    cues: ["Long step, torso tall", "Back knee kisses the floor", "Reps are per leg"],
  },
  "glute-ham-raise": {
    name: "Glute Ham Raise",
    equipment: "bodyweight",
    loadType: "bodyweight-plus",
    volumeFactor: 1,
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: ["glutes"],
  },
  "lying-leg-curl": {
    name: "Lying Leg Curl",
    equipment: "machine",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: [],
  },
  "seated-leg-curl": {
    name: "Seated Leg Curl",
    equipment: "machine",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: [],
    cues: ["Thigh pad locked down snug", "Full squeeze under the seat, slow return"],
    setup: "Note your seat + pad pins here after first session",
  },
  "nordic-ham-curl": {
    name: "Nordic Ham Curl",
    equipment: "bodyweight",
    loadType: "bodyweight",
    volumeFactor: 1,
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: [],
    cues: ["Partner holds your ankles (or hook them under something solid)", "Fight the fall as long as possible, push back up"],
  },
  "leg-extension": {
    name: "Leg Extension",
    equipment: "machine",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["quads"],
    secondaryMuscles: [],
    cues: ["Knee lines up with the machine's pivot", "1s squeeze at the top, 2s down"],
    setup: "Note your seat + pad pins here after first session",
  },
  "back-extension-45": {
    name: "45° Back Extension",
    equipment: "bodyweight",
    loadType: "bodyweight-plus",
    volumeFactor: 1,
    primaryMuscles: ["lower-back"],
    secondaryMuscles: ["glutes", "hamstrings"],
  },
  "good-morning": {
    name: "Good Morning",
    equipment: "barbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: ["lower-back", "glutes"],
    cues: ["Bar on the back like a squat, soft knees", "Hinge until the torso is ~45°, hamstrings loaded", "Start embarrassingly light"],
  },
  "seated-calf-raise": {
    name: "Seated Calf Raise",
    equipment: "machine",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
  },
  "standing-calf-raise": {
    name: "Standing Calf Raise",
    equipment: "machine",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
  },
  "leg-press-calf-press": {
    name: "Leg Press Calf Press",
    equipment: "machine",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
  },
  "db-seated-calf-raise": {
    name: "DB Seated Calf Raise",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    cues: ["Sit on a bench, plate under your toes, DBs on the knees", "Pause 1s at the top and the stretch"],
  },
  "db-standing-calf-raise": {
    name: "DB Standing Calf Raise",
    equipment: "dumbbell",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    cues: ["Toes on a plate edge, DBs at your sides", "Full stretch at the bottom, tall pause at the top", "Slow — bouncing is the ankle, not the calf"],
  },
  "smith-calf-raise": {
    name: "Smith Machine Calf Raise",
    equipment: "smith",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    cues: ["Plate under the toes, bar across the shoulders", "Pause at both ends of the rep"],
  },

  /* ----------------------------------------------------------------- abs */
  "cable-crunch": {
    name: "Cable Crunch",
    equipment: "cable",
    loadType: "external",
    volumeFactor: 1,
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
    cues: ["Kneel below a high pulley, rope beside the ears", "Crunch the ribs to the hips — the hips don't move", "It's a curl of the spine, not a bow"],
    setup: "High pulley, rope attachment",
  },
  "decline-situp-weighted": {
    name: "Plate-Weighted Decline Sit-Up",
    equipment: "bodyweight",
    loadType: "bodyweight-plus",
    volumeFactor: 1,
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
    cues: ["Hug a plate to your chest", "Curl up one vertebra at a time"],
  },
  "hanging-leg-raise": {
    name: "Hanging Leg Raise",
    equipment: "bodyweight",
    loadType: "bodyweight",
    volumeFactor: 1,
    primaryMuscles: ["abs"],
    secondaryMuscles: ["forearms"],
    cues: ["Dead hang, no swing between reps", "Curl the pelvis up — toes toward the bar"],
  },
  "roman-chair-leg-raise": {
    name: "Roman Chair Leg Raise",
    equipment: "bodyweight",
    loadType: "bodyweight",
    volumeFactor: 1,
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
    cues: ["Forearms on the pads, back against the rest", "Knees to chest with a posterior tilt — don't just swing the legs", "Slow down, the burn is the point"],
  },
  "bent-knee-leg-raise": {
    name: "Bent-Knee Leg Raise",
    equipment: "bodyweight",
    loadType: "bodyweight",
    volumeFactor: 1,
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
  },
} as const satisfies Record<string, ExerciseInfo>;

export type ExerciseId = keyof typeof CATALOG;

/** Widened view — optional fields (cues/setup/unitLabel) stay accessible. */
export const EXERCISES: Record<ExerciseId, ExerciseInfo> = CATALOG;

export function exercise(id: ExerciseId): ExerciseInfo {
  return EXERCISES[id];
}

/** Human muscle labels for chips. */
export const MUSCLE_LABELS: Record<Muscle, string> = {
  chest: "Chest",
  "front-delts": "Front delts",
  "side-delts": "Side delts",
  "rear-delts": "Rear delts",
  lats: "Lats",
  "upper-back": "Upper back",
  traps: "Traps",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  abs: "Abs",
  "lower-back": "Lower back",
};

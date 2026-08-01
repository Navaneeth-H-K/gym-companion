/**
 * RPE explainer copy — rendered by the RPE popover the first time the
 * user touches an RPE control, and on demand from any "RPE" label.
 */

export type RpeValue = 6 | 6.5 | 7 | 7.5 | 8 | 8.5 | 9 | 9.5 | 10;

export const RPE_VALUES: readonly RpeValue[] = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

/** Reps-in-reserve description per whole step (halves read "between"). */
export const RPE_SCALE: Record<6 | 7 | 8 | 9 | 10, string> = {
  6: "you had 4 more reps in you",
  7: "3 more reps in you",
  8: "2 more reps in you",
  9: "1 more rep in you",
  10: "nothing left — barely finished",
};

export const RPE_FOOTNOTE =
  "Between two? Log the lower one. Early sets should feel easier than the last.";

/** Tailwind token suffix for a given RPE (e.g. 8.5 → "rpe-85"). */
export function rpeToken(rpe: RpeValue): string {
  return `rpe-${String(rpe).replace(".", "")}`;
}

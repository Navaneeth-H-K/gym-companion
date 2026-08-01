/**
 * Day math anchored to Asia/Kolkata (IST), never the device timezone.
 * Streaks, "today", heatmaps, and month buckets all key off IST date
 * strings — Date objects never cross engine boundaries.
 */

const IST = "Asia/Kolkata";
const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: IST,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** ISO date string (YYYY-MM-DD) for the given instant, in IST. */
export function istDateKey(d: Date = new Date()): string {
  return fmt.format(d); // en-CA yields YYYY-MM-DD
}

/** Today's IST date as YYYY-MM-DD. */
export const istToday = (): string => istDateKey();

/** IST date string N days before/after a given IST date string. */
export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const ms = Date.parse(dateKey + "T00:00:00+05:30") + deltaDays * 86_400_000;
  return istDateKey(new Date(ms));
}

/** Whole-day difference b − a (both IST date keys). */
export function diffDays(a: string, b: string): number {
  const ams = Date.parse(a + "T00:00:00+05:30");
  const bms = Date.parse(b + "T00:00:00+05:30");
  return Math.round((bms - ams) / 86_400_000);
}

/** 0 = Monday … 6 = Sunday, for an IST date key. */
export function weekdayOf(dateKey: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  // Date.getUTCDay on an IST-midnight instant shifted to UTC is fragile;
  // parse as IST-noon to dodge DST-free but offset-sensitive edges.
  const d = new Date(Date.parse(dateKey + "T12:00:00+05:30"));
  const js = new Intl.DateTimeFormat("en-US", { timeZone: IST, weekday: "short" }).format(d);
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
  return order.indexOf(js as (typeof order)[number]) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/** "YYYY-MM" month bucket for a date key. */
export function monthKeyOf(dateKey: string): string {
  return dateKey.slice(0, 7);
}

/** Short human date ("Tue, Aug 4") for an IST date key. */
export function humanDate(dateKey: string): string {
  const d = new Date(Date.parse(dateKey + "T12:00:00+05:30"));
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

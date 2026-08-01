"use client";

import { Check, Snowflake } from "lucide-react";
import { shiftDateKey, weekdayOf } from "@/lib/ist";
import { cn } from "@/lib/utils";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

/** Trailing 7 days, today rightmost. Missed days are faint, never red. */
export function WeekStrip({
  trainedDates,
  frozenDates,
  todayKey,
}: {
  trainedDates: Set<string>;
  frozenDates: Set<string>;
  todayKey: string;
}) {
  const days = Array.from({ length: 7 }, (_, i) => shiftDateKey(todayKey, i - 6));

  return (
    <div className="flex justify-between px-2">
      {days.map((dateKey) => {
        const trained = trainedDates.has(dateKey);
        const frozen = frozenDates.has(dateKey);
        const isToday = dateKey === todayKey;
        return (
          <div key={dateKey} className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                trained && "bg-accent",
                frozen && !trained && "bg-accent-2-dim",
                !trained && !frozen && isToday && "border-2 border-accent",
                !trained && !frozen && !isToday && "border border-line",
              )}
            >
              {trained ? (
                <Check size="1rem" className="text-accent-ink" strokeWidth={3} />
              ) : frozen ? (
                <Snowflake size="0.875rem" className="text-accent-2" />
              ) : (
                <span className={cn("text-[0.6875rem] font-medium", isToday ? "text-accent" : "text-fg-faint")}>
                  {DAY_LETTERS[weekdayOf(dateKey)]}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

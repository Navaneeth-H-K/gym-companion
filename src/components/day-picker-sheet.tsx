"use client";

import { Check } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { DAY_ORDER, PROGRAM, workingSetCount, type DayKey } from "@/lib/program";
import { cn } from "@/lib/utils";
import { Sheet } from "./sheet";

/** "Not this one?" — pick any day of the cycle to train. */
export function DayPickerSheet({
  open,
  onClose,
  cycleDone,
  suggested,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  cycleDone: DayKey[];
  suggested: DayKey;
  onPick: (dayKey: DayKey) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Pick a session">
      <div className="flex flex-col gap-2">
        {DAY_ORDER.map((dayKey, i) => {
          const day = PROGRAM[dayKey];
          const done = cycleDone.includes(dayKey);
          const isSuggested = dayKey === suggested;
          return (
            <button
              key={dayKey}
              onClick={() => {
                haptic("select");
                onPick(dayKey);
              }}
              className={cn(
                "flex h-16 items-center gap-3 rounded-[16px] bg-bg-2 px-4 text-left",
                isSuggested && "border border-accent/40",
              )}
            >
              <span className="overline-label w-7 text-fg-faint tnum">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1">
                <span className="block text-[15px] font-semibold">{day.title}</span>
                <span className="block text-[13px] leading-[18px] text-fg-muted">
                  {day.slots.length} exercises · {workingSetCount(day)} working sets
                </span>
              </span>
              {isSuggested && !done && (
                <span className="overline-label rounded-[8px] bg-accent-dim px-2 py-1 text-accent">next</span>
              )}
              {done && <Check size={18} className="text-accent" />}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[13px] leading-[18px] text-fg-faint">
        The cycle just continues from whatever you pick — nothing is ever marked missed.
      </p>
    </Sheet>
  );
}

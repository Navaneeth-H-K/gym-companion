"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CircleHelp } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { RPE_FOOTNOTE, RPE_SCALE, RPE_VALUES, type RpeValue } from "@/lib/rpe";
import { cn } from "@/lib/utils";
import { Sheet } from "./sheet";

function rpeColor(v: RpeValue): string {
  return `var(--color-rpe-${String(v).replace(".", "")})`;
}

function Chip({
  v,
  selected,
  onSelect,
}: {
  v: RpeValue;
  selected: boolean;
  onSelect: (v: RpeValue) => void;
}) {
  const c = rpeColor(v);
  return (
    <motion.button
      whileTap={{ scale: 1.06 }}
      transition={{ duration: 0.09 }}
      onClick={() => {
        haptic("select");
        onSelect(v);
      }}
      className={cn("tnum h-11 min-w-[52px] shrink-0 rounded-[12px] border text-[15px] font-semibold")}
      style={
        selected
          ? { background: c, borderColor: c, color: "var(--color-accent-ink)" }
          : { borderColor: c, color: c, background: `color-mix(in oklab, ${c} 10%, transparent)` }
      }
    >
      {v}
    </motion.button>
  );
}

/**
 * RPE control. Non-last sets: 3 quick chips around the target (the Log
 * button already defaults to target — chips are the override). Last set:
 * the full half-step ramp, scrollable, where the progression cap lives.
 */
export function RpeQuick({
  target,
  isLastSet,
  value,
  onChange,
}: {
  target: RpeValue;
  isLastSet: boolean;
  value: RpeValue;
  onChange: (v: RpeValue) => void;
}) {
  const [helpOpen, setHelpOpen] = useState(false);

  const quick: RpeValue[] = isLastSet
    ? RPE_VALUES.slice()
    : ([target - 1, target, target + 1].filter(
        (v) => v >= 6 && v <= 10,
      ) as RpeValue[]);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setHelpOpen(true)}
        className="flex w-[74px] shrink-0 items-center gap-1 text-left"
        aria-label="What is RPE?"
      >
        <span className="overline-label text-fg-faint">RPE</span>
        <CircleHelp size={14} className="text-fg-faint" />
      </button>
      <div className={cn("flex flex-1 gap-2", isLastSet && "no-scrollbar overflow-x-auto")}>
        {quick.map((v) => (
          <Chip key={v} v={v} selected={value === v} onSelect={onChange} />
        ))}
      </div>

      <Sheet open={helpOpen} onClose={() => setHelpOpen(false)} title="RPE — how hard did it feel?">
        <div className="flex flex-col gap-3">
          {([6, 7, 8, 9, 10] as const).map((v) => (
            <div key={v} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: rpeColor(v) }} />
              <span className="tnum w-14 text-[15px] font-semibold">RPE {v}</span>
              <span className="text-[15px] leading-[22px] text-fg-muted">{RPE_SCALE[v]}</span>
            </div>
          ))}
          <p className="mt-1 text-[13px] leading-[18px] text-fg-faint">{RPE_FOOTNOTE}</p>
        </div>
      </Sheet>
    </div>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";
import { Flame, Snowflake } from "lucide-react";
import { dur, easeOutExpo } from "@/lib/motion";
import { DAY_ORDER, type DayKey } from "@/lib/program";
import { cn } from "@/lib/utils";

/* Geometry is expressed in viewBox units; the rendered size is rem, so the
   ring scales with the phone alongside everything else. */
const SIZE = 220;
const SIZE_REM = `${SIZE / 16}rem`;
const R = 102;
const STROKE = 16;
const ARC = 42; // degrees per segment
const GAP = 18;

function polar(deg: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: SIZE / 2 + R * Math.cos(rad), y: SIZE / 2 + R * Math.sin(rad) };
}

function arcPath(startDeg: number, endDeg: number): string {
  const s = polar(startDeg);
  const e = polar(endDeg);
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 0 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

/**
 * The weekly ring — 6 segments, one per session of the current cycle
 * (cycle position, not calendar week). Done segments draw with the
 * accent gradient; the next segment idles with a soft pulse.
 */
export function Ring({
  cycleDone,
  streak,
  freezeTokens,
  doneToday,
}: {
  cycleDone: DayKey[];
  streak: number;
  freezeTokens: number;
  doneToday: boolean;
}) {
  const reduced = useReducedMotion();
  const nextIdx = DAY_ORDER.findIndex((d) => !cycleDone.includes(d));

  return (
    <div className="relative mx-auto" style={{ width: SIZE_REM, height: SIZE_REM }}>
      <svg className="h-full w-full" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-accent-2)" />
          </linearGradient>
        </defs>
        {DAY_ORDER.map((dayKey, i) => {
          const start = i * (ARC + GAP) + GAP / 2;
          const d = arcPath(start, start + ARC);
          const done = cycleDone.includes(dayKey);
          const isNext = i === nextIdx && !doneToday;
          return (
            <g key={dayKey}>
              {/* track */}
              {isNext && !reduced ? (
                <motion.path
                  d={d}
                  fill="none"
                  stroke="var(--color-line)"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: [0.83, 0, 0.17, 1] }}
                />
              ) : (
                <path
                  d={d}
                  fill="none"
                  stroke="var(--color-line)"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  opacity={isNext ? 1 : 0.9}
                />
              )}
              {/* filled segment */}
              {done && (
                <motion.path
                  d={d}
                  fill="none"
                  stroke="url(#ring-grad)"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: dur.grand, ease: easeOutExpo, delay: i * 0.09 }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* center */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
        <Flame size="1.25rem" className="text-accent" />
        <div className="font-display text-[2.75rem] font-semibold leading-[3rem] tracking-tight tnum">
          {streak}
        </div>
        <div className="overline-label text-fg-faint">day streak</div>
        <div className="mt-1 flex gap-1.5">
          {[0, 1].map((i) => (
            <Snowflake
              key={i}
              size="1rem"
              className={cn(i < freezeTokens ? "text-accent-2" : "text-line-strong")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

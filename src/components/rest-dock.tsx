"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SkipForward } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { springSheet } from "@/lib/motion";
import { formatClock, formatOverdue, progress } from "@/lib/resttimer";
import { cn } from "@/lib/utils";
import { Sheet } from "./sheet";
import type { RestTimerState } from "./use-rest-timer";

/* viewBox units; rendered at a rem size so it scales with the phone. */
const RING = 44;
const RING_REM = `${RING / 16}rem`;
const RING_R = 19;
const CIRC = 2 * Math.PI * RING_R;

/**
 * Persistent bottom dock while resting. It participates in layout (the
 * page pads for it) rather than covering the Log button; `skip` is
 * disabled for 300ms after spring-in to absorb the just-tapped thumb.
 */
export function RestDock({
  state,
  nextLabel,
  onSkip,
  onExtend,
}: {
  state: RestTimerState;
  nextLabel: string;
  onSkip: () => void;
  onExtend: (sec: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { timer, remainingMs, overdueMs, cameBackLate } = state;
  const done = timer != null && remainingMs === 0;

  const endsAtLabel = timer
    ? new Date(timer.endsAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      })
    : "";

  return (
    <>
      <AnimatePresence>
        {timer && (
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0, transition: springSheet }}
            exit={{ y: "110%", transition: { duration: 0.24 } }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md rounded-t-[1.75rem] border-t border-line bg-bg-3 safe-bottom",
              done && "bg-accent-2-dim",
            )}
          >
            <button className="flex h-[4.75rem] w-full items-center gap-3 px-5" onClick={() => setExpanded(true)}>
              {/* depleting ring */}
              <svg
                style={{ width: RING_REM, height: RING_REM }}
                viewBox={`0 0 ${RING} ${RING}`}
                className="shrink-0 -rotate-90"
              >
                <circle cx={RING / 2} cy={RING / 2} r={RING_R} fill="none" stroke="var(--color-line)" strokeWidth="4" />
                <circle
                  cx={RING / 2}
                  cy={RING / 2}
                  r={RING_R}
                  fill="none"
                  stroke="var(--color-accent-2)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={timer ? CIRC * progress(timer, timer.endsAt - remainingMs) : 0}
                />
              </svg>

              <div className="flex-1 text-left">
                {done ? (
                  <>
                    <div className="tnum text-[1.75rem] font-medium leading-8 text-accent-2">GO</div>
                    <div className="text-[0.8125rem] leading-[1.125rem] text-fg-muted">
                      {cameBackLate ? `Rest over — ${formatOverdue(overdueMs)}` : nextLabel}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="tnum text-[1.75rem] font-medium leading-8">{formatClock(remainingMs)}</div>
                    <div className="text-[0.8125rem] leading-[1.125rem] text-fg-muted">rest · {nextLabel}</div>
                  </>
                )}
              </div>

              <span
                role="button"
                className="tnum flex h-14 w-[4.5rem] items-center justify-center rounded-[0.75rem] border border-line-strong bg-bg-2 text-[0.9375rem] font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  haptic("select");
                  onExtend(30);
                }}
              >
                +30s
              </span>
              <SkipControl onSkip={onSkip} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={expanded && !!timer} onClose={() => setExpanded(false)}>
        <div className="flex flex-col items-center gap-2 pb-2 pt-4">
          <div className="tnum text-[4.5rem] font-medium leading-[4.75rem]">
            {done ? "GO" : formatClock(remainingMs)}
          </div>
          <div className="text-[0.8125rem] text-fg-muted">
            {done ? nextLabel : `ends ${endsAtLabel} · ${nextLabel}`}
          </div>
          <div className="mt-4 flex w-full gap-2">
            <button
              className="tnum h-14 flex-1 rounded-[1rem] bg-bg-2 text-[0.9375rem] font-semibold"
              onClick={() => onExtend(-30)}
            >
              −30s
            </button>
            <button
              className="tnum h-14 flex-1 rounded-[1rem] bg-bg-2 text-[0.9375rem] font-semibold"
              onClick={() => onExtend(30)}
            >
              +30s
            </button>
            <button
              className="h-14 flex-1 rounded-[1rem] bg-bg-2 text-[0.9375rem] font-semibold text-fg-muted"
              onClick={() => {
                setExpanded(false);
                onSkip();
              }}
            >
              skip
            </button>
          </div>
        </div>
      </Sheet>
    </>
  );
}

/** Skip is armed 300ms after mount — it appears where the thumb just was. */
function SkipControl({ onSkip }: { onSkip: () => void }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setArmed(true), 300);
    return () => clearTimeout(t);
  }, []);
  return (
    <span
      role="button"
      aria-disabled={!armed}
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-[0.75rem] text-fg-muted",
        !armed && "opacity-40",
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (!armed) return;
        haptic("select");
        onSkip();
      }}
    >
      <SkipForward size="1.25rem" />
    </span>
  );
}

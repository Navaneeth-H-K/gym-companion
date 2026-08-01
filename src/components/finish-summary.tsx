"use client";

import { useEffect, useState } from "react";
import { animate, motion } from "motion/react";
import { Flame, Trophy } from "lucide-react";
import type { PrEvent } from "@/lib/e1rm";
import { haptic } from "@/lib/haptics";
import { dur, easeOutExpo, fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Confetti } from "./confetti";

export type PrRecord = { setId: string; name: string; event: PrEvent };

function prLabel(r: PrRecord): string {
  switch (r.event.kind) {
    case "e1rm":
      return `${r.name} — e1RM ${r.event.value} kg ▲ +${Math.round((r.event.value - r.event.prev) * 10) / 10}`;
    case "weight":
      return `${r.name} — heaviest ever, ${r.event.weightKg} kg`;
    case "reps-at-weight":
      return `${r.name} — ${r.event.reps} reps @ ${r.event.weightKg} kg`;
  }
}

/** Fullscreen session-complete takeover: stats stagger in, volume counts
 *  up, streak pops, PRs land with confetti. */
export function FinishSummary({
  dayTitle,
  durationMs,
  workingSets,
  totalWorkingTarget,
  volumeKg,
  prs,
  streakCurrent,
  onDone,
}: {
  dayTitle: string;
  durationMs: number;
  workingSets: number;
  totalWorkingTarget: number;
  volumeKg: number;
  prs: PrRecord[];
  streakCurrent: number;
  onDone: () => void;
}) {
  const [displayVolume, setDisplayVolume] = useState(0);
  const [burst, setBurst] = useState(0);
  const [origin, setOrigin] = useState({ x: 200, y: 300 });

  useEffect(() => {
    haptic("finish");
    const controls = animate(0, volumeKg, {
      duration: 0.8,
      ease: easeOutExpo,
      delay: 0.4,
      onUpdate: (v) => setDisplayVolume(Math.round(v)),
    });
    return () => controls.stop();
  }, [volumeKg]);

  useEffect(() => {
    if (prs.length === 0) return;
    const t = setTimeout(() => {
      setOrigin({ x: window.innerWidth / 2, y: window.innerHeight * 0.4 });
      setBurst((b) => b + 1);
      haptic("pr");
    }, 1400);
    return () => clearTimeout(t);
  }, [prs.length]);

  const minutes = Math.max(1, Math.round(durationMs / 60000));

  return (
    <motion.div
      initial={{ y: "8%", opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { duration: 0.38, ease: easeOutExpo } }}
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-md flex-col overflow-y-auto bg-bg px-5 safe-top"
    >
      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-1 flex-col pt-10">
        <motion.span variants={fadeUp} className="overline-label text-accent">
          session complete
        </motion.span>
        <motion.h1 variants={fadeUp} className="mt-1 font-display text-[1.875rem] font-semibold leading-[2.125rem]">
          {dayTitle} banked
        </motion.h1>

        <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center">
          <span className="tnum font-display text-[2.75rem] font-semibold leading-[3rem]">
            {displayVolume.toLocaleString("en-IN")} kg
          </span>
          <span className="overline-label mt-1 text-fg-faint">total volume moved</span>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8 grid grid-cols-3 gap-3">
          {[
            { label: "duration", value: `${minutes}m` },
            { label: "sets", value: `${workingSets}/${totalWorkingTarget}` },
            {
              label: "streak",
              value: (
                <span className="flex items-center justify-center gap-1">
                  <Flame size="1.125rem" className="text-accent" />
                  <motion.span
                    key={streakCurrent}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, scale: [1, 1.18, 1] }}
                    transition={{ duration: 0.32, delay: 1.1, ease: easeOutExpo }}
                    className="inline-block"
                  >
                    {streakCurrent}
                  </motion.span>
                </span>
              ),
            },
          ].map((s) => (
            <div key={s.label} className="rounded-[1.25rem] bg-bg-1 p-4 text-center">
              <div className="tnum text-[1.375rem] font-medium leading-7">{s.value}</div>
              <div className="overline-label mt-1 text-fg-faint">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {prs.length > 0 && (
          <motion.div variants={fadeUp} className="mt-6 flex flex-col gap-2">
            {prs.map((r, i) => (
              <motion.div
                key={`${r.setId}-${i}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 + i * 0.08, duration: dur.gentle, ease: easeOutExpo }}
                className="flex items-center gap-3 rounded-[1rem] bg-bg-1 px-4 py-3"
              >
                <Trophy size="1rem" className="shrink-0 text-gold" />
                <span className="tnum text-[0.9375rem] font-semibold">{prLabel(r)}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <div className={cn("sticky bottom-0 bg-bg py-4 safe-bottom")}>
        <button
          onClick={onDone}
          className="h-14 w-full rounded-[1rem] bg-accent text-[1rem] font-semibold text-accent-ink"
        >
          Done
        </button>
      </div>

      <Confetti burstKey={burst} origin={origin} />
    </motion.div>
  );
}

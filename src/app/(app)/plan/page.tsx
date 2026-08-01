"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "motion/react";
import { ChevronRight, Moon } from "lucide-react";
import { istToday } from "@/lib/ist";
import { fadeUp, stagger } from "@/lib/motion";
import { DAY_ORDER, PROGRAM, workingSetCount } from "@/lib/program";
import { todaysPlan } from "@/lib/schedule";
import { doneDays } from "@/lib/selectors";

export default function PlanPage() {
  const days = useLiveQuery(doneDays, []);
  const plan = useMemo(() => todaysPlan(days ?? [], istToday()), [days]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 pt-4 safe-top">
      <motion.h1 variants={fadeUp} className="font-display text-[30px] font-semibold leading-[34px]">
        Plan
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-1 text-[13px] text-fg-muted">
        Push/Pull/Legs × 2 · six sessions Mon–Sat, Sunday off
      </motion.p>

      <motion.div variants={fadeUp} className="mt-5 flex flex-col gap-3">
        {DAY_ORDER.map((dayKey, i) => {
          const day = PROGRAM[dayKey];
          const isNext = plan.dayKey === dayKey && plan.suggestion !== "rest";
          return (
            <Link
              key={dayKey}
              href={`/plan/${dayKey}`}
              className="flex h-[76px] items-center gap-3 rounded-[20px] bg-bg-1 px-4"
            >
              <span className="tnum flex h-8 w-8 items-center justify-center rounded-[8px] bg-bg-2 text-[13px] font-medium text-fg-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-semibold">{day.title}</span>
                  {isNext && (
                    <span className="overline-label shrink-0 rounded-[8px] bg-accent-dim px-1.5 py-0.5 text-accent">
                      next
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-fg-muted">
                  {day.focusLabel}
                </span>
                <span className="tnum block text-[11px] text-fg-faint">
                  {day.slots.length} exercises · {workingSetCount(day)} sets · {day.estMinutes.min}–
                  {day.estMinutes.max} min
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-fg-faint" />
            </Link>
          );
        })}

        <div className="flex h-12 items-center gap-3 px-4">
          <Moon size={16} className="text-fg-faint" />
          <span className="text-[13px] text-fg-faint">
            Sunday — rest. Shift it to another day and the streak won&apos;t mind.
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

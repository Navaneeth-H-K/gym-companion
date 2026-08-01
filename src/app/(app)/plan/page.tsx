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
      <motion.h1 variants={fadeUp} className="font-display text-[1.875rem] font-semibold leading-[2.125rem]">
        Plan
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-1 text-[0.8125rem] text-fg-muted">
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
              className="flex h-[4.75rem] items-center gap-3 rounded-[1.25rem] bg-bg-1 px-4"
            >
              <span className="tnum flex h-8 w-8 items-center justify-center rounded-[0.5rem] bg-bg-2 text-[0.8125rem] font-medium text-fg-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[0.9375rem] font-semibold">{day.title}</span>
                  {isNext && (
                    <span className="overline-label shrink-0 rounded-[0.5rem] bg-accent-dim px-1.5 py-0.5 text-accent">
                      next
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-[0.8125rem] text-fg-muted">
                  {day.focusLabel}
                </span>
                <span className="tnum block text-[0.6875rem] text-fg-faint">
                  {day.slots.length} exercises · {workingSetCount(day)} sets · {day.estMinutes.min}–
                  {day.estMinutes.max} min
                </span>
              </span>
              <ChevronRight size="1.125rem" className="shrink-0 text-fg-faint" />
            </Link>
          );
        })}

        <div className="flex h-12 items-center gap-3 px-4">
          <Moon size="1rem" className="text-fg-faint" />
          <span className="text-[0.8125rem] text-fg-faint">
            Sunday — rest. Shift it to another day and the streak won&apos;t mind.
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

/** Long-press auto-repeat: 400ms → 160ms → 80ms → 50ms floor. */
function useAutoRepeat(step: () => void) {
  const timer = useRef<number | null>(null);
  const count = useRef(0);

  const fire = () => {
    step();
    haptic("tick");
  };
  const loop = () => {
    fire();
    count.current += 1;
    const delay = count.current > 18 ? 50 : count.current > 6 ? 80 : 160;
    timer.current = window.setTimeout(loop, delay);
  };
  const start = () => {
    fire();
    count.current = 0;
    timer.current = window.setTimeout(loop, 400);
  };
  const stop = () => {
    if (timer.current != null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  return { start, stop };
}

/**
 * Big-thumb numeric stepper with long-press acceleration and tap-to-type
 * inline entry. `format` renders the display value; `parse` validates
 * typed input (return null to reject → shake + error haptic).
 */
export function Stepper({
  label,
  value,
  display,
  onDecrement,
  onIncrement,
  onDirectEntry,
  inputMode = "decimal",
  disabled = false,
}: {
  label: string;
  value: string;
  display?: React.ReactNode;
  onDecrement: () => void;
  onIncrement: () => void;
  onDirectEntry: (raw: string) => boolean;
  inputMode?: "decimal" | "numeric";
  disabled?: boolean;
}) {
  const dec = useAutoRepeat(onDecrement);
  const inc = useAutoRepeat(onIncrement);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [shake, setShake] = useState(0);

  const commit = () => {
    setEditing(false);
    if (draft.trim() === "") return;
    const ok = onDirectEntry(draft.trim().replace(",", "."));
    if (!ok) {
      haptic("error");
      setShake((s) => s + 1);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="overline-label w-[74px] shrink-0 text-fg-faint">{label}</span>
      <button
        aria-label={`Decrease ${label}`}
        disabled={disabled}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] bg-bg-3 disabled:opacity-30"
        onPointerDown={disabled ? undefined : dec.start}
        onPointerUp={dec.stop}
        onPointerLeave={dec.stop}
        onPointerCancel={dec.stop}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Minus size={20} />
      </button>

      <div key={shake} className={cn("flex h-14 flex-1 items-center justify-center", shake > 0 && "animate-shake")}>
        {editing ? (
          <input
            autoFocus
            inputMode={inputMode}
            defaultValue={value}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            onFocus={(e) => e.target.select()}
            className="tnum w-full bg-transparent text-center text-[32px] font-medium leading-9 text-fg outline-none"
          />
        ) : (
          <button
            className="w-full text-center"
            onClick={() => {
              if (disabled) return;
              setDraft(value);
              setEditing(true);
            }}
          >
            <motion.span
              key={value}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.09 }}
              className="tnum inline-block text-[32px] font-medium leading-9"
            >
              {display ?? value}
            </motion.span>
          </button>
        )}
      </div>

      <button
        aria-label={`Increase ${label}`}
        disabled={disabled}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] bg-bg-3 disabled:opacity-30"
        onPointerDown={disabled ? undefined : inc.start}
        onPointerUp={inc.stop}
        onPointerLeave={inc.stop}
        onPointerCancel={inc.stop}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Plus size={20} />
      </button>
    </div>
  );
}

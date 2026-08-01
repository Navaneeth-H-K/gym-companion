"use client";

import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { chime, haptic } from "@/lib/haptics";
import { clearRest } from "@/lib/repo";
import { restTimer } from "@/lib/selectors";
import type { ActiveTimer } from "@/lib/db";

export type RestTimerState = {
  timer: ActiveTimer | null;
  remainingMs: number;
  overdueMs: number;
  /** True while showing the post-expiry "rest over N ago" recovery state. */
  cameBackLate: boolean;
};

/**
 * Rest timer driver. Truth = persisted endsAt; a 250ms tick recomputes
 * remaining and a precise setTimeout fires the cue exactly on time. A
 * hidden page can't vibrate — returning past endsAt fires the cue
 * immediately and shows "rest over" instead of pretending nothing
 * happened. Live expiries auto-dismiss the dock after 1.4s.
 */
export function useRestTimer(): RestTimerState {
  const timer = useLiveQuery(restTimer, []);
  const [nowTick, setNowTick] = useState(0);
  const firedFor = useRef<number | null>(null);
  const lastTickSecond = useRef<number>(-1);
  const [cameBackLate, setCameBackLate] = useState(false);

  const endsAt = timer?.endsAt;

  useEffect(() => {
    if (endsAt == null) return;
    const tick = () => setNowTick(Date.now());
    const iv = setInterval(tick, 250);
    const exact = setTimeout(tick, Math.max(0, endsAt - Date.now()) + 20);
    tick();
    return () => {
      clearInterval(iv);
      clearTimeout(exact);
    };
  }, [endsAt]);

  // Cue: fires exactly once per endsAt, only while visible.
  useEffect(() => {
    if (endsAt == null) return;
    const check = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();

      // final-3s ticks
      const remaining = endsAt - now;
      if (remaining > 0 && remaining <= 3000) {
        const second = Math.ceil(remaining / 1000);
        if (lastTickSecond.current !== second) {
          lastTickSecond.current = second;
          haptic("restTick");
        }
      }

      if (now >= endsAt && firedFor.current !== endsAt) {
        firedFor.current = endsAt;
        haptic("restOver");
        chime();
        const overdue = now - endsAt;
        if (overdue < 2000) {
          // live expiry — flash GO, then dismiss
          setCameBackLate(false);
          setTimeout(() => void clearRest(), 1400);
        } else {
          // expired while hidden — persist the recovery state
          setCameBackLate(true);
        }
      }
    };
    const iv = setInterval(check, 250);
    document.addEventListener("visibilitychange", check);
    check();
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", check);
    };
  }, [endsAt]);

  // A fresh timer clears any lingering recovery state (deferred to a
  // callback — never a synchronous set inside the effect body).
  useEffect(() => {
    const t = setTimeout(() => setCameBackLate(false), 0);
    return () => clearTimeout(t);
  }, [endsAt]);

  if (!timer) return { timer: null, remainingMs: 0, overdueMs: 0, cameBackLate: false };
  const now = nowTick || timer.startedAt;
  return {
    timer,
    remainingMs: Math.max(0, timer.endsAt - now),
    overdueMs: Math.max(0, now - timer.endsAt),
    cameBackLate,
  };
}

"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Refcounted screen wake lock. The OS auto-releases on hide/discard; we
 * re-acquire on visibility. Always an enhancement — every call is
 * try/caught and the timer's persisted endsAt makes recovery exact.
 */

let refCount = 0;
let sentinel: WakeLockSentinel | null = null;
let held = false;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

async function acquire(): Promise<void> {
  if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
  try {
    sentinel = await navigator.wakeLock.request("screen");
    held = true;
    notify();
    sentinel.addEventListener("release", () => {
      held = false;
      notify();
    });
  } catch {
    held = false;
    notify();
  }
}

function release(): void {
  try {
    void sentinel?.release();
  } catch {
    /* already gone */
  }
  sentinel = null;
  held = false;
  notify();
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function useWakeLock(active: boolean): { supported: boolean; held: boolean } {
  const heldNow = useSyncExternalStore(
    subscribe,
    () => held,
    () => false,
  );

  useEffect(() => {
    if (!active) return;
    refCount += 1;
    if (refCount === 1) void acquire();
    const onVisible = () => {
      if (document.visibilityState === "visible" && refCount > 0 && !held) void acquire();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      refCount -= 1;
      document.removeEventListener("visibilitychange", onVisible);
      if (refCount === 0) release();
    };
  }, [active]);

  const supported = typeof navigator !== "undefined" && "wakeLock" in navigator;
  return { supported, held: heldNow };
}

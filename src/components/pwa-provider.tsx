"use client";

import { useEffect, useRef } from "react";
import { SerwistProvider, useSerwist } from "@serwist/turbopack/react";
import { useLiveQuery } from "dexie-react-hooks";
import { activeSession } from "@/lib/selectors";

/**
 * Update handling. The service worker activates immediately; this decides
 * when the open page actually swaps to it.
 *
 * A new build reloads on its own — silently, as soon as the worker takes
 * control — EXCEPT while a workout is in progress, where a reload mid-set
 * would be jarring. In that case the reload is deferred until the session
 * ends (the rest timer and every logged set survive it either way, since
 * both live in IndexedDB).
 */
function UpdateGate() {
  const { serwist } = useSerwist();
  const active = useLiveQuery(activeSession, []);
  const pending = useRef(false);
  const reloading = useRef(false);

  const inWorkout = !!active;

  useEffect(() => {
    if (!serwist) return;
    const onControlling = (event: { isUpdate?: boolean }) => {
      if (!event.isUpdate) return; // first install — nothing to swap
      pending.current = true;
      if (!inWorkout && !reloading.current) {
        reloading.current = true;
        window.location.reload();
      }
    };
    serwist.addEventListener("controlling", onControlling);
    return () => serwist.removeEventListener("controlling", onControlling);
  }, [serwist, inWorkout]);

  // A workout just ended with an update parked — apply it now.
  useEffect(() => {
    if (inWorkout || !pending.current || reloading.current) return;
    reloading.current = true;
    window.location.reload();
  }, [inWorkout]);

  return null;
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      disable={process.env.NODE_ENV === "development"}
      options={{ scope: "/" }}
    >
      {children}
      <UpdateGate />
    </SerwistProvider>
  );
}

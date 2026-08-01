"use client";

import { useEffect, useState } from "react";
import { SerwistProvider, useSerwist } from "@serwist/turbopack/react";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "motion/react";
import { activeSession } from "@/lib/selectors";
import { springSheet } from "@/lib/motion";

/**
 * Update toast: a waiting service worker offers "Update ready" →
 * SKIP_WAITING → reload on controlling change. Suppressed while a
 * workout session is active — never reload mid-set (the rest timer would
 * survive via its persisted endsAt, but the interruption wouldn't).
 */
function UpdateToast() {
  const { serwist } = useSerwist();
  const [waiting, setWaiting] = useState(false);
  const active = useLiveQuery(activeSession, []);

  useEffect(() => {
    if (!serwist) return;
    const onWaiting = () => setWaiting(true);
    serwist.addEventListener("waiting", onWaiting);
    return () => serwist.removeEventListener("waiting", onWaiting);
  }, [serwist]);

  useEffect(() => {
    if (!serwist) return;
    let reloading = false;
    const onControlling = (event: { isUpdate?: boolean }) => {
      if (reloading || !event.isUpdate) return;
      reloading = true;
      window.location.reload();
    };
    serwist.addEventListener("controlling", onControlling);
    return () => serwist.removeEventListener("controlling", onControlling);
  }, [serwist]);

  const show = waiting && !active;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: springSheet }}
          exit={{ y: -48, opacity: 0, transition: { duration: 0.14 } }}
          className="fixed inset-x-5 top-3 z-[70] mx-auto flex h-12 max-w-md items-center justify-between rounded-full bg-bg-3 px-5 shadow-[0_0_0_1px_var(--color-line)] safe-top"
        >
          <span className="text-[0.8125rem] font-medium">Update ready</span>
          <button
            onClick={() => serwist?.messageSkipWaiting()}
            className="text-[0.8125rem] font-semibold text-accent"
          >
            Restart
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      disable={process.env.NODE_ENV === "development"}
      options={{ scope: "/" }}
    >
      {children}
      <UpdateToast />
    </SerwistProvider>
  );
}

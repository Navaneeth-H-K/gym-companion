"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { CircleCheck, Flame, MonitorSmartphone, Snowflake } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/* Captured module-level so the event survives re-renders (Chrome fires it
 * once, early). */
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    for (const l of promptListeners) l();
  });
}

function useInstallPrompt(): BeforeInstallPromptEvent | null {
  return useSyncExternalStore(
    (cb) => {
      promptListeners.add(cb);
      return () => promptListeners.delete(cb);
    },
    () => deferredPrompt,
    () => null,
  );
}

function useStandalone(): boolean {
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const update = () => setStandalone(mq.matches);
    const t = setTimeout(update, 0);
    mq.addEventListener("change", update);
    return () => {
      clearTimeout(t);
      mq.removeEventListener("change", update);
    };
  }, []);
  return standalone;
}

/** Two skippable pages: the program's shape, then add-to-home-screen. */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const installPrompt = useInstallPrompt();
  const standalone = useStandalone();

  const finish = () => {
    haptic("select");
    onDone();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-md flex-col bg-bg px-6 safe-top"
    >
      <div className="flex h-12 items-center justify-end">
        <button onClick={finish} className="h-11 px-2 text-[13px] font-medium text-fg-faint">
          Skip
        </button>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.32, ease: easeOutExpo }}
        className="flex flex-1 flex-col justify-center pb-24"
      >
        {step === 0 ? (
          <>
            <Flame size={32} className="text-accent" />
            <h1 className="mt-4 font-display text-[30px] font-semibold leading-[36px]">
              Six sessions fill the ring.
            </h1>
            <div className="mt-4 flex flex-col gap-3 text-[15px] leading-[22px] text-fg-muted">
              <p>
                Push, Pull, Legs — twice each, in order, on whatever days life allows. Finish all
                six and the cycle resets. Rest never breaks anything.
              </p>
              <p>
                <span className="font-semibold text-fg">Enter weights as you go</span> — the first
                time an exercise comes up, start light (RPE 6–7 — you could do 3–4 more reps). Every
                session after that is pre-filled, and the app tells you when you&apos;ve earned more
                weight.
              </p>
              <p className="flex items-center gap-2">
                <Snowflake size={16} className="shrink-0 text-accent-2" />
                <span>Perfect cycles earn streak freezes for the days that go sideways.</span>
              </p>
            </div>
          </>
        ) : (
          <>
            <MonitorSmartphone size={32} className="text-accent" />
            <h1 className="mt-4 font-display text-[30px] font-semibold leading-[36px]">
              Put it on your home screen.
            </h1>
            {standalone ? (
              <p className="mt-4 flex items-center gap-2 text-[15px] leading-[22px] text-fg-muted">
                <CircleCheck size={18} className="shrink-0 text-accent" /> Already installed — you&apos;re
                set.
              </p>
            ) : installPrompt ? (
              <>
                <p className="mt-4 text-[15px] leading-[22px] text-fg-muted">
                  Full-screen, offline in the gym basement, opens like any app.
                </p>
                <button
                  onClick={() => void installPrompt.prompt()}
                  className="mt-6 h-14 w-full rounded-[16px] bg-accent text-[16px] font-semibold text-accent-ink"
                >
                  Add to Home Screen
                </button>
              </>
            ) : (
              <div className="mt-4 flex flex-col gap-2 text-[15px] leading-[22px] text-fg-muted">
                <p>Full-screen, offline in the gym basement, opens like any app:</p>
                <p>
                  1. Tap Chrome&apos;s <span className="font-semibold text-fg">⋮</span> menu
                </p>
                <p>
                  2. <span className="font-semibold text-fg">Add to Home screen</span> → Install
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>

      <div className="fixed inset-x-6 bottom-0 mx-auto max-w-md pb-6 safe-bottom">
        <div className="mb-4 flex justify-center gap-1.5">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={cn("h-1.5 w-1.5 rounded-full", i === step ? "bg-accent" : "bg-line-strong")}
            />
          ))}
        </div>
        <button
          onClick={() => {
            haptic("select");
            if (step === 0) setStep(1);
            else finish();
          }}
          className="h-14 w-full rounded-[16px] bg-accent text-[16px] font-semibold text-accent-ink"
        >
          {step === 0 ? "Next" : "Let's lift"}
        </button>
      </div>
    </motion.div>
  );
}

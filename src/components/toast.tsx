"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { springSheet } from "@/lib/motion";

export type ToastData = {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Single pill toast above the dock; swipe down or 5s auto-dismiss. */
export function Toast({ toast, onDismiss }: { toast: ToastData | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: springSheet }}
          exit={{ y: 24, opacity: 0, transition: { duration: 0.14 } }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.8 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 24 || info.velocity.y > 500) onDismiss();
          }}
          className="fixed inset-x-5 bottom-28 z-40 mx-auto flex h-12 max-w-md items-center justify-between rounded-full bg-bg-3 px-5 shadow-[0_0_0_1px_var(--color-line)]"
        >
          <span className="truncate text-[13px] font-medium">{toast.message}</span>
          {toast.actionLabel && (
            <button
              onClick={() => {
                toast.onAction?.();
                onDismiss();
              }}
              className="ml-3 shrink-0 text-[13px] font-semibold text-accent"
            >
              {toast.actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

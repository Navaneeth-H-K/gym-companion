"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Shared bottom sheet: slide-up panel, drag-to-dismiss (velocity > 800px/s
 * or 45% of height), dim backdrop.
 *
 * Three structural decisions, each the result of a real failure:
 * - Not built on AnimatePresence. Its exit ran but the nodes were never
 *   unmounted, leaving an invisible full-screen backdrop that ate every
 *   tap. Both layers stay mounted; `inert` takes them out of hit-testing
 *   and the a11y tree when closed.
 * - Open/close is a plain CSS transition. Motion's transform animation
 *   was unreliable here (variant propagation from ancestor containers and
 *   the drag gesture both contend for `y`); CSS just works, and the
 *   global reduced-motion rule neutralizes it for free.
 * - Drag lives on an inner element so the gesture never fights the
 *   open/close transform.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  tall = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  tall?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <button
        aria-label="Close"
        inert={!open}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* position layer — owns open/close.
          Inline `transform` on purpose: Tailwind v4's translate-* utilities
          write the separate `translate` property through a registered custom
          property, which does not transition cleanly here. */}
      <div
        inert={!open}
        style={{
          transform: open ? "translateY(0)" : "translateY(110%)",
          transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md",
          !open && "pointer-events-none",
        )}
      >
        {/* drag layer — owns the dismiss gesture */}
        <motion.div
          ref={ref}
          drag="y"
          dragSnapToOrigin
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.05, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            const h = ref.current?.offsetHeight ?? 400;
            if (info.velocity.y > 800 || info.offset.y > h * 0.45) onClose();
          }}
          className={cn(
            "rounded-t-[1.75rem] bg-bg-3 px-5 safe-bottom",
            tall && "max-h-[85dvh] overflow-y-auto",
          )}
        >
          <div className="mx-auto mb-3 mt-2 h-1 w-9 rounded-full bg-line-strong" />
          {title && <h2 className="mb-4 text-[1.0625rem] font-semibold tracking-tight">{title}</h2>}
          <div className="pb-4">{children}</div>
        </motion.div>
      </div>
    </>
  );
}

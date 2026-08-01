import type { Transition, Variants } from "motion/react";

/** Signature easings — shared by JS-driven motion and CSS tokens. */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeInOutQuint = [0.83, 0, 0.17, 1] as const;

/** Duration ladder in seconds (motion uses seconds). */
export const dur = {
  instant: 0.09,
  fast: 0.14,
  base: 0.22,
  gentle: 0.32,
  slow: 0.5,
  grand: 0.7,
  epic: 1.1,
} as const;

/** Spring configs. */
export const springSheet: Transition = { type: "spring", stiffness: 420, damping: 40, mass: 1 };
export const springSnappy: Transition = { type: "spring", stiffness: 640, damping: 32, mass: 0.7 };
export const springGentle: Transition = { type: "spring", stiffness: 260, damping: 32, mass: 1 };
export const springPill: Transition = { type: "spring", stiffness: 520, damping: 36 };

/** Fade + rise, the default entrance for content blocks. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: dur.gentle, ease: easeOutExpo, delay: i * 0.06 },
  }),
};

/** Stagger container for lists of `fadeUp` children. */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

/** Bottom sheet enter/exit. */
export const sheetVariants: Variants = {
  hidden: { y: "100%" },
  show: { y: 0, transition: springSheet },
  exit: { y: "100%", transition: { duration: dur.base, ease: easeOutExpo } },
};

/** Backdrop fade for sheets/dialogs. */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: dur.fast } },
};

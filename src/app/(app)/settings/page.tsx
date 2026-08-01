"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "motion/react";
import { chime, haptic } from "@/lib/haptics";
import { fadeUp, stagger } from "@/lib/motion";
import { saveSettings } from "@/lib/repo";
import { settings } from "@/lib/selectors";
import { cn } from "@/lib/utils";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => {
        haptic("tick");
        onChange(!on);
      }}
      className={cn(
        "relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-150",
        on ? "bg-accent" : "bg-bg-3",
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-6 w-6 rounded-full bg-fg transition-[left] duration-150",
          on ? "left-[24px] bg-accent-ink" : "left-1",
        )}
      />
    </button>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-14 items-center gap-3 px-4 py-2">
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-medium">{label}</div>
        {hint && <div className="mt-0.5 text-[13px] leading-[18px] text-fg-muted">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section variants={fadeUp}>
      <h2 className="overline-label mb-2 px-1 text-fg-faint">{title}</h2>
      <div className="divide-y divide-line rounded-[20px] bg-bg-1">{children}</div>
    </motion.section>
  );
}

export default function SettingsPage() {
  const s = useLiveQuery(settings, []);

  if (!s) {
    return (
      <div className="px-5 pt-4 safe-top">
        <div className="skeleton h-9 w-40 rounded-[8px]" />
        <div className="skeleton mt-6 h-40 w-full rounded-[20px]" />
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 px-5 pt-4 safe-top"
    >
      <motion.h1 variants={fadeUp} className="font-display text-[30px] font-semibold leading-[34px]">
        Settings
      </motion.h1>

      <Section title="training">
        <Row
          label="Schedule"
          hint="Six sessions in a rolling cycle — each one suggests the next, so a missed day never drops a session. Sunday is the rest day; training anyway is always one tap away."
        />
        <Row label="Units" hint="Kilograms, like the plates.">
          <span className="tnum text-[15px] text-fg-muted">kg</span>
        </Row>
      </Section>

      <Section title="feedback">
        <Row label="Haptics" hint="Vibration on logs, timers and PRs.">
          <Toggle on={s.vibrate} onChange={(v) => void saveSettings({ vibrate: v })} />
        </Row>
        <Row label="Sound" hint="A short chime when rest ends.">
          <Toggle on={s.audioCue} onChange={(v) => void saveSettings({ audioCue: v })} />
        </Row>
        <Row label="Test" hint="Feel the set-complete pattern.">
          <button
            onClick={() => {
              haptic("setDone");
              chime();
            }}
            className="h-10 rounded-[12px] bg-bg-2 px-4 text-[13px] font-semibold"
          >
            Play
          </button>
        </Row>
      </Section>

      <Section title="data">
        <Row
          label="Backup"
          hint="Everything lives on this phone for now — cloud backup and multi-device sync land in the next phase."
        />
      </Section>

      <Section title="about">
        <Row label="Gym Companion" hint="Built for one gym in particular. v0.1.0" />
      </Section>
    </motion.div>
  );
}

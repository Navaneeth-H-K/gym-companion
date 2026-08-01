"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { primeAudio, setAudioEnabled, setHapticsEnabled } from "@/lib/haptics";
import { settings } from "@/lib/selectors";

/** Syncs haptics/audio toggles from settings and unlocks the AudioContext
 *  on the session's first gesture (autoplay policy). */
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const s = useLiveQuery(settings, []);

  useEffect(() => {
    if (!s) return;
    setHapticsEnabled(s.vibrate);
    setAudioEnabled(s.audioCue);
  }, [s]);

  useEffect(() => {
    const prime = () => primeAudio();
    window.addEventListener("pointerdown", prime, { once: true });
    return () => window.removeEventListener("pointerdown", prime);
  }, []);

  return <>{children}</>;
}

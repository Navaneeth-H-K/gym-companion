/**
 * Haptic + audio feedback. Android Chrome only fires vibration after the
 * first user gesture (sticky activation) and never while the page is
 * hidden — every haptic is therefore paired with a visual state by the
 * calling UI, and callers never rely on vibration alone.
 */

const PATTERNS = {
  tick: [8], // stepper detent
  select: [12], // chip / toggle / swap / tab
  setDone: [12, 40, 24], // "da-DUM"
  restTick: [15], // final-3s countdown, one per second
  restOver: [100, 80, 100, 80, 220], // must be felt on a bench
  finish: [30, 60, 30, 60, 80, 60, 160], // rising cadence
  pr: [20, 50, 30, 50, 45, 50, 120], // escalating celebration
  destructive: [60], // single heavy thud
  error: [40, 60, 40], // double buzz
} as const;

export type HapticName = keyof typeof PATTERNS;

let hapticsEnabled = true;
let audioEnabled = false;

export function setHapticsEnabled(v: boolean): void {
  hapticsEnabled = v;
}

export function setAudioEnabled(v: boolean): void {
  audioEnabled = v;
}

export function haptic(name: HapticName): void {
  if (!hapticsEnabled) return;
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(PATTERNS[name]);
  } catch {
    /* unsupported — visual pairing carries the signal */
  }
}

/* ------------------------------------------------------------------ *
 * Rest-over chime — the one P1 sound. AudioContext must be created and
 * resumed inside a user gesture (autoplay policy); primeAudio() is wired
 * to the app shell's first pointerdown.
 * ------------------------------------------------------------------ */

let ctx: AudioContext | null = null;

export function primeAudio(): void {
  if (typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null;
  }
}

function note(frequency: number, at: number, duration: number): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.18, at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + duration + 0.02);
}

/** Two ascending notes; audible cue that rest is over. */
export function chime(): void {
  if (!audioEnabled || !ctx || ctx.state !== "running") return;
  const t = ctx.currentTime;
  note(880, t, 0.14);
  note(1320, t + 0.12, 0.2);
}

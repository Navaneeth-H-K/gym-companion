# Gym Companion

Push/Pull/Legs at one particular gym — logged, located, and streaked.

**Live:** https://gym.navaneethhk.in

## Install it on your phone

PWA — no app store, no download.

- **Android (Chrome)** — ⋮ menu → **Install and create shortcut** → **Install**. Not *Create shortcut*: that reopens Chrome and splits history across two copies.
- **iOS (Safari)** — Share → **Add to Home Screen**. Chrome for iOS can't install web apps.

Illustrated walkthrough: [`public/Install Guide.pdf`](public/Install%20Guide.pdf)

## Why

- My trainer's split is a fixed input. Every other app wanted me to use its templates.
- Showing up was the hard part, not knowing what to do — so it's built around streaks, not logging.
- My gym is two floors and seventeen stations. Hunting for a machine wastes time between sets.

## What it does

- **Today** — the day's session, streak ring, week strip. One tap starts or resumes.
- **Workout runner** — weight/reps/RPE per set, warm-ups, rest timer that survives a backgrounded phone, wake lock, prefill from last time, mid-session swaps, PR callouts on finish.
- **Plan** — the six-day rotation with rep ranges, RPE targets, rest windows, substitutions.
- **Settings** — haptics, rest chime. Deliberately thin.
- **Progress** — not built yet. Ships as an empty state; e1RM trends, volume by muscle and PRs land next.

Offline-first. No accounts, no backend, nothing leaves the phone.

## Knowing the room

`src/lib/stations.ts`

- 17 stations across 2 floors, each with a `howToFind` line in plain language. Photos optional, text required.
- `STATION_FOR` attaches a station to each exercise — floor chip, photo and find-it line ride along on the card, not a separate map view.
- `HOUSE_DEFAULTS` handles what the gym doesn't have (no pec deck, GHD, T-bar or calf machine): each declares what to do instead and why.
- `resolveExercise()` precedence: session swap → saved override → house default → as written. Sets log under what was actually performed.

## The interesting part

`src/lib/streak.ts` — took the most attempts by a wide margin.

- Consecutive calendar days is wrong: six sessions a week means every correct week contains a rest day.
- Weekday-anchored rest is also wrong: the rotation is rolling, so the rest day drifts. Resting Wednesday one week and Sunday the next must score the same.
- What it does: rolling trailing-7 window, weekday-agnostic. One untrained day in the trailing seven is free. A second auto-spends a freeze token; tokens are earned per six-trained-in-seven run, capped at two — consistency buys forgiveness.
- The subtle bit is `protectedDates` + the `covered()` closure. A frozen day must stay covered in *future* windows too, or the same absence cascades across the next six overlapping windows and resets a streak it already paid for. Days before history begins count as covered for the same reason.
- Deterministic fold over completed-day history, stored only as a recomputable cache. All day math anchored to IST via `src/lib/ist.ts`, never the device clock.
- `src/lib/__tests__/streak.test.ts` pins every case above.

Scheduling stays separate (`src/lib/schedule.ts`): *which* session is next is the successor of the last completed one, so a missed day never drops a session; *when* to rest is a Sunday suggestion you can train through.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Dexie (IndexedDB) · Serwist · Motion · Vitest · Vercel

- Local-first: schema in `src/lib/db.ts`, all writes through `src/lib/repo.ts`.
- No server, no auth, no third-party API — and no environment variables.

## Running locally

```bash
npm install
npm run dev        # http://localhost:4323
```

```bash
npm test           # Vitest — 65 tests, 8 files
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
```

## Notes

Personal tool. The split, the units and the gym are baked in rather than configurable — one program, one room, one person's rest day.

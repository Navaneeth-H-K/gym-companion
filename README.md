# Gym Companion

Push/Pull/Legs at one particular gym — logged, located, and streaked.

**Live:** https://gym.navaneethhk.in

## Why

Three things I wanted that no tracker gave me together.

My trainer gave me a Push/Pull/Legs split built around my own goals, and every app I tried wanted me to use its templates instead. I wanted the plan to be a fixed input, not something I re-entered every week.

Knowing what to do was never the problem — showing up was. So the app is built around habit rather than logging: streaks, a clear plan for the day, and progress that only moves if I actually turn up.

And the practical one: my gym is large enough that finding equipment wastes real time between sets. The app maps where each machine actually is, so the day's plan comes with a route through the floor rather than a list of names I then have to go hunting for.

## What it does

- **Today** — logs the current session against the day's split
- **Plan** — the Push/Pull/Legs rotation and per-day exercise list
- **Progress** — history, streaks, and per-lift trends over time
- **Settings** — configuration for the split, units, and gym location

<!-- TODO: correct any of the above that I got wrong from the outside, and add a
     line for the equipment map — where each machine sits on the gym floor. It's
     the most unusual thing in this app and nothing above currently mentions it.
     Say whether it lives in its own view or is attached to each exercise. -->

## Install it on your phone

No app store, no download. It's a PWA — open the site on your phone and add it to your home screen, and it runs full-screen like a native app.

**iOS (Safari)**
1. Open https://gym.navaneethhk.in
2. Tap the Share button
3. Tap **Add to Home Screen**

**Android (Chrome)**
1. Open https://gym.navaneethhk.in
2. Tap the ⋮ menu
3. Tap **Install app** (or **Add to Home Screen**)


## Stack

Next.js (App Router) · TypeScript · Tailwind · Vitest · deployed on Vercel


## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm test          # Vitest
npm run lint      # ESLint
```

## Notes

Built and maintained as a personal tool — I use it for my own training, which is why the split is opinionated rather than configurable.



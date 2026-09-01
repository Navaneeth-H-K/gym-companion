# Gym Companion

Push/Pull/Legs at one particular gym — logged, located, and streaked.

**Live:** https://gym.navaneethhk.in

<!-- TODO: add a screenshot or short GIF here. A reviewer's first two minutes are
     mostly visual. Drop the file in /public and reference it:
     ![Today view](public/screenshot-today.png) -->

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

<!-- TODO: a QR code pointing at the live URL belongs right here — it's the
     difference between a reviewer thinking "I could try this" and actually
     trying it. Generate one, drop it in /public, and reference it. -->

<!-- TODO: verify the install prompt actually fires on Android. I could see your
     Apple meta tags, but Chrome needs a valid manifest with icons (192px and
     512px) and a service worker before it offers "Install app". Test it on a
     real device — a README that promises an install flow that doesn't appear is
     worse than not mentioning it. -->

## The interesting part

<!-- TODO: THIS IS THE SECTION THAT MATTERS. Everything above is table stakes;
     this is what a reviewer is actually looking for.

     Write 3–6 sentences on the one problem that took you the most attempts.
     Structure:
       1. What the problem was, concretely.
       2. What your first approach was, and why it broke.
       3. What you do now, and what tradeoff that choice accepts.

     Name the file. "See src/lib/streak.ts" lets someone verify you in ten
     seconds, which is worth more than any adjective you could use here.

     Candidates, if you're deciding: how the equipment map is modelled and how
     the day's exercises get ordered into a sensible route across the floor,
     offline logging reconciling on reconnect, streak calculation across a
     missed day or a timezone change, or plan rebalancing after a skipped
     session. Pick the one where your first two versions were actually wrong. -->

## Stack

Next.js (App Router) · TypeScript · Tailwind · Vitest · deployed on Vercel

<!-- TODO: add your data layer — whatever you use for persistence, auth if any,
     and the geolocation API if the location check is real. -->

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

<!-- TODO: if any environment variables are required, list them here with a
     .env.example. A reviewer who clones this and hits a wall on missing config
     stops reading. -->

## Notes

Built and maintained as a personal tool — I use it for my own training, which is why the split is opinionated rather than configurable.

<!-- TODO: delete this section if it isn't true. -->

# Gym Companion

Push/Pull/Legs at one particular gym — logged, located, and streaked.

**Live:** https://gym.navaneethhk.in

<!-- TODO: add a screenshot or short GIF here. A reviewer's first two minutes are
     mostly visual. Drop the file in /public and reference it:
     ![Today view](public/screenshot-today.png) -->

## Why

<!-- TODO: 2–4 sentences, first person. What was wrong with the alternatives you
     tried, and what did you want instead? Be specific — "existing trackers are
     bloated" is generic; "every app I tried made me tap through four screens to
     log one set" is not. If the geolocation constraint exists because you were
     logging sessions you hadn't actually done, say so. That kind of honesty
     reads well. -->

## What it does

- **Today** — logs the current session against the day's split
- **Plan** — the Push/Pull/Legs rotation and per-day exercise list
- **Progress** — history, streaks, and per-lift trends over time
- **Settings** — configuration for the split, units, and gym location

<!-- TODO: correct any of the above that I got wrong from the outside, and add
     anything genuinely distinctive. If sessions are location-verified, that
     deserves its own line — it's the most unusual thing about this app. -->

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

     Candidates, if you're deciding: offline logging reconciling on reconnect,
     streak calculation across timezone changes or a missed day, indoor GPS
     accuracy for the location check, or plan rebalancing after a skipped
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

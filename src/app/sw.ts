/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, ExpirationPlugin, NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // Auto-activate. Waiting for a toast tap left the phone stranded on an
  // old build when the toast didn't surface; the client decides when to
  // actually reload (never mid-workout), so taking control early is safe.
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Sync/auth responses must never come from cache.
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    // Station photos are immutable-ish and precious offline.
    {
      matcher: ({ url }) => url.pathname.startsWith("/stations/"),
      handler: new CacheFirst({
        cacheName: "stations",
        plugins: [new ExpirationPlugin({ maxEntries: 60 })],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();

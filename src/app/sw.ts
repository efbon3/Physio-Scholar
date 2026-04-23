/// <reference lib="WebWorker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * App service worker.
 *
 * Precache manifest is injected at build time by @serwist/next; runtime
 * caching for API + static assets uses the default strategies (NetworkFirst
 * for navigations, StaleWhileRevalidate for static assets, CacheFirst for
 * images and fonts). Good enough for Phase 2; we'll tune per asset class
 * in Phase 6 (build spec §4.7 PWA polish).
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

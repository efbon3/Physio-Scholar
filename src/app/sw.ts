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
 * images and fonts).
 *
 * `skipWaiting` is deliberately **false** so a new worker parks itself in
 * the `waiting` state when it installs. The client-side `UpdateBanner`
 * component sees that state, shows an "Update available" notice, and only
 * calls `SKIP_WAITING` + reload after the learner opts in. Prevents a
 * mid-review auto-reload that would wipe session state (build spec §4.7).
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// Allow the client to request the skip via postMessage once the learner
// confirms they're ready to reload. The banner component posts this.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});

"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Update available" banner (build spec §4.7).
 *
 * Flow:
 *   1. Register for navigator.serviceWorker updates.
 *   2. When a new worker installs and lands in `waiting`, surface the
 *      banner with a "Reload to update" button.
 *   3. On click, post { type: "SKIP_WAITING" } to the waiting worker,
 *      then wait for `controllerchange` and call location.reload().
 *
 * The service worker in src/app/sw.ts is configured with
 * `skipWaiting: false` so a new version doesn't hijack the tab mid-review.
 * Combined with this banner, learners always choose the moment the
 * reload happens.
 *
 * First-install guard: `clientsClaim: true` on the SW makes the initial
 * install fire `controllerchange` even though no update happened. We
 * track `hadControllerAtMount` and an explicit `userTriggeredSkip` ref
 * so the handler only triggers a reload for genuine learner-initiated
 * updates.
 */
export function UpdateBanner() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const userTriggered = useRef(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    const hadControllerAtMount = Boolean(navigator.serviceWorker.controller);

    function handleRegistration(registration: ServiceWorkerRegistration) {
      if (registration.waiting) {
        if (!cancelled) setWaitingWorker(registration.waiting);
      }
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            if (!cancelled) setWaitingWorker(installing);
          }
        });
      });
    }

    void navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) handleRegistration(registration);
    });

    const onControllerChange = () => {
      // Silent on the first install — no prior controller + no explicit
      // learner action means this is clientsClaim taking over, not an
      // update the learner opted into.
      if (!hadControllerAtMount && !userTriggered.current) return;
      if (!cancelled) window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  if (!waitingWorker || dismissed) return null;

  const applyUpdate = () => {
    userTriggered.current = true;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    // The reload is triggered by the controllerchange event.
  };

  return (
    <div
      role="region"
      aria-label="App update available"
      className="border-border bg-primary/5 sticky top-0 z-20 w-full border-b"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs">
        <p>
          <span className="font-medium">A new version of Physio-Scholar is ready.</span>{" "}
          <span className="text-muted-foreground">
            Reload to pick up the latest content and fixes.
          </span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={applyUpdate}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1 text-xs"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:bg-muted rounded-md px-3 py-1 text-xs"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

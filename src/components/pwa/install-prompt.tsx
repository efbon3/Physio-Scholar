"use client";

import { useEffect, useState } from "react";

import {
  checkEligibility,
  isIosSafari,
  isRunningStandalone,
  markDismissed,
  markInstalled,
} from "@/lib/pwa/install-state";

/**
 * `beforeinstallprompt` event — not fully typed in lib.dom. We capture it
 * to call `.prompt()` later, on our own schedule (build spec §2.8: only
 * after 3+ sessions).
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Kind = "native" | "ios" | null;

/**
 * Contextual install banner. Three paths:
 *
 * 1. Chromium / Edge / Samsung Internet — captures the
 *    `beforeinstallprompt` event. When the learner is eligible
 *    (3+ completed review sessions, no recent dismissal) we show a
 *    compact banner with an "Install" button that calls `.prompt()`.
 *
 * 2. iOS Safari — doesn't fire `beforeinstallprompt`, so we render
 *    text instructions referencing the Share menu → "Add to Home Screen"
 *    path. Only shown when the user matches the iOS+Safari UA.
 *
 * 3. Already-installed / opened from the home screen — show nothing.
 *
 * The component is client-only; mounting it in the (app) layout keeps it
 * out of the /login + /signup surfaces where it'd be noise.
 */
export function InstallPrompt() {
  const [kind, setKind] = useState<Kind>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isRunningStandalone()) return;
    const eligibility = checkEligibility();
    if (!eligibility.eligible) return;

    // Path 1: native install event.
    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setKind("native");
    }

    function onInstalled() {
      markInstalled();
      setKind(null);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // Path 2: iOS fallback — no DOM event, so show instructions directly.
    // Delay slightly so the banner doesn't flash at page mount.
    const iosTimer = setTimeout(() => {
      if (isIosSafari()) setKind((current) => current ?? "ios");
    }, 300);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(iosTimer);
    };
  }, []);

  if (kind === null) return null;

  if (kind === "ios") {
    return (
      <Banner
        label="Add Physio-Scholar to your home screen"
        body={
          <>
            Tap the Share icon in Safari and choose{" "}
            <strong>&ldquo;Add to Home Screen&rdquo;</strong> to launch Physio-Scholar fullscreen.
          </>
        }
        onDismiss={() => {
          markDismissed();
          setKind(null);
        }}
      />
    );
  }

  return (
    <Banner
      label="Install Physio-Scholar"
      body="Pin to your home screen so reviews are one tap away and the app keeps working offline."
      action={{
        label: "Install",
        onClick: async () => {
          if (!deferredPrompt) return;
          try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") markInstalled();
            else markDismissed();
          } finally {
            setDeferredPrompt(null);
            setKind(null);
          }
        },
      }}
      onDismiss={() => {
        markDismissed();
        setKind(null);
        setDeferredPrompt(null);
      }}
    />
  );
}

function Banner({
  label,
  body,
  action,
  onDismiss,
}: {
  label: string;
  body: React.ReactNode;
  action?: { label: string; onClick: () => void };
  onDismiss: () => void;
}) {
  return (
    <div
      role="region"
      aria-label="Install Physio-Scholar"
      className="border-border bg-muted/60 sticky bottom-0 z-10 w-full border-t"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-muted-foreground text-xs leading-5">{body}</p>
        </div>
        <div className="flex items-center gap-2">
          {action ? (
            <button
              type="button"
              onClick={action.onClick}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm"
            >
              {action.label}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            className="text-muted-foreground hover:bg-muted rounded-md px-3 py-1.5 text-xs"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

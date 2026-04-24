/**
 * Session counter + dismissal tracking for the PWA install prompt.
 *
 * Build spec §2.8: "Install prompt surfaced contextually (after 3+
 * sessions)." We bump a per-browser counter when a review session
 * completes. Dismissing re-hides the banner for 14 days so learners
 * aren't nagged.
 */

const STORAGE_KEYS = {
  sessionCount: "physio-scholar:install:sessions",
  dismissedAt: "physio-scholar:install:dismissed_at",
  installed: "physio-scholar:install:installed",
} as const;

export const INSTALL_PROMPT_SESSION_THRESHOLD = 3;
export const INSTALL_DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function safeGet(key: string): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private-browsing / quota */
  }
}

export function getSessionCount(): number {
  const raw = safeGet(STORAGE_KEYS.sessionCount);
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function incrementSessionCount(): number {
  const next = getSessionCount() + 1;
  safeSet(STORAGE_KEYS.sessionCount, `${next}`);
  return next;
}

export function markDismissed(now: Date = new Date()): void {
  safeSet(STORAGE_KEYS.dismissedAt, now.toISOString());
}

export function markInstalled(now: Date = new Date()): void {
  safeSet(STORAGE_KEYS.installed, now.toISOString());
}

export function isInstalled(): boolean {
  return safeGet(STORAGE_KEYS.installed) !== null;
}

export function isDismissedRecently(now: Date = new Date()): boolean {
  const raw = safeGet(STORAGE_KEYS.dismissedAt);
  if (!raw) return false;
  const ts = Date.parse(raw);
  if (!Number.isFinite(ts)) return false;
  return now.getTime() - ts < INSTALL_DISMISS_COOLDOWN_MS;
}

export type InstallEligibility = {
  eligible: boolean;
  reason: "installed" | "dismissed" | "too-few-sessions" | "eligible";
};

/**
 * Pure eligibility check given current session count + dismissal state.
 * Extracted so it can be unit-tested without jsdom or localStorage.
 */
export function computeEligibility(params: {
  sessionCount: number;
  dismissedAt: Date | null;
  installed: boolean;
  now: Date;
}): InstallEligibility {
  if (params.installed) return { eligible: false, reason: "installed" };
  if (params.dismissedAt) {
    const diff = params.now.getTime() - params.dismissedAt.getTime();
    if (diff < INSTALL_DISMISS_COOLDOWN_MS) {
      return { eligible: false, reason: "dismissed" };
    }
  }
  if (params.sessionCount < INSTALL_PROMPT_SESSION_THRESHOLD) {
    return { eligible: false, reason: "too-few-sessions" };
  }
  return { eligible: true, reason: "eligible" };
}

/** Reads the current eligibility from localStorage. */
export function checkEligibility(now: Date = new Date()): InstallEligibility {
  const dismissedRaw = safeGet(STORAGE_KEYS.dismissedAt);
  const dismissedAt = dismissedRaw ? new Date(dismissedRaw) : null;
  return computeEligibility({
    sessionCount: getSessionCount(),
    dismissedAt: dismissedAt && Number.isFinite(dismissedAt.getTime()) ? dismissedAt : null,
    installed: isInstalled(),
    now,
  });
}

/**
 * Best-effort iOS detection. iOS Safari doesn't fire beforeinstallprompt,
 * so on iOS we show an instruction banner instead of a programmatic
 * install button.
 */
export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
}

/** Detect if the app is already running standalone (installed). */
export function isRunningStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

export const __TEST_KEYS = STORAGE_KEYS;

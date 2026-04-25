/**
 * Thin wrapper around the Fullscreen API for the focused-study mode.
 *
 * The browser only honours `requestFullscreen()` from inside the call
 * stack of a user gesture (a click handler synchronously, before any
 * await). Callers must invoke `tryEnterFullscreen` directly in the click
 * handler — kicking it off from a setTimeout or post-await branch will
 * silently fail with a SecurityError.
 *
 * iOS Safari (non-PWA tab) does not implement the API on `document` —
 * only on `<video>` elements. There we degrade gracefully: the call
 * resolves `false` and the session still runs, just without the chrome
 * being hidden. In PWA standalone mode (the intended deployment path
 * per build spec §2.4) iOS already presents a chromeless surface, so
 * the lack of API support there is a non-issue.
 */

type FullscreenCapableElement = HTMLElement & {
  requestFullscreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenCapableDocument = Document & {
  fullscreenElement?: Element | null;
  webkitFullscreenElement?: Element | null;
  exitFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void> | void;
};

export function isFullscreenSupported(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.documentElement as FullscreenCapableElement;
  return (
    typeof el.requestFullscreen === "function" || typeof el.webkitRequestFullscreen === "function"
  );
}

export function isFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as FullscreenCapableDocument;
  return Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);
}

export async function tryEnterFullscreen(): Promise<boolean> {
  if (typeof document === "undefined") return false;
  const el = document.documentElement as FullscreenCapableElement;
  try {
    if (typeof el.requestFullscreen === "function") {
      await el.requestFullscreen();
      return true;
    }
    if (typeof el.webkitRequestFullscreen === "function") {
      const result = el.webkitRequestFullscreen();
      if (result instanceof Promise) await result;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function tryExitFullscreen(): Promise<boolean> {
  if (typeof document === "undefined") return false;
  const doc = document as FullscreenCapableDocument;
  try {
    if (typeof doc.exitFullscreen === "function" && doc.fullscreenElement) {
      await doc.exitFullscreen();
      return true;
    }
    if (typeof doc.webkitExitFullscreen === "function" && doc.webkitFullscreenElement) {
      const result = doc.webkitExitFullscreen();
      if (result instanceof Promise) await result;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

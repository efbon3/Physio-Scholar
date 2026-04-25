import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isFullscreen,
  isFullscreenSupported,
  tryEnterFullscreen,
  tryExitFullscreen,
} from "./fullscreen";

type MutableElement = HTMLElement & {
  requestFullscreen?: unknown;
  webkitRequestFullscreen?: unknown;
};

type MutableDocument = Document & {
  fullscreenElement?: unknown;
  webkitFullscreenElement?: unknown;
  exitFullscreen?: unknown;
  webkitExitFullscreen?: unknown;
};

describe("fullscreen helper", () => {
  const originalRequest = (document.documentElement as MutableElement).requestFullscreen;
  const originalWebkitRequest = (document.documentElement as MutableElement)
    .webkitRequestFullscreen;
  const originalExit = (document as MutableDocument).exitFullscreen;
  const originalFullscreenElement = (document as MutableDocument).fullscreenElement;

  beforeEach(() => {
    Reflect.deleteProperty(document.documentElement, "requestFullscreen");
    Reflect.deleteProperty(document.documentElement, "webkitRequestFullscreen");
    Reflect.deleteProperty(document, "exitFullscreen");
    Reflect.deleteProperty(document, "webkitExitFullscreen");
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      writable: true,
      value: null,
    });
  });

  afterEach(() => {
    if (originalRequest)
      (document.documentElement as MutableElement).requestFullscreen = originalRequest;
    if (originalWebkitRequest)
      (document.documentElement as MutableElement).webkitRequestFullscreen = originalWebkitRequest;
    if (originalExit) (document as MutableDocument).exitFullscreen = originalExit;
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      writable: true,
      value: originalFullscreenElement,
    });
  });

  it("isFullscreenSupported is false when neither API exists (iOS Safari tab)", () => {
    expect(isFullscreenSupported()).toBe(false);
  });

  it("isFullscreenSupported is true when standard API is present", () => {
    (document.documentElement as MutableElement).requestFullscreen = vi.fn(() => Promise.resolve());
    expect(isFullscreenSupported()).toBe(true);
  });

  it("isFullscreenSupported is true when the legacy webkit API is present", () => {
    (document.documentElement as MutableElement).webkitRequestFullscreen = vi.fn(() =>
      Promise.resolve(),
    );
    expect(isFullscreenSupported()).toBe(true);
  });

  it("tryEnterFullscreen calls the standard API and returns true on success", async () => {
    const spy = vi.fn(() => Promise.resolve());
    (document.documentElement as MutableElement).requestFullscreen = spy;
    expect(await tryEnterFullscreen()).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("tryEnterFullscreen falls back to webkitRequestFullscreen", async () => {
    const spy = vi.fn(() => undefined);
    (document.documentElement as MutableElement).webkitRequestFullscreen = spy;
    expect(await tryEnterFullscreen()).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("tryEnterFullscreen returns false when the API rejects (permission denied)", async () => {
    (document.documentElement as MutableElement).requestFullscreen = vi.fn(() =>
      Promise.reject(new Error("not allowed")),
    );
    expect(await tryEnterFullscreen()).toBe(false);
  });

  it("tryEnterFullscreen returns false when no API is available", async () => {
    expect(await tryEnterFullscreen()).toBe(false);
  });

  it("tryExitFullscreen exits when fullscreenElement is set", async () => {
    const spy = vi.fn(() => Promise.resolve());
    (document as MutableDocument).exitFullscreen = spy;
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      writable: true,
      value: document.documentElement,
    });
    expect(await tryExitFullscreen()).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("tryExitFullscreen returns false when not currently fullscreen", async () => {
    (document as MutableDocument).exitFullscreen = vi.fn(() => Promise.resolve());
    expect(await tryExitFullscreen()).toBe(false);
  });

  it("isFullscreen reflects document.fullscreenElement", () => {
    expect(isFullscreen()).toBe(false);
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      writable: true,
      value: document.documentElement,
    });
    expect(isFullscreen()).toBe(true);
  });
});

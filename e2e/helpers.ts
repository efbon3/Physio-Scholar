import type { ConsoleMessage, Page } from "@playwright/test";

/**
 * Patterns that show up in Next.js dev mode but not in production builds.
 * They aren't real errors — they're HMR and dev-tooling noise.
 * The CI config (playwright.ci.config.ts) runs against `next start` so these
 * don't appear; locally they do, and we silently drop them.
 */
const DEV_ONLY_NOISE_PATTERNS: readonly RegExp[] = [
  /webpack-hmr/i,
  /on-demand-entries-ping/i,
  /\[Fast Refresh\]/i,
  /_next\/static\/webpack/i,
];

export function isDevOnlyNoise(text: string): boolean {
  return DEV_ONLY_NOISE_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Collect real page errors and console errors from a Page, filtering out
 * dev-only noise. Returns a live array the test can assert against.
 */
export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    if (!isDevOnlyNoise(error.message)) errors.push(error.message);
  });
  page.on("console", (message: ConsoleMessage) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (!isDevOnlyNoise(text)) errors.push(text);
  });
  return errors;
}

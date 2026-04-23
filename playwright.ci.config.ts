import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

/**
 * CI-only Playwright config. Builds the app and serves it with `next start`
 * so tests hit a real production bundle — no HMR, no dev-only warnings, no
 * Fast Refresh chatter in the console. Also runnable locally with
 * `npm run test:e2e:ci` when you want to mirror CI behavior.
 *
 * Startup timing: `npm run build && npm run start` takes ~10–60s before the
 * server is ready. Playwright's `webServer.url` check polls this URL and
 * blocks tests until it responds, so tests never fire against a not-yet-ready
 * server. The 5-minute `timeout` is the upper bound for that wait.
 */
export default defineConfig({
  ...baseConfig,
  webServer: {
    command: "npm run build && npm run start",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
    env: { PORT: String(PORT) },
  },
});

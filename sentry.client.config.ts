import * as Sentry from "@sentry/nextjs";

/**
 * Client-side (browser) Sentry initialization.
 *
 * Runs on every page load. Gracefully becomes a no-op when
 * NEXT_PUBLIC_SENTRY_DSN is absent, so CI, Vercel previews without the env
 * var, and local dev stay quiet instead of spamming errors.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Sample only a fraction of traces in production to keep quota in check.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Replay only failed sessions — full session replay is expensive.
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.0,
    integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    enabled: true,
  });
}

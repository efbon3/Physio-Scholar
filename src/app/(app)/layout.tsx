import type { ReactNode } from "react";

import { AppNav } from "@/components/nav/app-nav";

/**
 * Layout for the signed-in app section (Today, Systems, Progress).
 * Wraps pages with the tab nav so the three surfaces share one
 * consistent chrome.
 *
 * Deliberately not wrapping `/review` — per build spec §2.3 the review
 * session is fullscreen, so it lives at `src/app/review/` outside this
 * route group and renders without the nav.
 *
 * Middleware enforces auth on each of the three routes individually via
 * its PROTECTED_PREFIXES list; nothing in this layout re-checks.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}

import type { ReactNode } from "react";

import { AppNav } from "@/components/nav/app-nav";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { Watermark } from "@/components/watermark";
import { requireApprovedUser } from "@/lib/auth/approval";
import { createClient } from "@/lib/supabase/server";

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
 * its PROTECTED_PREFIXES list. We look up the profile id here so the
 * nav's SyncIndicator can scope Dexie reads; in envs without Supabase
 * (CI / unconfigured previews) we fall back to the "preview" sentinel
 * which disables the indicator gracefully.
 */
type ResolvedIdentity = {
  profileId: string;
  isAdmin: boolean;
  isFaculty: boolean;
};

async function resolveIdentity(): Promise<ResolvedIdentity> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { profileId: "preview", isAdmin: false, isFaculty: false };
  }
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      return { profileId: "preview", isAdmin: false, isFaculty: false };
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, is_faculty")
      .eq("id", userId)
      .single();
    return {
      profileId: userId,
      isAdmin: profile?.is_admin === true,
      isFaculty: profile?.is_faculty === true,
    };
  } catch {
    return { profileId: "preview", isAdmin: false, isFaculty: false };
  }
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Approval gate — bounces signed-in-but-unapproved users to
  // /pending-approval before any learner surface renders. Admins
  // bypass; CI / preview envs without Supabase env vars also bypass.
  await requireApprovedUser();
  const { profileId, isAdmin, isFaculty } = await resolveIdentity();
  // Mobile (<md) stacks vertically: AppNav renders a top bar and the
  // page content sits below. Desktop (md+) splits horizontally:
  // AppNav becomes a permanent left sidebar and the page fills the
  // rest of the row.
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppNav profileId={profileId} isAdmin={isAdmin} isFaculty={isFaculty} />
      <div className="min-w-0 flex-1">{children}</div>
      <InstallPrompt />
      <Watermark userId={profileId === "preview" ? null : profileId} />
    </div>
  );
}

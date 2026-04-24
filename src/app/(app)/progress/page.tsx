import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Progress",
};

/**
 * Progress tab — placeholder. The real dashboard (retention curves,
 * mastery %, streak history, weekly metacognitive calibration report,
 * study-time aggregates — build spec §2.3) needs review history and
 * a time-series computation layer that isn't built yet. Shipping
 * the route + nav entry now so the nav shell is complete; the
 * content lands in a later Phase 5 sub-phase.
 */
export default async function ProgressPage() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createClient();
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) redirect("/login?next=/progress");
    } catch {
      // env present but unreachable — fall through to render placeholder.
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Progress</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Your progress</h1>
      </header>
      <p className="text-sm leading-7">
        This dashboard will show retention curves, mastery percentages per mechanism, streak
        history, weekly metacognitive calibration reports, and study-time aggregates. We&apos;re
        building it in the next sub-phase of Phase 5 — right now review data is collecting locally
        (Dexie) while we wire the analytics.
      </p>
    </main>
  );
}

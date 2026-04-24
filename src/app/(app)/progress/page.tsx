import { redirect } from "next/navigation";

import { extractCards, type Card } from "@/lib/content/cards";
import { readAllMechanisms } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

import { ProgressDashboard } from "./progress-dashboard";

export const metadata = {
  title: "Progress",
};

/**
 * Progress tab — Phase 5 learner-facing analytics. The route shell +
 * placeholder copy shipped in D1; D3 wires in the real Dexie-backed
 * metrics (streak, retention%, per-mechanism mastery, activity
 * sparkline).
 *
 * Per build spec §2.3, the full Progress surface eventually includes
 * metacognitive calibration too — that depends on the Phase 4 grader
 * scoring self-explanations, so it lands in a later sub-phase.
 */
export default async function ProgressPage() {
  let userId: string | null = null;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) redirect("/login?next=/progress");
      userId = data.user.id;
    } catch {
      // env present but unreachable — fall through to render with preview id.
    }
  }

  const mechanisms = await readAllMechanisms();
  const cards: Card[] = mechanisms.flatMap(extractCards);
  const mechanismTitles = Object.fromEntries(
    mechanisms.map((m) => [m.frontmatter.id, m.frontmatter.title]),
  );

  return (
    <ProgressDashboard
      cards={cards}
      mechanismTitles={mechanismTitles}
      profileId={userId ?? "preview"}
    />
  );
}

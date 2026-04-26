import { redirect } from "next/navigation";

import { readVisibleEvents, daysUntil } from "@/lib/calendar/events";
import { buildBoostCardIds, findActiveExamWindow } from "@/lib/calendar/srs-weighting";
import { extractCards, type Card } from "@/lib/content/cards";
import { readAllMechanisms } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

import { TodayDashboard } from "./today-dashboard";

export const metadata = {
  title: "Dashboard",
};

/**
 * Today dashboard — post-login landing per build spec §2.3.
 *   - Greeting
 *   - Review queue count (client-driven because Dexie lives in the browser)
 *   - Primary action: "Start review"
 *   - Active-systems chip surfacing the per-student J0 selector
 *
 * Placeholders for streak, weak area, clinical challenge (§2.3) — those
 * need data we don't have until Phase 5's progress work lands. Shipping
 * the shell now so the nav + landing flow feels right.
 */
async function getUserAndSystems() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { user: null, studySystems: null };
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return { user: null, studySystems: null };
    const { data: profile } = await supabase
      .from("profiles")
      .select("study_systems")
      .eq("id", data.user.id)
      .single();
    return {
      user: data.user,
      studySystems: profile?.study_systems ?? null,
    };
  } catch {
    return { user: null, studySystems: null };
  }
}

export default async function TodayPage() {
  const { user, studySystems } = await getUserAndSystems();
  if (!user && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    redirect("/login?next=/today");
  }

  const mechanisms = await readAllMechanisms();

  // Honour the learner's active-systems preference for the count and the
  // queue assembly. The Today summary should match what /review will
  // actually serve — not the entire authored universe.
  const inScope = studySystems
    ? mechanisms.filter((m) => studySystems.includes(m.frontmatter.organ_system))
    : mechanisms;
  const cards: Card[] = inScope.flatMap(extractCards);
  // Mechanism title lookup powers the weak-area + daily-challenge widgets.
  // Built from `inScope` so the daily challenge only rotates through
  // mechanisms the learner has actively opted into studying.
  const mechanismTitles: Record<string, string> = {};
  for (const m of inScope) {
    mechanismTitles[m.frontmatter.id] = m.frontmatter.title;
  }

  // J7 exam-aware weighting: find the soonest exam in the ±14d window
  // and compute the boost set of card ids the queue should surface
  // first. Both audiences (institution + personal) participate.
  const now = new Date();
  const events = await readVisibleEvents();
  const activeExam = findActiveExamWindow(events, now);
  const boostCardIds = activeExam
    ? buildBoostCardIds(activeExam, inScope, cards)
    : new Set<string>();
  const examWidget = activeExam
    ? {
        title: activeExam.title,
        startsAt: activeExam.starts_at,
        daysAway: daysUntil(activeExam.starts_at, now),
        topics: activeExam.organ_systems,
        audience: activeExam.audience,
      }
    : null;

  return (
    <TodayDashboard
      cards={cards}
      mechanismTitles={mechanismTitles}
      email={user?.email ?? null}
      profileId={user?.id ?? "preview"}
      studySystems={studySystems}
      boostCardIds={Array.from(boostCardIds)}
      examWidget={examWidget}
    />
  );
}

import { redirect } from "next/navigation";

import { readVisibleEvents } from "@/lib/calendar/events";
import { buildBoostCardIds, findActiveExamWindow } from "@/lib/calendar/srs-weighting";
import { extractCards, type Card } from "@/lib/content/cards";
import { readAllChapters } from "@/lib/content/source";
import { pickRandomQuote } from "@/lib/motivation/quotes";
import { createClient } from "@/lib/supabase/server";

import { TodayDashboard, type FacultyAssignment, type UpcomingGoal } from "./today-dashboard";

export const metadata = {
  title: "Dashboard",
};

/**
 * Today dashboard — post-login landing.
 *
 * Reads the learner's display name (nickname → full name → email
 * prefix → "there" fallback), their organ-system scope, and the
 * upcoming calendar goals. Picks a random motivational quote at
 * request time so the greeting changes on every navigation. The
 * actual queue numbers + weak-area widget are computed client-side
 * because Dexie lives in the browser.
 */
type ProfileSnapshot = {
  user: { id: string; email: string | null } | null;
  studySystems: string[] | null;
  nickname: string | null;
  fullName: string | null;
};

async function getProfileSnapshot(): Promise<ProfileSnapshot> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { user: null, studySystems: null, nickname: null, fullName: null };
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return { user: null, studySystems: null, nickname: null, fullName: null };
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("study_systems, nickname, full_name")
      .eq("id", data.user.id)
      .single();
    return {
      user: { id: data.user.id, email: data.user.email ?? null },
      studySystems: profile?.study_systems ?? null,
      nickname: profile?.nickname ?? null,
      fullName: profile?.full_name ?? null,
    };
  } catch {
    return { user: null, studySystems: null, nickname: null, fullName: null };
  }
}

export default async function TodayPage() {
  const { user, studySystems, nickname, fullName } = await getProfileSnapshot();
  if (!user && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    redirect("/login?next=/today");
  }

  const mechanisms = await readAllChapters();

  // Honour the learner's active-systems preference for the count and the
  // queue assembly. The Today summary should match what /review will
  // actually serve — not the entire authored universe.
  const inScope = studySystems
    ? mechanisms.filter((m) => studySystems.includes(m.frontmatter.organ_system))
    : mechanisms;
  const cards: Card[] = inScope.flatMap(extractCards);
  // Chapter title lookup powers the weak-area + daily-challenge widgets.
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

  // The "upcoming goals" widget shows the next three events the learner
  // has on their calendar — exams, deadlines, personal goals. The
  // exam-window widget shown above used to single out one exam, but the
  // wider list is more useful as a general reminder surface.
  const todayMs = now.getTime();
  const upcomingGoals: UpcomingGoal[] = events
    .map((e) => ({
      id: e.id,
      title: e.title,
      startsAt: e.starts_at,
      audience: e.audience,
      daysAway: Math.max(
        0,
        Math.ceil((new Date(e.starts_at).getTime() - todayMs) / (1000 * 60 * 60 * 24)),
      ),
    }))
    .filter((e) => new Date(e.startsAt).getTime() >= todayMs - 1000 * 60 * 60 * 12)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 3);

  const quote = pickRandomQuote();
  // Greeting: prefer nickname, then full name, then email prefix, then
  // a friendly fallback. Trimmed so a profile that stored "  ali  "
  // doesn't surface an awkward extra space.
  const greetingName =
    nickname?.trim() || fullName?.trim() || user?.email?.split("@")[0]?.trim() || "there";

  // Faculty homework — RLS scopes the result to the caller's
  // institution, so the page just orders + slices. We surface the next
  // 3: anything with a future due_at, then anything with no deadline,
  // dropping rows whose deadline already passed (the dashboard isn't a
  // graveyard for stale assignments — faculty can manage those at
  // /faculty/assignments).
  let assignments: FacultyAssignment[] = [];
  if (user) {
    try {
      const supabaseForReads = await createClient();
      const { data: rows } = await supabaseForReads
        .from("faculty_assignments")
        .select("id, title, due_at")
        .or(`due_at.gte.${now.toISOString()},due_at.is.null`)
        .order("due_at", { ascending: true, nullsFirst: false })
        .limit(3);
      assignments = (rows ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        dueAt: r.due_at,
      }));
    } catch {
      // RLS hit / table not yet migrated → empty list, the card shows the
      // "no homework yet" copy. Don't surface as an error.
      assignments = [];
    }
  }

  return (
    <TodayDashboard
      cards={cards}
      mechanismTitles={mechanismTitles}
      greetingName={greetingName}
      profileId={user?.id ?? "preview"}
      studySystems={studySystems}
      boostCardIds={Array.from(boostCardIds)}
      upcomingGoals={upcomingGoals}
      quote={quote}
      assignments={assignments}
    />
  );
}

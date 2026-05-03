import { redirect } from "next/navigation";

import { readVisibleEvents } from "@/lib/calendar/events";
import { buildBoostCardIds, findActiveExamWindow } from "@/lib/calendar/srs-weighting";
import { extractCards, type Card } from "@/lib/content/cards";
import { readAllChapters } from "@/lib/content/source";
import { gradeFor, parseGradeThresholds } from "@/lib/grading/thresholds";
import { pickRandomQuote } from "@/lib/motivation/quotes";
import { createClient } from "@/lib/supabase/server";

import {
  TodayDashboard,
  type AnnouncementSummary,
  type AttendanceSummary,
  type FacultyAssignment,
  type InboxMessageSummary,
  type MarkSummary,
  type UpcomingGoal,
} from "./today-dashboard";

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
  let announcements: AnnouncementSummary[] = [];
  let inboxMessages: InboxMessageSummary[] = [];
  let attendanceSummary: AttendanceSummary | null = null;
  let recentMarks: MarkSummary[] = [];
  if (user) {
    try {
      const supabaseForReads = await createClient();
      const [assignmentsRes, announcementsRes, messagesRes] = await Promise.all([
        supabaseForReads
          .from("faculty_assignments")
          .select("id, title, due_at, link_url")
          .or(`due_at.gte.${now.toISOString()},due_at.is.null`)
          .order("due_at", { ascending: true, nullsFirst: false })
          .limit(3),
        // Announcements: RLS already filters to status=approved AND
        // (target_batch_ids is empty OR contains the student's
        // batch_id), so the page just reads the most recent few.
        supabaseForReads
          .from("announcements")
          .select("id, title, body, created_at")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(3),
        // Inbox: RLS limits to messages where recipient_id = auth.uid().
        // Surface unread first, then a few read tail entries so the
        // student keeps the trail.
        supabaseForReads
          .from("weak_student_messages")
          .select("id, sender_id, body, sent_at, read_at")
          .eq("recipient_id", user.id)
          .order("sent_at", { ascending: false })
          .limit(5),
      ]);
      assignments = (assignmentsRes.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        dueAt: r.due_at,
        linkUrl: r.link_url,
      }));
      announcements = (announcementsRes.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        createdAt: r.created_at,
      }));
      const rawMessages = messagesRes.data ?? [];
      const senderIds = Array.from(
        new Set(rawMessages.map((m) => m.sender_id).filter((s): s is string => Boolean(s))),
      );
      const senderNameById = new Map<string, string>();
      if (senderIds.length > 0) {
        const { data: senderRows } = await supabaseForReads
          .from("profiles")
          .select("id, full_name, nickname")
          .in("id", senderIds);
        for (const s of senderRows ?? []) {
          senderNameById.set(s.id, s.nickname || s.full_name || "(unknown)");
        }
      }
      inboxMessages = rawMessages.map((m) => ({
        id: m.id,
        senderName: m.sender_id ? (senderNameById.get(m.sender_id) ?? "(unknown)") : "(former HOD)",
        body: m.body,
        sentAt: m.sent_at,
        readAt: m.read_at,
      }));

      // My-attendance + my-marks. RLS lets students read only their own
      // rows so we just SELECT and aggregate. We avoid Postgrest's
      // implicit-join syntax (it requires FK relationships in the
      // generated types and ours don't all have them yet) by issuing
      // separate queries and joining client-side.
      const [{ data: attRows }, { data: codeRows }, { data: profileRow }, { data: markRows }] =
        await Promise.all([
          supabaseForReads
            .from("attendance_records")
            .select("code, class_session_id")
            .eq("student_id", user.id),
          supabaseForReads.from("attendance_codes").select("code, counts_toward_total"),
          supabaseForReads.from("profiles").select("institution_id").eq("id", user.id).single(),
          supabaseForReads
            .from("assignment_marks")
            .select("assignment_id, marks, graded_at")
            .eq("student_id", user.id)
            .order("graded_at", { ascending: false })
            .limit(3),
        ]);

      // Pull session status for the records we have (one batch query).
      const sessionIds = Array.from(new Set((attRows ?? []).map((r) => r.class_session_id))).filter(
        (v): v is string => Boolean(v),
      );
      const { data: sessionRows } = sessionIds.length
        ? await supabaseForReads.from("class_sessions").select("id, status").in("id", sessionIds)
        : { data: [] as Array<{ id: string; status: string }> };
      const sessionStatusById = new Map((sessionRows ?? []).map((s) => [s.id, s.status as string]));

      // Institution settings for threshold + grade cut-offs.
      let threshold = 0.75;
      let gradeThresholds = parseGradeThresholds(null);
      if (profileRow?.institution_id) {
        const { data: instRow } = await supabaseForReads
          .from("institutions")
          .select("attendance_threshold, grade_thresholds")
          .eq("id", profileRow.institution_id)
          .single();
        if (instRow) {
          threshold = Number(instRow.attendance_threshold ?? 0.75);
          gradeThresholds = parseGradeThresholds(instRow.grade_thresholds);
        }
      }

      const countsByCode = new Map<string, boolean>(
        (codeRows ?? []).map((c) => [c.code, c.counts_toward_total]),
      );
      const heldRecords = (attRows ?? []).filter(
        (r) =>
          sessionStatusById.get(r.class_session_id) === "held" && countsByCode.get(r.code) === true,
      );
      // "attended" = anything that counts toward the total minus
      // explicit absents ("A"). Pilot-scale heuristic; we'll add a
      // "kind" column on attendance_codes if the rule needs to grow.
      const attended = heldRecords.filter((r) => r.code.toUpperCase() !== "A").length;
      attendanceSummary = {
        totalCounted: heldRecords.length,
        attended,
        ratio: heldRecords.length === 0 ? null : attended / heldRecords.length,
        threshold,
      };

      const assignmentIdsForMarks = Array.from(
        new Set((markRows ?? []).map((r) => r.assignment_id)),
      ).filter((v): v is string => Boolean(v));
      const { data: assignmentMetaRows } = assignmentIdsForMarks.length
        ? await supabaseForReads
            .from("faculty_assignments")
            .select("id, title, max_marks")
            .in("id", assignmentIdsForMarks)
        : {
            data: [] as Array<{ id: string; title: string; max_marks: number | null }>,
          };
      const metaById = new Map(
        (assignmentMetaRows ?? []).map((a) => [
          a.id,
          { title: a.title, maxMarks: a.max_marks === null ? null : Number(a.max_marks) },
        ]),
      );
      recentMarks = (markRows ?? [])
        .map((m) => {
          const meta = metaById.get(m.assignment_id);
          if (!meta || meta.maxMarks === null || meta.maxMarks <= 0) return null;
          const marksNum = Number(m.marks);
          if (!Number.isFinite(marksNum)) return null;
          const pct = (marksNum / meta.maxMarks) * 100;
          return {
            id: m.assignment_id,
            title: meta.title,
            marks: marksNum,
            maxMarks: meta.maxMarks,
            letter: gradeFor(pct, gradeThresholds),
          };
        })
        .filter((v): v is MarkSummary => v !== null);
    } catch {
      // RLS hit / table not yet migrated → empty lists, cards show the
      // "no items yet" copy. Don't surface as an error.
      assignments = [];
      announcements = [];
      inboxMessages = [];
      attendanceSummary = null;
      recentMarks = [];
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
      announcements={announcements}
      inboxMessages={inboxMessages}
      attendanceSummary={attendanceSummary}
      recentMarks={recentMarks}
    />
  );
}

import { redirect } from "next/navigation";

import { Watermark } from "@/components/watermark";
import { readVisibleEvents } from "@/lib/calendar/events";
import { buildBoostCardIds, findActiveExamWindow } from "@/lib/calendar/srs-weighting";
import {
  applyCardFilters,
  filterByFormat,
  parseDifficultyFilter,
  parsePriorityFilter,
} from "@/lib/content/card-filters";
import { extractCards, type Card, type QuestionFormat } from "@/lib/content/cards";
import { normaliseMechanismId } from "@/lib/content/filters";
import { readAllChapters } from "@/lib/content/source";
import { requireApprovedUser } from "@/lib/auth/approval";
import { createClient } from "@/lib/supabase/server";

import { SessionPlayer } from "./session-player";

export const metadata = {
  title: "Review",
};

type SearchParams = {
  Chapter?: string | string[];
  priority?: string | string[];
  difficulty?: string | string[];
  /**
   * Optional format filter ("descriptive" by default for /review since
   * the session-player UI is text-input-based). Passed by the
   * Chapter-page format picker so a learner who picks "Descriptive"
   * lands on a queue of just descriptive-format cards.
   */
  format?: string | string[];
};

const VALID_FORMATS = new Set<QuestionFormat>(["mcq", "descriptive", "fill_blank"]);
function parseFormatFilter(raw: string | string[] | undefined): QuestionFormat | null {
  if (!raw) return null;
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase().replace(/-/g, "_");
  if (!value) return null;
  return VALID_FORMATS.has(value as QuestionFormat) ? (value as QuestionFormat) : null;
}

/**
 * Review-session entry point. Server-rendered so the card universe is
 * already in the HTML; the client-side session player then reads local
 * card_states from Dexie, assembles the queue, and runs the loop.
 *
 * `?Chapter=<id>` narrows the card universe to a single Chapter so
 * a learner can drill just one topic (wired from the Chapter-detail
 * "Study this Chapter" CTA per build spec §2.3). An unknown or
 * malformed id falls back to the full queue — better to study
 * something than fail closed on a typo.
 *
 * The whole `/review` route is behind middleware-enforced auth
 * (`src/lib/supabase/middleware.ts`), so an anonymous visitor bounces
 * to /login?next=/review before this page even runs. We still re-check
 * the session here because middleware can be a pass-through in envs
 * without Supabase env vars (CI, unconfigured previews) — in those cases
 * we show a graceful placeholder instead of crashing.
 */
export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const mechanismFilter = normaliseMechanismId(resolvedParams.Chapter);
  // J7: priority + difficulty filter chips. Either axis can be a CSV
  // ("must,should") or omitted entirely; null means "no filter on this
  // axis". Drives `applyCardFilters` below — the learner can ask for
  // just must-know foundationals, or any combination, without losing
  // the per-Chapter / per-system filters that already exist.
  const priorityFilter = parsePriorityFilter(resolvedParams.priority);
  const difficultyFilter = parseDifficultyFilter(resolvedParams.difficulty);
  const formatFilter = parseFormatFilter(resolvedParams.format);

  // Approval gate before anything else — unapproved learners bounce
  // to /pending-approval. (app) layout enforces this for /today etc;
  // /review is outside the layout so we re-enforce here.
  await requireApprovedUser();

  // Same graceful posture as the middleware: when Supabase env vars are
  // absent (CI, unconfigured Vercel preview), skip the auth lookup and
  // render the SessionPlayer with a placeholder profile id. The page
  // still works end-to-end locally in those environments, which keeps
  // the E2E suite honest.
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  let userId: string | null = null;
  let studySystems: string[] | null = null;
  if (hasSupabase) {
    try {
      const supabase = await createClient();
      const result = await supabase.auth.getUser();
      userId = result.data.user?.id ?? null;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("study_systems")
          .eq("id", userId)
          .single();
        studySystems = profile?.study_systems ?? null;
      }
    } catch {
      // Supabase unreachable — fall through to the preview id.
    }
    if (!userId) {
      const next = mechanismFilter
        ? `/review?Chapter=${encodeURIComponent(mechanismFilter)}`
        : "/review";
      redirect(`/login?next=${encodeURIComponent(next)}`);
    }
  }

  // Build the card universe from authored content. Frank-Starling lands
  // here today via the Phase 2 loader + C3a parser. As the cohort grows,
  // every file in content/chapters/ automatically contributes cards.
  const mechanisms = await readAllChapters();

  // Apply the per-student "active organ systems" filter (J0). If the
  // learner has narrowed their study scope (e.g., cardiovascular only),
  // exclude mechanisms outside that scope. A `?Chapter=<id>` filter
  // takes precedence — explicit topic intent wins over the general
  // preference. When no preference is set (CI / preview), all systems
  // remain active.
  const filteredMechanisms = studySystems
    ? mechanisms.filter((m) => studySystems!.includes(m.frontmatter.organ_system))
    : mechanisms;

  let cards: Card[] = filteredMechanisms.flatMap(extractCards);
  let focusTitle: string | null = null;

  if (mechanismFilter) {
    const match = mechanisms.find((m) => m.frontmatter.id === mechanismFilter);
    if (match) {
      const filtered = extractCards(match);
      // Only apply the filter when it yields cards — otherwise fall back
      // to the full queue so the learner isn't bounced straight to the
      // empty state on a draft Chapter without a Questions section.
      if (filtered.length > 0) {
        cards = filtered;
        focusTitle = match.frontmatter.title;
      }
    }
  }

  // Apply priority / difficulty filters last. Same fallback posture as
  // the Chapter filter: if the combination yields zero cards we keep
  // the unfiltered list rather than trapping the learner on the empty
  // state. The session-player UI then surfaces "Nothing due" naturally.
  if (priorityFilter || difficultyFilter) {
    const filtered = applyCardFilters(cards, {
      priority: priorityFilter,
      difficulty: difficultyFilter,
    });
    if (filtered.length > 0) cards = filtered;
  }

  // Format filter — applied after priority / difficulty so that a
  // strict format choice doesn't override what the learner asked for
  // on the other axes. Same empty-state fallback: if no cards match,
  // keep the wider deck rather than trap on "no questions found."
  if (formatFilter) {
    const filtered = filterByFormat(cards, formatFilter);
    if (filtered.length > 0) cards = filtered;
  }

  // NOTE: Build spec §2.11 mandates "80 questions served / account / day."
  // A previous version of this page called enforceRateLimit() here —
  // wrong, because it counted /review page loads instead of actual
  // cards rated. A learner who opened /review 80 times without rating
  // anything would get locked out. The correct place to enforce is
  // server-side when the review row is pushed to Supabase (on sync),
  // not when the page renders. Tracked as a pilot-launch item in the
  // author runbook; removing the misfiring check is the safer interim.

  // Build the title-and-organ-system map once at request time so the
  // ReviewHeader can show "Frank-Starling Chapter · Cardiovascular"
  // instead of the kebab-case slug.
  const mechanismTitles: Record<string, { title: string; organSystem: string }> = {};
  for (const m of mechanisms) {
    mechanismTitles[m.frontmatter.id] = {
      title: m.frontmatter.title,
      organSystem: m.frontmatter.organ_system,
    };
  }

  // J7 exam-aware boost: same logic as /today. We don't apply weighting
  // when the learner explicitly drilled into a single Chapter via
  // `?Chapter=…` — that's a deliberate focus and the boost would
  // be a no-op anyway (the queue is already a single Chapter).
  const events = await readVisibleEvents();
  const activeExam = mechanismFilter ? null : findActiveExamWindow(events, new Date());
  const boostCardIds = activeExam
    ? Array.from(buildBoostCardIds(activeExam, filteredMechanisms, cards))
    : [];

  return (
    <>
      <SessionPlayer
        cards={cards}
        profileId={userId ?? "preview"}
        focusMechanism={focusTitle ? { id: mechanismFilter!, title: focusTitle } : null}
        mechanismTitles={mechanismTitles}
        boostCardIds={boostCardIds}
      />
      <Watermark userId={userId} />
    </>
  );
}

import { redirect } from "next/navigation";

import { Watermark } from "@/components/watermark";
import { extractCards, type Card } from "@/lib/content/cards";
import { normaliseMechanismId } from "@/lib/content/filters";
import { readAllMechanisms } from "@/lib/content/source";
import { enforceRateLimit } from "@/lib/rate-limit/enforce";
import { createClient } from "@/lib/supabase/server";

import { SessionPlayer } from "./session-player";

export const metadata = {
  title: "Review",
};

type SearchParams = { mechanism?: string | string[] };

/**
 * Review-session entry point. Server-rendered so the card universe is
 * already in the HTML; the client-side session player then reads local
 * card_states from Dexie, assembles the queue, and runs the loop.
 *
 * `?mechanism=<id>` narrows the card universe to a single mechanism so
 * a learner can drill just one topic (wired from the mechanism-detail
 * "Study this mechanism" CTA per build spec §2.3). An unknown or
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
  const mechanismFilter = normaliseMechanismId(resolvedParams.mechanism);

  // Same graceful posture as the middleware: when Supabase env vars are
  // absent (CI, unconfigured Vercel preview), skip the auth lookup and
  // render the SessionPlayer with a placeholder profile id. The page
  // still works end-to-end locally in those environments, which keeps
  // the E2E suite honest.
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  let userId: string | null = null;
  if (hasSupabase) {
    try {
      const supabase = await createClient();
      const result = await supabase.auth.getUser();
      userId = result.data.user?.id ?? null;
    } catch {
      // Supabase unreachable — fall through to the preview id.
    }
    if (!userId) {
      const next = mechanismFilter
        ? `/review?mechanism=${encodeURIComponent(mechanismFilter)}`
        : "/review";
      redirect(`/login?next=${encodeURIComponent(next)}`);
    }
  }

  // Build the card universe from authored content. Frank-Starling lands
  // here today via the Phase 2 loader + C3a parser. As the cohort grows,
  // every file in content/mechanisms/ automatically contributes cards.
  const mechanisms = await readAllMechanisms();
  let cards: Card[] = mechanisms.flatMap(extractCards);
  let focusTitle: string | null = null;

  if (mechanismFilter) {
    const match = mechanisms.find((m) => m.frontmatter.id === mechanismFilter);
    if (match) {
      const filtered = extractCards(match);
      // Only apply the filter when it yields cards — otherwise fall back
      // to the full queue so the learner isn't bounced straight to the
      // empty state on a draft mechanism without a Questions section.
      if (filtered.length > 0) {
        cards = filtered;
        focusTitle = match.frontmatter.title;
      }
    }
  }

  // Enforce the 80-questions-per-day ceiling (build spec §2.11) before
  // we render the player. A blocked learner still sees an informative
  // screen — not a 429. The limit counts per /review page load, which
  // over-counts slightly (nav away + back without rating costs one);
  // that's conservative in the pilot's favour and will be refined when
  // analytics land.
  if (userId) {
    const supabase = await createClient();
    const rateLimit = await enforceRateLimit(supabase, userId, "reviews");
    if (!rateLimit.allowed) {
      return (
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="font-heading text-2xl font-medium">Daily review limit reached</h1>
          <p className="text-muted-foreground text-sm">
            You&apos;ve worked through {rateLimit.totalToday} reviews today — the daily ceiling
            (build spec §2.11). Come back tomorrow; your streak doesn&apos;t break.
          </p>
          <Watermark userId={userId} />
        </main>
      );
    }
  }

  return (
    <>
      <SessionPlayer
        cards={cards}
        profileId={userId ?? "preview"}
        focusMechanism={focusTitle ? { id: mechanismFilter!, title: focusTitle } : null}
      />
      <Watermark userId={userId} />
    </>
  );
}

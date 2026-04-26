import { redirect } from "next/navigation";

import { extractCards, type Card } from "@/lib/content/cards";
import { normaliseMechanismId } from "@/lib/content/filters";
import { readAllMechanisms } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

import { SelfTestSession } from "./self-test-session";

export const metadata = {
  title: "Self-test session",
};

type SearchParams = {
  mechanism?: string | string[];
};

/**
 * Self-test session entry point. Loads the chosen mechanism's cards
 * server-side, then hands them to the client component for the
 * drill → grade → save loop.
 *
 * Scope is always a single mechanism in v1 (matching /review's
 * `?mechanism=…` filter). System-wide self-test was considered and
 * deferred — without a way to slice "10 representative cards from
 * the system", a 70-card session would be more useful as exam mode
 * (timed MCQ) than as deliberate practice.
 *
 * Same auth posture as /review: middleware enforces sign-in for
 * any authenticated route. We re-check here in case we're running
 * in a CI / preview env without Supabase env vars, in which case we
 * use the "preview" placeholder profile.
 */
export default async function SelfTestSessionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const mechanismFilter = normaliseMechanismId(resolved.mechanism);
  if (!mechanismFilter) {
    redirect("/self-test");
  }

  const mechanisms = await readAllMechanisms();
  const target = mechanisms.find((m) => m.frontmatter.id === mechanismFilter);
  if (!target) {
    redirect("/self-test");
  }
  const cards: Card[] = extractCards(target);
  if (cards.length === 0) {
    redirect("/self-test");
  }

  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  let userId: string | null = null;
  if (hasSupabase) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    } catch {
      userId = null;
    }
    if (!userId) {
      redirect(
        `/login?next=${encodeURIComponent(`/self-test/session?mechanism=${mechanismFilter}`)}`,
      );
    }
  }

  return (
    <SelfTestSession
      cards={cards}
      profileId={userId ?? "preview"}
      focusMechanism={{ id: target.frontmatter.id, title: target.frontmatter.title }}
    />
  );
}

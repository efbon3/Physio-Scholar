import { redirect } from "next/navigation";

import { extractFacts, FACT_CATEGORIES, type Fact, type FactCategory } from "@/lib/content/facts";
import { normaliseMechanismId } from "@/lib/content/filters";
import { readAllMechanisms } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

import { FactsSession } from "./facts-session";

export const metadata = {
  title: "Facts session",
};

type SearchParams = {
  mechanism?: string | string[];
  category?: string | string[];
};

/**
 * Facts session entry. Loads the chosen mechanism's facts (optionally
 * filtered to a single category) server-side, then hands them to the
 * client component for the flashcard loop.
 *
 * Same auth posture as /self-test — middleware enforces sign-in;
 * we re-check here so CI / preview envs without Supabase env vars
 * fall back to the "preview" placeholder profile.
 */
export default async function FactsSessionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const mechanismId = normaliseMechanismId(resolved.mechanism);
  const rawCategory = Array.isArray(resolved.category) ? resolved.category[0] : resolved.category;
  const categoryFilter: FactCategory | null =
    rawCategory && (FACT_CATEGORIES as readonly string[]).includes(rawCategory)
      ? (rawCategory as FactCategory)
      : null;

  if (!mechanismId) redirect("/facts");

  const mechanisms = await readAllMechanisms();
  const target = mechanisms.find((m) => m.frontmatter.id === mechanismId);
  if (!target) redirect("/facts");

  let facts: Fact[] = extractFacts(target);
  if (categoryFilter) {
    facts = facts.filter((f) => f.category === categoryFilter);
  }
  if (facts.length === 0) redirect("/facts");

  // Note: shuffle happens client-side inside FactsSession so the server
  // render remains pure (no Date.now() during render). The client can
  // freely randomise on mount without breaking React 19's purity rule.

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
      const next = `/facts/session?mechanism=${encodeURIComponent(mechanismId)}${categoryFilter ? `&category=${categoryFilter}` : ""}`;
      redirect(`/login?next=${encodeURIComponent(next)}`);
    }
  }

  return (
    <FactsSession
      facts={facts}
      profileId={userId ?? "preview"}
      mechanism={{ id: target.frontmatter.id, title: target.frontmatter.title }}
      categoryFilter={categoryFilter}
    />
  );
}

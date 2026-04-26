import { extractCards } from "@/lib/content/cards";
import { readAllMechanisms } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

import { TopicsOverview } from "./topics-overview";

export const metadata = {
  title: "Topics",
};

/**
 * Topics overview — mechanisms classified by progress bucket
 * (in-progress / completed / not-started). Replaces the need for a
 * learner to dig into /progress for a per-mechanism view; this page
 * answers "what should I do next?" at the topic granularity.
 *
 * Server-side we load the authored mechanism universe + the learner's
 * profile id; the bucket classification runs client-side from Dexie
 * so it reflects local card_states even when offline. That mirrors
 * the same pattern /today and /progress use.
 */
export default async function TopicsPage() {
  const mechanisms = await readAllMechanisms();
  const cards = mechanisms.flatMap(extractCards);

  const mechanismMeta: Record<string, { title: string; organSystem: string }> = {};
  for (const m of mechanisms) {
    mechanismMeta[m.frontmatter.id] = {
      title: m.frontmatter.title,
      organSystem: m.frontmatter.organ_system,
    };
  }

  let profileId = "preview";
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      profileId = data.user?.id ?? "preview";
    } catch {
      // Fall through to preview id.
    }
  }

  return <TopicsOverview cards={cards} mechanismMeta={mechanismMeta} profileId={profileId} />;
}

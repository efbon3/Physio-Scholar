import { redirect } from "next/navigation";

import { extractCards, type Card } from "@/lib/content/cards";
import { readAllMechanisms } from "@/lib/content/fs";
import { createClient } from "@/lib/supabase/server";

import { SessionPlayer } from "./session-player";

export const metadata = {
  title: "Review",
};

/**
 * Review-session entry point. Server-rendered so the card universe is
 * already in the HTML; the client-side session player then reads local
 * card_states from Dexie, assembles the queue, and runs the loop.
 *
 * The whole `/review` route is behind middleware-enforced auth
 * (`src/lib/supabase/middleware.ts`), so an anonymous visitor bounces
 * to /login?next=/review before this page even runs. We still re-check
 * the session here because middleware can be a pass-through in envs
 * without Supabase env vars (CI, unconfigured previews) — in those cases
 * we show a graceful placeholder instead of crashing.
 */
export default async function ReviewPage() {
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
    if (!userId) redirect("/login?next=/review");
  }

  // Build the card universe from authored content. Frank-Starling lands
  // here today via the Phase 2 loader + C3a parser. As the cohort grows,
  // every file in content/mechanisms/ automatically contributes cards.
  const mechanisms = await readAllMechanisms();
  const cards: Card[] = mechanisms.flatMap(extractCards);

  return <SessionPlayer cards={cards} profileId={userId ?? "preview"} />;
}

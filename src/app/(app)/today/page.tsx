import { redirect } from "next/navigation";

import { extractCards, type Card } from "@/lib/content/cards";
import { readAllMechanisms } from "@/lib/content/fs";
import { createClient } from "@/lib/supabase/server";

import { TodayDashboard } from "./today-dashboard";

export const metadata = {
  title: "Today",
};

/**
 * Today dashboard — post-login landing per build spec §2.3.
 *   - Greeting
 *   - Review queue count (client-driven because Dexie lives in the browser)
 *   - Primary action: "Start review"
 *
 * Placeholders for streak, weak area, clinical challenge (§2.3) — those
 * need data we don't have until Phase 5's progress work lands. Shipping
 * the shell now so the nav + landing flow feels right.
 */
async function getUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

export default async function TodayPage() {
  const user = await getUser();
  if (!user && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    redirect("/login?next=/today");
  }

  const mechanisms = await readAllMechanisms();
  const cards: Card[] = mechanisms.flatMap(extractCards);

  return <TodayDashboard cards={cards} email={user?.email ?? null} />;
}

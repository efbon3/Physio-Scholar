import { redirect } from "next/navigation";

import { normaliseMechanismId } from "@/lib/content/filters";
import { readAllMechanisms } from "@/lib/content/source";
import { extractValues, type Value } from "@/lib/content/values";
import { createClient } from "@/lib/supabase/server";

import { ValuesSession } from "./values-session";

export const metadata = {
  title: "Values session",
};

type SearchParams = {
  mechanism?: string | string[];
};

/**
 * Values drill entry. Loads the chosen mechanism's values server-side
 * and hands them to the client component for the flashcard loop.
 */
export default async function ValuesSessionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const mechanismId = normaliseMechanismId(resolved.mechanism);
  if (!mechanismId) redirect("/values");

  const mechanisms = await readAllMechanisms();
  const target = mechanisms.find((m) => m.frontmatter.id === mechanismId);
  if (!target) redirect("/values");

  const values: Value[] = extractValues(target);
  if (values.length === 0) redirect("/values");

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
      redirect(`/login?next=${encodeURIComponent(`/values/session?mechanism=${mechanismId}`)}`);
    }
  }

  return (
    <ValuesSession
      values={values}
      profileId={userId ?? "preview"}
      mechanism={{ id: target.frontmatter.id, title: target.frontmatter.title }}
    />
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { extractCards } from "@/lib/content/cards";
import { filterByFormat, filterPublished } from "@/lib/content/card-filters";
import { readMechanismById } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

import { FillBlankSession } from "./fill-blank-session";

export const metadata = {
  title: "Fill in the blank",
};

type Params = { params: Promise<{ mechanism: string }> };

/** Same graceful posture as the rest of the app: skip Supabase in unconfigured envs. */
async function getProfileId(nextPath: string): Promise<string> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return "preview";
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
    return data.user.id;
  } catch {
    return "preview";
  }
}

export default async function FillBlankSessionPage({ params }: Params) {
  const { mechanism: id } = await params;
  const mechanism = await readMechanismById(id);
  if (!mechanism) notFound();

  const profileId = await getProfileId(`/test/${id}/fill-blank`);

  const allCards = extractCards(mechanism);
  const cards = filterByFormat(filterPublished(allCards), "fill_blank");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <nav className="text-muted-foreground text-xs">
        <Link
          href={`/systems/${mechanism.frontmatter.organ_system}/${id}`}
          className="underline-offset-2 hover:underline"
        >
          ← Back to mechanism
        </Link>
      </nav>
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Fill in the blank</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {mechanism.frontmatter.title}
        </h1>
      </header>

      {cards.length === 0 ? (
        <p className="text-muted-foreground text-sm leading-relaxed">
          No fill-in-the-blank questions have been authored for this mechanism yet. Once a question
          with <code>**Format:** fill_blank</code> lands in the markdown, it&apos;ll appear here.
        </p>
      ) : (
        <FillBlankSession
          cards={cards}
          mechanismId={id}
          mechanismSystem={mechanism.frontmatter.organ_system}
          profileId={profileId}
        />
      )}
    </main>
  );
}

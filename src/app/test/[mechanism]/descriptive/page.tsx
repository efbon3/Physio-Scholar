import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { extractCards } from "@/lib/content/cards";
import { filterByFormat, filterPublished } from "@/lib/content/card-filters";
import { readMechanismById } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

import { DescriptiveSession } from "./descriptive-session";

export const metadata = {
  title: "Descriptive",
};

type Params = { params: Promise<{ mechanism: string }> };

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

export default async function DescriptiveSessionPage({ params }: Params) {
  const { mechanism: id } = await params;
  const mechanism = await readMechanismById(id);
  if (!mechanism) notFound();

  const profileId = await getProfileId(`/test/${id}/descriptive`);

  const allCards = extractCards(mechanism);
  const cards = filterByFormat(filterPublished(allCards), "descriptive");

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
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Descriptive</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {mechanism.frontmatter.title}
        </h1>
      </header>

      {cards.length === 0 ? (
        <p className="text-muted-foreground text-sm leading-relaxed">
          No descriptive questions have been authored for this mechanism yet. Once a question with{" "}
          <code>**Format:** descriptive</code> lands in the markdown, it&apos;ll appear here.
        </p>
      ) : (
        <DescriptiveSession
          cards={cards}
          mechanismId={id}
          mechanismSystem={mechanism.frontmatter.organ_system}
          profileId={profileId}
        />
      )}
    </main>
  );
}

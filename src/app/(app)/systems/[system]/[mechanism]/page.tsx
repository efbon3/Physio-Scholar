import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ChapterRenderer } from "@/components/content/mechanism-renderer";
import { readAllChapters, readChapterById } from "@/lib/content/source";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ system: string; mechanism: string }> };

export async function generateStaticParams() {
  const mechanisms = await readAllChapters();
  return mechanisms.map((m) => ({
    system: m.frontmatter.organ_system,
    mechanism: m.frontmatter.id,
  }));
}

export async function generateMetadata({ params }: Params) {
  const { mechanism: id } = await params;
  const m = await readChapterById(id);
  return { title: m?.frontmatter.title ?? "Chapter not found" };
}

/** Same graceful posture as the middleware: skip Supabase in unconfigured envs. */
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

export default async function ChapterPage({ params }: Params) {
  const { system, mechanism: id } = await params;
  const chapter = await readChapterById(id);

  // 404 cleanly if the Chapter id doesn't exist OR if the URL's
  // system slug doesn't match the Chapter's actual system — prevents
  // "renal/frank-starling" from rendering as if it were a renal topic.
  if (!chapter || chapter.frontmatter.organ_system !== system) {
    notFound();
  }

  const profileId = await getProfileId(`/systems/${system}/${id}`);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <nav className="text-muted-foreground text-xs">
        <Link href="/systems" className="underline-offset-2 hover:underline">
          Assessment
        </Link>
        {" / "}
        <Link href={`/systems#${system}`} className="capitalize underline-offset-2 hover:underline">
          {system}
        </Link>
      </nav>
      <ChapterRenderer chapter={chapter} profileId={profileId} />
    </main>
  );
}

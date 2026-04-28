import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ChapterEditor } from "../../mechanism-editor";

export const metadata = {
  title: "Edit chapter · Admin",
};

type Params = { params: Promise<{ id: string }> };

const VALID_ID = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/**
 * Edit an existing CMS-authored Chapter. FS-only mechanisms are not
 * editable here — the list page's "Clone to CMS" button creates a DB
 * row first, then the admin edits that.
 */
export default async function EditMechanismPage({ params }: Params) {
  const { id } = await params;
  if (!VALID_ID.test(id)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_chapters")
    .select("id, markdown, status")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-10">
        <p className="text-destructive text-sm">Failed to load: {error.message}</p>
        <Link href="/admin/content" className="text-xs underline-offset-2 hover:underline">
          Back to content list
        </Link>
      </main>
    );
  }

  if (!data) notFound();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Admin · Content</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Edit — {data.id}</h1>
          <p className="text-muted-foreground text-sm">
            Changes save immediately. Set status to <span className="font-medium">Published</span>{" "}
            when you&apos;re ready to show this to learners.
          </p>
        </div>
        <a
          href={`/admin/content/${encodeURIComponent(data.id)}/export`}
          className="hover:bg-muted rounded-md border px-3 py-1.5 text-xs"
          title="Download the current CMS markdown as a .md file for git / backup"
        >
          Export as .md
        </a>
      </header>

      <ChapterEditor
        mode="update"
        initialMarkdown={data.markdown}
        initialStatus={data.status}
        expectedId={data.id}
      />
    </main>
  );
}

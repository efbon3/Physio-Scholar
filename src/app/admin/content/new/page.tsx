import { readChapterById } from "@/lib/content/fs";
import { CHAPTER_TEMPLATE } from "@/lib/content/templates";

import { ChapterEditor } from "../mechanism-editor";

export const metadata = {
  title: "New chapter · Admin",
};

type SearchParams = { clone?: string };

/**
 * New Chapter form.
 *
 * If `?clone=<id>` is present, we seed the editor with the markdown of
 * that filesystem Chapter — useful for "fork this .md file into the
 * CMS so the team can edit it without touching git." The clone path
 * reads only from the filesystem source; the dual loader logic doesn't
 * apply here because DB-authored mechanisms are already editable.
 */
export default async function NewChapterPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { clone } = await searchParams;

  let initialMarkdown = CHAPTER_TEMPLATE;
  let clonedFrom: string | null = null;
  if (clone) {
    const source = await readChapterById(clone);
    if (source) {
      // We can't just read the parsed Chapter — we need the raw
      // markdown text. Re-open from disk in the loader module isn't
      // exposed, so for the clone path we reconstruct from layers
      // plus frontmatter using gray-matter upstream. For simplicity,
      // do the raw read here.
      initialMarkdown = await readRawMechanism(clone);
      clonedFrom = clone;
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Admin · Content</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {clonedFrom ? `Clone from ${clonedFrom}` : "New chapter"}
        </h1>
        {clonedFrom ? (
          <p className="text-muted-foreground text-sm">
            Starting from the filesystem file <code>{clonedFrom}.md</code>. Save to create a CMS row
            that will override the file.
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Edit the template below. The id in the frontmatter becomes the URL slug — keep it
            kebab-case and unique.
          </p>
        )}
      </header>

      <ChapterEditor mode="create" initialMarkdown={initialMarkdown} initialStatus="draft" />
    </main>
  );
}

async function readRawMechanism(id: string): Promise<string> {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const path = join(process.cwd(), "content", "mechanisms", `${id}.md`);
  return readFile(path, "utf8");
}

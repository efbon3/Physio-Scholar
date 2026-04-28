import matter from "gray-matter";

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
 * that filesystem Chapter — useful for "fork these .md files into the
 * CMS so the team can edit without touching git."
 *
 * The clone reads via `readChapterById`, which routes through the
 * filesystem loader's merge logic (fs.ts:mergeChapterFiles). For a
 * chapter authored across multiple suffix files (e.g. ch01-foo.md +
 * ch01-foo-fillblank.md + ch01-foo-descriptive.md), the returned
 * Chapter has the merged body — all questions from all formats,
 * renumbered sequentially. Serialising that back through gray-matter
 * gives a single canonical .md document the CMS row can hold without
 * losing any of the suffix files' content.
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
      // gray-matter's stringify(body, data) emits frontmatter + body
      // as a complete .md document. The merged Chapter's frontmatter
      // is the canonical shape (id, title, organ_system, etc.), so
      // the resulting markdown round-trips cleanly through
      // `parseChapter` when the CMS row is read at render time.
      initialMarkdown = matter.stringify(source.body, source.frontmatter);
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

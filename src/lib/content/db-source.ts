import { createClient } from "@/lib/supabase/server";

import { parseChapter, type Chapter } from "./loader";

/**
 * Supabase-backed chapter source.
 *
 * CMS-authored chapters land in `public.content_chapters` as full
 * markdown text (frontmatter + body). At render time, the
 * dual-source loader in `./source.ts` asks this module for published
 * rows first, then layers the filesystem markdown underneath for any
 * id the DB doesn't cover.
 *
 * Why a separate module: keeps the pure filesystem path (`./fs.ts`)
 * importable without pulling in Supabase. The tests exercise the fs
 * reader directly; the full app uses the composed loader.
 *
 * All functions here fail gracefully when Supabase env vars are absent
 * — CI + unconfigured previews get an empty DB set and the filesystem
 * reader owns the whole content universe.
 */

/**
 * Read every published chapter out of the DB, parsed.
 * Returns [] when Supabase is unconfigured or unreachable. Parse errors
 * on a specific row are logged but don't abort the whole load — one
 * malformed DB row shouldn't nuke the Assessment page.
 */
export async function readPublishedChaptersFromDb(): Promise<Chapter[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("content_chapters")
    .select("id, markdown")
    .eq("status", "published");

  if (error || !data) return [];

  const parsed: Chapter[] = [];
  for (const row of data) {
    try {
      const chapter = parseChapter(row.markdown);
      // Defence: frontmatter's id field must match the DB key. If they
      // disagree, skip the row — but log loudly so the mismatch gets
      // noticed in Vercel logs instead of the row just vanishing from
      // /systems with no diagnostic.
      if (chapter.frontmatter.id !== row.id) {
        console.warn(
          `[content/db-source] Skipping chapter: DB id "${row.id}" does not match frontmatter id "${chapter.frontmatter.id}". Edit the row in /admin/content and align them.`,
        );
        continue;
      }
      parsed.push(chapter);
    } catch (err) {
      // Malformed DB row — log, don't crash.
      console.error(`Failed to parse DB chapter ${row.id}`, err);
    }
  }
  return parsed;
}

/** Read one chapter from the DB by id, or null if absent / unpublished. */
export async function readPublishedChapterByIdFromDb(id: string): Promise<Chapter | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("content_chapters")
    .select("id, markdown")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;

  try {
    const chapter = parseChapter(data.markdown);
    if (chapter.frontmatter.id !== data.id) {
      console.warn(
        `[content/db-source] Chapter "${data.id}" requested, but frontmatter id is "${chapter.frontmatter.id}". Falling back to filesystem.`,
      );
      return null;
    }
    return chapter;
  } catch (err) {
    console.error(`Failed to parse DB chapter ${id}`, err);
    return null;
  }
}

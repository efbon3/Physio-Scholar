import { readPublishedChapterByIdFromDb, readPublishedChaptersFromDb } from "./db-source";
import { readAllChapters as readAllFromFs, readChapterById as readFromFsById } from "./fs";
import type { Chapter } from "./loader";

/**
 * Dual-source chapter loader. This is the module the app's server
 * components should import.
 *
 * Ordering:
 *   1. Read every published row from public.content_mechanisms (DB).
 *   2. Read every `.md` file from content/chapters/ (filesystem).
 *   3. Merge by id — DB wins when both exist.
 *   4. Sort by title for deterministic Assessment-tab rendering.
 *
 * Filesystem chapters and CMS-authored rows compose: a published DB
 * row with a matching id wins over the file. This keeps repo-based
 * content working unchanged while letting authors edit through the
 * admin UI without git access.
 */

export async function readAllChapters(): Promise<Chapter[]> {
  const [fromDb, fromFs] = await Promise.all([readPublishedChaptersFromDb(), readAllFromFs()]);
  const byId = new Map<string, Chapter>();
  for (const m of fromFs) byId.set(m.frontmatter.id, m);
  for (const m of fromDb) byId.set(m.frontmatter.id, m); // DB overrides fs
  return [...byId.values()].sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}

export async function readChapterById(id: string): Promise<Chapter | null> {
  // DB first. A published DB row wins over an fs file of the same id.
  const fromDb = await readPublishedChapterByIdFromDb(id);
  if (fromDb) return fromDb;
  return readFromFsById(id);
}

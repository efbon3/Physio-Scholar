import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { parseChapter, splitLayers, type Chapter } from "./loader";

/**
 * Defense-in-depth: the caller (a dynamic route) should be passing a
 * sanitised id, but since the value comes from a URL param we also
 * validate the shape here. Only kebab-case [a-z0-9-] — matches the
 * `mechanismIdSchema` in schema.ts. A mismatch means the id is either
 * malformed (return 404-worthy null) or adversarial (same outcome,
 * no filesystem touch).
 */
const VALID_ID = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/**
 * Directory holding author-authored Chapter markdown files.
 * Resolved from the project root so it works the same in `next dev`,
 * `next build`, and when read from server components on Vercel.
 */
const CHAPTERS_DIR = join(process.cwd(), "content", "chapters");

/**
 * Server-only helpers. These import `node:fs/promises`, which would
 * explode in the browser bundle — never call them from a "use client"
 * component or from the middleware. Next.js catches the misuse at
 * build time thanks to the `node:*` protocol.
 */

/** Read + parse every `.md` file in content/chapters/. */
export async function readAllChapters(): Promise<Chapter[]> {
  const entries = await readdir(CHAPTERS_DIR, { withFileTypes: true });
  const markdownFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => e.name);

  const parsed = await Promise.all(
    markdownFiles.map(async (name) => {
      const raw = await readFile(join(CHAPTERS_DIR, name), "utf8");
      // Pass the basename (sans `.md`) so chapter-format files derive
      // their id from the filename instead of the chapter title — the
      // URL slug must equal the filename for `/systems/<sys>/<id>`
      // routing to find `<id>.md` on disk.
      return parseChapter(raw, name.replace(/\.md$/, ""));
    }),
  );

  const merged = mergeChapterFiles(parsed);
  // Stable sort by title so the Systems tab is deterministic.
  return merged.sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}

/** Read + parse one Chapter by id, or return null if absent. */
export async function readChapterById(id: string): Promise<Chapter | null> {
  // Reject anything that isn't a valid kebab-case id before touching
  // the filesystem. Blocks `..`, `/`, `\`, absolute paths, etc.
  if (!VALID_ID.test(id)) return null;
  // Routes through `readAllChapters` so the chapter-merge logic
  // applies — a request for the primary id of a merged chapter
  // returns the union of its constituent files. Reading every file
  // for a single page is fine while the content directory is small;
  // cache + index later if it grows large.
  const all = await readAllChapters();
  return all.find((m) => m.frontmatter.id === id) ?? null;
}

/**
 * Merge chapter-format files that share a `chapter:` frontmatter into
 * a single Chapter. Two files with identical chapter titles (e.g.
 * `ch01-intro-and-homeostasis.md` for MCQs and
 * `ch01-intro-and-homeostasis-fillblank.md` for fill-blanks) become
 * one row in `/systems` with a fully-populated format picker —
 * matching the UI's design intent that one Chapter carries all
 * three test formats.
 *
 * Mergeability is keyed on `frontmatter.title` (which the chapter
 * parser sets to the verbatim `chapter:` field). Canonical Chapter
 * files have unique titles by design, so they pass through
 * untouched.
 *
 * Primary selection (whose id becomes the merged URL): the file
 * whose id lacks a recognised format suffix (`-mcq`, `-fillblank`,
 * `-descriptive`) wins. With multiple unsuffixed or zero unsuffixed
 * files, the lex-shortest id wins as tiebreaker. This keeps URLs
 * stable when an extra format file lands later.
 *
 * Question indices are renumbered sequentially across the merged
 * body (1..N) so card ids of the form `${chapter_id}:${index}`
 * stay unique. The question-block ordering in the merged body is:
 * primary's questions first, then extras in lex-id order.
 */
function mergeChapterFiles(mechanisms: Chapter[]): Chapter[] {
  const groups = new Map<string, Chapter[]>();
  for (const m of mechanisms) {
    const key = m.frontmatter.title;
    const arr = groups.get(key);
    if (arr) arr.push(m);
    else groups.set(key, [m]);
  }

  const result: Chapter[] = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }
    result.push(mergeOneGroup(group));
  }
  return result;
}

const FORMAT_SUFFIXES = ["-mcq", "-fillblank", "-descriptive"];
function hasFormatSuffix(id: string): boolean {
  return FORMAT_SUFFIXES.some((s) => id.endsWith(s));
}

function mergeOneGroup(group: readonly Chapter[]): Chapter {
  // Pick primary: prefer files without a format suffix, lex-shortest
  // tiebreaker. Sort places primary first.
  const sorted = [...group].sort((a, b) => {
    const aSuf = hasFormatSuffix(a.frontmatter.id);
    const bSuf = hasFormatSuffix(b.frontmatter.id);
    if (aSuf !== bSuf) return aSuf ? 1 : -1;
    return a.frontmatter.id.localeCompare(b.frontmatter.id);
  });
  const primary = sorted[0];

  // Concatenate question sections from primary + extras, renumber
  // `## Question N` headings sequentially so card ids stay unique
  // under the primary's chapter_id namespace.
  const questionSections = sorted
    .map((m) => m.layers.questions)
    .filter((s): s is string => typeof s === "string" && s.length > 0)
    .join("\n\n");
  let counter = 0;
  const renumbered = questionSections.replace(/^##\s+Question\s+\d+\s*$/gim, () => {
    counter += 1;
    return `## Question ${counter}`;
  });

  // Rebuild the body. Chapter-format files only ever populate
  // `# Questions` (no Layer 1-4, no Sources), so the merged body is
  // just the consolidated questions section under that heading.
  // Canonical Chapter files don't merge — they're filtered upstream
  // by the unique-title invariant.
  const mergedBody = `# Questions\n\n${renumbered}\n`;
  return {
    frontmatter: primary.frontmatter,
    body: mergedBody,
    layers: splitLayers(mergedBody),
    // Take the primary's topics (the unsuffixed MCQ file's `## Pass`
    // groupings). Fillblank / descriptive variants have their own pass
    // groupings that describe question shape rather than chapter
    // content, so they're discarded during merge.
    topics: primary.topics,
  };
}

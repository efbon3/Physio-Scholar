import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { parseChapter, splitLayers, type Chapter } from "./loader";

/**
 * Pre-PG content loader — parallel to `fs.ts` but reads from
 * `content/prepg/` instead of `content/chapters/`. Pre-PG content is
 * authored in the same chapter-format markdown as the curriculum,
 * just with MCQ-shape questions only and optional `**Year:** /
 * **Exam:**` metadata per question.
 *
 * The output is the same `Chapter` type the curriculum loader returns,
 * so downstream UI code (FormatPicker, McqSession, etc.) can render
 * Pre-PG chapters with no special-casing — the only thing that
 * differs is which Dexie table the session writes ratings to.
 */

const VALID_ID = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const PREPG_DIR = join(process.cwd(), "content", "prepg");

/**
 * Read + parse every `.md` file in `content/prepg/`. Returns [] when
 * the directory is empty (the .gitkeep file is filtered out by the
 * `.md` extension check).
 *
 * Multiple files belonging to the same chapter title are merged into
 * one Pre-PG mechanism, same as the curriculum loader does. In
 * practice Pre-PG authoring is one file per chapter, so the merge
 * is a pass-through, but the symmetry keeps the loader pair clean.
 */
export async function readAllPrepgChapters(): Promise<Chapter[]> {
  let entries;
  try {
    entries = await readdir(PREPG_DIR, { withFileTypes: true });
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return [];
    throw err;
  }
  const markdownFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => e.name);
  if (markdownFiles.length === 0) return [];

  const parsed = await Promise.all(
    markdownFiles.map(async (name) => {
      const raw = await readFile(join(PREPG_DIR, name), "utf8");
      return parseChapter(raw, name.replace(/\.md$/, ""));
    }),
  );

  return mergePrepgFiles(parsed).sort((a, b) =>
    a.frontmatter.title.localeCompare(b.frontmatter.title),
  );
}

/** Read + parse one Pre-PG chapter by id, or null if absent. */
export async function readPrepgChapterById(id: string): Promise<Chapter | null> {
  if (!VALID_ID.test(id)) return null;
  const all = await readAllPrepgChapters();
  return all.find((m) => m.frontmatter.id === id) ?? null;
}

/**
 * Same merge rule as the curriculum loader (`fs.ts:mergeChapterFiles`):
 * group by `frontmatter.title`, pick the lex-shortest unsuffixed id
 * as primary, concatenate question sections, renumber sequentially.
 * Pre-PG chapters typically arrive as one file each, so this is
 * effectively a pass-through, but keeping the parity means future
 * authoring patterns (e.g. splitting a long chapter across two files
 * by year-range) Just Work.
 */
function mergePrepgFiles(chapters: Chapter[]): Chapter[] {
  const groups = new Map<string, Chapter[]>();
  for (const m of chapters) {
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

function mergeOneGroup(group: readonly Chapter[]): Chapter {
  const sorted = [...group].sort((a, b) => a.frontmatter.id.localeCompare(b.frontmatter.id));
  const primary = sorted[0];
  const questionSections = sorted
    .map((m) => m.layers.questions)
    .filter((s): s is string => typeof s === "string" && s.length > 0)
    .join("\n\n");
  let counter = 0;
  const renumbered = questionSections.replace(/^##\s+Question\s+\d+\s*$/gim, () => {
    counter += 1;
    return `## Question ${counter}`;
  });
  const mergedBody = `# Questions\n\n${renumbered}\n`;
  return {
    frontmatter: primary.frontmatter,
    body: mergedBody,
    layers: splitLayers(mergedBody),
  };
}

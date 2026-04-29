import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import { isAuthorChapterFrontmatter, mapPartToOrganSystem } from "./chapter-parser";
import { parseChapter, splitLayers, type Chapter } from "./loader";

/**
 * Learning content loader — reads chapter-format markdown files from
 * `content/learning/` and exposes them as `Chapter` objects. Unlike
 * the Assessment / Pre-PG paths, Learning files have no Questions
 * section: their body is just the four reading layers (Layer 1 Core,
 * Layer 2 Working, Layer 3 Deep Dive, Layer 4 Clinical Integration).
 *
 * Two authoring shapes are accepted:
 *
 *   - Author shape (preferred): `chapter:` and `part:` frontmatter,
 *     plus optional `tier`, `status`, etc. The id is derived from the
 *     filename, the title from `chapter`, the organ_system from
 *     `part`. Body is passed through unchanged so `splitLayers`
 *     extracts the four reading layers cleanly.
 *
 *   - Canonical shape: full `ChapterFrontmatter` with `id`, `title`,
 *     `organ_system`, etc. Routed through `parseChapter` directly.
 *
 * The Learning module is purely read-only — no SRS, no question
 * extraction. It exists alongside Assessment/Pre-PG so a learner can
 * read the underlying notes for a chapter without it being
 * inter-mixed with test sessions.
 */

const KEBAB_ID = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const LEARNING_DIR = join(process.cwd(), "content", "learning");

/**
 * Loose author-shape schema. Strictly less than
 * `authorChapterFrontmatterSchema` in chapter-parser.ts because
 * Learning files don't need tier/target_count/source-list metadata —
 * those describe a question bank's authoring discipline, not a
 * reading note.
 */
const learningAuthorSchema = z.object({
  chapter: z.string().min(1),
  part: z.string().min(1),
  status: z.enum(["draft", "review", "published", "retired"]).default("draft"),
  author: z.string().optional(),
  reviewer: z.string().optional(),
  version: z.string().optional(),
});

/** Read + parse every `.md` file in `content/learning/`. */
export async function readAllLearningChapters(): Promise<Chapter[]> {
  let entries;
  try {
    entries = await readdir(LEARNING_DIR, { withFileTypes: true });
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return [];
    throw err;
  }
  const markdownFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => e.name);
  if (markdownFiles.length === 0) return [];

  const parsed: Chapter[] = [];
  for (const name of markdownFiles) {
    const raw = await readFile(join(LEARNING_DIR, name), "utf8");
    const filenameId = name.replace(/\.md$/, "");
    const chapter = parseLearningFile(raw, filenameId);
    if (chapter) parsed.push(chapter);
  }
  return parsed.sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}

/** Read + parse one Learning chapter by id, or null if absent. */
export async function readLearningChapterById(id: string): Promise<Chapter | null> {
  if (!KEBAB_ID.test(id)) return null;
  try {
    const raw = await readFile(join(LEARNING_DIR, `${id}.md`), "utf8");
    return parseLearningFile(raw, id);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return null;
    throw err;
  }
}

/**
 * Parse one Learning markdown file into a `Chapter`. Detects the
 * authoring shape and routes appropriately:
 *
 *   - canonical (frontmatter has `id`): defer to `parseChapter` —
 *     same code path the Assessment loader uses
 *   - author (chapter + part, no id): build minimal canonical
 *     frontmatter from the filename + chapter + part, pass body
 *     through unchanged
 *   - anything else: return null (silently skipped at the loader
 *     level so a malformed file doesn't crash the whole list page)
 */
function parseLearningFile(raw: string, filenameId: string): Chapter | null {
  if (!KEBAB_ID.test(filenameId)) return null;
  const parsed = matter(raw);

  // Author shape — chapter + part + no id.
  if (isAuthorChapterFrontmatter(parsed.data)) {
    const meta = learningAuthorSchema.safeParse(parsed.data);
    if (!meta.success) return null;
    let organSystem;
    try {
      organSystem = mapPartToOrganSystem(meta.data.part);
    } catch {
      return null;
    }
    const body = parsed.content;
    return {
      frontmatter: {
        id: filenameId,
        title: meta.data.chapter,
        organ_system: organSystem,
        nmc_competencies: [],
        exam_patterns: ["mbbs"],
        prerequisites: [],
        related_chapters: [],
        blooms_distribution: { remember: 25, understand: 25, apply: 25, analyze: 25 },
        author: meta.data.author ?? "pending",
        reviewer: meta.data.reviewer ?? "pending",
        status: meta.data.status,
        version: meta.data.version ?? "0.1",
        published_date: new Date(),
        last_reviewed: new Date(),
      },
      body,
      layers: splitLayers(body),
    };
  }

  // Canonical shape — defer to the existing parser. parseChapter
  // returns a fully-validated Chapter or throws on malformed input;
  // wrap in try/catch so one bad file doesn't take out the whole page.
  try {
    return parseChapter(raw, filenameId);
  } catch {
    return null;
  }
}

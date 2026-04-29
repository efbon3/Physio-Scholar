import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Server-only reader for `docs/syllabus.md` — the canonical chapter-wise
 * topic distribution for the syllabus. The file is the author's reference
 * "what does each chapter cover", and the Assessment list page surfaces
 * its `####` section headings underneath each chapter so learners can
 * see the topics covered without having to open the chapter.
 *
 * Structure of `docs/syllabus.md` (only the lines this parser cares about):
 *
 *   ### Chapter 1. Introduction to Physiology and Homeostasis
 *
 *   #### The scope and methods of physiology
 *   - bullet
 *
 *   #### The internal environment
 *   - bullet
 *
 *   ### Chapter 2. The Cell as the Functional Unit
 *
 *   #### The plasma membrane
 *   ...
 *
 * The parser collects each `#### ...` heading underneath the most recent
 * `### Chapter N. ...` heading into a per-chapter list, keyed by the
 * integer chapter number. Chapter ids in `content/chapters/` follow the
 * `chNN-...` convention so callers can derive the chapter number from
 * the id and look up its topics.
 */

const SYLLABUS_PATH = join(process.cwd(), "docs", "syllabus.md");

/** Loaded and parsed map: chapter number → ordered list of topic titles. */
let cache: Map<number, string[]> | null = null;

/**
 * Read + parse `docs/syllabus.md`. Returns a map keyed by chapter
 * number; each value is the ordered list of `####` topic titles that
 * appear under that chapter's `### Chapter N. ...` heading. The file
 * is read once per server process and memoised in module scope —
 * the dev server picks up edits on next build, which matches how
 * other content under `content/` and `docs/` is treated.
 */
export async function readSyllabusTopics(): Promise<Map<number, string[]>> {
  if (cache) return cache;
  let raw: string;
  try {
    raw = await readFile(SYLLABUS_PATH, "utf8");
  } catch {
    // Missing syllabus file is not a hard error — the page degrades to
    // showing chapter titles without topics. Useful in CI sandboxes /
    // unit tests where the doc may not be available.
    cache = new Map();
    return cache;
  }
  cache = parseSyllabus(raw);
  return cache;
}

/** Test helper — drop the in-memory cache so the next call re-reads. */
export function __resetSyllabusCacheForTests(): void {
  cache = null;
}

/**
 * Parse the syllabus markdown into the chapter-number → topics map.
 * Exported for unit testing without the filesystem dependency.
 */
export function parseSyllabus(raw: string): Map<number, string[]> {
  const result = new Map<number, string[]>();
  const lines = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n").split("\n");

  let currentChapter: number | null = null;
  let insideFence = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) continue;

    const chapterMatch = line.match(/^###\s+Chapter\s+(\d+)\.\s+/);
    if (chapterMatch) {
      currentChapter = parseInt(chapterMatch[1], 10);
      if (!result.has(currentChapter)) result.set(currentChapter, []);
      continue;
    }

    if (currentChapter === null) continue;

    const topicMatch = line.match(/^####\s+(.+?)\s*$/);
    if (topicMatch) {
      const title = topicMatch[1].trim();
      if (title.length > 0) result.get(currentChapter)!.push(title);
    }
  }

  return result;
}

/**
 * Extract the chapter number embedded in a chapter id like
 * `ch01-introduction-and-homeostasis` → `1`. Returns null when the id
 * doesn't follow the `chNN-...` convention.
 */
export function chapterNumberFromId(id: string): number | null {
  const m = id.match(/^ch(\d+)(?:-|$)/);
  if (!m) return null;
  return parseInt(m[1], 10);
}

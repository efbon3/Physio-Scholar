import { z } from "zod";

import { chapterFrontmatterSchema, type ChapterFrontmatter, type OrganSystem } from "./schema";

/**
 * Chapter-format adapter. The platform's canonical content unit is a
 * "Chapter" — one focused topic, frontmatter + four reading layers
 * + a Questions section. The author also produces "chapter" files
 * (one chapter of the master syllabus, 20+ MCQs covering several
 * sections of physiology), which use a richer authoring schema.
 *
 * Rather than maintain two parsers downstream, this module detects
 * the chapter format from the frontmatter shape and transforms it
 * into the Chapter shape in memory. The returned `Chapter` is
 * indistinguishable from one parsed from a hand-authored Chapter
 * file: same `frontmatter`, same `body`, same `layers.questions`
 * shape — `extractCards()` walks it and produces `Card[]` exactly as
 * for a regular Chapter.
 *
 * Chapter authoring format (sample at content/chapters/
 * ch01-introduction-and-homeostasis.md):
 *
 *   ---
 *   chapter: Chapter 1 — Introduction to Physiology and Homeostasis
 *   part: Part I — Foundations of Physiology
 *   tier: 1
 *   tier_rationale: ...
 *   target_count: 22
 *   actual_count: 22
 *   sources_consulted: [Guyton..., Costanzo..., ...]
 *   status: draft
 *   ---
 *
 *   # Chapter N — MCQs
 *   (optional preamble paragraph)
 *
 *   ## Pass 1 — ...
 *
 *   QUESTION 1
 *   Type: recall
 *   Bloom's level: remember
 *
 *   Stem: ...
 *
 *   Correct answer: ...
 *
 *   Distractors:
 *   - "wrong A" — Reveals misconception: ...
 *   - "wrong B" — Plausible but does not reveal a specific misconception ...
 *   - "wrong C" — Reveals misconception: ...
 *
 *   Explanation: ...
 *
 *   Hints:
 *   1. ...
 *   2. ...
 *   3. ...
 *
 *   ---
 *
 *   QUESTION 2
 *   ...
 *
 *   ## Pass 2 — ...
 *   QUESTION N ...
 *
 *   # Final Summary
 *   (author notes, sources summary — stripped)
 *
 * The transformer:
 *   - Derives `id` from `chapter` (e.g. "Chapter 1 — Introduction to
 *     Physiology and Homeostasis" → "ch01-introduction-and-homeostasis").
 *   - Maps `part` → `organ_system` (e.g. "Part I — Foundations of
 *     Physiology" → "foundations").
 *   - Defaults `nmc_competencies`, `prerequisites`, `related_chapters`
 *     to empty; defaults `exam_patterns` to ["mbbs"]; defaults
 *     `blooms_distribution` to even split (re-derives from question
 *     levels if any are present).
 *   - Strips `## Pass N — ...` headings, the optional preamble, and the
 *     `# Final Summary` section.
 *   - Transforms each `QUESTION N` block to a `## Question N` block
 *     with the platform's `**Label:**` shape and the strict
 *     misconception-mapping line format.
 *   - Wraps the resulting question blocks under a `# Questions`
 *     top-level heading so the Chapter loader's `splitLayers()`
 *     can find them.
 */

/** Chapter-file frontmatter shape. */
const authorChapterFrontmatterSchema = z.object({
  chapter: z.string().min(1),
  part: z.string().min(1),
  tier: z
    .union([z.number().int().min(1).max(3), z.literal(1), z.literal(2), z.literal(3)])
    .optional(),
  tier_rationale: z.string().optional(),
  target_count: z.number().int().nonnegative().optional(),
  actual_count: z.number().int().nonnegative().optional(),
  sources_consulted: z.array(z.string()).optional(),
  author: z.string().optional(),
  reviewer: z.string().optional(),
  status: z.enum(["draft", "review", "published", "retired"]).default("draft"),
  version: z.string().optional(),
});

export type AuthorChapterFrontmatter = z.infer<typeof authorChapterFrontmatterSchema>;

/**
 * Detect chapter-format frontmatter. Heuristic: has `chapter` and
 * `part` keys, and no `id` (id presence is the signal for the
 * canonical Chapter format).
 */
export function isAuthorChapterFrontmatter(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return typeof d.chapter === "string" && typeof d.part === "string" && !("id" in d);
}

/**
 * Transform chapter-format frontmatter + body into the Chapter
 * shape. Throws if the frontmatter or the body don't match the
 * documented chapter format.
 *
 * `filenameHint` is the basename of the source file (without `.md`).
 * When provided and shaped like a kebab-case slug, it overrides the
 * chapter-title-derived id. This guarantees the on-disk filename and
 * the Chapter id always agree, which is what the URL routing relies
 * on (`/systems/<system>/<id>` resolves by reading `<id>.md`). When
 * absent (DB rows, in-memory tests), the chapter title is slugified
 * as before.
 */
export function parseAuthorChapter(
  data: unknown,
  body: string,
  filenameHint?: string,
): { frontmatter: ChapterFrontmatter; body: string } {
  const cf = authorChapterFrontmatterSchema.parse(data);
  const id = pickId(filenameHint, cf.chapter);
  const organ_system = mapPartToOrganSystem(cf.part);
  const transformedBody = transformBody(body);

  const frontmatter: ChapterFrontmatter = chapterFrontmatterSchema.parse({
    id,
    title: cf.chapter,
    organ_system,
    nmc_competencies: [],
    exam_patterns: ["mbbs"],
    prerequisites: [],
    related_chapters: [],
    blooms_distribution: { remember: 25, understand: 25, apply: 25, analyze: 25 },
    author: cf.author ?? "pending",
    reviewer: cf.reviewer ?? "pending",
    status: cf.status,
    version: cf.version ?? "0.1",
    published_date: new Date(),
    last_reviewed: new Date(),
  });

  return { frontmatter, body: transformedBody };
}

/**
 * Pick the id for a chapter Chapter. Filename wins when it's a
 * valid kebab-case slug (URL routing reads `<id>.md`, so id and
 * filename must agree). Falls back to slugifying the chapter title
 * when no filename is available.
 */
const KEBAB_ID = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
function pickId(filenameHint: string | undefined, chapterField: string): string {
  if (filenameHint && KEBAB_ID.test(filenameHint)) return filenameHint;
  return deriveChapterId(chapterField);
}

/**
 * Slugify the chapter title to a kebab-case id. Output looks like
 * `ch01-introduction-and-homeostasis`.
 *
 * Pattern: extract the chapter number, prepend `ch{NN}-`, then
 * slugify the rest of the title. Em-dashes / en-dashes / hyphens
 * collapse to single hyphens.
 */
export function deriveChapterId(chapterField: string): string {
  // "Chapter 1 — Introduction to Physiology and Homeostasis"
  const m = chapterField.match(/^Chapter\s+(\d+)\s*[—–-]\s*(.+)$/i);
  if (m) {
    const num = m[1].padStart(2, "0");
    const slug = slugify(m[2]);
    return `ch${num}-${slug}`;
  }
  // Fallback: slugify the whole title.
  return slugify(chapterField);
}

/**
 * Map a `part` field value to an `organ_system` token. Canonical
 * mapping per `docs/syllabus.md`. Throws if the part doesn't match
 * any known syllabus part — better to fail loudly during content
 * load than to mis-tag a chapter as cardiovascular when it isn't.
 */
export function mapPartToOrganSystem(partField: string): OrganSystem {
  const norm = partField.toLowerCase().replace(/\s+/g, " ").trim();
  if (/part\s+i\b.*foundations/.test(norm)) return "foundations";
  if (/part\s+ii\b.*excitable/.test(norm)) return "musculoskeletal";
  // Author's curriculum-bank uses "Part II — Neurophysiology" as a
  // single grouping for nervous-system chapters (ch10+); the syllabus
  // splits this into Part III. Map to the same `nervous` token either
  // way so /systems renders both spellings under one section.
  if (/part\s+ii\b.*neurophysiology/.test(norm)) return "nervous";
  if (/part\s+iii\b.*nervous/.test(norm)) return "nervous";
  // Author's curriculum-bank uses "Part III — Blood and Immunity" for
  // ch16-19; the syllabus calls this Part IV. Map to the same `blood`
  // token regardless of the Roman numeral.
  if (/part\s+iii\b.*blood/.test(norm)) return "blood";
  if (/part\s+iv\b.*blood/.test(norm)) return "blood";
  if (/part\s+v\b.*cardiovascular/.test(norm)) return "cardiovascular";
  if (/part\s+vi\b.*respiratory/.test(norm)) return "respiratory";
  if (/part\s+vii\b.*renal/.test(norm)) return "renal";
  if (/part\s+viii\b.*gastro/.test(norm)) return "gastrointestinal";
  if (/part\s+ix\b.*endocrine/.test(norm)) return "endocrine";
  if (/part\s+x\b.*reproduct/.test(norm)) return "reproductive";
  if (/part\s+xi\b.*integrative/.test(norm)) return "integrated";
  throw new Error(
    `Unknown syllabus part "${partField}" — could not map to organ_system. ` +
      `Update src/lib/content/chapter-parser.ts:mapPartToOrganSystem if the syllabus changed.`,
  );
}

/**
 * Transform the chapter body into a Chapter body. The output has
 * exactly one top-level section, `# Questions`, containing the
 * questions transformed to platform shape.
 */
function transformBody(raw: string): string {
  // 1. Normalise CRLF → LF and strip a leading UTF-8 BOM so that
  //    files saved by Notepad / PowerShell parse the same as
  //    files saved by VS Code on Linux.
  // 2. Drop the optional `# Chapter N — MCQs` heading and any preamble
  //    paragraph between it and the first `## Pass` heading.
  // 3. Drop `## Pass N — …` group headings; their grouping is meta
  //    information for the author and doesn't survive into the runtime.
  // 4. Drop the trailing `# Final Summary` section if present — it is
  //    author meta-notes, not student-facing content.
  // 5. Walk the rest splitting on `\n---\n` separators, identify each
  //    chunk that opens with `QUESTION <n>`, transform to a `##
  //    Question <n>` block.
  const normalised = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const stripped = stripFinalSummary(normalised);
  const blocks = stripped.split(/\n-{3,}\n/);
  const transformedQuestions: string[] = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (trimmed.length === 0) continue;
    if (/^#\s+Chapter\b/im.test(trimmed) && !/QUESTION\s+\d+/.test(trimmed)) continue;
    if (/^##\s+Pass\b/im.test(trimmed) && !/QUESTION\s+\d+/.test(trimmed)) continue;

    const transformed = transformQuestionBlock(trimmed);
    if (transformed) transformedQuestions.push(transformed);
  }
  if (transformedQuestions.length === 0) return "# Questions\n\n";
  return ["# Questions\n", ...transformedQuestions].join("\n\n");
}

function stripFinalSummary(raw: string): string {
  const m = raw.match(/^#\s+Final\s+Summary\s*$/im);
  if (!m || m.index === undefined) return raw;
  return raw.slice(0, m.index).trimEnd();
}

/**
 * Transform a single `QUESTION N` block into a `## Question N`
 * block with bold-labeled fields. Detects the shape and dispatches:
 *   - `Canonical answer:` present → fill-blank
 *   - `Model answer:` present → descriptive (free-text + self-rated)
 *   - otherwise (`Correct answer:` + `Distractors:`) → MCQ
 *
 * Returns null if the block doesn't begin with a recognisable
 * QUESTION heading (e.g. a `## Pass N` block on its own).
 */
function transformQuestionBlock(block: string): string | null {
  const headingMatch = block.match(/^QUESTION\s+(\d+)\s*$/im);
  if (!headingMatch) return null;
  const number = headingMatch[1];
  if (/^Canonical answer:/im.test(block)) {
    return transformFillBlankBlock(block, number);
  }
  if (/^Model answer:/im.test(block)) {
    return transformDescriptiveBlock(block, number);
  }
  return transformMcqBlock(block, number);
}

/**
 * Common shared bits: Type, Bloom's, Priority, Difficulty, Stem,
 * Hints. Returned as a partial line list ready to be appended to in
 * each format-specific transformer.
 */
function buildCommonHeader(block: string, number: string): string[] {
  const get = (label: string): string | null => extractLineField(block, label);
  const type = get("Type");
  const blooms = get("Bloom's level") ?? get("Bloom's Level");
  // Priority and Difficulty live on the question block in two
  // shapes the author uses interchangeably:
  //   - canonical:  `Priority: must`         /  `Difficulty: foundational`
  //   - shorthand:  `Priority (M / S / G): m` /  `Difficulty (F / I / A): f`
  // The shorthand form (single letter) maps to the canonical token
  // before being emitted, so cards.ts's enum normaliser sees a value
  // it already recognises.
  const priority = mapPriorityShorthand(
    get("Priority (M / S / G)") ?? get("Priority (M/S/G)") ?? get("Priority"),
  );
  const difficulty = mapDifficultyShorthand(
    get("Difficulty (F / I / A)") ?? get("Difficulty (F/I/A)") ?? get("Difficulty"),
  );
  const lines: string[] = [];
  lines.push(`## Question ${number}`);
  lines.push(`**Status:** published`);
  if (type) lines.push(`**Type:** ${type}`);
  if (blooms) lines.push(`**Bloom's level:** ${blooms}`);
  if (priority) lines.push(`**Priority:** ${priority}`);
  if (difficulty) lines.push(`**Difficulty:** ${difficulty}`);
  return lines;
}

function transformMcqBlock(block: string, number: string): string {
  const lines = buildCommonHeader(block, number);
  // Insert `**Format:**` after the shared header but before the
  // status-prefixed lines for readability — the platform tolerates
  // any order, but author-shaped output is easier to skim.
  lines.splice(1, 0, `**Format:** mcq`);

  const stem = extractMultilineField(block, "Stem");
  const correct = extractMultilineField(block, "Correct answer");
  const explanation = extractMultilineField(block, "Explanation");
  const distractors = extractListField(block, "Distractors");
  const hints = extractListField(block, "Hints");
  // Optional Pre-PG metadata. Authored on past-exam MCQs as
  // `**Year:** 2018` and `**Exam:** NEET-PG`. Pass through to
  // cards.ts which lands them on the Card schema as optional fields.
  const year = extractLineField(block, "Year");
  const exam = extractLineField(block, "Exam");

  if (year) lines.push(`**Year:** ${year}`);
  if (exam) lines.push(`**Exam:** ${exam}`);
  if (stem) lines.push(`**Stem:** ${stem}`);
  if (correct) lines.push(`**Correct answer:** ${correct}`);
  if (explanation) lines.push(`**Elaborative explanation:** ${explanation}`);

  if (hints.length > 0) {
    lines.push("");
    lines.push("### Hint Ladder");
    hints.forEach((h, i) => lines.push(`${i + 1}. ${h}`));
  }

  if (distractors.length > 0) {
    lines.push("");
    lines.push("### Misconception Mappings");
    for (const d of distractors) {
      const m = parseDistractorLine(d);
      if (m) lines.push(`- Wrong answer: "${m.wrong}" -> Misconception: ${m.description}`);
    }
  }

  return lines.join("\n");
}

function transformFillBlankBlock(block: string, number: string): string {
  const lines = buildCommonHeader(block, number);
  lines.splice(1, 0, `**Format:** fill_blank`);

  const stem = extractMultilineField(block, "Stem");
  const canonical = extractMultilineField(block, "Canonical answer");
  const explanation = extractMultilineField(block, "Explanation");
  const variants = extractListField(block, "Accepted variants");
  const hints = extractListField(block, "Hints");
  const toleranceRaw = extractLineField(block, "Tolerance");
  const tolerance = formatToleranceForChapter(canonical, toleranceRaw);
  const unit = inferUnit(canonical);

  if (stem) lines.push(`**Stem:** ${stem}`);
  if (canonical) lines.push(`**Correct answer:** ${canonical}`);
  // Acceptable answers: pipe-separated, each variant quoted to allow
  // pipes inside values. Filter out the canonical form duplicated as
  // a variant — cards.ts's grader already accepts the canonical, and
  // duplicating it just adds noise.
  if (variants.length > 0) {
    const filtered = variants.filter((v) => v !== canonical);
    if (filtered.length > 0) {
      lines.push(`**Acceptable answers:** ${filtered.map((v) => `"${v}"`).join(" | ")}`);
    }
  }
  if (unit) lines.push(`**Unit:** ${unit}`);
  if (tolerance) lines.push(`**Tolerance:** ${tolerance}`);
  if (explanation) lines.push(`**Elaborative explanation:** ${explanation}`);

  if (hints.length > 0) {
    lines.push("");
    lines.push("### Hint Ladder");
    hints.forEach((h, i) => lines.push(`${i + 1}. ${h}`));
  }

  // Yellow conditions are intentionally dropped — the platform's
  // grader (`gradeFillBlank`) computes Yellow algorithmically (right
  // value/wrong unit, near-tolerance miss). Per-question authored
  // Yellow feedback messages can be re-introduced when there's
  // evidence the algorithmic version is too generic.
  return lines.join("\n");
}

function transformDescriptiveBlock(block: string, number: string): string {
  const lines = buildCommonHeader(block, number);
  lines.splice(1, 0, `**Format:** descriptive`);

  const stem = extractMultilineField(block, "Stem");
  const model = extractMultilineField(block, "Model answer");
  const explanation = extractMultilineField(block, "Elaborative explanation");
  const checklist = extractMultilineField(block, "Self-grading checklist");
  const misconceptions = extractMultilineField(block, "Common misconceptions");
  const hints = extractListField(block, "Hints");

  if (stem) lines.push(`**Stem:** ${stem}`);
  if (model) lines.push(`**Correct answer:** ${model}`);
  if (explanation) lines.push(`**Elaborative explanation:** ${explanation}`);

  if (hints.length > 0) {
    lines.push("");
    lines.push("### Hint Ladder");
    hints.forEach((h, i) => lines.push(`${i + 1}. ${h}`));
  }

  // Self-grading checklist is a multi-paragraph rubric (Green /
  // Yellow / Red criteria) — emit as a `### Self-Grading Checklist`
  // subsection so cards.ts's section-based extractor can grab the
  // whole block. A `**Label:**` line would terminate at the first
  // blank line and lose the Yellow/Red paragraphs.
  if (checklist) {
    lines.push("");
    lines.push("### Self-Grading Checklist");
    lines.push(checklist);
  }

  // Common misconceptions: a list of "wrong-mental-model" → correction
  // pairs the author identified. Surfaced in the descriptive reveal
  // screen so a learner can spot a misalignment in their own answer
  // even when their self-rating is correct. Multi-line markup, so use
  // the `### Common Misconceptions` subsection treatment for the same
  // reason as the checklist.
  if (misconceptions) {
    lines.push("");
    lines.push("### Common Misconceptions");
    lines.push(misconceptions);
  }

  return lines.join("\n");
}

/**
 * Convert a chapter-format Tolerance string into the percent form the
 * platform's grader expects. Three cases:
 *   - "not applicable" / "n/a" → null (no tolerance, exact match)
 *   - "±5%" / "5%" → emitted as "±5%"
 *   - absolute (e.g., "±10 percentage points", "±0.5 °C", "±5 mmol/L")
 *     → converted to percent of the canonical answer's numeric value
 *
 * The grader interprets `tolerance_pct` as a fraction of the
 * canonical's numeric value, so absolute → percent conversion
 * preserves the author's intended grading window. Returns null if
 * either value lacks a numeric component to anchor the conversion.
 */
export function formatToleranceForChapter(
  canonicalRaw: string | null,
  toleranceRaw: string | null,
): string | null {
  if (!toleranceRaw) return null;
  const lower = toleranceRaw.trim().toLowerCase();
  if (lower.length === 0) return null;
  if (lower.startsWith("not applicable") || lower === "n/a" || lower === "na") {
    return null;
  }
  // Match the first numeric token plus an optional trailing % so we
  // can tell "±5%" (already a percent) from "±10 percentage points
  // (range 50–70%)" (absolute, where the trailing % is just prose).
  const tolMatch = toleranceRaw.match(/([\d.]+)(%?)/);
  if (!tolMatch) return null;
  const tolNum = Number.parseFloat(tolMatch[1]);
  if (!Number.isFinite(tolNum)) return null;
  // Already a percent — pass through.
  if (tolMatch[2] === "%") return `±${tolNum}%`;
  // Absolute → convert to percent using the canonical's numeric value.
  if (!canonicalRaw) return null;
  const canMatch = canonicalRaw.match(/[\d.]+/);
  if (!canMatch) return null;
  const canNum = Number.parseFloat(canMatch[0]);
  if (!Number.isFinite(canNum) || canNum === 0) return null;
  const pct = (tolNum / Math.abs(canNum)) * 100;
  // Two decimal places keeps the emitted value readable while
  // preserving enough resolution for clinically narrow windows
  // (pH 7.4 ± 0.05 → 0.68%, not 1%).
  return `±${pct.toFixed(2)}%`;
}

/**
 * Pull the unit string out of a canonical answer like "5.6 L/min" or
 * "37.0 °C". Returns null when the answer is purely numeric or
 * categorical ("two-thirds", "homeostasis"). Only the trailing unit
 * tokens are extracted — the leading numeric portion is dropped.
 */
function inferUnit(canonicalRaw: string | null): string | null {
  if (!canonicalRaw) return null;
  // Match: optional sign, digits with optional decimal, a separator,
  // then the unit token (letters, slashes, °, µ, % allowed inside).
  const m = canonicalRaw.match(/^\s*[−\-+]?[\d.]+\s+([^\s].*?)\s*$/);
  if (!m) return null;
  const unit = m[1].trim();
  // Skip purely-parenthetical "(textbook range)" type tails.
  if (unit.startsWith("(")) return null;
  // Skip prose that snuck through (e.g. "to physiology"); a unit is
  // typically a short token.
  if (unit.length > 16 || /\s/.test(unit)) return null;
  return unit;
}

/**
 * Pull a single-line `Label: value` from a question block.
 * Single-line fields are: Type, Bloom's level.
 */
function extractLineField(block: string, label: string): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^${escaped}:\\s*(.+)$`, "im");
  const m = block.match(re);
  return m ? m[1].trim() : null;
}

/**
 * Pull a possibly-multiline `Label: value` from a question block.
 * Multiline fields span all three chapter shapes:
 *   - MCQ:        Stem, Correct answer, Explanation
 *   - Fill-blank: Stem, Canonical answer, Explanation
 *   - Descriptive: Stem, Model answer, Elaborative explanation,
 *                  Self-grading checklist, Common misconceptions
 *
 * The stop-list lookahead unions all known field labels so an
 * extracted multiline value can never run past the next field. New
 * shapes need their distinguishing labels added here.
 */
function extractMultilineField(block: string, label: string): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // End-of-string anchor: JS regex has no `\z`, and `$` with the `m`
  // flag matches end-of-line — which would terminate a multi-paragraph
  // value (like the descriptive Self-grading checklist) at the first
  // line break. Use `(?![\s\S])` instead — a negative lookahead for
  // any character, true only at the end of input.
  const re = new RegExp(
    `^${escaped}:\\s*([\\s\\S]+?)(?=\\n\\s*(?:Type|Bloom's level|Bloom's Level|Stem|Correct answer|Canonical answer|Accepted variants|Tolerance|Yellow conditions|Distractors|Model answer|Elaborative explanation|Self-grading checklist|Common misconceptions|Explanation|Hints|Year|Exam):|(?![\\s\\S]))`,
    "im",
  );
  const m = block.match(re);
  return m ? m[1].trim() : null;
}

/**
 * Pull a bullet-list field (`Distractors:`, `Hints:`) from a
 * question block. Returns the raw content of each list item, in
 * order. Distractors use `- ` markers; Hints use `1.` numbered
 * markers — both shapes are accepted here so the same helper drives
 * both extractions.
 *
 * Implementation: walk the block line-by-line. Once we see the
 * label header, collect every subsequent list-shaped line. Stop on
 * a blank line or any line that is neither a list item nor part of
 * the previous item. (Earlier versions used a lazy regex with a
 * lookahead, but the lookahead was too conservative around line
 * boundaries — non-greedy `[\s\S]+?` would terminate after the
 * first item when it shouldn't have.)
 */
function extractListField(block: string, label: string): string[] {
  const lines = block.split(/\r?\n/);
  const headerNorm = `${label}:`.toLowerCase();
  let inList = false;
  let seenItem = false;
  const items: string[] = [];
  for (const line of lines) {
    if (!inList) {
      if (line.trim().toLowerCase() === headerNorm) inList = true;
      continue;
    }
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      // Blank line. If we've already started consuming items, this
      // ends the list. If we haven't yet (prettier sometimes inserts
      // a blank line between the label and the first bullet), keep
      // scanning.
      if (seenItem) break;
      continue;
    }
    const m = line.match(/^\s*(?:-\s+|\d+\.\s+)(.+)$/);
    if (m) {
      items.push(m[1].trim());
      seenItem = true;
      continue;
    }
    // Not a list line and not blank — must be the next field's
    // header, so stop.
    break;
  }
  return items;
}

/**
 * Map a Priority shorthand to its canonical token. Accepts:
 *   - single-letter shorthand: m / s / g
 *   - full names: must / should / good (and the synonyms cards.ts
 *     accepts: essential / core / expected / optional / bonus)
 * Returns null when the input is missing — the chapter file may
 * legitimately omit Priority on a per-question basis.
 */
function mapPriorityShorthand(raw: string | null): string | null {
  if (raw === null) return null;
  const lower = raw.trim().toLowerCase();
  if (lower.length === 0) return null;
  if (lower === "m") return "must";
  if (lower === "s") return "should";
  if (lower === "g") return "good";
  // Full word — pass through; cards.ts's normaliser handles synonyms.
  return lower;
}

/**
 * Map a Difficulty shorthand to its canonical token. Accepts:
 *   - single-letter shorthand: f / i / a
 *   - full names: foundational / standard / advanced (and the
 *     synonyms cards.ts accepts: easy / intermediate / hard)
 *
 *   "i" maps to "standard" — the chapter shorthand uses "I" for
 *   "Intermediate," which is the spec's synonym for "standard."
 */
function mapDifficultyShorthand(raw: string | null): string | null {
  if (raw === null) return null;
  const lower = raw.trim().toLowerCase();
  if (lower.length === 0) return null;
  if (lower === "f") return "foundational";
  if (lower === "i") return "standard";
  if (lower === "a") return "advanced";
  return lower;
}

/**
 * Parse a single Distractor list line. Two shapes accepted:
 *   - `"answer" — Reveals misconception: <text>. Correction: <text>.`
 *   - `"answer" — Plausible but does not reveal a specific misconception (...).`
 * Both use the em-dash / en-dash / ASCII hyphen as the separator
 * between the wrong-answer-quote and the description.
 *
 * Returns null when the line doesn't fit either shape — that line is
 * silently skipped at the parse layer rather than dropping the whole
 * block.
 */
export function parseDistractorLine(line: string): { wrong: string; description: string } | null {
  // Quote variants: straight (") or curly (" / "); content can contain
  // anything except a closing quote of the same kind.
  const m = line.match(/^["“]([^"”]+)["”]\s*[—–-]+\s*(.+)$/);
  if (!m) return null;
  return { wrong: m[1].trim(), description: m[2].trim() };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

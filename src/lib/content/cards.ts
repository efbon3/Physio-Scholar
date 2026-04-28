import { z } from "zod";

import type { Chapter } from "./loader";

/**
 * Card extraction — pulls the structured question bank out of the
 * `# Questions` section of a Chapter markdown. Matches SOP Appendix A
 * exactly; a mismatch means the content is malformed and we surface a
 * clear error rather than silently skip.
 *
 * A Card is the unit the SRS schedules and the review UI displays.
 * Its id is `{chapter_id}:{index}` (index is 1-based from
 * "## Question N"), deterministic across rebuilds so SRS history
 * survives content edits that don't reorder the question bank.
 */

/** Bloom's taxonomy levels we actually use in v1. */
export const bloomsLevelSchema = z.enum(["remember", "understand", "apply", "analyze"]);
export type BloomsLevel = z.infer<typeof bloomsLevelSchema>;

/**
 * How a question is rendered and graded.
 *
 *   - mcq:         four-option multiple choice; deterministic grading;
 *                  misconception-keyed feedback on wrong choices.
 *   - descriptive: free-text answer; student self-rates Green/Yellow/Red
 *                  against the model answer after a 5s reveal delay.
 *   - fill_blank:  short answer (value, term, phrase); deterministic
 *                  grading via acceptable_answers + tolerance + unit;
 *                  partial-credit feedback for unit-error and near-miss.
 *
 * Default when omitted: "descriptive". Authored per question via
 * `**Format:** mcq` (or `descriptive` / `fill_blank`).
 */
export const questionFormatSchema = z.enum(["mcq", "descriptive", "fill_blank"]);
export type QuestionFormat = z.infer<typeof questionFormatSchema>;

/**
 * Question lifecycle.
 *
 *   - published: live in test sessions, contributing to SRS state.
 *   - retired:   tombstoned — kept in markdown for audit and review
 *                history, excluded from new test sessions. Retire is
 *                the SRS-safe alternative to deletion when a question
 *                is wrong, replaced, or otherwise out of circulation.
 *                See content_production_sop.md §6.3 for the cosmetic-
 *                vs-material edit rule that drives retirement.
 *
 * Default when omitted: "published".
 */
export const questionStatusSchema = z.enum(["published", "retired"]);
export type QuestionStatus = z.infer<typeof questionStatusSchema>;

/**
 * Pedagogic priority — how essential the question is to mastery of the
 * Chapter. Drives adaptive ordering (must-know surfaces first, then
 * should-know, then good-to-know) and curriculum-coverage analytics.
 *
 *   - must:   foundational facts the learner cannot omit
 *   - should: standard expectations of a competent learner
 *   - good:   bonus depth — interesting, not required
 *
 * Default when omitted: "should". Authored per question via
 * `**Priority:** must` (or `should` / `good`).
 */
export const priorityLevelSchema = z.enum(["must", "should", "good"]);
export type PriorityLevel = z.infer<typeof priorityLevelSchema>;

/**
 * Difficulty band — how hard the question is to answer correctly,
 * independent of pedagogic priority. A "must / advanced" question is
 * legitimate and useful (a foundational concept tested at high
 * cognitive depth). Used for adaptive pacing — the queue can
 * front-load foundational items before advancing.
 *
 *   - foundational: a learner first encountering the topic should manage
 *   - standard:     average difficulty for this level of training
 *   - advanced:     challenging even for a well-prepared learner
 *
 * Default when omitted: "standard". Authored per question via
 * `**Difficulty:** foundational` (or `standard` / `advanced`).
 */
export const difficultyLevelSchema = z.enum(["foundational", "standard", "advanced"]);
export type DifficultyLevel = z.infer<typeof difficultyLevelSchema>;

export const misconceptionSchema = z.object({
  /** The incorrect answer string, as written. */
  wrong_answer: z.string().min(1),
  /** Why it's wrong — the mental-model correction. */
  description: z.string().min(1),
});
export type Misconception = z.infer<typeof misconceptionSchema>;

export const cardSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+:\d+$/),
  chapter_id: z.string().min(1),
  index: z.number().int().min(1),
  /**
   * Stable per-question identifier intended to survive renumbering,
   * Chapter file renames, and retire-and-replace flows. Optional
   * during the transition from `{Chapter}:{index}` ids — once the
   * SRS keys migrate to UUID this field becomes the canonical id.
   * Authored per question via `**ID:** <uuid>`.
   */
  uuid: z.string().uuid().optional(),
  /** Render and grading mode — see `questionFormatSchema`. Defaults to "descriptive". */
  format: questionFormatSchema,
  /** Lifecycle — see `questionStatusSchema`. Defaults to "published". */
  status: questionStatusSchema,
  type: z.string().min(1),
  blooms_level: bloomsLevelSchema,
  /** Pedagogic priority — see `priorityLevelSchema`. Defaults to "should". */
  priority: priorityLevelSchema,
  /** Difficulty band — see `difficultyLevelSchema`. Defaults to "standard". */
  difficulty: difficultyLevelSchema,
  stem: z.string().min(1),
  correct_answer: z.string().min(1),
  elaborative_explanation: z.string().min(1),
  /** Three tiers per build spec §2.5, but drafts may have fewer. */
  hints: z.array(z.string().min(1)).max(3),
  misconceptions: z.array(misconceptionSchema),
  /**
   * Exam patterns a card is appropriate for — drives the exam-mode
   * filter (MBBS vs pre-PG per build spec §2.11). Authored either
   * per-card via `**Exam patterns:** mbbs, pre-pg` or inherited from
   * the Chapter frontmatter. Stored lowercased + trimmed here.
   */
  exam_patterns: z.array(z.string().min(1)),
  /**
   * Fill-blank only: alternative strings the grader accepts as
   * Green-grade. Authored as `**Acceptable answers:** "form A" | "form B"`.
   * Quotes around each variant disambiguate values containing pipes.
   */
  acceptable_answers: z.array(z.string().min(1)).optional(),
  /**
   * Fill-blank only: the expected unit (e.g. "L/min", "mmHg"). Used to
   * separate Yellow (right value, wrong unit) from Red (wrong value).
   * Authored as `**Unit:** L/min`.
   */
  unit: z.string().min(1).optional(),
  /**
   * Fill-blank only: numeric tolerance band as a fraction (0.05 = ±5%).
   * Anything within tolerance is Green; outside but on the right
   * order of magnitude is Yellow. Authored as `**Tolerance:** ±5%`
   * or `**Tolerance:** 0.05`.
   */
  tolerance_pct: z.number().min(0).max(1).optional(),
  /**
   * Descriptive only: the multi-paragraph rubric the student uses to
   * self-rate Green / Yellow / Red after seeing the model answer.
   * Authored as a `### Self-Grading Checklist` subsection (rather
   * than a `**Label:**` line) so the rubric can span paragraphs and
   * include bullet lists without the field extractor terminating at
   * the first blank line. Stored verbatim — the renderer treats it
   * as markdown.
   */
  self_grading_checklist: z.string().min(1).optional(),
});
export type Card = z.infer<typeof cardSchema>;

/**
 * Extract all cards from a Chapter. Returns [] for a Chapter
 * without a Questions section (drafts) rather than throwing.
 */
export function extractCards(chapter: Chapter): Card[] {
  if (!chapter.layers.questions) return [];
  const chapterExamPatterns = chapter.frontmatter.exam_patterns ?? [];
  return parseQuestionsSection(
    chapter.frontmatter.id,
    chapter.layers.questions,
    chapterExamPatterns,
  );
}

function parseQuestionsSection(
  chapterId: string,
  section: string,
  chapterExamPatterns: readonly string[],
): Card[] {
  // Split the section on `## Question N` headings. The regex keeps the
  // heading with the block so we can recover the index.
  const parts = section.split(/^##\s+Question\s+(\d+)\s*$/im);
  // split() returns [preamble, capture1, body1, capture2, body2, …]
  // Preamble is whatever sits between `# Questions` and the first
  // `## Question N`, usually nothing. Paired capture/body make the cards.
  const cards: Card[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const indexStr = parts[i];
    const body = parts[i + 1] ?? "";
    const index = Number.parseInt(indexStr, 10);
    const card = parseCardBody(chapterId, index, body, chapterExamPatterns);
    cards.push(cardSchema.parse(card));
  }
  return cards;
}

function parseCardBody(
  chapterId: string,
  index: number,
  body: string,
  fallbackExamPatterns: readonly string[],
) {
  const rawId = extractLabeledField(body, "ID");
  return {
    id: `${chapterId}:${index}`,
    chapter_id: chapterId,
    index,
    uuid: rawId && isUuid(rawId) ? rawId.toLowerCase() : undefined,
    format: normaliseQuestionFormat(extractLabeledField(body, "Format")),
    status: normaliseQuestionStatus(extractLabeledField(body, "Status")),
    type: extractLabeledField(body, "Type") ?? "unspecified",
    blooms_level: normaliseBloomsLevel(extractLabeledField(body, "Bloom's level") ?? ""),
    priority: normalisePriorityLevel(extractLabeledField(body, "Priority")),
    difficulty: normaliseDifficultyLevel(extractLabeledField(body, "Difficulty")),
    stem: extractLabeledField(body, "Stem") ?? "",
    correct_answer: extractLabeledField(body, "Correct answer") ?? "",
    elaborative_explanation: extractLabeledField(body, "Elaborative explanation") ?? "",
    hints: extractHintLadder(body),
    misconceptions: extractMisconceptions(body),
    exam_patterns: extractCardExamPatterns(body, fallbackExamPatterns),
    acceptable_answers: extractAcceptableAnswers(body),
    unit: extractLabeledField(body, "Unit") ?? undefined,
    tolerance_pct: parseTolerance(extractLabeledField(body, "Tolerance")),
    self_grading_checklist: extractSelfGradingChecklist(body),
  };
}

function extractSelfGradingChecklist(body: string): string | undefined {
  // Section heading is `### Self-Grading Checklist`. Mirrors
  // `extractHintLadder`'s shape: stops at the next `###` subheading
  // or end of body. Returns undefined when absent so the optional
  // schema field stays out rather than being explicitly empty.
  const match = body.match(/###\s+Self-Grading\s+Checklist\s*\n([\s\S]+?)(?=\n\s*###\s|$)/i);
  if (!match) return undefined;
  const trimmed = match[1].trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

/**
 * Coerce a `**Format:**` value to one of the canonical tokens. Accepts
 * a few near-synonyms ("multiple choice" → mcq, "free text" →
 * descriptive, "fill in the blank" → fill_blank) so author phrasing
 * doesn't break the parse. Falls back to "descriptive" when omitted —
 * matches the pre-redesign default behaviour for legacy questions.
 */
function normaliseQuestionFormat(raw: string | null): QuestionFormat {
  if (!raw) return "descriptive";
  const lower = raw
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (lower === "mcq" || lower === "multiple_choice" || lower === "multiple_choice_question") {
    return "mcq";
  }
  if (
    lower === "fill_blank" ||
    lower === "fill_in_blank" ||
    lower === "fill_in_the_blank" ||
    lower === "fillin" ||
    lower === "fillinblank" ||
    lower === "fillintheblank"
  ) {
    return "fill_blank";
  }
  if (
    lower === "descriptive" ||
    lower === "free_text" ||
    lower === "free_recall" ||
    lower === "essay" ||
    lower === "short_answer"
  ) {
    return "descriptive";
  }
  return "descriptive";
}

/**
 * Coerce a `**Status:**` value to one of the canonical tokens. Anything
 * not "retired" treats the question as live — failing safe by leaving
 * the question in circulation if the status label is malformed.
 */
function normaliseQuestionStatus(raw: string | null): QuestionStatus {
  if (!raw) return "published";
  const lower = raw.trim().toLowerCase();
  if (lower === "retired" || lower === "tombstoned") return "retired";
  return "published";
}

/**
 * Parse a `**Tolerance:**` value to a fraction. Accepts:
 *   - `5%`, `±5%`, `+/-5%`  → 0.05
 *   - `0.05`, `±0.05`        → 0.05
 *   - `5` (bare number > 1)  → 0.05 (treated as percent)
 * Returns undefined for unparseable input rather than throwing — keeps
 * the question loadable; downstream graders can fall back to exact match.
 */
function parseTolerance(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[±\s]|\+\/-/g, "");
  const pctMatch = cleaned.match(/^([\d.]+)%$/);
  if (pctMatch) {
    const v = Number.parseFloat(pctMatch[1]);
    if (Number.isFinite(v)) return v / 100;
  }
  const numMatch = cleaned.match(/^([\d.]+)$/);
  if (numMatch) {
    const v = Number.parseFloat(numMatch[1]);
    if (Number.isFinite(v)) return v <= 1 ? v : v / 100;
  }
  return undefined;
}

/**
 * Parse a `**Acceptable answers:**` value. Recognises two shapes:
 *   - quoted, pipe-separated: `"5.6 L/min" | "5.6 liters per minute"`
 *   - bare pipe-separated:    `5.6 L/min | 5.6 liters per minute`
 * Quoted form is preferred — it disambiguates values containing pipes.
 */
function extractAcceptableAnswers(body: string): string[] | undefined {
  const raw = extractLabeledField(body, "Acceptable answers");
  if (!raw) return undefined;
  const quoted = [...raw.matchAll(/["“]([^"”]+)["”]/g)].map((m) => m[1].trim());
  if (quoted.length > 0) return quoted;
  const piped = raw
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return piped.length > 0 ? piped : undefined;
}

/**
 * Parse the optional `**Exam patterns:** mbbs, pre-pg` line from a
 * question body. If absent, inherit the Chapter-level list (Option
 * Y per the plan — questions default to the Chapter's tagging,
 * but can override).
 *
 * Values are lower-cased and trimmed so downstream filters don't need
 * to normalise. Deduplicated to keep the serialised Card compact.
 */
function extractCardExamPatterns(body: string, fallback: readonly string[]): string[] {
  const raw = extractLabeledField(body, "Exam patterns");
  if (!raw) {
    return normaliseExamPatterns(fallback);
  }
  const tokens = raw
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  return normaliseExamPatterns(tokens);
}

function normaliseExamPatterns(tokens: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tokens) {
    const key = raw.toLowerCase().trim();
    if (!key) continue;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }
  return out;
}

/**
 * Pull the value of a `**Label:** value` line out of the question body.
 * Values may span to the next bolded label, a blank line, or the next
 * `###` heading — whichever comes first.
 */
function extractLabeledField(body: string, label: string): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // The field value ends at:
  //   - the start of another **Label:** line
  //   - the start of a ### subheading (e.g. Hint Ladder)
  //   - two consecutive newlines
  //   - end of body
  const pattern = new RegExp(
    `\\*\\*${escaped}:\\*\\*\\s*([\\s\\S]+?)(?=\\n\\s*\\*\\*[^*]+?:\\*\\*|\\n\\s*###\\s|\\n\\s*\\n|$)`,
    "i",
  );
  const match = body.match(pattern);
  return match ? match[1].trim() : null;
}

function normaliseBloomsLevel(raw: string): BloomsLevel {
  const lower = raw.trim().toLowerCase();
  const candidates: BloomsLevel[] = ["remember", "understand", "apply", "analyze"];
  for (const candidate of candidates) {
    if (lower === candidate) return candidate;
  }
  // Default — SOP Appendix A puts every question into one of the four;
  // if the content uses a non-v1 level (evaluate / create), we coerce
  // to the closest supported bucket rather than fail the whole parse.
  if (lower.startsWith("evaluate") || lower.startsWith("create")) return "analyze";
  return "apply";
}

/**
 * Coerce a `**Priority:**` value to one of the canonical tokens.
 * Accepts a few near-synonyms authors are likely to type
 * ("essential" / "core" → must; "optional" / "bonus" → good) so the
 * parser tolerates light drift. Falls back to "should" when omitted
 * or unrecognised — that's the centre of the distribution and the
 * least surprising default.
 */
function normalisePriorityLevel(raw: string | null): PriorityLevel {
  if (!raw) return "should";
  const lower = raw.trim().toLowerCase();
  if (lower === "must" || lower === "must-know" || lower === "essential" || lower === "core") {
    return "must";
  }
  if (lower === "should" || lower === "should-know" || lower === "expected") {
    return "should";
  }
  if (lower === "good" || lower === "good-to-know" || lower === "optional" || lower === "bonus") {
    return "good";
  }
  return "should";
}

/**
 * Coerce a `**Difficulty:**` value to one of the canonical tokens.
 * Accepts the few synonym variants authors are likely to type
 * ("intermediate" / "moderate" → standard) so a paste from a draft
 * doesn't break the parse. Falls back to "standard" when omitted.
 */
function normaliseDifficultyLevel(raw: string | null): DifficultyLevel {
  if (!raw) return "standard";
  const lower = raw.trim().toLowerCase();
  if (lower === "foundational" || lower === "basic" || lower === "easy") {
    return "foundational";
  }
  if (lower === "standard" || lower === "intermediate" || lower === "moderate") {
    return "standard";
  }
  if (lower === "advanced" || lower === "hard" || lower === "challenging") {
    return "advanced";
  }
  return "standard";
}

function extractHintLadder(body: string): string[] {
  const match = body.match(/###\s+Hint\s+Ladder\s*\n([\s\S]+?)(?=\n\s*###\s|$)/i);
  if (!match) return [];
  const listBody = match[1];
  const hints: string[] = [];
  const lineRe = /^\s*\d+\.\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(listBody)) !== null) hints.push(m[1].trim());
  return hints.slice(0, 3);
}

function extractMisconceptions(body: string): Misconception[] {
  const match = body.match(/###\s+Misconception\s+Mappings\s*\n([\s\S]+?)(?=\n\s*###\s|$)/i);
  if (!match) return [];
  const listBody = match[1];
  const out: Misconception[] = [];
  // Accept both ASCII `->` and Unicode `→` as the separator so author
  // keyboards that autocorrect to the arrow don't break the parser.
  const lineRe =
    /^\s*-\s+Wrong answer:\s*["“]([^"”]+)["”]\s*(?:->|→|=>)\s*Misconception:\s*(.+)$/gim;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(listBody)) !== null) {
    out.push({ wrong_answer: m[1].trim(), description: m[2].trim() });
  }
  return out;
}

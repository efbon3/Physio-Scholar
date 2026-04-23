import { z } from "zod";

import type { Mechanism } from "./loader";

/**
 * Card extraction — pulls the structured question bank out of the
 * `# Questions` section of a mechanism markdown. Matches SOP Appendix A
 * exactly; a mismatch means the content is malformed and we surface a
 * clear error rather than silently skip.
 *
 * A Card is the unit the SRS schedules and the review UI displays.
 * Its id is `{mechanism_id}:{index}` (index is 1-based from
 * "## Question N"), deterministic across rebuilds so SRS history
 * survives content edits that don't reorder the question bank.
 */

/** Bloom's taxonomy levels we actually use in v1. */
export const bloomsLevelSchema = z.enum(["remember", "understand", "apply", "analyze"]);
export type BloomsLevel = z.infer<typeof bloomsLevelSchema>;

export const misconceptionSchema = z.object({
  /** The incorrect answer string, as written. */
  wrong_answer: z.string().min(1),
  /** Why it's wrong — the mental-model correction. */
  description: z.string().min(1),
});
export type Misconception = z.infer<typeof misconceptionSchema>;

export const cardSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+:\d+$/),
  mechanism_id: z.string().min(1),
  index: z.number().int().min(1),
  type: z.string().min(1),
  blooms_level: bloomsLevelSchema,
  stem: z.string().min(1),
  correct_answer: z.string().min(1),
  elaborative_explanation: z.string().min(1),
  /** Three tiers per build spec §2.5, but drafts may have fewer. */
  hints: z.array(z.string().min(1)).max(3),
  misconceptions: z.array(misconceptionSchema),
});
export type Card = z.infer<typeof cardSchema>;

/**
 * Extract all cards from a mechanism. Returns [] for a mechanism
 * without a Questions section (drafts) rather than throwing.
 */
export function extractCards(mechanism: Mechanism): Card[] {
  if (!mechanism.layers.questions) return [];
  return parseQuestionsSection(mechanism.frontmatter.id, mechanism.layers.questions);
}

function parseQuestionsSection(mechanismId: string, section: string): Card[] {
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
    const card = parseCardBody(mechanismId, index, body);
    cards.push(cardSchema.parse(card));
  }
  return cards;
}

function parseCardBody(mechanismId: string, index: number, body: string) {
  return {
    id: `${mechanismId}:${index}`,
    mechanism_id: mechanismId,
    index,
    type: extractLabeledField(body, "Type") ?? "unspecified",
    blooms_level: normaliseBloomsLevel(extractLabeledField(body, "Bloom's level") ?? ""),
    stem: extractLabeledField(body, "Stem") ?? "",
    correct_answer: extractLabeledField(body, "Correct answer") ?? "",
    elaborative_explanation: extractLabeledField(body, "Elaborative explanation") ?? "",
    hints: extractHintLadder(body),
    misconceptions: extractMisconceptions(body),
  };
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

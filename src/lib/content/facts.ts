import { z } from "zod";

import type { Mechanism } from "./loader";

/**
 * Fact extraction — pulls factual-recall items out of the optional
 * `# Facts` section of a mechanism markdown.
 *
 * Facts are distinct from `Card`s (mechanism questions) by purpose:
 *
 *   Card  — full question with stem + correct answer + elaborative
 *           explanation + hint ladder + misconceptions. Drives the
 *           review flow that asks the learner to explain a mechanism.
 *   Fact  — short factual recall item. The prompt is a term / question;
 *           the answer is a concise reply. Drives the rapid-fire
 *           flashcard mode at /facts.
 *
 * Both share the same `card_id` namespace so they can both feed the
 * SRS scheduler via `recordReviewLocally`. To avoid id collisions
 * between question N and fact N within the same mechanism, facts use
 * an offset numeric range — index 10001+ — while questions stay at
 * 1–99 (no mechanism is going to author 10000+ questions).
 *
 * ## Authoring format
 *
 * Each `# Facts` section uses category subheadings (`## Definitions`,
 * `## Normal values`, etc.) and one fact per bullet:
 *
 *   ## Definitions
 *
 *   - **Preload**: end-diastolic ventricular volume (sarcomere stretch
 *     at end of diastole).
 *   - **Afterload**: wall stress during ejection.
 *
 *   ## Normal values
 *
 *   - **Cardiac output**: 5 L/min in a resting adult.
 *   - **Stroke volume**: 70 mL.
 *
 *   ## Functions
 *
 *   - **SA node**: sets heart rate via phase 4 depolarisation.
 *
 *   ## Relations
 *
 *   - **Stroke volume formula**: SV = EDV − ESV.
 *
 *   ## Associations
 *
 *   - **S3 sound**: rapid filling; pathological in older adults.
 *
 *   ## Classifications
 *
 *   - **Types of shock**: distributive, hypovolemic, cardiogenic,
 *     obstructive.
 *
 * The bullet must follow the `**prompt**: answer` shape. Anything
 * that doesn't match is ignored — drafts can leave incomplete bullets
 * inline without breaking the parse.
 */

export const FACT_CATEGORIES = [
  "definition",
  "normal-value",
  "function",
  "relation",
  "association",
  "classification",
] as const;
export type FactCategory = (typeof FACT_CATEGORIES)[number];

/** Display labels for the UI. */
export const FACT_CATEGORY_LABELS: Record<FactCategory, string> = {
  definition: "Definitions",
  "normal-value": "Normal values",
  function: "Functions",
  relation: "Relations",
  association: "Associations",
  classification: "Classifications",
};

/** Human-readable singular label, used in card prompts. */
export const FACT_CATEGORY_SINGULAR: Record<FactCategory, string> = {
  definition: "Define",
  "normal-value": "Normal value",
  function: "Function of",
  relation: "Relation",
  association: "Association",
  classification: "Classify",
};

/**
 * Numeric offset added to a fact's position in the section to keep
 * fact IDs from colliding with question IDs (1–99). 10000 leaves
 * plenty of headroom on both sides.
 */
export const FACT_INDEX_OFFSET = 10000;

export const factSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+:\d+$/),
  mechanism_id: z.string().min(1),
  /** Numeric, with FACT_INDEX_OFFSET added so it never collides with a question. */
  index: z
    .number()
    .int()
    .min(FACT_INDEX_OFFSET + 1),
  category: z.enum(FACT_CATEGORIES),
  /** The term / question the learner sees on the card front. */
  prompt: z.string().min(1),
  /** The answer the learner reveals after self-attempting. */
  answer: z.string().min(1),
});
export type Fact = z.infer<typeof factSchema>;

/**
 * Extract all facts from a mechanism. Returns [] for mechanisms
 * without a `# Facts` section (everything authored before this
 * feature, plus drafts).
 */
export function extractFacts(mechanism: Mechanism): Fact[] {
  if (!mechanism.layers.facts) return [];
  return parseFactsSection(mechanism.frontmatter.id, mechanism.layers.facts);
}

function parseFactsSection(mechanismId: string, section: string): Fact[] {
  const lines = section.split(/\r?\n/);
  const facts: Fact[] = [];
  let currentCategory: FactCategory | null = null;
  let position = 0;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");

    // ## Heading → category switch
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      currentCategory = normaliseCategory(heading[1]);
      continue;
    }

    if (!currentCategory) continue;

    // Bullet: `- **prompt**: answer`
    // Tolerate single asterisks (`*` for emphasis) so authors can write
    // either bold style. Match either at the start.
    const bullet = line.match(/^-\s+\*\*([^*]+)\*\*\s*:\s*(.+)$/);
    if (bullet) {
      const prompt = bullet[1].trim();
      const answer = bullet[2].trim();
      if (prompt.length === 0 || answer.length === 0) continue;
      position += 1;
      const index = FACT_INDEX_OFFSET + position;
      facts.push(
        factSchema.parse({
          id: `${mechanismId}:${index}`,
          mechanism_id: mechanismId,
          index,
          category: currentCategory,
          prompt,
          answer,
        }),
      );
    }
  }

  return facts;
}

function normaliseCategory(heading: string): FactCategory | null {
  const lower = heading.toLowerCase().trim();
  if (lower.startsWith("definition")) return "definition";
  if (lower.startsWith("normal value") || lower.startsWith("normal-value")) return "normal-value";
  if (lower.startsWith("function")) return "function";
  if (lower.startsWith("relation")) return "relation";
  if (lower.startsWith("association")) return "association";
  if (lower.startsWith("classification") || lower.startsWith("classifies")) return "classification";
  return null;
}

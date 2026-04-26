import { z } from "zod";

import type { Mechanism } from "./loader";

/**
 * Value extraction — pulls numeric-quantity recall items out of the
 * optional `# Values` section of a mechanism markdown.
 *
 * Distinct from `Fact` (which has six categories including
 * normal-value): the Values module is dedicated to numeric quantities
 * with units, where the answer is "the number". Authored separately
 * so a learner who wants to drill *only* values gets a clean stream
 * without definitions or relations mixed in.
 *
 * ## Authoring format
 *
 * One bullet per value, with the term in bold and the value text
 * after a colon. The value text may include a parenthetical range or
 * note that the UI surfaces alongside the answer:
 *
 *   # Values
 *
 *   - **Cardiac output (CO)**: 5 L/min (range 4–8 L/min, resting adult).
 *   - **Stroke volume (SV)**: 70 mL (range 60–100 mL).
 *   - **Mean arterial pressure (MAP)**: 93 mmHg (range 70–110 mmHg).
 *   - **Heart rate (HR)**: 75 bpm (range 60–100 bpm awake).
 *
 * The parser stores the whole "5 L/min (range 4–8 L/min, resting
 * adult)" string as `answer` so the UI can render the value and any
 * range together. A future iteration may split the parenthetical
 * into a `detail` field if the UX needs it.
 *
 * ## SRS namespace
 *
 * Values get id `{mechanism_id}:{20000+position}` — offset 20000 to
 * avoid colliding with question ids (1–99) and fact ids (10001+).
 * They share the same `card_id` namespace so they can feed the
 * existing card_states / reviews tables without a migration.
 */

export const valueSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+:\d+$/),
  mechanism_id: z.string().min(1),
  index: z.number().int().min(20001),
  /** The term / quantity name shown on the card front. */
  prompt: z.string().min(1),
  /** The value text revealed on flip — number + unit + optional range. */
  answer: z.string().min(1),
});
export type Value = z.infer<typeof valueSchema>;

export const VALUE_INDEX_OFFSET = 20000;

/**
 * Extract all values from a mechanism. Returns [] for mechanisms
 * without a `# Values` section.
 */
export function extractValues(mechanism: Mechanism): Value[] {
  if (!mechanism.layers.values) return [];
  return parseValuesSection(mechanism.frontmatter.id, mechanism.layers.values);
}

function parseValuesSection(mechanismId: string, section: string): Value[] {
  const lines = section.split(/\r?\n/);
  const values: Value[] = [];
  let position = 0;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");
    // Bullet shape: `- **prompt**: answer`
    const match = line.match(/^-\s+\*\*([^*]+)\*\*\s*:\s*(.+)$/);
    if (!match) continue;
    const prompt = match[1].trim();
    const answer = match[2].trim();
    if (prompt.length === 0 || answer.length === 0) continue;
    position += 1;
    const index = VALUE_INDEX_OFFSET + position;
    values.push(
      valueSchema.parse({
        id: `${mechanismId}:${index}`,
        mechanism_id: mechanismId,
        index,
        prompt,
        answer,
      }),
    );
  }

  return values;
}

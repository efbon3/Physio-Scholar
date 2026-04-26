import matter from "gray-matter";

import { mechanismFrontmatterSchema, type MechanismFrontmatter } from "./schema";

/**
 * Typed representation of a parsed mechanism markdown file.
 *
 * `body` is the raw markdown body (everything after the frontmatter).
 * `layers` is the same body split into the six canonical top-level
 * sections defined by SOP Appendix A — useful for rendering layer 1 as a
 * quick overview without loading the rest, or for computing a layer-level
 * index without re-parsing.
 *
 * Sections absent from the source (e.g. a draft mechanism without
 * `# Questions` yet) resolve to `undefined`; a missing section is not an
 * error at parse time — the content lifecycle (SOP §6.1) decides when
 * missing sections gate publication.
 */
export type MechanismLayers = {
  core?: string;
  working?: string;
  deepDive?: string;
  clinicalIntegration?: string;
  questions?: string;
  /**
   * Optional `# Facts` section — short factual recall items grouped
   * by category (definitions, normal values, functions, etc). Parsed
   * by extractFacts() in src/lib/content/facts.ts. Independent of
   * `# Questions`; mechanisms can have one, the other, both, or neither.
   */
  facts?: string;
  sources?: string;
};

export type Mechanism = {
  frontmatter: MechanismFrontmatter;
  body: string;
  layers: MechanismLayers;
};

/**
 * Parse a raw markdown document (frontmatter + body) into a validated
 * `Mechanism`. Throws a `ZodError` if frontmatter is missing, malformed,
 * or fails any schema invariant (see schema.ts).
 *
 * This function is intentionally decoupled from the filesystem so the
 * same parser can run on author IDE previews, Edge runtime handlers
 * (where `fs` is not available), and plain Node tests.
 */
export function parseMechanism(raw: string): Mechanism {
  const parsed = matter(raw);
  const frontmatter = mechanismFrontmatterSchema.parse(parsed.data);
  const body = parsed.content;
  const layers = splitLayers(body);
  return { frontmatter, body, layers };
}

/**
 * Headings this loader recognises as top-level layer starts. Must match
 * the exact strings SOP Appendix A uses — the SOP is the contract with
 * content authors.
 */
// Separator between "Layer N" and the section name. SOP Appendix A shows
// em-dash; author keyboards on macOS / iOS often produce en-dash (–)
// autocorrect; some authors will type an ASCII hyphen. Accept all three.
const LAYER_SEPARATOR = "[—–-]";
const LAYER_HEADINGS = {
  core: new RegExp(`^#\\s+Layer\\s+1\\s+${LAYER_SEPARATOR}\\s+Core\\s*$`, "i"),
  working: new RegExp(
    `^#\\s+Layer\\s+2\\s+${LAYER_SEPARATOR}\\s+Working(?:\\s+Explanation)?\\s*$`,
    "i",
  ),
  deepDive: new RegExp(`^#\\s+Layer\\s+3\\s+${LAYER_SEPARATOR}\\s+Deep\\s+Dive\\s*$`, "i"),
  clinicalIntegration: new RegExp(
    `^#\\s+Layer\\s+4\\s+${LAYER_SEPARATOR}\\s+Clinical\\s+Integration\\s*$`,
    "i",
  ),
  questions: /^#\s+Questions\s*$/i,
  facts: /^#\s+Facts\s*$/i,
  sources: /^#\s+Sources\s*$/i,
} as const;

type LayerKey = keyof typeof LAYER_HEADINGS;

/**
 * Split a markdown body on top-level `# ` headings that match the
 * canonical layer names. Content inside fenced code blocks is ignored
 * so that a stray `#` in an example block can't tear a section in half.
 */
function splitLayers(body: string): MechanismLayers {
  const lines = body.split(/\r?\n/);
  const layers: MechanismLayers = {};

  let currentKey: LayerKey | null = null;
  let currentBuffer: string[] = [];
  let insideFence = false;

  const flush = () => {
    if (currentKey) {
      const joined = currentBuffer.join("\n").trim();
      if (joined.length > 0) layers[currentKey] = joined;
    }
    currentBuffer = [];
  };

  for (const line of lines) {
    // Track ```…``` fences so we don't mistake a `# ` inside a code block
    // for a new section.
    if (/^\s*```/.test(line)) {
      insideFence = !insideFence;
    }

    if (!insideFence) {
      const matchedKey = (Object.keys(LAYER_HEADINGS) as LayerKey[]).find((key) =>
        LAYER_HEADINGS[key].test(line),
      );
      if (matchedKey) {
        flush();
        currentKey = matchedKey;
        continue;
      }
    }

    if (currentKey) currentBuffer.push(line);
  }

  flush();
  return layers;
}

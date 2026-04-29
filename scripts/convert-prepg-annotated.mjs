/**
 * One-shot converter: takes a Pre-PG "annotated" markdown file in the
 * source format used in `~/OneDrive/Documents/Claude/.../Physiology mcq/`
 * and emits a chapter-format markdown file the existing chapter-parser
 * accepts.
 *
 * Differences this script normalises:
 *   - Source has no frontmatter → emit author-chapter frontmatter with
 *     `chapter:` and `part:` so the parser can route it.
 *   - Source uses `Options: a)/b)/c)/d)` blocks → drop entirely (the
 *     parser doesn't look at them; correct-answer + distractors are
 *     enough).
 *   - Source uses `Correct answer: d) <text>` → drop the `d) ` prefix.
 *   - Source uses `Distractor analysis:` after Explanation → rename to
 *     `Distractors:` so the parser finds the field.
 *   - Source distractor lines `- (a) "..." — ...` → strip the `(a) `
 *     prefix so the line opens with a quote and parseDistractorLine
 *     accepts it.
 *   - Source uses `## Final summary` → rewrite to `# Final Summary`
 *     so the parser's stripFinalSummary helper drops it.
 *
 * Run with `node scripts/convert-prepg-annotated.mjs <input> <output>
 *   --chapter "<chapter title>" --part "<syllabus part>"`.
 */
import { readFile, writeFile } from "node:fs/promises";
import { argv } from "node:process";

function arg(name) {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? null : argv[i + 1];
}

const [input, output] = argv.slice(2).filter((a) => !a.startsWith("--"));
const chapter = arg("chapter");
const part = arg("part");
if (!input || !output || !chapter || !part) {
  console.error(
    "usage: node convert-prepg-annotated.mjs <input> <output> --chapter <title> --part <part>",
  );
  process.exit(1);
}

const raw = await readFile(input, "utf8");

const lines = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n").split("\n");
const out = [];

// Drop the leading `# Chapter N: ...` heading (we'll emit our own
// chapter title via frontmatter).
let cursor = 0;
while (cursor < lines.length && /^\s*$/.test(lines[cursor])) cursor++;
if (cursor < lines.length && /^#\s+Chapter\b/i.test(lines[cursor])) cursor++;
while (cursor < lines.length && /^\s*$/.test(lines[cursor])) cursor++;

let inOptions = false;
for (let i = cursor; i < lines.length; i++) {
  const line = lines[i];

  // Replace `## Final summary` with `# Final Summary` so the parser
  // strips it. Pass through everything that follows verbatim.
  if (/^##\s+Final\s+summary\s*$/i.test(line)) {
    out.push("# Final Summary");
    continue;
  }

  // Drop the `Options:` label and the four `a) / b) / c) / d)` lines
  // that follow until a blank line.
  if (/^Options:\s*$/i.test(line)) {
    inOptions = true;
    continue;
  }
  if (inOptions) {
    if (/^\s*$/.test(line)) {
      inOptions = false;
      out.push(line); // preserve the blank-line separator
    }
    continue;
  }

  // Strip a leading letter-prefix on the correct-answer value:
  //   `Correct answer: d) Body maintains...` → `Correct answer: Body maintains...`
  let l = line.replace(/^(Correct answer:\s*)[a-d]\)\s+/i, "$1");

  // Rename `Distractor analysis:` → `Distractors:`.
  l = l.replace(/^Distractor analysis:\s*$/i, "Distractors:");

  // Drop the leading `(a) ` / `(b) ` etc. on each distractor bullet:
  //   `- (a) "Stimulus" — ...` → `- "Stimulus" — ...`
  l = l.replace(/^(\s*-\s+)\([a-d]\)\s+/i, "$1");

  out.push(l);
}

const frontmatter = ["---", `chapter: ${chapter}`, `part: ${part}`, "status: draft", "---", ""];

await writeFile(output, frontmatter.concat(out).join("\n"));
console.log(`wrote ${output}`);

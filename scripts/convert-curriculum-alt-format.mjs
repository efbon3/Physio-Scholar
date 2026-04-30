/**
 * Converter for the alternate curriculum-chapter authoring format
 * used in some Part01 chapters (ch6/ch7 as of 2026-04-30).
 *
 * Source shape (differs from the canonical author-chapter format):
 *
 *   ---
 *   chapter: 6
 *   chapter_title: The Neuron and Synaptic Transmission
 *   section: Foundations
 *   type: MCQ          (or Fill-in-the-Blank, or Descriptive)
 *   tier: 1
 *   total_questions: 27
 *   sources:
 *     - ...
 *   ---
 *
 *   # Chapter N — Title — MCQs
 *
 *   ## Pass 1 — ...
 *
 *   ### Q1. <stem text>
 *
 *   A. option a
 *   B. option b
 *   C. option c
 *   D. option d
 *
 *   **Answer:** C
 *
 *   **Explanation:** ...
 *
 *   **Difficulty:** F
 *
 *   **Priority:** M
 *   ---
 *
 *   ### Q2. ...
 *
 * The script rewrites both frontmatter and body into the canonical
 * shape the existing chapter parser accepts:
 *
 *   ---
 *   chapter: Chapter N — Title
 *   part: <inferred / supplied>
 *   status: draft
 *   ---
 *
 *   # Chapter N — Title — MCQs
 *
 *   ## Pass 1 — ...
 *
 *   QUESTION 1
 *   Type: recall
 *   Bloom's level: understand
 *   Difficulty (F / I / A): f
 *   Priority (M / S / G): m
 *
 *   Stem: ...
 *
 *   Correct answer: ...
 *
 *   Distractors:
 *   - "..." — Plausible but does not reveal a specific misconception worth naming.
 *   - "..." — Plausible but does not reveal a specific misconception worth naming.
 *   - "..." — Plausible but does not reveal a specific misconception worth naming.
 *
 *   Explanation: ...
 *
 *   ---
 *
 * Distractor lines from the source carry no misconception mapping
 * (the alt-format author didn't write them), so the converter emits
 * the boilerplate "Plausible..." line — the chapter parser accepts
 * it and the misconception column on each card just reads as a
 * plausible distractor with no specific correction.
 *
 * Fill-blank dispatch: looks for `**Answer:**` followed by a value;
 * emits `Canonical answer:` field instead of `Correct answer:` so the
 * parser routes the block to the fill-blank transformer.
 *
 * Descriptive dispatch: source uses `**Answer key:**` with a multi-
 * paragraph model answer; converter emits `Model answer:` with the
 * full body, terminating at the next labeled field. Self-grading
 * checklist / hints / common-misconceptions sections are not present
 * in the alt source, so those features will be absent on these cards
 * — the platform tolerates that.
 *
 * Run:
 *   node scripts/convert-curriculum-alt-format.mjs <input> <output>
 *     --chapter "Chapter 6 — The Neuron and Synaptic Transmission"
 *     --part "Part I — Foundations of Physiology"
 *     --format mcq    (or fillblank, or descriptive)
 */
import { readFile, writeFile } from "node:fs/promises";
import { argv } from "node:process";
import matter from "gray-matter";

function arg(name) {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? null : argv[i + 1];
}

const positional = argv.slice(2).filter((a, i, all) => {
  if (a.startsWith("--")) return false;
  if (i > 0 && all[i - 1].startsWith("--")) return false;
  return true;
});
const [input, output] = positional;
const chapter = arg("chapter");
const part = arg("part");
const format = arg("format");

if (!input || !output || !chapter || !part || !format) {
  console.error(
    "usage: node convert-curriculum-alt-format.mjs <input> <output>\n" +
      "  --chapter <title> --part <part> --format <mcq|fillblank|descriptive>",
  );
  process.exit(1);
}
if (!["mcq", "fillblank", "descriptive"].includes(format)) {
  console.error(`unknown format: ${format}`);
  process.exit(1);
}

const raw = await readFile(input, "utf8");
const parsed = matter(raw);
const body = parsed.content;

// Split body into question blocks. Each block starts with `### Q<n>.` and
// ends at the next `### Q` heading or the next horizontal rule + EOF.
const blocks = [];
const lines = body.replace(/\r\n/g, "\n").split("\n");
let current = null;
for (const line of lines) {
  const m = line.match(/^###\s+Q(\d+)\.\s*(.*)$/);
  if (m) {
    if (current) blocks.push(current);
    current = { number: parseInt(m[1], 10), stem: m[2].trim(), tail: [] };
  } else if (current) {
    current.tail.push(line);
  }
}
if (current) blocks.push(current);

const out = [];
out.push(`# ${chapter} — ${formatLabel(format)}`);
out.push("");

for (const blk of blocks) {
  out.push("---");
  out.push("");
  out.push(`QUESTION ${blk.number}`);
  out.push("");
  // Difficulty / Priority extraction
  const tail = blk.tail.join("\n");
  const difficulty = pickField(tail, "Difficulty");
  const priority = pickField(tail, "Priority");
  // Difficulty/Priority shorthands match the parser's expected
  // shorthand keys (F/I/A and M/S/G).
  if (difficulty) out.push(`Difficulty (F / I / A): ${difficulty.toLowerCase()}`);
  if (priority) out.push(`Priority (M / S / G): ${priority.toLowerCase()}`);
  out.push("");
  out.push(`Stem: ${blk.stem}`);
  out.push("");

  if (format === "mcq") {
    const options = pickOptions(tail);
    const answer = pickField(tail, "Answer");
    const explanation = pickFieldMulti(tail, "Explanation");
    const correct = answer ? options[answer.toUpperCase()] : null;
    if (correct) {
      out.push(`Correct answer: ${correct}`);
      out.push("");
    }
    const wrongs = ["A", "B", "C", "D"]
      .filter((k) => k !== (answer ? answer.toUpperCase() : ""))
      .map((k) => options[k])
      .filter(Boolean);
    if (wrongs.length > 0) {
      out.push("Distractors:");
      for (const w of wrongs) {
        out.push(`- "${w}" — Plausible but does not reveal a specific misconception worth naming.`);
      }
      out.push("");
    }
    if (explanation) {
      out.push(`Explanation: ${explanation}`);
      out.push("");
    }
  } else if (format === "fillblank") {
    const answer = pickField(tail, "Answer");
    const explanation = pickFieldMulti(tail, "Explanation");
    if (answer) {
      out.push(`Canonical answer: ${answer}`);
      out.push("");
    }
    if (explanation) {
      out.push(`Explanation: ${explanation}`);
      out.push("");
    }
  } else if (format === "descriptive") {
    const modelAnswer = pickFieldMulti(tail, "Answer key");
    if (modelAnswer) {
      out.push(`Model answer: ${modelAnswer}`);
      out.push("");
      // The Card schema requires a non-empty elaborative_explanation
      // even on descriptive cards. The alt-format source doesn't author
      // a separate explanation paragraph, so we surface a short pointer
      // back to the model answer — keeps the schema happy without
      // fabricating content the author didn't write.
      out.push("Elaborative explanation: See the Model answer above for the full reasoning.");
      out.push("");
    }
  }
}
out.push("---");

const frontmatter = ["---", `chapter: ${chapter}`, `part: ${part}`, "status: draft", "---", ""];
await writeFile(output, frontmatter.concat(out).join("\n"));
console.log(`wrote ${output} (${blocks.length} blocks)`);

function formatLabel(f) {
  if (f === "mcq") return "MCQs";
  if (f === "fillblank") return "Fill-in-the-Blank Questions";
  return "Descriptive Questions";
}

/** Pick a single-line `**<Label>:** <value>` field from a tail string. */
function pickField(tail, label) {
  const re = new RegExp(`^\\*\\*${escapeRe(label)}:\\*\\*\\s*(.+?)\\s*$`, "im");
  const m = tail.match(re);
  return m ? m[1].trim() : null;
}

/**
 * Pick a multi-line `**<Label>:**` field. The body extends from the line
 * after the label to the next blank line that is followed by a labeled
 * field, or the end of input. Boldface markers are stripped from the
 * result so the parser sees plain prose; line breaks are preserved.
 */
function pickFieldMulti(tail, label) {
  const re = new RegExp(
    `^\\*\\*${escapeRe(label)}:\\*\\*\\s*(?:\\n|$)([\\s\\S]+?)(?=\\n\\s*\\*\\*(?:Difficulty|Priority|Explanation|Answer|Answer key|Hint|Hints):\\*\\*|$)`,
    "im",
  );
  const m = tail.match(re);
  if (!m) {
    // Same-line variant: `**Explanation:** <text>` continuing onto next paragraph
    const re2 = new RegExp(
      `^\\*\\*${escapeRe(label)}:\\*\\*\\s*(.+?)(?=\\n\\s*\\*\\*(?:Difficulty|Priority|Explanation|Answer|Answer key|Hint|Hints):\\*\\*|$)`,
      "ims",
    );
    const m2 = tail.match(re2);
    if (!m2) return null;
    return cleanProse(m2[1]);
  }
  return cleanProse(m[1]);
}

/** Pull `A. text\nB. text\nC. text\nD. text` into { A, B, C, D }. */
function pickOptions(tail) {
  const out = {};
  const lines = tail.split("\n");
  for (const line of lines) {
    const m = line.match(/^([A-D])\.\s+(.+?)\s*$/);
    if (m && !out[m[1]]) out[m[1]] = m[2].trim();
  }
  return out;
}

function cleanProse(s) {
  // Drop trailing newline / horizontal rule artefacts and collapse
  // surrounding whitespace.
  return s
    .replace(/\n\s*---\s*$/, "")
    .trim()
    .replace(/\n{3,}/g, "\n\n");
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

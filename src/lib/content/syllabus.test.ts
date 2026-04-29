import { describe, expect, it } from "vitest";

import { chapterNumberFromId, parseSyllabus } from "./syllabus";

describe("parseSyllabus", () => {
  it("collects `#### topic` headings under each `### Chapter N.` heading", () => {
    const raw = `# Title

## Quick Outline

- Some bullet that should be ignored

### Chapter 1. Introduction to Physiology and Homeostasis

#### The scope and methods of physiology

- bullet
- bullet

#### The internal environment

- bullet

#### Homeostasis and control systems

- bullet

### Chapter 2. The Cell as the Functional Unit

#### The plasma membrane

- bullet
`;
    const map = parseSyllabus(raw);
    expect(map.get(1)).toEqual([
      "The scope and methods of physiology",
      "The internal environment",
      "Homeostasis and control systems",
    ]);
    expect(map.get(2)).toEqual(["The plasma membrane"]);
  });

  it("preserves order of `####` topics as they appear in the file", () => {
    const raw = `### Chapter 5. Order matters

#### Beta
#### Alpha
#### Gamma
`;
    const map = parseSyllabus(raw);
    expect(map.get(5)).toEqual(["Beta", "Alpha", "Gamma"]);
  });

  it("ignores `####` headings before the first `### Chapter N.` heading", () => {
    const raw = `## Quick outline

#### Stray topic — should be skipped

### Chapter 1. Real chapter

#### Real topic
`;
    const map = parseSyllabus(raw);
    expect(map.get(1)).toEqual(["Real topic"]);
    expect(map.size).toBe(1);
  });

  it("ignores `####` headings inside fenced code blocks", () => {
    const raw =
      "### Chapter 1. Test\n\n#### Real topic\n\n```\n#### Inside fence\n```\n\n#### Another real topic\n";
    const map = parseSyllabus(raw);
    expect(map.get(1)).toEqual(["Real topic", "Another real topic"]);
  });

  it("returns an empty map when the file has no chapter headings", () => {
    expect(parseSyllabus("")).toEqual(new Map());
    expect(parseSyllabus("# Just a title\n\nSome prose.")).toEqual(new Map());
  });

  it("creates an empty topic list for a chapter heading with no `####` underneath", () => {
    const raw = `### Chapter 7. Stub chapter

(prose with no sub-headings)

### Chapter 8. Next chapter

#### Topic
`;
    const map = parseSyllabus(raw);
    expect(map.get(7)).toEqual([]);
    expect(map.get(8)).toEqual(["Topic"]);
  });
});

describe("chapterNumberFromId", () => {
  it("extracts the integer from the `chNN-...` prefix", () => {
    expect(chapterNumberFromId("ch01-introduction-and-homeostasis")).toBe(1);
    expect(chapterNumberFromId("ch22-the-heart-as-a-pump")).toBe(22);
  });

  it("accepts a bare chNN id with no suffix", () => {
    expect(chapterNumberFromId("ch07")).toBe(7);
  });

  it("returns null when the id doesn't follow the chNN convention", () => {
    expect(chapterNumberFromId("frank-starling")).toBeNull();
    expect(chapterNumberFromId("chapter-1-introduction")).toBeNull();
    expect(chapterNumberFromId("")).toBeNull();
  });
});

/**
 * Same diagnostic shape as check-prepg-cards.ts but for the curriculum
 * chapters under content/chapters/. After a bulk import or format
 * conversion, run this to find any chapter whose extracted cards fail
 * Zod validation before pushing.
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { extractCards } from "../src/lib/content/cards";
import { parseChapter } from "../src/lib/content/loader";

type ZodLike = {
  constructor?: { name?: string };
  message?: string;
  issues?: Array<{ path: PropertyKey[]; code: string; message: string }>;
};

const DIR = join(process.cwd(), "content", "chapters");

async function main() {
  const files = (await readdir(DIR)).filter((n) => n.endsWith(".md"));
  let failures = 0;
  for (const name of files) {
    const raw = await readFile(join(DIR, name), "utf8");
    let chapter;
    try {
      chapter = parseChapter(raw, name.replace(/\.md$/, ""));
    } catch (err) {
      const e = err as ZodLike;
      console.log(`${name}: parseChapter THREW ${e.constructor?.name}: ${e.message}`);
      failures++;
      continue;
    }
    try {
      const cards = extractCards(chapter);
      console.log(`${name}: ${cards.length} cards OK`);
    } catch (err) {
      const e = err as ZodLike;
      console.log(`${name}: extractCards THREW ${e.constructor?.name}`);
      if (e.issues) {
        for (const issue of e.issues) {
          console.log(`  - path=${issue.path.join(".")} code=${issue.code} msg=${issue.message}`);
        }
      } else {
        console.log(`  message: ${e.message}`);
      }
      failures++;
    }
  }
  console.log(`\n${failures} failures out of ${files.length} files`);
  process.exit(failures > 0 ? 1 : 0);
}

main();

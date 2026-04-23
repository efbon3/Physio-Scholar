import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { parseMechanism, type Mechanism } from "./loader";

/**
 * Defense-in-depth: the caller (a dynamic route) should be passing a
 * sanitised id, but since the value comes from a URL param we also
 * validate the shape here. Only kebab-case [a-z0-9-] — matches the
 * `mechanismIdSchema` in schema.ts. A mismatch means the id is either
 * malformed (return 404-worthy null) or adversarial (same outcome,
 * no filesystem touch).
 */
const VALID_ID = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/**
 * Directory holding author-authored mechanism markdown files.
 * Resolved from the project root so it works the same in `next dev`,
 * `next build`, and when read from server components on Vercel.
 */
const MECHANISMS_DIR = join(process.cwd(), "content", "mechanisms");

/**
 * Server-only helpers. These import `node:fs/promises`, which would
 * explode in the browser bundle — never call them from a "use client"
 * component or from the middleware. Next.js catches the misuse at
 * build time thanks to the `node:*` protocol.
 */

/** Read + parse every `.md` file in content/mechanisms/. */
export async function readAllMechanisms(): Promise<Mechanism[]> {
  const entries = await readdir(MECHANISMS_DIR, { withFileTypes: true });
  const markdownFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => e.name);

  const mechanisms = await Promise.all(
    markdownFiles.map(async (name) => {
      const raw = await readFile(join(MECHANISMS_DIR, name), "utf8");
      return parseMechanism(raw);
    }),
  );

  // Stable sort by title so the Systems tab is deterministic.
  return mechanisms.sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}

/** Read + parse one mechanism by id, or return null if absent. */
export async function readMechanismById(id: string): Promise<Mechanism | null> {
  // Reject anything that isn't a valid kebab-case id before touching
  // the filesystem. Blocks `..`, `/`, `\`, absolute paths, etc.
  if (!VALID_ID.test(id)) return null;
  try {
    const raw = await readFile(join(MECHANISMS_DIR, `${id}.md`), "utf8");
    return parseMechanism(raw);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return null;
    throw err;
  }
}

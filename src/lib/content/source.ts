import { readPublishedMechanismByIdFromDb, readPublishedMechanismsFromDb } from "./db-source";
import { readAllMechanisms as readAllFromFs, readMechanismById as readFromFsById } from "./fs";
import type { Mechanism } from "./loader";

/**
 * Dual-source mechanism loader. This is the module the app's server
 * components should import.
 *
 * Ordering:
 *   1. Read every published row from public.content_mechanisms (DB).
 *   2. Read every `.md` file from content/mechanisms/ (filesystem).
 *   3. Merge by id — DB wins when both exist.
 *   4. Sort by title for deterministic Systems-tab rendering.
 *
 * This lets the existing filesystem markdown (frank-starling.md,
 * baroreceptor-reflex.md) continue to work exactly as before while
 * CMS-authored content takes precedence the moment an admin saves a
 * published row with a matching id. Makes the switch from "repo-based"
 * to "CMS-based" content entirely additive.
 */

export async function readAllMechanisms(): Promise<Mechanism[]> {
  const [fromDb, fromFs] = await Promise.all([readPublishedMechanismsFromDb(), readAllFromFs()]);
  const byId = new Map<string, Mechanism>();
  for (const m of fromFs) byId.set(m.frontmatter.id, m);
  for (const m of fromDb) byId.set(m.frontmatter.id, m); // DB overrides fs
  return [...byId.values()].sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}

export async function readMechanismById(id: string): Promise<Mechanism | null> {
  // DB first. A published DB row wins over an fs file of the same id.
  const fromDb = await readPublishedMechanismByIdFromDb(id);
  if (fromDb) return fromDb;
  return readFromFsById(id);
}

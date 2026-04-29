import Dexie, { type Table } from "dexie";

import type { ChapterFrontmatter, ChapterStatus, OrganSystem } from "./schema";
import type { Chapter, ChapterLayers } from "./loader";

/**
 * Row shape in the local mechanisms table.
 *
 * Dexie secondary indexes must reference top-level properties, so the
 * fields we index (`id`, `organ_system`, `status`) are kept flat at the
 * row root — even though they're duplicated inside `frontmatter`. The
 * full frontmatter is preserved for reads that need the whole thing.
 *
 * `indexed_at` is the timestamp of the last successful sync; surfaced to
 * the UI ("content last updated 2 min ago") and used to skip no-op
 * writes when the same version shows up again.
 */
export type StoredMechanism = {
  id: string;
  organ_system: OrganSystem;
  status: ChapterStatus;
  version: string;
  indexed_at: string;
  frontmatter: ChapterFrontmatter;
  body: string;
  layers: ChapterLayers;
};

/** Flatten a parsed Chapter into the row shape the DB indexes on. */
export function toStored(m: Chapter, indexedAt: string): StoredMechanism {
  return {
    id: m.frontmatter.id,
    organ_system: m.frontmatter.organ_system,
    status: m.frontmatter.status,
    version: m.frontmatter.version,
    indexed_at: indexedAt,
    frontmatter: m.frontmatter,
    body: m.body,
    layers: m.layers,
  };
}

/**
 * Dexie schema version 1 — only the mechanisms table. Indexes cover the
 * query patterns Phase 2 needs: `by id` (primary key) and
 * `by organ_system` for the "Systems" tab list.
 *
 * Bumping the schema in a future version:
 *   - add a new `this.version(n).stores({...})` block below the v1 one
 *   - use `.upgrade(tx => ...)` when the new version needs to transform
 *     existing rows; pure index additions do not require upgrade()
 */
export class PhysioContentDB extends Dexie {
  mechanisms!: Table<StoredMechanism, string>;

  constructor(databaseName = "physio-scholar-content") {
    super(databaseName);

    this.version(1).stores({
      mechanisms: "id, organ_system, status, indexed_at",
    });
  }
}

/**
 * Lazy singleton — Dexie opens an IndexedDB connection on first access.
 * In tests we can either swap in a fresh instance or reset this module
 * between cases via `__resetContentDBForTests`.
 */
let instance: PhysioContentDB | null = null;

/**
 * Accessor for the content DB. Throws a clear error if called from a
 * server-only context (server components, route handlers, instrumentation
 * hooks) — IndexedDB does not exist on the server, and the downstream
 * Dexie failure mode is a cryptic "unknown database" runtime exception.
 *
 * Test environments (Vitest + jsdom + fake-indexeddb/auto) have `window`
 * defined, so the guard does not trip there.
 */
export function getContentDB(): PhysioContentDB {
  if (typeof window === "undefined") {
    throw new Error(
      "getContentDB() must be called from client-side code (browser or test). " +
        "IndexedDB is not available in server components, route handlers, " +
        "or the Node runtime.",
    );
  }
  if (!instance) instance = new PhysioContentDB();
  return instance;
}

/** Test helper — reset the cached singleton so the next call opens fresh. */
export function __resetContentDBForTests(): void {
  instance = null;
}

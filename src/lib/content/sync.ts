import { getContentDB, toStored, type StoredMechanism } from "./db";
import type { Chapter } from "./loader";

export type SyncResult = {
  /** IDs whose stored row was created or replaced. */
  written: string[];
  /** IDs already up to date (same frontmatter.version) and skipped. */
  skipped: string[];
};

/**
 * Upsert a batch of mechanisms into the local content database.
 *
 * Write policy: a Chapter is written if
 *   - no row exists for that id, OR
 *   - the stored frontmatter.version differs from the incoming version.
 * Otherwise the existing row is considered current and we skip the write.
 *
 * Version comparison is string equality — the SOP version string is
 * author-controlled (`1.0`, `1.1`, etc.). If the author bumps it, we
 * resync; if not, we don't touch the row.
 */
export async function syncMechanisms(mechanisms: Chapter[]): Promise<SyncResult> {
  if (mechanisms.length === 0) return { written: [], skipped: [] };

  const db = getContentDB();
  const now = new Date().toISOString();
  const incomingIds = mechanisms.map((m) => m.frontmatter.id);

  const existing = await db.mechanisms.bulkGet(incomingIds);
  const existingByIdVersion = new Map<string, string>();
  for (const row of existing) {
    if (row) existingByIdVersion.set(row.id, row.version);
  }

  const toWrite: StoredMechanism[] = [];
  const skipped: string[] = [];
  for (const m of mechanisms) {
    const existingVersion = existingByIdVersion.get(m.frontmatter.id);
    if (existingVersion === m.frontmatter.version) {
      skipped.push(m.frontmatter.id);
      continue;
    }
    toWrite.push(toStored(m, now));
  }

  if (toWrite.length > 0) {
    await db.mechanisms.bulkPut(toWrite);
  }

  return { written: toWrite.map((row) => row.id), skipped };
}

/** Fetch a single Chapter from the local store. Returns undefined if absent. */
export async function getMechanism(id: string): Promise<StoredMechanism | undefined> {
  const db = getContentDB();
  return db.mechanisms.get(id);
}

/**
 * List mechanisms by organ system, ordered by title alphabetically.
 * Drives the Systems tab in B4.
 */
export async function listMechanismsBySystem(system: string): Promise<StoredMechanism[]> {
  const db = getContentDB();
  const rows = await db.mechanisms.where("organ_system").equals(system).toArray();
  return rows.sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}

/** List every Chapter in the store, for admin / debug views. */
export async function listAllMechanisms(): Promise<StoredMechanism[]> {
  const db = getContentDB();
  return db.mechanisms.toArray();
}

/** Wipe the store. Used by reset-on-logout and in tests. */
export async function clearMechanisms(): Promise<void> {
  const db = getContentDB();
  await db.mechanisms.clear();
}

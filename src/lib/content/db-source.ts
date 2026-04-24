import { createClient } from "@/lib/supabase/server";

import { parseMechanism, type Mechanism } from "./loader";

/**
 * Supabase-backed mechanism source.
 *
 * CMS-authored mechanisms land in `public.content_mechanisms` as full
 * markdown text (frontmatter + body). At render time, the
 * dual-source loader in `./source.ts` asks this module for published
 * rows first, then layers the filesystem markdown underneath for any
 * id the DB doesn't cover.
 *
 * Why a separate module: keeps the pure filesystem path (`./fs.ts`)
 * importable without pulling in Supabase. The tests exercise the fs
 * reader directly; the full app uses the composed loader.
 *
 * All functions here fail gracefully when Supabase env vars are absent
 * — CI + unconfigured previews get an empty DB set and the filesystem
 * reader owns the whole content universe.
 */

/**
 * Read every published mechanism out of the DB, parsed.
 * Returns [] when Supabase is unconfigured or unreachable. Parse errors
 * on a specific row are logged but don't abort the whole load — one
 * malformed DB row shouldn't nuke the Systems page.
 */
export async function readPublishedMechanismsFromDb(): Promise<Mechanism[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("content_mechanisms")
    .select("id, markdown")
    .eq("status", "published");

  if (error || !data) return [];

  const parsed: Mechanism[] = [];
  for (const row of data) {
    try {
      const mechanism = parseMechanism(row.markdown);
      // Defence: frontmatter's id field must match the DB key. If they
      // disagree, trust the DB row (it's what the admin saved) but
      // don't silently ingest — skip so the mismatch gets caught in
      // the admin UI instead of rendering a ghost mechanism.
      if (mechanism.frontmatter.id !== row.id) continue;
      parsed.push(mechanism);
    } catch (err) {
      // Malformed DB row — log, don't crash.
      console.error(`Failed to parse DB mechanism ${row.id}`, err);
    }
  }
  return parsed;
}

/** Read one mechanism from the DB by id, or null if absent / unpublished. */
export async function readPublishedMechanismByIdFromDb(id: string): Promise<Mechanism | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("content_mechanisms")
    .select("id, markdown")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;

  try {
    const mechanism = parseMechanism(data.markdown);
    if (mechanism.frontmatter.id !== data.id) return null;
    return mechanism;
  } catch (err) {
    console.error(`Failed to parse DB mechanism ${id}`, err);
    return null;
  }
}

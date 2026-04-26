/**
 * Sort helpers for the admin /admin/users table. Lifted out of the
 * page so they're testable without standing up a Supabase mock — the
 * comparator is pure once the row shape is in memory.
 */

export type SortKey = "name" | "college" | "roll" | "joined" | "status";
export type SortDir = "asc" | "desc";

/**
 * Subset of profile fields the comparator actually reads. The page
 * loads more — but we keep the type narrow here so a future change
 * to the SELECT doesn't quietly broaden what the sort depends on.
 */
export type SortableProfileRow = {
  full_name: string | null;
  college_name: string | null;
  roll_number: string | null;
  is_admin: boolean;
  approved_at: string | null;
  created_at: string;
};

export const SORT_KEYS: readonly SortKey[] = ["name", "college", "roll", "joined", "status"];
export const DEFAULT_SORT: SortKey = "status";
export const DEFAULT_DIR: SortDir = "asc";

export function parseSort(raw: string | undefined | null): SortKey {
  if (raw && (SORT_KEYS as readonly string[]).includes(raw)) return raw as SortKey;
  return DEFAULT_SORT;
}

export function parseDir(raw: string | undefined | null): SortDir {
  return raw === "desc" ? "desc" : raw === "asc" ? "asc" : DEFAULT_DIR;
}

export function makeComparator<T extends SortableProfileRow>(
  sort: SortKey,
  dir: SortDir,
): (a: T, b: T) => number {
  const flip = dir === "desc" ? -1 : 1;
  return (a, b) => compareByKey(a, b, sort) * flip;
}

function compareByKey(a: SortableProfileRow, b: SortableProfileRow, key: SortKey): number {
  switch (key) {
    case "name":
      return compareNullableString(a.full_name, b.full_name);
    case "college":
      return compareNullableString(a.college_name, b.college_name);
    case "roll":
      return compareNullableString(a.roll_number, b.roll_number);
    case "joined":
      return a.created_at.localeCompare(b.created_at);
    case "status": {
      // pending (0) < admin "n/a" (1) < approved (2) so pending floats
      // to the top by default, where the admin can act on them.
      const diff = statusRank(a) - statusRank(b);
      if (diff !== 0) return diff;
      // Within a tier, recently joined first so the queue is stable.
      return b.created_at.localeCompare(a.created_at);
    }
  }
}

function statusRank(p: SortableProfileRow): number {
  if (p.is_admin) return 1;
  return p.approved_at ? 2 : 0;
}

function compareNullableString(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null || a === "") return 1;
  if (b === null || b === "") return -1;
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

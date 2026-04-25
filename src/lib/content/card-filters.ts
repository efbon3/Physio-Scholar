import type { Card, DifficultyLevel, PriorityLevel } from "./cards";

/**
 * Pure helpers for filtering the card universe by priority and
 * difficulty. The review queue and exam-session assemblers both call
 * these — putting the logic here keeps the assemblers focused on
 * scheduling order and avoids duplicating the URL-param parsing.
 *
 * Filter semantics:
 *   - `null` (or empty array) means "no filter" — every level passes.
 *   - A non-empty array means "card must be in this set".
 *
 * Both axes filter independently — a card must satisfy both to pass
 * (priority AND difficulty), not either-or.
 */

const PRIORITY_VALUES: readonly PriorityLevel[] = ["must", "should", "good"];
const DIFFICULTY_VALUES: readonly DifficultyLevel[] = ["foundational", "standard", "advanced"];

/**
 * Parse a CSV-shaped URL param like `must,should` into a list of
 * canonical priority levels. Returns null when the param is empty or
 * absent (caller treats null as "no filter"). Unknown tokens are
 * silently dropped — defensive against link rot or hand-typed URLs.
 */
export function parsePriorityFilter(raw: string | string[] | undefined): PriorityLevel[] | null {
  const tokens = splitCsvParam(raw);
  if (tokens.length === 0) return null;
  const allowed = new Set<PriorityLevel>();
  for (const t of tokens) {
    if (PRIORITY_VALUES.includes(t as PriorityLevel)) {
      allowed.add(t as PriorityLevel);
    }
  }
  return allowed.size === 0 ? null : Array.from(allowed);
}

export function parseDifficultyFilter(
  raw: string | string[] | undefined,
): DifficultyLevel[] | null {
  const tokens = splitCsvParam(raw);
  if (tokens.length === 0) return null;
  const allowed = new Set<DifficultyLevel>();
  for (const t of tokens) {
    if (DIFFICULTY_VALUES.includes(t as DifficultyLevel)) {
      allowed.add(t as DifficultyLevel);
    }
  }
  return allowed.size === 0 ? null : Array.from(allowed);
}

/**
 * Apply both filters to a card list. Either filter (or both) can be
 * null, in which case that axis is unconstrained. Returns a new array;
 * the input is not mutated.
 */
export function applyCardFilters(
  cards: readonly Card[],
  opts: {
    priority?: readonly PriorityLevel[] | null;
    difficulty?: readonly DifficultyLevel[] | null;
  },
): Card[] {
  const { priority, difficulty } = opts;
  const prioritySet = priority && priority.length > 0 ? new Set<string>(priority) : null;
  const difficultySet = difficulty && difficulty.length > 0 ? new Set<string>(difficulty) : null;
  if (!prioritySet && !difficultySet) return [...cards];
  return cards.filter((c) => {
    if (prioritySet && !prioritySet.has(c.priority)) return false;
    if (difficultySet && !difficultySet.has(c.difficulty)) return false;
    return true;
  });
}

/**
 * Encode a filter selection back into a URL param string. Used when
 * the dashboard's filter chips construct an `href` for Start review /
 * Exam mode CTAs. Returns null when the selection is "all" (so callers
 * can omit the param entirely rather than write `?priority=`).
 */
export function encodeFilterParam(values: readonly string[] | null | undefined): string | null {
  if (!values || values.length === 0) return null;
  return values.join(",");
}

function splitCsvParam(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const joined = Array.isArray(raw) ? raw.join(",") : raw;
  return joined
    .split(/[,\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
}

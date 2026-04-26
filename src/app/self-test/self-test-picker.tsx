"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  DIFFICULTY_FILTER_OPTIONS,
  FilterChips,
  PRIORITY_FILTER_OPTIONS,
} from "@/components/filter-chips";
import { encodeFilterParam } from "@/lib/content/card-filters";

export type SelfTestMechanism = {
  id: string;
  title: string;
  cardCount: number;
};

export type SelfTestGroup = {
  system: string;
  mechanisms: readonly SelfTestMechanism[];
};

/**
 * Client wrapper for the /self-test landing page. Owns the priority +
 * difficulty filter chip state; each "Start self-test" link rewrites
 * its href on the fly so the chosen scope flows into the session via
 * `?priority=…&difficulty=…` URL params. The session entry parses
 * those and trims the card universe before the drill loop starts.
 *
 * Initial state can come from the URL (`?priority=must` etc.) so
 * deep-links and bookmarks survive a refresh.
 */
export function SelfTestPicker({
  groups,
  initialPriority,
  initialDifficulty,
}: {
  groups: readonly SelfTestGroup[];
  initialPriority: readonly string[];
  initialDifficulty: readonly string[];
}) {
  const [priorityFilter, setPriorityFilter] = useState<Set<string>>(() => new Set(initialPriority));
  const [difficultyFilter, setDifficultyFilter] = useState<Set<string>>(
    () => new Set(initialDifficulty),
  );

  function toggle(set: Set<string>, value: string, options: ReadonlyArray<{ value: string }>) {
    const next = new Set(set);
    if (next.size === 0) {
      next.add(value);
    } else if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    if (next.size === options.length) next.clear();
    return next;
  }

  // Build the `?priority=…&difficulty=…` suffix once per filter change
  // so every Start-self-test link reuses it.
  const filterQuery = useMemo(() => {
    const parts: string[] = [];
    const p = encodeFilterParam(Array.from(priorityFilter));
    const d = encodeFilterParam(Array.from(difficultyFilter));
    if (p) parts.push(`priority=${encodeURIComponent(p)}`);
    if (d) parts.push(`difficulty=${encodeURIComponent(d)}`);
    return parts.length === 0 ? "" : `&${parts.join("&")}`;
  }, [priorityFilter, difficultyFilter]);

  return (
    <>
      <section
        aria-label="Filter cards"
        className="border-input bg-muted/20 flex flex-col gap-3 rounded-md border p-3"
      >
        <FilterChips
          legend="Priority"
          options={PRIORITY_FILTER_OPTIONS as unknown as { value: string; label: string }[]}
          selected={priorityFilter}
          onToggle={(v) =>
            setPriorityFilter((s) =>
              toggle(s, v, PRIORITY_FILTER_OPTIONS as unknown as { value: string }[]),
            )
          }
          helper={
            priorityFilter.size === 0
              ? "All priorities included."
              : `Showing only ${Array.from(priorityFilter).join(", ")}.`
          }
        />
        <FilterChips
          legend="Difficulty"
          options={DIFFICULTY_FILTER_OPTIONS as unknown as { value: string; label: string }[]}
          selected={difficultyFilter}
          onToggle={(v) =>
            setDifficultyFilter((s) =>
              toggle(s, v, DIFFICULTY_FILTER_OPTIONS as unknown as { value: string }[]),
            )
          }
          helper={
            difficultyFilter.size === 0
              ? "All levels included."
              : `Showing only ${Array.from(difficultyFilter).join(", ")}.`
          }
        />
      </section>

      {groups.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No mechanisms with questions yet. Authored content lives under{" "}
          <code>content/mechanisms/</code>.
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {groups.map((g) => (
            <li key={g.system} className="flex flex-col gap-3">
              <h2 className="font-heading text-xl font-medium capitalize">{g.system}</h2>
              <ul className="flex flex-col gap-2">
                {g.mechanisms.map((m) => (
                  <li
                    key={m.id}
                    className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                  >
                    <div className="flex flex-col">
                      <Link
                        href={`/mechanisms/${encodeURIComponent(m.id)}`}
                        className="font-medium underline-offset-2 hover:underline"
                      >
                        {m.title}
                      </Link>
                      <p className="text-muted-foreground text-xs">
                        {m.cardCount} question{m.cardCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Link
                      href={`/self-test/session?mechanism=${encodeURIComponent(m.id)}${filterQuery}`}
                      className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md px-3 py-1.5 text-sm font-medium"
                      data-testid={`start-self-test-${m.id}`}
                    >
                      Start self-test
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

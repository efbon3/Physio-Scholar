"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  DIFFICULTY_FILTER_OPTIONS,
  FilterChips,
  PRIORITY_FILTER_OPTIONS,
} from "@/components/filter-chips";
import { buttonVariants } from "@/components/ui/button";
import { applyCardFilters, encodeFilterParam } from "@/lib/content/card-filters";
import type { Card, DifficultyLevel, PriorityLevel, QuestionFormat } from "@/lib/content/cards";
import { cn } from "@/lib/utils";

type Props = {
  mechanismId: string;
  cards: readonly Card[];
};

type FormatCard = {
  format: QuestionFormat;
  title: string;
  description: string;
  /**
   * Builds the session URL for this format. Filter selection is
   * passed through as `?priority=…&difficulty=…` so the destination
   * page can re-apply it server-side.
   */
  href: (mechanismId: string, query: string) => string;
};

const FORMATS: readonly FormatCard[] = [
  {
    format: "mcq",
    title: "Multiple choice",
    description:
      "Four-option questions with misconception-aware feedback on wrong answers. Graded automatically.",
    href: (id, query) => `/test/${encodeURIComponent(id)}/mcq${query}`,
  },
  {
    format: "descriptive",
    title: "Descriptive",
    description:
      "Type a free-text answer, compare against the model answer, then self-rate Green/Yellow/Red.",
    href: (id, query) => `/test/${encodeURIComponent(id)}/descriptive${query}`,
  },
  {
    format: "fill_blank",
    title: "Fill in the blank",
    description:
      "Short numeric or term answer. Graded automatically with partial credit for unit errors.",
    href: (id, query) => `/test/${encodeURIComponent(id)}/fill-blank${query}`,
  },
];

const PRIORITY_VALUES = PRIORITY_FILTER_OPTIONS.map((o) => o.value);
const DIFFICULTY_VALUES = DIFFICULTY_FILTER_OPTIONS.map((o) => o.value);

/**
 * Zone 2 of the two-zone mechanism page (build spec §2.3). Picks
 * format and (optionally) narrows the deck by priority + difficulty
 * before launching a session. Filter selection persists to
 * localStorage per (mechanism), so a returning student lands on
 * their last-used filter automatically.
 *
 * First-time defaults follow the spec: priority = "must", difficulty
 * = "foundational". Treating any single-axis "all selected" choice
 * as "no filter" — same convention as the existing FilterChips and
 * URL-param parsers.
 */
export function FormatPicker({ mechanismId, cards }: Props) {
  // Defaults match build spec §2.3 ("New students … see priority and
  // difficulty pre-defaulted to 'must' and 'foundational'"). Hydrated
  // from localStorage in a useEffect because SSR can't see the
  // browser's storage during render.
  const [priorityFilter, setPriorityFilter] = useState<Set<string>>(() => new Set(["must"]));
  const [difficultyFilter, setDifficultyFilter] = useState<Set<string>>(
    () => new Set(["foundational"]),
  );
  const [hydrated, setHydrated] = useState(false);

  const storageKey = `physio:filter:${mechanismId}`;

  // Hydrate from localStorage on mount. Older / missing entries fall
  // through to the spec defaults set above. Uses the standard
  // SSR-safe hydration pattern (default in render, replace from
  // storage in an effect) — the setState-in-effect lint rule fires
  // here because the rule can't tell legitimate hydration from
  // render-loop bugs, but this *is* the React-recommended shape.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { priority?: string[]; difficulty?: string[] };
        if (Array.isArray(parsed.priority)) {
          const valid = parsed.priority.filter((v) => PRIORITY_VALUES.includes(v as PriorityLevel));
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setPriorityFilter(new Set(valid));
        }
        if (Array.isArray(parsed.difficulty)) {
          const valid = parsed.difficulty.filter((v) =>
            DIFFICULTY_VALUES.includes(v as DifficultyLevel),
          );
          setDifficultyFilter(new Set(valid));
        }
      }
    } catch {
      // Corrupt entry — keep the defaults rather than block the UI.
    }
    setHydrated(true);
  }, [storageKey]);

  // Persist the selection so a returning student doesn't have to
  // re-pick filters each session. Skipped before hydration so the
  // first paint's defaults don't overwrite a real saved selection.
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          priority: Array.from(priorityFilter),
          difficulty: Array.from(difficultyFilter),
        }),
      );
    } catch {
      // Storage might be full / disabled (private mode). Filtering
      // still works in-memory; we just lose persistence.
    }
  }, [priorityFilter, difficultyFilter, storageKey, hydrated]);

  function togglePriority(value: string) {
    setPriorityFilter((prev) => toggleValue(prev, value));
  }

  function toggleDifficulty(value: string) {
    setDifficultyFilter((prev) => toggleValue(prev, value));
  }

  // Convert chip Sets to the form `applyCardFilters` expects. Empty
  // Set OR full Set → null ("no filter on this axis").
  const priorityArg = setToFilterArg(priorityFilter, PRIORITY_VALUES) as
    | readonly PriorityLevel[]
    | null;
  const difficultyArg = setToFilterArg(difficultyFilter, DIFFICULTY_VALUES) as
    | readonly DifficultyLevel[]
    | null;

  const publishedCards = cards.filter((c) => c.status === "published");
  const filteredCards = applyCardFilters(publishedCards, {
    priority: priorityArg,
    difficulty: difficultyArg,
  });
  const counts = countsByFormat(filteredCards);
  const total = filteredCards.length;
  const totalUnfiltered = publishedCards.length;

  // URL query string carrying the active filter, suitable for
  // appending to a session href. Empty string when no filter is
  // active, so unfiltered URLs stay clean.
  const query = buildFilterQuery(priorityArg, difficultyArg);

  return (
    <section
      aria-labelledby="test-yourself-heading"
      className="border-border flex flex-col gap-4 rounded-md border p-4"
    >
      <header className="flex items-baseline justify-between">
        <h2 id="test-yourself-heading" className="text-lg font-semibold">
          Test yourself
        </h2>
        <p className="text-muted-foreground text-xs">
          {totalUnfiltered === 0
            ? "No questions authored yet"
            : total === totalUnfiltered
              ? `${total} question${total === 1 ? "" : "s"} across ${nonZeroFormats(counts)} format${
                  nonZeroFormats(counts) === 1 ? "" : "s"
                }`
              : `${total} of ${totalUnfiltered} match the filter`}
        </p>
      </header>

      {totalUnfiltered > 0 ? (
        <div className="flex flex-col gap-3">
          <FilterChips
            legend="Priority"
            options={PRIORITY_FILTER_OPTIONS}
            selected={priorityFilter}
            onToggle={togglePriority}
          />
          <FilterChips
            legend="Difficulty"
            options={DIFFICULTY_FILTER_OPTIONS}
            selected={difficultyFilter}
            onToggle={toggleDifficulty}
          />
        </div>
      ) : null}

      <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {FORMATS.map((f) => {
          const n = counts[f.format];
          const disabled = n === 0;
          return (
            <li
              key={f.format}
              className="border-border bg-card flex min-w-0 flex-1 flex-col gap-2 rounded-md border p-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-medium">{f.title}</h3>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px]",
                    disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                  )}
                >
                  {n} {n === 1 ? "question" : "questions"}
                </span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">{f.description}</p>
              {disabled ? (
                <span
                  aria-disabled="true"
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                    "pointer-events-none opacity-50",
                  )}
                >
                  No questions match
                </span>
              ) : (
                <Link
                  href={f.href(mechanismId, query)}
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Start {f.title.toLowerCase()}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-muted-foreground text-[11px] leading-relaxed">
        Test sessions update your daily review queue. Toggle &ldquo;Practice only&rdquo; inside a
        session to drill without changing your schedule.
      </p>
    </section>
  );
}

function toggleValue(prev: ReadonlySet<string>, value: string): Set<string> {
  const next = new Set(prev);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

/**
 * Convert a chip Set into the `applyCardFilters` argument shape.
 * Empty Set or "all values selected" both mean "no filter" — same
 * convention as `FilterChips` and the URL-param parsers.
 */
function setToFilterArg(
  selected: ReadonlySet<string>,
  allValues: readonly string[],
): readonly string[] | null {
  if (selected.size === 0) return null;
  if (selected.size === allValues.length) return null;
  return Array.from(selected);
}

function countsByFormat(cards: readonly Card[]): Record<QuestionFormat, number> {
  const counts: Record<QuestionFormat, number> = {
    mcq: 0,
    descriptive: 0,
    fill_blank: 0,
  };
  for (const c of cards) {
    counts[c.format] += 1;
  }
  return counts;
}

function nonZeroFormats(counts: Record<QuestionFormat, number>): number {
  return Object.values(counts).filter((n) => n > 0).length;
}

function buildFilterQuery(
  priority: readonly PriorityLevel[] | null,
  difficulty: readonly DifficultyLevel[] | null,
): string {
  const parts: string[] = [];
  const p = encodeFilterParam(priority);
  if (p) parts.push(`priority=${encodeURIComponent(p)}`);
  const d = encodeFilterParam(difficulty);
  if (d) parts.push(`difficulty=${encodeURIComponent(d)}`);
  return parts.length === 0 ? "" : `?${parts.join("&")}`;
}

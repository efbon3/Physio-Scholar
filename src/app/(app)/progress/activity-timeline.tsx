"use client";

import { useMemo, useState } from "react";

import { activityShade, activityShadingThresholds, type ActivityCell } from "@/lib/srs/activity";
import { cn } from "@/lib/utils";

const SHADE_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-muted/30",
  1: "bg-emerald-100",
  2: "bg-emerald-300",
  3: "bg-emerald-500",
  4: "bg-emerald-700",
};

// Day-number text on each cell. Shade 0 (no activity) had failing
// contrast with text-muted-foreground at the small 10px size axe checks
// at; using text-foreground keeps it above 4.5:1.
const SHADE_TEXT: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "text-foreground",
  1: "text-foreground",
  2: "text-foreground",
  3: "text-emerald-50",
  4: "text-emerald-50",
};

/**
 * 35-day activity grid with click-to-expand per-day breakdowns.
 * Five rows of seven days, oldest first (top-left), so the visual
 * mirrors the calendar order a learner reads naturally.
 *
 * Cells are colour-shaded by quartile of non-zero activity (so a
 * sparse pilot still shows distinct levels). Clicking a cell opens
 * a detail panel below the grid showing per-mechanism breakdown for
 * that day. Tapping the same cell twice closes the panel.
 *
 * Read-only — this is a retrospective timeline, not an editor. All
 * data comes from Dexie via the parent dashboard.
 */
export function ActivityTimeline({ cells }: { cells: readonly ActivityCell[] }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const thresholds = useMemo(() => activityShadingThresholds(cells), [cells]);
  const selected = selectedKey ? (cells.find((c) => c.dateKey === selectedKey) ?? null) : null;

  const monthSpan = formatMonthSpan(cells);

  return (
    <section aria-label="Activity timeline" className="flex flex-col gap-3">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-xl font-medium">Last 5 weeks</h2>
        {monthSpan ? <p className="text-muted-foreground text-xs">{monthSpan}</p> : null}
      </header>

      <ul aria-label="Activity grid, 5 weeks" className="grid list-none grid-cols-7 gap-1.5 p-0">
        {cells.map((cell) => {
          const shade = activityShade(cell.count, thresholds);
          const isSelected = cell.dateKey === selectedKey;
          const day = cell.dateKey.slice(8, 10);
          return (
            <li key={cell.dateKey}>
              <button
                type="button"
                onClick={() => setSelectedKey(isSelected ? null : cell.dateKey)}
                aria-pressed={isSelected}
                aria-label={`${cell.dateKey}: ${cell.count} review${cell.count === 1 ? "" : "s"}`}
                className={cn(
                  "flex aspect-square w-full flex-col items-center justify-center rounded-md text-xs font-medium ring-offset-2 transition-shadow",
                  SHADE_CLASS[shade],
                  SHADE_TEXT[shade],
                  isSelected ? "ring-primary ring-2" : "hover:ring-input hover:ring-2",
                )}
                data-testid={`activity-cell-${cell.dateKey}`}
              >
                <span className="text-[10px]">{day}</span>
                <span>{cell.count > 0 ? cell.count : ""}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <Legend />

      {selected ? <DayDetail cell={selected} onClose={() => setSelectedKey(null)} /> : null}
    </section>
  );
}

function Legend() {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-xs">
      <span>Less</span>
      {([0, 1, 2, 3, 4] as const).map((shade) => (
        <span key={shade} aria-hidden className={cn("h-3 w-3 rounded-sm", SHADE_CLASS[shade])} />
      ))}
      <span>More</span>
    </div>
  );
}

function DayDetail({ cell, onClose }: { cell: ActivityCell; onClose: () => void }) {
  return (
    <article
      aria-label={`Detail for ${cell.dateKey}`}
      className="border-input flex flex-col gap-2 rounded-md border p-4"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">{formatLongDate(cell.dateKey)}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted rounded-md border px-2 py-0.5 text-xs"
        >
          Close
        </button>
      </header>
      {cell.count === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews on this day.</p>
      ) : (
        <>
          <p className="text-sm">
            <strong className="font-medium">{cell.count}</strong> review
            {cell.count === 1 ? "" : "s"} across {cell.byMechanism.length} mechanism
            {cell.byMechanism.length === 1 ? "" : "s"}.
          </p>
          <ul className="flex flex-col gap-1 text-sm">
            {cell.byMechanism.map((m) => (
              <li key={m.mechanismId} className="flex justify-between gap-2">
                <span>{m.title}</span>
                <span className="text-muted-foreground tabular-nums">{m.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}

function formatMonthSpan(cells: readonly ActivityCell[]): string | null {
  if (cells.length === 0) return null;
  const first = cells[0]!.dateKey;
  const last = cells.at(-1)!.dateKey;
  const firstLabel = formatMonth(first);
  const lastLabel = formatMonth(last);
  return firstLabel === lastLabel ? firstLabel : `${firstLabel} — ${lastLabel}`;
}

function formatMonth(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

function formatLongDate(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

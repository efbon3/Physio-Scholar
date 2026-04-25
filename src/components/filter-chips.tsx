"use client";

import { cn } from "@/lib/utils";

/**
 * Multi-select chip group for the priority + difficulty filter UI on
 * /today and /exam picker pages. Stays stateless — the parent owns the
 * `selected` set, this component just renders chips and reports
 * toggles. Treating empty / full selection as "no filter" is the
 * caller's responsibility (so a "must,should,good" URL collapses to
 * an omitted param).
 */
export type FilterChipsProps = {
  legend: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  /** Selected values. Empty array = "all" displayed; caller decides URL semantics. */
  selected: ReadonlySet<string>;
  onToggle: (value: string) => void;
  /** Optional helper line under the legend. */
  helper?: string;
};

export function FilterChips({ legend, options, selected, onToggle, helper }: FilterChipsProps) {
  const allSelected = selected.size === 0 || selected.size === options.length;
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="text-xs font-medium tracking-widest uppercase">{legend}</legend>
      {helper ? <p className="text-muted-foreground text-xs">{helper}</p> : null}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isOn = allSelected || selected.has(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              aria-pressed={isOn}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                isOn
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted text-muted-foreground border-input",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Canonical priority options in the order they should appear. */
export const PRIORITY_FILTER_OPTIONS = [
  { value: "must", label: "Must-know" },
  { value: "should", label: "Should-know" },
  { value: "good", label: "Good-to-know" },
] as const;

/** Canonical difficulty options in the order they should appear. */
export const DIFFICULTY_FILTER_OPTIONS = [
  { value: "foundational", label: "Foundational" },
  { value: "standard", label: "Standard" },
  { value: "advanced", label: "Advanced" },
] as const;

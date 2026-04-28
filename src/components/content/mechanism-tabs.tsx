"use client";

import { useId, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Tab keys used by the Chapter detail page. The labels and ordering
 * come from SOP Appendix A (Layer 1 Core → Layer 4 Clinical). The string
 * keys match `ChapterLayers` in `src/lib/content/loader.ts`.
 */
export type MechanismTabKey = "core" | "working" | "deepDive" | "clinicalIntegration";

export const MECHANISM_TAB_LABEL: Record<MechanismTabKey, string> = {
  core: "Core",
  working: "Working",
  deepDive: "Deep Dive",
  clinicalIntegration: "Clinical",
};

export const MECHANISM_TAB_ORDER: readonly MechanismTabKey[] = [
  "core",
  "working",
  "deepDive",
  "clinicalIntegration",
];

type Props = {
  /**
   * Prerendered layer content keyed by tab. Rendering happens in the
   * parent server component so react-markdown stays out of the client
   * bundle — the tabs component just owns the show/hide state.
   */
  panels: Partial<Record<MechanismTabKey, ReactNode>>;
  /** Initial active tab. Defaults to the first populated tab. */
  defaultTab?: MechanismTabKey;
};

/**
 * Accessible tablist for the four Chapter layers. Keyboard support
 * follows WAI-ARIA APG: ArrowLeft/ArrowRight move focus + activate,
 * Home/End jump to ends, Tab moves into the active panel.
 */
export function ChapterTabs({ panels, defaultTab }: Props) {
  const availableTabs = MECHANISM_TAB_ORDER.filter((key) => panels[key] !== undefined);
  const initialTab = defaultTab && panels[defaultTab] ? defaultTab : availableTabs[0];
  const [active, setActive] = useState<MechanismTabKey | undefined>(initialTab);
  const tablistId = useId();

  if (!initialTab || availableTabs.length === 0) {
    return <p className="text-muted-foreground text-sm">No content available yet.</p>;
  }

  function focusTab(key: MechanismTabKey) {
    setActive(key);
    // Shift focus so keyboard users see the active tab highlighted.
    const btn = document.getElementById(`${tablistId}-tab-${key}`);
    btn?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const current = active;
    if (!current) return;
    const idx = availableTabs.indexOf(current);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab(availableTabs[(idx + 1) % availableTabs.length]);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab(availableTabs[(idx - 1 + availableTabs.length) % availableTabs.length]);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(availableTabs[0]);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(availableTabs[availableTabs.length - 1]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Chapter layers"
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-1 border-b"
      >
        {availableTabs.map((key) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              id={`${tablistId}-tab-${key}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tablistId}-panel-${key}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(key)}
              className={cn(
                "border-b-2 px-3 py-2 text-sm transition-colors",
                isActive
                  ? "border-primary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              {MECHANISM_TAB_LABEL[key]}
            </button>
          );
        })}
      </div>
      {availableTabs.map((key) => {
        const isActive = key === active;
        return (
          <section
            key={key}
            id={`${tablistId}-panel-${key}`}
            role="tabpanel"
            aria-labelledby={`${tablistId}-tab-${key}`}
            hidden={!isActive}
            tabIndex={0}
            className="focus-visible:outline-ring rounded-md focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <div className="leading-7 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-medium [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6">
              {panels[key]}
            </div>
          </section>
        );
      })}
    </div>
  );
}

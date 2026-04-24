import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { collectPageErrors } from "./helpers";

test.describe("Systems tab + mechanism renderer", () => {
  test("systems index lists at least one mechanism under cardiovascular", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/systems");

    await expect(page.getByRole("heading", { name: /^systems$/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /cardiovascular/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Frank-Starling Mechanism/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("mechanism page renders layer tabs + stats + Study CTA and passes axe", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/systems/cardiovascular/frank-starling");

    await expect(page.getByRole("heading", { name: /Frank-Starling Mechanism/i })).toBeVisible();

    // Layer tablist exposes the four tabs as role=tab (ARIA APG pattern).
    for (const label of ["Core", "Working", "Deep Dive", "Clinical"]) {
      await expect(page.getByRole("tab", { name: new RegExp(`^${label}$`) })).toBeVisible();
    }

    // Stats block is rendered (loads asynchronously from Dexie).
    await expect(page.getByLabel(/your progress on this mechanism/i)).toBeVisible();

    // Study CTA links to /review with the mechanism filter.
    const cta = page.getByRole("link", { name: /study this mechanism/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/review?mechanism=frank-starling");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("mechanism tabs switch the visible panel when clicked", async ({ page }) => {
    await page.goto("/systems/cardiovascular/frank-starling");

    const coreTab = page.getByRole("tab", { name: /^core$/i });
    const workingTab = page.getByRole("tab", { name: /^working$/i });

    // Core starts selected.
    await expect(coreTab).toHaveAttribute("aria-selected", "true");
    await expect(workingTab).toHaveAttribute("aria-selected", "false");

    await workingTab.click();
    await expect(workingTab).toHaveAttribute("aria-selected", "true");
    await expect(coreTab).toHaveAttribute("aria-selected", "false");

    // The Working panel is now visible; the Core panel is hidden.
    const workingPanel = page.getByRole("tabpanel", { name: /^working$/i });
    await expect(workingPanel).toBeVisible();
  });

  test("wrong-system slug 404s instead of rendering the mechanism", async ({ page }) => {
    const response = await page.goto("/systems/renal/frank-starling");
    // Expect Next.js 404 — frank-starling is cardiovascular, not renal.
    expect(response?.status()).toBe(404);
  });

  test("review page shows a focus banner when launched via ?mechanism=", async ({ page }) => {
    await page.goto("/review?mechanism=frank-starling");

    // Banner surfaces which mechanism the session is drilling.
    await expect(page.getByText(/^studying:/i)).toBeVisible();
    await expect(page.getByText(/Frank-Starling Mechanism/i)).toBeVisible();
  });

  test("review page ignores a malformed ?mechanism= and falls back", async ({ page }) => {
    // The input is non-kebab — `normaliseMechanismId` should reject it,
    // so no focus banner appears even though the query is present.
    await page.goto("/review?mechanism=../../etc/passwd");
    await expect(page.getByText(/^studying:/i)).toHaveCount(0);
  });
});

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

  test("mechanism page renders layers and passes axe", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/systems/cardiovascular/frank-starling");

    await expect(page.getByRole("heading", { name: /Frank-Starling Mechanism/i })).toBeVisible();
    // Four layer section headings present.
    for (const label of ["Core", "Working", "Deep Dive", "Clinical"]) {
      await expect(page.getByRole("heading", { name: new RegExp(`^${label}$`) })).toBeVisible();
    }

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("wrong-system slug 404s instead of rendering the mechanism", async ({ page }) => {
    const response = await page.goto("/systems/renal/frank-starling");
    // Expect Next.js 404 — frank-starling is cardiovascular, not renal.
    expect(response?.status()).toBe(404);
  });
});

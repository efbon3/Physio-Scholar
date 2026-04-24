import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { collectPageErrors } from "./helpers";

test.describe("Today dashboard + app nav", () => {
  test("today page renders greeting + Start review CTA + nav tabs", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/today");

    await expect(page.getByRole("heading", { name: /^hi/i, level: 1 })).toBeVisible({
      timeout: 10_000,
    });

    // Global nav exposes all three tabs.
    await expect(page.getByRole("link", { name: /^today$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^systems$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^progress$/i })).toBeVisible();

    // Primary CTA is "Start review" once the queue summary resolves.
    await expect(page.getByRole("link", { name: /start review/i })).toBeVisible({
      timeout: 10_000,
    });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("progress page renders placeholder content and passes axe", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/progress");

    await expect(page.getByRole("heading", { name: /your progress/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("nav active state highlights the current tab", async ({ page }) => {
    await page.goto("/today");
    await expect(page.getByRole("link", { name: /^today$/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByRole("link", { name: /^progress$/i })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});

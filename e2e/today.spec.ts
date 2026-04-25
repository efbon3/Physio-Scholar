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

  test("progress page renders dashboard widgets and passes axe", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/progress");

    await expect(page.getByRole("heading", { name: /your progress/i })).toBeVisible();
    // Section landmarks are present — this is the Dexie-backed dashboard,
    // not the D1 placeholder. Sparkline + headline stats + mechanism list.
    await expect(page.getByLabel(/headline stats/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel(/retention and card pool/i)).toBeVisible();
    await expect(page.getByLabel(/daily activity/i)).toBeVisible();
    await expect(page.getByLabel(/per-mechanism mastery/i)).toBeVisible();

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

  test("calendar page renders with empty state and passes axe", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/calendar");

    await expect(page.getByRole("heading", { name: /upcoming/i })).toBeVisible({
      timeout: 10_000,
    });
    // Empty state copy — CI has no Supabase env vars, so the read returns []
    // and we show the "Nothing scheduled" line.
    await expect(page.getByText(/Nothing scheduled/i)).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("profile page renders with personal-detail fields and passes axe", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/profile");

    await expect(page.getByRole("heading", { name: /your details/i })).toBeVisible({
      timeout: 10_000,
    });
    // The four editable text inputs are exposed.
    await expect(page.getByLabel(/^full name$/i)).toBeVisible();
    await expect(page.getByLabel(/^date of birth$/i)).toBeVisible();
    await expect(page.getByLabel(/^roll number$/i)).toBeVisible();
    await expect(page.getByLabel(/^phone number$/i)).toBeVisible();
    await expect(page.getByLabel(/^address$/i)).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
});

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { collectPageErrors } from "./helpers";

test.describe("Auth pages render and are accessible", () => {
  test("signup page exposes consent checkboxes and has no axe violations", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/signup");

    await expect(page.getByRole("heading", { name: /request access/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Both required consent checkboxes must be present and focusable.
    await expect(page.getByRole("checkbox", { name: /terms of service/i })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: /privacy policy/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("login page renders with link to signup and reset", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /forgot your password\?/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /create one/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("reset password page renders and sends form", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/reset-password");

    await expect(page.getByRole("heading", { name: /reset your password/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
});

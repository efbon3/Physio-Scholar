import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { collectPageErrors } from "./helpers";

/**
 * Smoke + axe coverage for the simulator and exam surfaces shipped in
 * the I-series and H2. Runs against the CI playwright config with no
 * Supabase env vars, so middleware is a pass-through and the pages
 * render without the auth redirect.
 */
test.describe("Simulators + exam surfaces", () => {
  test("simulators index lists both and passes axe", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/simulators");

    await expect(page.getByRole("heading", { name: /interactive models/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Frank-Starling curve/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Baroreceptor reflex/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("Frank-Starling simulator renders and passes axe", async ({ page }) => {
    await page.goto("/simulators/frank-starling");
    await expect(page.getByRole("heading", { name: /Frank-Starling curve/i })).toBeVisible();
    await expect(page.getByRole("img", { name: /Frank-Starling curve plot/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Baroreceptor simulator renders and passes axe", async ({ page }) => {
    await page.goto("/simulators/baroreceptor-reflex");
    await expect(page.getByRole("heading", { name: /^baroreceptor reflex$/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("exam landing renders, pickers visible, passes axe", async ({ page }) => {
    await page.goto("/exam");
    await expect(page.getByRole("heading", { name: /exam mode/i })).toBeVisible();
    await expect(page.getByRole("radio", { name: /MBBS Exams/i })).toBeVisible();
    await expect(page.getByRole("radio", { name: /Pre-PG/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("pre-PG drill produces an MCQ against shipped content (regression for bug G)", async ({
    page,
  }) => {
    // Before the alias fix, the shipped content was tagged `neet-pg`
    // and the filter accepted only literal `pre-pg`. This page would
    // render "No questions available" — with the alias map + canonical
    // tokens in frontmatter, a drill should render.
    await page.goto("/exam/session?type=pre-pg&count=20");
    await expect(page.getByRole("heading", { name: /no questions available/i })).toHaveCount(0);
    // Positive: the drill has a Next/Skip/Submit button.
    await expect(
      page.getByRole("button", { name: /submit drill|^next$|^skip$/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("MBBS drill also produces an MCQ against shipped content", async ({ page }) => {
    await page.goto("/exam/session?type=mbbs&count=20");
    await expect(page.getByRole("heading", { name: /no questions available/i })).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /submit drill|^next$|^skip$/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { collectPageErrors } from "./helpers";

/**
 * Full learning loop — at least one pass of it — against whatever
 * mechanisms ship in content/.
 *
 * Runs in the CI Playwright config, which starts the production build
 * with no Supabase env vars. That means:
 *   - middleware is a pass-through (no redirect to /login)
 *   - the /review page's own getUser() returns null but the guarded
 *     `NEXT_PUBLIC_SUPABASE_URL` branch doesn't trip, so it renders
 *     the SessionPlayer with profileId="preview" — exactly the fallback
 *     documented in src/app/review/page.tsx
 *
 * Verifying the loop end-to-end in this mode gives us a "is the shape
 * of the UI right" signal without needing to wire auth fixtures.
 *
 * Per the 2026-04-26 redesign the per-card flow is:
 *   1. Type attempt into the textarea
 *   2. (optional) Show hint(s)
 *   3. Submit attempt → locks the textarea
 *   4. Show answer → reveals correct answer + explanation
 *   5. Self-grade (Correct / Partially wrong / Partially correct / Wrong)
 *      → mapped internally to an SM-2 rating that drives the scheduler
 *
 * The test self-grades "Correct" on every card until the session
 * finishes, so it works regardless of how many cards are present.
 */
test.describe("Review session — end-to-end loop", () => {
  test("full submit-and-self-grade session completes cleanly", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/review");

    // Pre-flight modal: dismiss it before the card UI appears.
    const beginButton = page.getByTestId("preflight-accept");
    await expect(beginButton).toBeVisible({ timeout: 10_000 });
    await beginButton.click();

    // Wait for the queue to assemble on the client.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("region", { name: /question/i })).toBeVisible();

    // First card walked all the way: attempt → hint → submit → reveal → grade.
    await page.getByRole("textbox", { name: /your attempt/i }).fill("Placeholder attempt text.");
    await page.getByRole("button", { name: /show hint/i }).click();
    await expect(page.getByRole("region", { name: /hints/i })).toBeVisible();
    await page.getByRole("button", { name: /submit attempt/i }).click();
    await page.getByRole("button", { name: /show answer/i }).click();
    await expect(page.getByRole("heading", { name: /^correct answer$/i })).toBeVisible();

    let correctButton = page.getByTestId("self-grade-correct");
    await expect(correctButton).toBeEnabled({ timeout: 5_000 });
    await correctButton.click();

    // Walk through remaining cards. The "Submit attempt" button is
    // present before submit, so its visibility marks a fresh card.
    const completeHeading = page.getByRole("heading", { name: /session complete/i });
    const maxCards = 50;
    for (let i = 0; i < maxCards; i += 1) {
      const submit = page.getByRole("button", { name: /submit attempt/i });
      await Promise.race([
        submit.waitFor({ state: "visible", timeout: 8_000 }),
        completeHeading.waitFor({ state: "visible", timeout: 8_000 }),
      ]);
      if (await completeHeading.isVisible()) break;
      await page.getByRole("textbox", { name: /your attempt/i }).fill("ok");
      await submit.click();
      await page.getByRole("button", { name: /show answer/i }).click();
      correctButton = page.getByTestId("self-grade-correct");
      await expect(correctButton).toBeEnabled({ timeout: 5_000 });
      await correctButton.click();
    }

    await expect(completeHeading).toBeVisible({ timeout: 5_000 });

    expect(errors).toEqual([]);
  });

  test("axe WCAG 2.2 AA clean on the reveal state", async ({ page }) => {
    await page.goto("/review");
    const beginButton = page.getByTestId("preflight-accept");
    await expect(beginButton).toBeVisible({ timeout: 10_000 });
    await beginButton.click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10_000 });

    // Drive UI to the revealed state: type → submit → show answer.
    await page.getByRole("textbox", { name: /your attempt/i }).fill("placeholder");
    await page.getByRole("button", { name: /submit attempt/i }).click();
    await page.getByRole("button", { name: /show answer/i }).click();
    await expect(page.getByRole("heading", { name: /^correct answer$/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

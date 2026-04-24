import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { collectPageErrors } from "./helpers";

/**
 * Full six-step learning loop — at least one pass of it — against
 * whatever mechanisms ship in content/.
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
 * The test rates Good on every card until the session finishes, so it
 * works regardless of how many mechanisms (and therefore cards) are in
 * the filesystem fallback today.
 */
test.describe("Review session — end-to-end loop", () => {
  test("full rate-good session completes cleanly", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/review");

    // Wait for the queue to assemble on the client.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10_000 });

    // A Question section renders with a stem. Don't couple to a specific
    // mechanism's first question — the queue order depends on which
    // mechanisms exist, and content changes shouldn't break the loop test.
    await expect(page.getByRole("region", { name: /question/i })).toBeVisible();

    // Walk through the first card the full way: attempt → hint → reveal.
    await page.getByRole("textbox", { name: /your attempt/i }).fill("Placeholder attempt text.");
    await page.getByRole("button", { name: /show hint/i }).click();
    await expect(page.getByRole("region", { name: /hints/i })).toBeVisible();
    await page.getByRole("button", { name: /show answer/i }).click();
    await expect(page.getByRole("heading", { name: /^correct answer$/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^why$/i })).toBeVisible();

    // Rating delay (2s) then the Good button unlocks for this card.
    let goodButton = page.getByTestId("rate-good");
    await expect(goodButton).toBeEnabled({ timeout: 5_000 });
    await goodButton.click();

    // Rate through any remaining cards. After each rating, race the
    // next card's "Show answer" button against the completion heading.
    // The button is only present before reveal, so its visibility means
    // we're on a fresh card (the attempt textarea is briefly still in
    // the DOM from the previous card during the transition, so we can't
    // use it as the ready signal).
    const completeHeading = page.getByRole("heading", { name: /session complete/i });
    const maxCards = 50;
    for (let i = 0; i < maxCards; i += 1) {
      const showAnswer = page.getByRole("button", { name: /show answer/i });
      await Promise.race([
        showAnswer.waitFor({ state: "visible", timeout: 8_000 }),
        completeHeading.waitFor({ state: "visible", timeout: 8_000 }),
      ]);
      if (await completeHeading.isVisible()) break;
      await page.getByRole("textbox", { name: /your attempt/i }).fill("ok");
      await showAnswer.click();
      goodButton = page.getByTestId("rate-good");
      await expect(goodButton).toBeEnabled({ timeout: 5_000 });
      await goodButton.click();
    }

    await expect(completeHeading).toBeVisible({ timeout: 5_000 });

    expect(errors).toEqual([]);
  });

  test("axe WCAG 2.2 AA clean on the reveal state", async ({ page }) => {
    await page.goto("/review");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10_000 });

    // Drive the UI to the "revealed" state so axe audits it too.
    await page.getByRole("textbox", { name: /your attempt/i }).fill("placeholder");
    await page.getByRole("button", { name: /show answer/i }).click();
    await expect(page.getByRole("heading", { name: /^correct answer$/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

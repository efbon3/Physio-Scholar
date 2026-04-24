import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { collectPageErrors } from "./helpers";

/**
 * Full six-step learning loop — at least one pass of it — against the
 * placeholder Frank-Starling mechanism that ships in content/.
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
 */
test.describe("Review session — end-to-end loop", () => {
  test("full rate-good session completes cleanly", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/review");

    // Wait for the queue to assemble on the client.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10_000 });

    // Stem should be visible — match on the "infused with ... saline" phrase.
    await expect(page.getByText(/infused with .* saline/i)).toBeVisible();

    // Type an attempt. `getByRole('textbox')` is unambiguous — the
    // section also has aria-label "Your attempt", which would match getByLabel.
    await page
      .getByRole("textbox", { name: /your attempt/i })
      .fill("Frank-Starling; SV rises at constant HR.");

    // Trigger the first hint, then reveal.
    await page.getByRole("button", { name: /show hint/i }).click();
    await expect(page.getByRole("region", { name: /hints/i })).toBeVisible();
    await page.getByRole("button", { name: /show answer/i }).click();

    // Reveal section shows correct answer + elaborative explanation.
    await expect(page.getByRole("heading", { name: /^correct answer$/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^why$/i })).toBeVisible();

    // Rating buttons are hidden for 2 seconds then fade in.
    const goodButton = page.getByTestId("rate-good");
    await expect(goodButton).toBeEnabled({ timeout: 5_000 });

    // Submit rating — session completes because we only have one card.
    await goodButton.click();
    await expect(page.getByRole("heading", { name: /session complete/i })).toBeVisible({
      timeout: 5_000,
    });

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

import { expect, test } from "@playwright/test";
import { collectPageErrors } from "./helpers";

test("home page renders without console errors", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
  expect(errors).toEqual([]);
});

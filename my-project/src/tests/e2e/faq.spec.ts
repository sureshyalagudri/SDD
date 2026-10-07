import { expect, test } from "@playwright/test";

test.describe("FAQ page", () => {
  test("loads with at least six collapsed questions", async ({ page }) => {
    await page.goto("/faq/");
    const items = page.locator("details");
    expect(await items.count()).toBeGreaterThanOrEqual(6);
    await expect(page.locator("details[open]")).toHaveCount(0);
  });

  test("expands with keyboard and collapses on click", async ({ page }) => {
    await page.goto("/faq/");
    const first = page.locator("details").first();
    const summary = first.locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("open", "");
    await expect(first.locator("p")).toBeVisible();
    await summary.click();
    await expect(first).not.toHaveAttribute("open", "");
  });
});

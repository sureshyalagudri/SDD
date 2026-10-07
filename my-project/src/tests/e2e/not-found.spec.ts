import { expect, test } from "@playwright/test";

test("unknown URL shows the branded not-found page with a way home", async ({ page }) => {
  const response = await page.goto("/does-not-exist/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/isn.t/i);
  await page.getByRole("link", { name: /back to the landing page/i }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Art of Listening");
});

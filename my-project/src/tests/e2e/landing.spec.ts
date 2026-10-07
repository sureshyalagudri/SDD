import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows the featured episode hero with all data points", async ({ page }) => {
    await page.goto("/");
    const hero = page.getByRole("region", { name: /the art of listening/i });
    await expect(hero).toBeVisible();
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(hero.getByRole("img")).toHaveAttribute("alt", /episode 7/i);
    await expect(hero.getByText(/featured episode/i)).toBeVisible();
    await expect(hero.getByText("55:40")).toBeVisible();
    await expect(hero.locator("time")).toHaveAttribute("datetime", "2026-02-17");
  });

  test("hero CTA navigates to the featured episode page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /listen now/i }).click();
    await expect(page).toHaveURL(/\/episodes\/ep-07-the-art-of-listening\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Art of Listening");
  });

  test("primary navigation reaches every top-level page", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await nav.getByRole("link", { name: "Episodes" }).click();
    await expect(page).toHaveURL(/\/episodes\/$/);
    await nav.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about\/$/);
    await nav.getByRole("link", { name: "FAQ" }).click();
    await expect(page).toHaveURL(/\/faq\/$/);
  });

  test("offers at least three Listen-on platform links", async ({ page }) => {
    await page.goto("/");
    const links = page.getByRole("region", { name: "Listen on" }).getByRole("link");
    expect(await links.count()).toBeGreaterThanOrEqual(3);
    for (const href of await links.evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))) {
      expect(href).toMatch(/^https:\/\//);
    }
  });
});

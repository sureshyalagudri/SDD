import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PAGES } from "./pages";

test.describe("Accessibility (axe, WCAG 2.1 A/AA)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "chromium", "runs once");
  });

  for (const path of PAGES) {
    for (const theme of ["light", "dark"] as const) {
      test(`${path} in ${theme} theme has no violations`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
        await page.goto(path);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
      });
    }
  }

  for (const theme of ["light", "dark"] as const) {
    test(`/episodes/ in List view and ${theme} theme has no violations`, async ({ page }) => {
      await page.addInitScript((t) => {
        localStorage.setItem("theme", t);
        localStorage.setItem("episodeView", "list");
      }, theme);
      await page.goto("/episodes/");
      await expect(page.locator("html")).toHaveAttribute("data-view", "list");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });

    test(`/episodes/ sorted by title in ${theme} theme has no violations`, async ({ page }) => {
      await page.addInitScript((t) => {
        localStorage.setItem("theme", t);
        localStorage.setItem("episodeSort", "title-asc");
        if (t === "dark") localStorage.setItem("episodeView", "list");
      }, theme);
      await page.goto("/episodes/");
      await expect(page.locator("html")).toHaveAttribute("data-sort", "title-asc");
      await expect(page.getByLabel("Sort by")).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }
});

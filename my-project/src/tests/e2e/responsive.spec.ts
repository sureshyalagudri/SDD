import { expect, test } from "@playwright/test";
import { PAGES } from "./pages";

const WIDTHS = [320, 768, 1280, 1920];

test.describe("Responsive layout", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "chromium", "viewport matrix runs once");
  });

  for (const path of PAGES) {
    for (const width of WIDTHS) {
      test(`${path} has no horizontal overflow at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  }

  for (const width of WIDTHS) {
    test(`/episodes/ in List view has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("episodeView", "list"));
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/episodes/");
      await expect(page.locator("html")).toHaveAttribute("data-view", "list");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      if (width === 320) {
        const first = page.getByRole("list", { name: "All episodes" }).getByRole("listitem").first();
        await expect(first.getByText(/^Ep\. \d+$/)).toBeVisible();
        await expect(first.locator("time")).toBeVisible();
        await expect(first.getByText(/^\d+:\d{2}$/)).toBeVisible();
      }
    });
  }
});

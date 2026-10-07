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
});

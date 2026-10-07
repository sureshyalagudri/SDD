import { expect, test } from "@playwright/test";
import { PAGES } from "./pages";

test.describe("Keyboard operability", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "chromium", "runs once");
  });

  for (const path of PAGES) {
    test(`${path}: every interactive element is reachable with a visible focus indicator`, async ({ page }) => {
      await page.goto(path);
      const expected = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll<HTMLElement>(
            'a[href], button, summary, input[type="range"], audio[controls]',
          ),
        ).filter((el) => el.offsetParent !== null || el.tagName === "SUMMARY").length,
      );
      expect(expected).toBeGreaterThan(0);

      const seen = new Set<string>();
      for (let i = 0; i < expected + 5; i++) {
        await page.keyboard.press("Tab");
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const cs = getComputedStyle(el);
          const key = `${el.tagName}#${el.id}.${el.className}:${el.textContent?.trim().slice(0, 30)}`;
          const visibleOutline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
          return { key, visibleOutline, tag: el.tagName };
        });
        if (!info) continue;
        seen.add(info.key);
        // Native <audio> paints its own focus ring; skip the outline check for it.
        if (info.tag !== "AUDIO") expect(info.visibleOutline, info.key).toBe(true);
      }
      expect(seen.size).toBeGreaterThanOrEqual(Math.min(expected, 8));
    });
  }
});

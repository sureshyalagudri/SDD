import { expect, test } from "@playwright/test";

test.describe("Theme", () => {
  test("toggle switches theme, persists across reload and navigation", async ({ page }, info) => {
    test.skip(info.project.name === "no-js", "requires JavaScript");
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).not.toHaveAttribute("data-theme", /.+/);

    await page.getByRole("button", { name: /switch to dark theme/i }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

    // Theme must be applied before first paint: check the attribute as soon as the DOM exists.
    await page.reload({ waitUntil: "commit" });
    await page.waitForFunction(() => document.documentElement.hasAttribute("data-theme"));
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.goto("/episodes/");
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.getByRole("button", { name: /switch to light theme/i }).click();
    await expect(html).toHaveAttribute("data-theme", "light");
  });

  test("without JavaScript the toggle is hidden and system preference applies", async ({ page }, info) => {
    test.skip(info.project.name !== "no-js", "no-js project only");
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/no-js/);
    await expect(page.locator(".theme-toggle")).toBeHidden();
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(15, 17, 23)");

    await page.emulateMedia({ colorScheme: "light" });
    const bgLight = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bgLight).toBe("rgb(250, 249, 247)");
  });
});

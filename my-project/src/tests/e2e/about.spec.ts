import { expect, test } from "@playwright/test";

test.describe("About page", () => {
  test("shows introduction, host, and mission sections", async ({ page }) => {
    await page.goto("/about/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("About");
    await expect(page.getByRole("region", { name: "The podcast" })).toBeVisible();
    const hostSection = page.getByRole("region", { name: /your host/i });
    await expect(hostSection).toBeVisible();
    await expect(hostSection.getByRole("img")).toHaveAttribute("alt", /.+/);
    await expect(page.getByRole("region", { name: "Our mission" })).toBeVisible();
  });
});

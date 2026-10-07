import { expect, test } from "@playwright/test";

test.describe("Episodes catalog", () => {
  test("lists exactly 20 episodes newest first", async ({ page }) => {
    await page.goto("/episodes/");
    const items = page.getByRole("list", { name: "All episodes" }).getByRole("listitem");
    await expect(items).toHaveCount(20);
    const dates = await items.locator("time").evaluateAll((ts) =>
      ts.map((t) => t.getAttribute("datetime") ?? ""),
    );
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  test("each card shows number, title, description, duration, and date", async ({ page }) => {
    await page.goto("/episodes/");
    const first = page.getByRole("list", { name: "All episodes" }).getByRole("listitem").first();
    await expect(first.getByText(/^Ep\. \d+$/)).toBeVisible();
    await expect(first.getByRole("heading", { level: 3 })).toBeVisible();
    await expect(first.locator("time")).toBeVisible();
    await expect(first.getByText(/^\d+:\d{2}$/)).toBeVisible();
  });

  test("selecting a card opens its dedicated page", async ({ page }) => {
    await page.goto("/episodes/");
    const link = page.getByRole("list", { name: "All episodes" }).getByRole("link").first();
    const title = (await link.textContent())?.trim();
    await link.click();
    await expect(page).toHaveURL(/\/episodes\/ep-\d{2}-[a-z0-9-]+\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title!);
  });

  test("renders in a single column with no horizontal overflow on mobile", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "mobile viewport only");
    await page.goto("/episodes/");
    const items = page.getByRole("list", { name: "All episodes" }).getByRole("listitem");
    const [a, b] = await Promise.all([items.nth(0).boundingBox(), items.nth(1).boundingBox()]);
    expect(a!.x).toBeCloseTo(b!.x, 0);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});

test.describe("Episode detail", () => {
  test("has a working player bound to its own clip", async ({ page }, info) => {
    test.skip(info.project.name === "no-js", "requires JavaScript");
    await page.goto("/episodes/ep-01-why-we-started-signal-and-noise/");
    const audio = page.locator("audio");
    await expect(audio).toHaveAttribute("src", "/audio/ep-01.mp3");

    const play = page.getByRole("button", { name: "Play" });
    await play.click();
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
    await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.paused)).toBe(false);

    await page.getByRole("button", { name: "Pause" }).click();
    await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);

    await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.duration)).toBeGreaterThan(0);
    const slider = page.getByRole("slider", { name: "Seek" });
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.currentTime)).toBeGreaterThan(0);
  });

  test("different episodes reference different clips", async ({ page }) => {
    await page.goto("/episodes/ep-01-why-we-started-signal-and-noise/");
    const a = await page.locator("audio").getAttribute("src");
    await page.goto("/episodes/ep-02-the-quiet-power-of-constraints/");
    const b = await page.locator("audio").getAttribute("src");
    expect(a).not.toEqual(b);
  });

  test("shows native controls without JavaScript", async ({ page }, info) => {
    test.skip(info.project.name !== "no-js", "no-js project only");
    await page.goto("/episodes/ep-03-what-the-ocean-knows-about-data/");
    await expect(page.locator("audio[controls]")).toBeAttached();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("What the Ocean Knows About Data");
    expect(await page.getByRole("region", { name: "Listen on" }).getByRole("link").count()).toBeGreaterThanOrEqual(3);
  });
});

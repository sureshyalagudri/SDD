import { expect, test, type Page } from "@playwright/test";

const items = (page: Page) => page.getByRole("list", { name: "All episodes" }).getByRole("listitem");
const datetimes = (page: Page) =>
  items(page).locator("time").evaluateAll((ts) => ts.map((t) => t.getAttribute("datetime")));
const switcher = (page: Page) => page.getByRole("group", { name: "Catalog view" });

test.describe("View switcher (US1)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name === "no-js", "requires JavaScript");
  });

  test("defaults to Card and switches to List in place", async ({ page }) => {
    await page.goto("/episodes/");
    await expect(switcher(page).getByRole("button", { name: "Card" })).toHaveAttribute("aria-pressed", "true");
    await expect(items(page)).toHaveCount(20);
    const before = await datetimes(page);
    const cardHeight = (await items(page).first().boundingBox())!.height;

    await switcher(page).getByRole("button", { name: "List" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-view", "list");
    await expect(switcher(page).getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
    await expect(items(page)).toHaveCount(20);
    expect(await datetimes(page)).toEqual(before);
    const rowHeight = (await items(page).first().boundingBox())!.height;
    expect(rowHeight).toBeLessThan(160);
    expect(rowHeight).toBeLessThan(cardHeight / 2);
    await expect(switcher(page).locator("[aria-live]")).toHaveText("List view selected");
  });

  test("row titles still link to the episode page", async ({ page }) => {
    await page.goto("/episodes/");
    await switcher(page).getByRole("button", { name: "List" }).click();
    await items(page).first().getByRole("link").click();
    await expect(page).toHaveURL(/\/episodes\/ep-\d{2}-[a-z0-9-]+\/$/);
  });

  test("is keyboard operable", async ({ page }) => {
    await page.goto("/episodes/");
    await switcher(page).getByRole("button", { name: "List" }).click();
    await switcher(page).getByRole("button", { name: "Card" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-view", "card");
    await expect(switcher(page).getByRole("button", { name: "Card" })).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("View preference persistence (US2)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name === "no-js", "requires JavaScript");
  });

  test("survives reload with no flash, navigation, and resets to Card", async ({ page }) => {
    await page.goto("/episodes/");
    await switcher(page).getByRole("button", { name: "List" }).click();

    await page.reload({ waitUntil: "commit" });
    await page.waitForFunction(() => document.documentElement.hasAttribute("data-view"));
    await expect(page.locator("html")).toHaveAttribute("data-view", "list");

    await page.goto("/");
    await page.goto("/episodes/");
    await expect(page.locator("html")).toHaveAttribute("data-view", "list");
    await expect(switcher(page).getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");

    await switcher(page).getByRole("button", { name: "Card" }).click();
    expect(await page.evaluate(() => localStorage.getItem("episodeView"))).toBe("card");
  });

  test("ignores an invalid stored value", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("episodeView", "banana"));
    await page.goto("/episodes/");
    await expect(page.locator("html")).not.toHaveAttribute("data-view", /.+/);
    await expect(switcher(page).getByRole("button", { name: "Card" })).toHaveAttribute("aria-pressed", "true");
  });

  test("uses Card when nothing is stored", async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/episodes/");
    await expect(switcher(page).getByRole("button", { name: "Card" })).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("List density (US3 / SC-004)", () => {
  test("shows at least twice as many episodes per screen at 1280x800", async ({ page }, info) => {
    test.skip(info.project.name !== "chromium", "runs once");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/episodes/");
    // "Per screen" = items whose top edge starts inside the first viewport.
    const visibleCount = async () => {
      const tops = await items(page).evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect().top),
      );
      return tops.filter((top) => top >= 0 && top < 800).length;
    };
    const cardCount = await visibleCount();
    await switcher(page).getByRole("button", { name: "List" }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    const listCount = await visibleCount();
    expect(cardCount).toBeGreaterThan(0);
    expect(listCount).toBeGreaterThanOrEqual(2 * cardCount);
  });
});

test.describe("Without JavaScript (FR-009)", () => {
  test("renders Card view and hides the switcher", async ({ page }, info) => {
    test.skip(info.project.name !== "no-js", "no-js project only");
    await page.goto("/episodes/");
    await expect(page.locator("html")).toHaveClass(/no-js/);
    await expect(page.locator("html")).not.toHaveAttribute("data-view", /.+/);
    await expect(page.locator(".view-switcher")).toBeHidden();
    await expect(items(page)).toHaveCount(20);
    expect((await items(page).first().boundingBox())!.height).toBeGreaterThan(200);
  });
});

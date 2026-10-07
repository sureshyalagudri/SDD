import { expect, test, type Page } from "@playwright/test";

const items = (page: Page) => page.getByRole("list", { name: "All episodes" }).getByRole("listitem");
const select = (page: Page) => page.getByLabel("Sort by");
const html = (page: Page) => page.locator("html");

type Row = { date: string; title: string; seconds: number; number: number };

async function rows(page: Page): Promise<Row[]> {
  return items(page).evaluateAll((els) =>
    els.map((el) => {
      const text = el.textContent ?? "";
      const dur = text.match(/(\d+):(\d{2})(?::(\d{2}))?/)!;
      const seconds = dur[3]
        ? Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3])
        : Number(dur[1]) * 60 + Number(dur[2]);
      return {
        date: el.querySelector("time")!.getAttribute("datetime")!,
        title: el.querySelector("h3")!.textContent!.trim(),
        seconds,
        number: Number(text.match(/Ep\. (\d+)/)![1]),
      };
    }),
  );
}

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });
const monotonic = <T,>(xs: T[], cmp: (a: T, b: T) => number) =>
  xs.every((x, i) => i === 0 || cmp(xs[i - 1], x) <= 0);

const ORDERS: Record<string, { label: string; cmp: (a: Row, b: Row) => number }> = {
  newest: { label: "Newest first", cmp: (a, b) => b.date.localeCompare(a.date) },
  oldest: { label: "Oldest first", cmp: (a, b) => a.date.localeCompare(b.date) },
  "title-asc": { label: "Title A–Z", cmp: (a, b) => collator.compare(a.title, b.title) },
  "title-desc": { label: "Title Z–A", cmp: (a, b) => collator.compare(b.title, a.title) },
  shortest: { label: "Shortest first", cmp: (a, b) => a.seconds - b.seconds },
  longest: { label: "Longest first", cmp: (a, b) => b.seconds - a.seconds },
};

test.describe("Sort control (US1)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name === "no-js", "requires JavaScript");
  });

  test("defaults to newest first", async ({ page }) => {
    await page.goto("/episodes/");
    await expect(select(page)).toHaveValue("newest");
    expect(monotonic(await rows(page), ORDERS.newest.cmp)).toBe(true);
  });

  for (const [value, { label, cmp }] of Object.entries(ORDERS)) {
    test(`orders by "${label}" in place`, async ({ page }) => {
      await page.goto("/episodes/");
      // Switch away first so selecting "newest" is a real change.
      if (value === "newest") await select(page).selectOption("oldest");
      await select(page).selectOption(value);
      await expect(html(page)).toHaveAttribute("data-sort", value);
      await expect(items(page)).toHaveCount(20);
      const r = await rows(page);
      expect(monotonic(r, cmp), JSON.stringify(r.map((x) => x.title))).toBe(true);
      await expect(page.locator(".sort-control [aria-live]")).toHaveText(`Sorted by ${label}`);
    });
  }

  test("oldest puts episode 1 first and keeps List view", async ({ page }) => {
    await page.goto("/episodes/");
    await page.getByRole("group", { name: "Catalog view" }).getByRole("button", { name: "List" }).click();
    await select(page).selectOption("oldest");
    await expect(html(page)).toHaveAttribute("data-view", "list");
    const r = await rows(page);
    expect(r[0].number).toBe(1);
    expect(r[19].number).toBe(20);
  });
});

test.describe("Sort persistence (US2)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name === "no-js", "requires JavaScript");
  });

  test("is applied pre-paint via CSS order, reconciled in DOM, and survives navigation", async ({ page }) => {
    await page.goto("/episodes/");
    await select(page).selectOption("oldest");

    await page.reload({ waitUntil: "commit" });
    await page.waitForFunction(() => document.documentElement.dataset.sort === "oldest");
    // Pre-hydration bridge: lowest CSS `order` must be Episode 1.
    const firstVisual = await page.evaluate(() => {
      const lis = Array.from(document.querySelectorAll('ul[aria-label="All episodes"] > li'));
      lis.sort((a, b) => Number(getComputedStyle(a).order) - Number(getComputedStyle(b).order));
      return lis[0]?.querySelector("time")?.getAttribute("datetime") ?? "";
    });
    expect(firstVisual).toBe("2026-01-06");

    await page.waitForLoadState("networkidle");
    await expect(select(page)).toHaveValue("oldest");
    expect((await rows(page))[0].number).toBe(1);

    await page.goto("/");
    await page.goto("/episodes/");
    await expect(html(page)).toHaveAttribute("data-sort", "oldest");
    expect((await rows(page))[0].number).toBe(1);

    await select(page).selectOption("newest");
    expect(await page.evaluate(() => localStorage.getItem("episodeSort"))).toBe("newest");
  });

  test("ignores an invalid stored value", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("episodeSort", "banana"));
    await page.goto("/episodes/");
    await expect(html(page)).not.toHaveAttribute("data-sort", /.+/);
    await expect(select(page)).toHaveValue("newest");
  });

  test("uses newest when nothing is stored", async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/episodes/");
    await expect(select(page)).toHaveValue("newest");
    expect((await rows(page))[0].number).toBe(20);
  });
});

test.describe("Sort and view independence (US3)", () => {
  test("both preferences persist and change independently", async ({ page }, info) => {
    test.skip(info.project.name === "no-js", "requires JavaScript");
    await page.addInitScript(() => {
      localStorage.setItem("episodeView", "list");
      localStorage.setItem("episodeSort", "longest");
    });
    await page.goto("/episodes/");
    await expect(html(page)).toHaveAttribute("data-view", "list");
    await expect(html(page)).toHaveAttribute("data-sort", "longest");
    const longest = (await rows(page))[0];
    expect(monotonic(await rows(page), ORDERS.longest.cmp)).toBe(true);

    await page.getByRole("group", { name: "Catalog view" }).getByRole("button", { name: "Card" }).click();
    await expect(html(page)).toHaveAttribute("data-sort", "longest");
    expect((await rows(page))[0]).toEqual(longest);

    await select(page).selectOption("title-asc");
    await expect(html(page)).toHaveAttribute("data-view", "card");
  });
});

test.describe("Without JavaScript (FR-009)", () => {
  test("renders newest first and hides the sort control", async ({ page }, info) => {
    test.skip(info.project.name !== "no-js", "no-js project only");
    await page.goto("/episodes/");
    await expect(html(page)).not.toHaveAttribute("data-sort", /.+/);
    await expect(page.locator(".sort-control")).toBeHidden();
    await expect(items(page)).toHaveCount(20);
    expect(monotonic(await rows(page), ORDERS.newest.cmp)).toBe(true);
  });
});

test.describe("Keyboard and focus order", () => {
  test("select is keyboard operable and DOM order follows visual order", async ({ page }, info) => {
    test.skip(info.project.name !== "chromium", "runs once");
    await page.goto("/episodes/");
    await select(page).focus();
    await select(page).selectOption("oldest");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("episode-sort");
    await expect(html(page)).toHaveAttribute("data-sort", "oldest");

    const focusedTitles: string[] = [];
    for (let i = 0; i < 6 && focusedTitles.length < 2; i++) {
      await page.keyboard.press("Tab");
      const t = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return el?.closest('ul[aria-label="All episodes"]') && el?.tagName === "A" ? el.textContent?.trim() : null;
      });
      if (t) focusedTitles.push(t);
    }
    const r = await rows(page);
    expect(focusedTitles).toEqual([r[0].title, r[1].title]);
  });
});

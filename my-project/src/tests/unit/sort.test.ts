import { describe, expect, it } from "vitest";
import { episodes } from "@/content/episodes";
import { getAllEpisodes } from "@/lib/episodes";
import {
  compareEpisodes,
  DEFAULT_SORT,
  isEpisodeSort,
  rankEpisodes,
  rankStyle,
  SORT_OPTIONS,
  sortEpisodes,
  sortInitScript,
  type EpisodeSort,
} from "@/lib/sort";

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

function isMonotonic<T>(xs: T[], cmp: (a: T, b: T) => number) {
  return xs.every((x, i) => i === 0 || cmp(xs[i - 1], x) <= 0);
}

describe("SORT_OPTIONS / isEpisodeSort", () => {
  it("defines exactly six options in order", () => {
    expect(SORT_OPTIONS.map((o) => o.value)).toEqual([
      "newest",
      "oldest",
      "title-asc",
      "title-desc",
      "shortest",
      "longest",
    ]);
    expect(SORT_OPTIONS.map((o) => o.label)).toEqual([
      "Newest first",
      "Oldest first",
      "Title A–Z",
      "Title Z–A",
      "Shortest first",
      "Longest first",
    ]);
    expect(DEFAULT_SORT).toBe("newest");
  });

  it("accepts only the six values", () => {
    for (const o of SORT_OPTIONS) expect(isEpisodeSort(o.value)).toBe(true);
    for (const bad of ["banana", "", null, undefined, 0, "Newest", {}]) {
      expect(isEpisodeSort(bad)).toBe(false);
    }
  });
});

describe("sortEpisodes on real content", () => {
  it("newest equals getAllEpisodes()", () => {
    expect(sortEpisodes(episodes, "newest").map((e) => e.slug)).toEqual(
      getAllEpisodes().map((e) => e.slug),
    );
  });

  const cases: [EpisodeSort, (a: (typeof episodes)[number], b: (typeof episodes)[number]) => number][] = [
    ["newest", (a, b) => b.publishedAt.localeCompare(a.publishedAt)],
    ["oldest", (a, b) => a.publishedAt.localeCompare(b.publishedAt)],
    ["title-asc", (a, b) => collator.compare(a.title, b.title)],
    ["title-desc", (a, b) => collator.compare(b.title, a.title)],
    ["shortest", (a, b) => a.durationSeconds - b.durationSeconds],
    ["longest", (a, b) => b.durationSeconds - a.durationSeconds],
  ];

  for (const [sort, cmp] of cases) {
    it(`${sort} keeps 20 items and is monotonic on its key`, () => {
      const sorted = sortEpisodes(episodes, sort);
      expect(sorted).toHaveLength(20);
      expect(new Set(sorted.map((e) => e.slug)).size).toBe(20);
      expect(isMonotonic(sorted, cmp)).toBe(true);
    });
  }

  it("oldest puts episode 1 first and 20 last", () => {
    const sorted = sortEpisodes(episodes, "oldest");
    expect(sorted[0].number).toBe(1);
    expect(sorted[19].number).toBe(20);
  });
});

describe("tie-break and collation", () => {
  const mk = (number: number, title: string, publishedAt = "2026-01-01", durationSeconds = 100) => ({
    number,
    title,
    publishedAt,
    durationSeconds,
  });

  it("breaks ties by episode number descending for every sort", () => {
    const a = mk(3, "same");
    const b = mk(7, "SAME");
    for (const o of SORT_OPTIONS) {
      expect([a, b].sort(compareEpisodes(o.value))[0].number).toBe(7);
    }
  });

  it("is locale-aware and numeric for titles", () => {
    const list = [mk(1, "Ep 10"), mk(2, "élan"), mk(3, "Ep 2"), mk(4, "Elan Z")];
    const titles = sortEpisodes(list, "title-asc").map((e) => e.title);
    expect(titles.indexOf("Ep 2")).toBeLessThan(titles.indexOf("Ep 10"));
    expect(Math.abs(titles.indexOf("élan") - titles.indexOf("Elan Z"))).toBe(1);
  });
});

describe("rankEpisodes / rankStyle", () => {
  it("produces a permutation of 0..19 for each non-default key", () => {
    const ranks = rankEpisodes(episodes);
    expect(Object.keys(ranks)).toHaveLength(20);
    for (const key of ["oldest", "title-asc", "title-desc", "shortest", "longest"] as const) {
      const values = Object.values(ranks).map((r) => r[key]).sort((a, b) => a - b);
      expect(values).toEqual(Array.from({ length: 20 }, (_, i) => i));
    }
    const first = sortEpisodes(episodes, "oldest")[0];
    expect(ranks[first.slug].oldest).toBe(0);
  });

  it("maps ranks to the five CSS custom properties", () => {
    const style = rankStyle({ oldest: 1, "title-asc": 2, "title-desc": 3, shortest: 4, longest: 5 }) as Record<
      string,
      number
    >;
    expect(Object.keys(style)).toEqual([
      "--s-oldest",
      "--s-title-asc",
      "--s-title-desc",
      "--s-shortest",
      "--s-longest",
    ]);
    expect(style["--s-longest"]).toBe(5);
  });
});

describe("sortInitScript", () => {
  it("is a tiny guarded IIFE that reads the storage key", () => {
    expect(sortInitScript.length).toBeLessThanOrEqual(200);
    expect(sortInitScript).toContain('"episodeSort"');
    expect(sortInitScript.startsWith("(function(){try{")).toBe(true);
  });
});

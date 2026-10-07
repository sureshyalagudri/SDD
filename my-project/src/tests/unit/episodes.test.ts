import { describe, expect, it } from "vitest";
import {
  episodeHref,
  formatDate,
  formatDuration,
  getAllEpisodes,
  getEpisodeBySlug,
  getFeaturedEpisode,
} from "@/lib/episodes";

describe("getAllEpisodes", () => {
  it("returns 20 episodes newest first", () => {
    const all = getAllEpisodes();
    expect(all).toHaveLength(20);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].publishedAt >= all[i].publishedAt).toBe(true);
    }
  });
});

describe("getFeaturedEpisode", () => {
  it("returns the single featured episode", () => {
    expect(getFeaturedEpisode().featured).toBe(true);
  });
});

describe("getEpisodeBySlug", () => {
  it("finds an existing slug and returns undefined for a miss", () => {
    const first = getAllEpisodes()[0];
    expect(getEpisodeBySlug(first.slug)).toEqual(first);
    expect(getEpisodeBySlug("nope")).toBeUndefined();
  });
});

describe("formatDuration", () => {
  it("formats boundaries", () => {
    expect(formatDuration(59)).toBe("0:59");
    expect(formatDuration(60)).toBe("1:00");
    expect(formatDuration(3599)).toBe("59:59");
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(3661)).toBe("1:01:01");
  });
});

describe("formatDate / episodeHref", () => {
  it("formats ISO dates and builds hrefs", () => {
    expect(formatDate("2026-02-17")).toBe("February 17, 2026");
    expect(episodeHref({ slug: "ep-07-the-art-of-listening" })).toBe(
      "/episodes/ep-07-the-art-of-listening/",
    );
  });
});

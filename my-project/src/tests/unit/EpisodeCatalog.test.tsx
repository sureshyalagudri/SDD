import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EpisodeCatalog } from "@/components/EpisodeCatalog";
import type { CardEpisode } from "@/components/EpisodeCard";
import { getAllEpisodes } from "@/lib/episodes";
import { rankEpisodes, sortEpisodes } from "@/lib/sort";

const all = getAllEpisodes();
const ranks = rankEpisodes(all);
const cards: CardEpisode[] = all.map((e) => ({
  number: e.number,
  slug: e.slug,
  title: e.title,
  shortDescription: e.shortDescription,
  artworkSrc: e.artworkSrc,
  artworkAlt: e.artworkAlt,
  durationSeconds: e.durationSeconds,
  publishedAt: e.publishedAt,
}));

const headings = () => screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
const renderCatalog = () => render(<EpisodeCatalog episodes={cards} ranks={ranks} header={<h1>Episodes</h1>} />);

describe("EpisodeCatalog", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-sort");
    document.documentElement.removeAttribute("data-view");
  });

  afterEach(cleanup);

  it("renders newest first by default with rank variables on every item", () => {
    renderCatalog();
    expect(screen.getByLabelText("Sort by")).toHaveValue("newest");
    expect(headings()).toEqual(all.map((e) => e.title));
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(20);
    for (const li of items) expect(li.getAttribute("style")).toContain("--s-oldest");
  });

  it("re-orders, persists, and announces when the sort changes", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    renderCatalog();
    const select = screen.getByLabelText("Sort by");

    fireEvent.change(select, { target: { value: "oldest" } });
    expect(document.documentElement.getAttribute("data-sort")).toBe("oldest");
    expect(localStorage.getItem("episodeSort")).toBe("oldest");
    expect(headings()[0]).toBe(all.find((e) => e.number === 1)!.title);
    expect(document.querySelector(".sort-control [aria-live]")).toHaveTextContent("Sorted by Oldest first");
    expect(setItem).toHaveBeenCalledTimes(1);

    fireEvent.change(select, { target: { value: "oldest" } });
    expect(setItem).toHaveBeenCalledTimes(1);

    fireEvent.change(select, { target: { value: "title-asc" } });
    expect(headings()).toEqual(sortEpisodes(all, "title-asc").map((e) => e.title));
    setItem.mockRestore();
  });

  it("reads a valid preset attribute on mount and ignores an invalid one", () => {
    document.documentElement.setAttribute("data-sort", "longest");
    renderCatalog();
    expect(screen.getByLabelText("Sort by")).toHaveValue("longest");
    expect(headings()[0]).toBe(sortEpisodes(all, "longest")[0].title);
    cleanup();

    document.documentElement.setAttribute("data-sort", "banana");
    renderCatalog();
    expect(screen.getByLabelText("Sort by")).toHaveValue("newest");
  });
});

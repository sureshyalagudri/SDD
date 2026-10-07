import type { CSSProperties } from "react";
import type { Episode } from "@/lib/types";

export const SORT_STORAGE_KEY = "episodeSort";

export type EpisodeSort = "newest" | "oldest" | "title-asc" | "title-desc" | "shortest" | "longest";
export type NonDefaultSort = Exclude<EpisodeSort, "newest">;

export const DEFAULT_SORT: EpisodeSort = "newest";

export const SORT_OPTIONS: readonly { value: EpisodeSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
  { value: "shortest", label: "Shortest first" },
  { value: "longest", label: "Longest first" },
];

const SORT_VALUES: readonly string[] = SORT_OPTIONS.map((o) => o.value);
const NON_DEFAULT: readonly NonDefaultSort[] = ["oldest", "title-asc", "title-desc", "shortest", "longest"];

export function isEpisodeSort(value: unknown): value is EpisodeSort {
  return typeof value === "string" && SORT_VALUES.includes(value);
}

export function sortLabel(sort: EpisodeSort): string {
  return SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "";
}

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

type Sortable = Pick<Episode, "number" | "title" | "publishedAt" | "durationSeconds">;

export function compareEpisodes(sort: EpisodeSort): (a: Sortable, b: Sortable) => number {
  const primary = (a: Sortable, b: Sortable): number => {
    switch (sort) {
      case "newest":
        return b.publishedAt.localeCompare(a.publishedAt);
      case "oldest":
        return a.publishedAt.localeCompare(b.publishedAt);
      case "title-asc":
        return collator.compare(a.title, b.title);
      case "title-desc":
        return collator.compare(b.title, a.title);
      case "shortest":
        return a.durationSeconds - b.durationSeconds;
      case "longest":
        return b.durationSeconds - a.durationSeconds;
    }
  };
  // Ties always resolve by episode number descending so every order is stable and repeatable.
  return (a, b) => primary(a, b) || b.number - a.number;
}

export function sortEpisodes<T extends Sortable>(list: readonly T[], sort: EpisodeSort): T[] {
  return [...list].sort(compareEpisodes(sort));
}

export type EpisodeRanks = Record<string, Record<NonDefaultSort, number>>;

export function rankEpisodes<T extends Sortable & { slug: string }>(list: readonly T[]): EpisodeRanks {
  const ranks: EpisodeRanks = {};
  for (const key of NON_DEFAULT) {
    sortEpisodes(list, key).forEach((e, i) => {
      (ranks[e.slug] ??= {} as Record<NonDefaultSort, number>)[key] = i;
    });
  }
  return ranks;
}

export function rankStyle(ranks: Record<NonDefaultSort, number>): CSSProperties {
  return {
    "--s-oldest": ranks.oldest,
    "--s-title-asc": ranks["title-asc"],
    "--s-title-desc": ranks["title-desc"],
    "--s-shortest": ranks.shortest,
    "--s-longest": ranks.longest,
  } as CSSProperties;
}

// Runs inline in <head> (after theme/view bootstraps) so a stored order applies before first paint.
export const sortInitScript = `(function(){try{var s=localStorage.getItem("${SORT_STORAGE_KEY}");if(/^(newest|oldest|title-asc|title-desc|shortest|longest)$/.test(s))document.documentElement.dataset.sort=s}catch(e){}})();`;

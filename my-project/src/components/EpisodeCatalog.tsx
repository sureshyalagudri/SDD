"use client";

import { useEffect, useState, type ReactNode } from "react";
import { EpisodeCard, type CardEpisode } from "@/components/EpisodeCard";
import { SortControl } from "@/components/SortControl";
import { ViewSwitcher } from "@/components/ViewSwitcher";
import {
  DEFAULT_SORT,
  isEpisodeSort,
  rankStyle,
  SORT_STORAGE_KEY,
  sortEpisodes,
  sortLabel,
  type EpisodeRanks,
  type EpisodeSort,
} from "@/lib/sort";
import styles from "@/app/episodes/page.module.css";

export function EpisodeCatalog({
  episodes,
  ranks,
  header,
}: {
  episodes: readonly CardEpisode[];
  ranks: EpisodeRanks;
  header: ReactNode;
}) {
  const [sort, setSort] = useState<EpisodeSort>(DEFAULT_SORT);
  const [announcement, setAnnouncement] = useState("");

  // CSS `order` already positions items pre-paint; this re-renders DOM order to match for a11y.
  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-sort");
    if (isEpisodeSort(attr)) setSort(attr);
  }, []);

  const onChange = (next: EpisodeSort) => {
    if (next === sort) return;
    document.documentElement.setAttribute("data-sort", next);
    try {
      localStorage.setItem(SORT_STORAGE_KEY, next);
    } catch {
      /* storage unavailable: order still applies for this page */
    }
    setSort(next);
    setAnnouncement(`Sorted by ${sortLabel(next)}`);
  };

  return (
    <>
      <div className={styles.toolbar}>
        {header}
        <div className={styles.controls}>
          <ViewSwitcher />
          <SortControl value={sort} onChange={onChange} announcement={announcement} />
        </div>
      </div>
      <ul className={styles.grid} aria-label="All episodes">
        {sortEpisodes(episodes, sort).map((e) => (
          <EpisodeCard key={e.slug} episode={e} style={rankStyle(ranks[e.slug])} />
        ))}
      </ul>
    </>
  );
}

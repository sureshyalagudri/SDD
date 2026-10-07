import type { Metadata } from "next";
import { EpisodeCatalog } from "@/components/EpisodeCatalog";
import type { CardEpisode } from "@/components/EpisodeCard";
import { getAllEpisodes } from "@/lib/episodes";
import { rankEpisodes } from "@/lib/sort";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Episodes",
  description: "Every episode of Signal & Noise, newest first.",
};

export default function EpisodesPage() {
  const all = getAllEpisodes();
  const ranks = rankEpisodes(all);
  // Card-only projection keeps the client payload small (no full descriptions or audio paths).
  const cards: CardEpisode[] = all.map(
    ({ number, slug, title, shortDescription, artworkSrc, artworkAlt, durationSeconds, publishedAt }) => ({
      number,
      slug,
      title,
      shortDescription,
      artworkSrc,
      artworkAlt,
      durationSeconds,
      publishedAt,
    }),
  );

  return (
    <div className={styles.page}>
      <EpisodeCatalog
        episodes={cards}
        ranks={ranks}
        header={
          <header className={styles.header}>
            <p className="eyebrow">Season one</p>
            <h1>Episodes</h1>
            <p className="lede">{all.length} conversations. Pick one that fits your afternoon.</p>
          </header>
        }
      />
    </div>
  );
}

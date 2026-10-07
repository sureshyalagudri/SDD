import type { Metadata } from "next";
import { EpisodeCard } from "@/components/EpisodeCard";
import { ViewSwitcher } from "@/components/ViewSwitcher";
import { getAllEpisodes } from "@/lib/episodes";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Episodes",
  description: "Every episode of Signal & Noise, newest first.",
};

export default function EpisodesPage() {
  const all = getAllEpisodes();
  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <header className={styles.header}>
          <p className="eyebrow">Season one</p>
          <h1>Episodes</h1>
          <p className="lede">
            {all.length} conversations, newest first. Pick one that fits your afternoon.
          </p>
        </header>
        <ViewSwitcher />
      </div>
      <ul className={styles.grid} aria-label="All episodes">
        {all.map((e) => (
          <EpisodeCard key={e.slug} episode={e} />
        ))}
      </ul>
    </div>
  );
}

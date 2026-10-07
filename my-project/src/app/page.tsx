import type { Metadata } from "next";
import { EpisodeHero } from "@/components/EpisodeHero";
import { ListenOn } from "@/components/ListenOn";
import { podcast } from "@/content/podcast";
import { getFeaturedEpisode } from "@/lib/episodes";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  const featured = getFeaturedEpisode();
  return (
    <div className={styles.page}>
      <EpisodeHero episode={featured} />
      <section aria-labelledby="about-short" className={styles.intro}>
        <h2 id="about-short">{podcast.tagline}</h2>
        <p className="lede">{podcast.introduction}</p>
      </section>
      <ListenOn />
    </div>
  );
}

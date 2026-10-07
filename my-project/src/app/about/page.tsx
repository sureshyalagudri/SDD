import type { Metadata } from "next";
import { host } from "@/content/host";
import { podcast } from "@/content/podcast";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description: `About ${podcast.name}, its host, and its mission.`,
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className="eyebrow">About the show</p>
        <h1>About {podcast.name}</h1>
        <p className="lede">{podcast.tagline}</p>
      </header>

      <section aria-labelledby="about-intro" className={styles.section}>
        <h2 id="about-intro">The podcast</h2>
        <p>{podcast.introduction}</p>
      </section>

      <section aria-labelledby="about-host" className={`${styles.section} ${styles.host}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={host.photoSrc}
          alt={host.photoAlt}
          width={400}
          height={400}
          loading="lazy"
          decoding="async"
          className={styles.photo}
        />
        <div className={styles.hostBody}>
          <h2 id="about-host">Your host, {host.name}</h2>
          <p>{host.bio}</p>
        </div>
      </section>

      <section aria-labelledby="about-mission" className={`${styles.section} ${styles.mission}`}>
        <h2 id="about-mission">Our mission</h2>
        <p>{podcast.mission}</p>
      </section>
    </div>
  );
}

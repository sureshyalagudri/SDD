import Link from "next/link";
import type { Episode } from "@/lib/types";
import { episodeHref, formatDate, formatDuration } from "@/lib/episodes";
import styles from "./EpisodeHero.module.css";

export function EpisodeHero({ episode }: { episode: Episode }) {
  return (
    <section aria-labelledby="hero-title" className={styles.hero}>
      <div className={styles.copy}>
        <p className="eyebrow">Featured episode · Ep. {episode.number}</p>
        <h1 id="hero-title">{episode.title}</h1>
        <p className="lede">{episode.shortDescription}</p>
        <dl className="meta">
          <dt>Duration</dt>
          <dd>
            <span aria-hidden="true">◷</span> {formatDuration(episode.durationSeconds)}
          </dd>
          <dt>Published</dt>
          <dd>
            <span aria-hidden="true">▣</span>{" "}
            <time dateTime={episode.publishedAt}>{formatDate(episode.publishedAt)}</time>
          </dd>
        </dl>
        <p>
          <Link href={episodeHref(episode)} prefetch={false} className="btn">
            <span aria-hidden="true">▶</span> Listen now
          </Link>
        </p>
      </div>
      <div className={styles.art}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={episode.artworkSrc}
          alt={episode.artworkAlt}
          width={600}
          height={600}
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </section>
  );
}

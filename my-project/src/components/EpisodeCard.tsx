import Link from "next/link";
import type { Episode } from "@/lib/types";
import { episodeHref, formatDate, formatDuration } from "@/lib/episodes";
import styles from "./EpisodeCard.module.css";

export function EpisodeCard({ episode }: { episode: Episode }) {
  const titleId = `ep-${episode.number}-title`;
  return (
    <li className={styles.item}>
      <article className={styles.card} aria-labelledby={titleId}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={episode.artworkSrc}
          alt=""
          width={300}
          height={300}
          loading="lazy"
          decoding="async"
          className={styles.art}
        />
        <div className={styles.body}>
          <p className="eyebrow">Ep. {episode.number}</p>
          <h3 id={titleId} className={styles.title}>
            <Link href={episodeHref(episode)} className={styles.titleLink}>
              {episode.title}
            </Link>
          </h3>
          <p className={styles.desc}>{episode.shortDescription}</p>
          <dl className="meta">
            <dt>Duration</dt>
            <dd>{formatDuration(episode.durationSeconds)}</dd>
            <dt>Published</dt>
            <dd>
              <time dateTime={episode.publishedAt}>{formatDate(episode.publishedAt)}</time>
            </dd>
          </dl>
        </div>
      </article>
    </li>
  );
}

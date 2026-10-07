import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ListenOn } from "@/components/ListenOn";
import { episodes } from "@/content/episodes";
import { formatDate, formatDuration, getEpisodeBySlug } from "@/lib/episodes";
import styles from "./page.module.css";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return episodes.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);
  if (!episode) return {};
  return { title: `Ep. ${episode.number} · ${episode.title}`, description: episode.shortDescription };
}

export default async function EpisodePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);
  if (!episode) notFound();
  preload(episode.artworkSrc, { as: "image", fetchPriority: "high" });

  const paragraphs = episode.fullDescription.split(/\n\s*\n/).map((p) => p.trim());

  return (
    <article className={styles.article}>
      <p>
        <Link href="/episodes/" prefetch={false} className={styles.back}>
          <span aria-hidden="true">←</span> All episodes
        </Link>
      </p>
      <div className={styles.layout}>
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
        <div className={styles.body}>
          <p className="eyebrow">Episode {episode.number}</p>
          <h1>{episode.title}</h1>
          <dl className="meta">
            <dt>Duration</dt>
            <dd>{formatDuration(episode.durationSeconds)}</dd>
            <dt>Published</dt>
            <dd>
              <time dateTime={episode.publishedAt}>{formatDate(episode.publishedAt)}</time>
            </dd>
          </dl>
          <AudioPlayer src={episode.audioSrc} title={episode.title} />
          <div className={styles.description}>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <ListenOn headingId="episode-listen-on" />
        </div>
      </div>
    </article>
  );
}

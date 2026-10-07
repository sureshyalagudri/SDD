import { episodes } from "@/content/episodes";
import type { Episode } from "@/lib/types";

export function getAllEpisodes(): Episode[] {
  return [...episodes].sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.number - a.number,
  );
}

export function getFeaturedEpisode(): Episode {
  const featured = episodes.filter((e) => e.featured);
  if (featured.length !== 1) {
    throw new Error(`Expected exactly one featured episode, found ${featured.length}`);
  }
  return featured[0];
}

export function getEpisodeBySlug(slug: string): Episode | undefined {
  return episodes.find((e) => e.slug === slug);
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function episodeHref(episode: Pick<Episode, "slug">): string {
  return `/episodes/${episode.slug}/`;
}

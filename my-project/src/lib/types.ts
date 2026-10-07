export interface Podcast {
  name: string; // 1–60 chars
  tagline: string; // <= 120 chars
  introduction: string;
  mission: string;
}

export interface Host {
  name: string;
  photoSrc: string; // path under /public, must exist
  photoAlt: string; // non-empty
  bio: string; // <= 600 chars
}

export interface Episode {
  number: number; // 1..20, unique, contiguous
  slug: string; // ep-NN-kebab-title, unique
  title: string; // 1–90 chars
  shortDescription: string; // <= 160 chars
  fullDescription: string; // paragraphs separated by blank lines
  artworkSrc: string; // /artwork/ep-NN.svg, must exist
  artworkAlt: string; // non-empty
  durationSeconds: number; // > 0
  publishedAt: string; // YYYY-MM-DD, unique
  audioSrc: string; // /audio/ep-NN.mp3, distinct per episode
  featured: boolean; // exactly one true
}

export interface FaqItem {
  id: string; // unique kebab-case, used as DOM id
  question: string; // ends with ?
  answer: string;
  order: number; // unique ascending
}

export interface Platform {
  id: string; // e.g. apple | spotify | rss
  name: string;
  badgeSrc: string; // /badges/{id}.svg
  homeUrl: string; // https platform home page only
}

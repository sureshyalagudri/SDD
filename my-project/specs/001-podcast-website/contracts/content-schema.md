# Contract: Embedded Content Schema

**Feature**: 001-podcast-website | **Date**: 2026-10-07

Types live in `lib/types.ts`; data modules in `content/` export values conforming to them. This
is the only "data interface" of the site. Full field rules are in
[data-model.md](../data-model.md).

```ts
// lib/types.ts
export interface Podcast {
  name: string;
  tagline: string;
  introduction: string;
  mission: string;
}

export interface Host {
  name: string;
  photoSrc: string;   // "/host.jpg"
  photoAlt: string;
  bio: string;
}

export interface Episode {
  number: number;             // 1..20, unique
  slug: string;               // "ep-NN-kebab-title", unique
  title: string;
  shortDescription: string;   // <= 160 chars
  fullDescription: string;
  artworkSrc: string;         // "/artwork/ep-NN.svg"
  artworkAlt: string;
  durationSeconds: number;
  publishedAt: string;        // "YYYY-MM-DD"
  audioSrc: string;           // "/audio/ep-NN.mp3", distinct per episode
  featured: boolean;          // exactly one true
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface Platform {
  id: string;                 // "apple" | "spotify" | "rss" | ...
  name: string;
  badgeSrc: string;           // "/badges/{id}.svg"
  homeUrl: string;            // https platform home page only
}
```

## Module exports

| Module | Export | Type |
|--------|--------|------|
| `content/podcast.ts` | `podcast` | `Podcast` |
| `content/host.ts` | `host` | `Host` |
| `content/episodes.ts` | `episodes` | `readonly Episode[]` (length 20) |
| `content/faq.ts` | `faq` | `readonly FaqItem[]` (length ≥ 6) |
| `content/platforms.ts` | `platforms` | `readonly Platform[]` (length ≥ 3) |

## Helper API (`lib/episodes.ts`)

| Function | Returns | Contract |
|----------|---------|----------|
| `getAllEpisodes()` | `Episode[]` | sorted by `publishedAt` desc, then `number` desc |
| `getFeaturedEpisode()` | `Episode` | the single `featured: true` episode; throws at build if 0 or > 1 |
| `getEpisodeBySlug(slug)` | `Episode \| undefined` | exact slug match |
| `formatDuration(seconds)` | `string` | `m:ss` under 1 h, else `h:mm:ss` |

## Invariants enforced by `tests/unit/content.test.ts`

1. `episodes.length === 20`; numbers are exactly `1..20`; slugs unique and match
   `/^ep-\d{2}-[a-z0-9-]+$/`.
2. Exactly one `featured === true`.
3. Every `artworkSrc`, `audioSrc`, `photoSrc`, `badgeSrc` resolves to an existing file under
   `public/`; `audioSrc` values are pairwise distinct.
4. `publishedAt` parses as a valid date; `durationSeconds > 0`; `shortDescription.length <= 160`.
5. `faq.length >= 6`, `order` unique, every `question` ends with `?`.
6. `platforms.length >= 3`, every `homeUrl` starts with `https://`.

import type { Platform } from "@/lib/types";

// Sample-only: links go to platform home pages, never to a real show listing.
export const platforms: readonly Platform[] = [
  {
    id: "apple",
    name: "Apple Podcasts",
    badgeSrc: "/badges/apple.svg",
    homeUrl: "https://www.apple.com/apple-podcasts/",
  },
  {
    id: "spotify",
    name: "Spotify",
    badgeSrc: "/badges/spotify.svg",
    homeUrl: "https://open.spotify.com/",
  },
  {
    id: "rss",
    name: "RSS",
    badgeSrc: "/badges/rss.svg",
    homeUrl: "https://www.rssboard.org/",
  },
];

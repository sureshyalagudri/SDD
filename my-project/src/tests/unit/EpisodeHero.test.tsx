import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EpisodeHero } from "@/components/EpisodeHero";
import type { Episode } from "@/lib/types";

const fixture: Episode = {
  number: 7,
  slug: "ep-07-the-art-of-listening",
  title: "The Art of Listening",
  shortDescription: "Short blurb.",
  fullDescription: "Full text.",
  artworkSrc: "/artwork/ep-07.svg",
  artworkAlt: "Episode 7 artwork",
  durationSeconds: 3340,
  publishedAt: "2026-02-17",
  audioSrc: "/audio/ep-07.mp3",
  featured: true,
};

describe("EpisodeHero", () => {
  it("renders title, alt text, formatted meta, and CTA href", () => {
    render(<EpisodeHero episode={fixture} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("The Art of Listening");
    expect(screen.getByAltText("Episode 7 artwork")).toBeInTheDocument();
    expect(screen.getByText("55:40")).toBeInTheDocument();
    expect(screen.getByText("February 17, 2026")).toHaveAttribute("datetime", "2026-02-17");
    // next/link normalizes the trailing slash outside the Next runtime; the build restores it.
    expect(screen.getByRole("link", { name: /listen now/i }).getAttribute("href")).toMatch(
      /^\/episodes\/ep-07-the-art-of-listening\/?$/,
    );
  });
});

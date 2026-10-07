import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { episodes } from "@/content/episodes";
import { faq } from "@/content/faq";
import { host } from "@/content/host";
import { platforms } from "@/content/platforms";
import { podcast } from "@/content/podcast";

const publicPath = (src: string) => resolve(process.cwd(), "public", src.replace(/^\//, ""));
const unique = <T>(xs: readonly T[]) => new Set(xs).size === xs.length;

describe("podcast", () => {
  it("has a name within 1–60 chars and tagline <= 120", () => {
    expect(podcast.name.length).toBeGreaterThanOrEqual(1);
    expect(podcast.name.length).toBeLessThanOrEqual(60);
    expect(podcast.tagline.length).toBeLessThanOrEqual(120);
    expect(podcast.introduction.trim()).not.toBe("");
    expect(podcast.mission.trim()).not.toBe("");
  });
});

describe("episodes", () => {
  it("has exactly 20 episodes numbered 1..20", () => {
    expect(episodes).toHaveLength(20);
    const numbers = [...episodes].map((e) => e.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it("has unique slugs matching ep-NN-kebab-title", () => {
    expect(unique(episodes.map((e) => e.slug))).toBe(true);
    for (const e of episodes) {
      expect(e.slug).toMatch(/^ep-\d{2}-[a-z0-9-]+$/);
      expect(e.slug.startsWith(`ep-${String(e.number).padStart(2, "0")}-`)).toBe(true);
    }
  });

  it("has exactly one featured episode", () => {
    expect(episodes.filter((e) => e.featured)).toHaveLength(1);
  });

  it("has valid field constraints", () => {
    for (const e of episodes) {
      expect(e.title.length).toBeGreaterThanOrEqual(1);
      expect(e.title.length).toBeLessThanOrEqual(90);
      expect(e.shortDescription.length).toBeLessThanOrEqual(160);
      expect(e.fullDescription.trim()).not.toBe("");
      expect(e.artworkAlt.trim()).not.toBe("");
      expect(e.durationSeconds).toBeGreaterThan(0);
      expect(e.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(e.publishedAt))).toBe(false);
    }
    expect(unique(episodes.map((e) => e.publishedAt))).toBe(true);
  });

  it("references existing, distinct assets", () => {
    for (const e of episodes) {
      expect(existsSync(publicPath(e.artworkSrc)), e.artworkSrc).toBe(true);
      expect(existsSync(publicPath(e.audioSrc)), e.audioSrc).toBe(true);
    }
    expect(unique(episodes.map((e) => e.audioSrc))).toBe(true);
  });
});

describe("host", () => {
  it("has an existing photo and bio <= 600 chars", () => {
    expect(host.name.trim()).not.toBe("");
    expect(host.photoAlt.trim()).not.toBe("");
    expect(existsSync(publicPath(host.photoSrc))).toBe(true);
    expect(host.bio.length).toBeLessThanOrEqual(600);
  });
});

describe("faq", () => {
  it("has >= 6 items with unique ids/order and question marks", () => {
    expect(faq.length).toBeGreaterThanOrEqual(6);
    expect(unique(faq.map((f) => f.id))).toBe(true);
    expect(unique(faq.map((f) => f.order))).toBe(true);
    for (const f of faq) {
      expect(f.id).toMatch(/^[a-z0-9-]+$/);
      expect(f.question.trim().endsWith("?")).toBe(true);
      expect(f.answer.trim()).not.toBe("");
    }
  });
});

describe("platforms", () => {
  it("has >= 3 platforms with https home URLs and existing badges", () => {
    expect(platforms.length).toBeGreaterThanOrEqual(3);
    expect(unique(platforms.map((p) => p.id))).toBe(true);
    for (const p of platforms) {
      expect(p.homeUrl.startsWith("https://")).toBe(true);
      expect(existsSync(publicPath(p.badgeSrc)), p.badgeSrc).toBe(true);
    }
  });
});

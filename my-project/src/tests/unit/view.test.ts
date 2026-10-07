import { describe, expect, it } from "vitest";
import { DEFAULT_VIEW, isEpisodeView, viewInitScript } from "@/lib/view";

describe("isEpisodeView", () => {
  it("accepts only card and list", () => {
    expect(isEpisodeView("card")).toBe(true);
    expect(isEpisodeView("list")).toBe(true);
    for (const bad of ["banana", "", null, undefined, 1, "Card", {}]) {
      expect(isEpisodeView(bad)).toBe(false);
    }
    expect(DEFAULT_VIEW).toBe("card");
  });
});

describe("viewInitScript", () => {
  it("is a tiny guarded IIFE that reads the storage key", () => {
    expect(viewInitScript.length).toBeLessThanOrEqual(150);
    expect(viewInitScript).toContain('"episodeView"');
    expect(viewInitScript.startsWith("(function(){try{")).toBe(true);
  });
});
